'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, font, glass } from '@/lib/theme'

const SUGGESTED_TAGS = ['Art', 'Music', 'Theatre', 'Dance', 'Writing', 'Film', 'Photography', 'Design', 'Tech', 'Gaming']

export default function PostComposer({ userId, avatarUrl }: { userId: string; avatarUrl?: string | null }) {
  const [body, setBody] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const MAX = 2000

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const picked = Array.from(files).slice(0, 4)
    setImages(picked)
    setPreviews(picked.map(f => URL.createObjectURL(f)))
  }

  const addTag = (tag: string) => {
    const clean = tag.trim().replace(/^#/, '')
    if (!clean || tags.includes(clean) || tags.length >= 5) return
    setTags(t => [...t, clean])
  }

  const removeTag = (tag: string) => setTags(t => t.filter(x => x !== tag))

  const submit = async () => {
    if (!body.trim()) return
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: post, error: postError } = await supabase
      .from('posts').insert({ author_id: userId, body: body.trim(), tags }).select().single()
    if (postError || !post) { setError(postError?.message ?? 'Failed'); setLoading(false); return }
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()
      const path = `${userId}/${post.id}/${i}.${ext}`
      const { data: upload } = await supabase.storage.from('post-images').upload(path, file, { upsert: true })
      if (upload) {
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(upload.path)
        await supabase.from('post_images').insert({ post_id: post.id, url: publicUrl, position: i })
      }
    }
    setBody(''); setImages([]); setPreviews([]); setTags([])
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ ...glass, padding: '20px', fontFamily: font.sans }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {avatarUrl
          ? <img src={avatarUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${C.cardBorder}`, flexShrink: 0 }} />
          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.inputBg, border: `1px solid ${C.cardBorder}`, flexShrink: 0 }} />
        }
        <div style={{ flex: 1 }}>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share something…"
            rows={3}
            maxLength={MAX}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              fontFamily: font.serif, fontSize: 17, color: C.textPrimary,
              resize: 'none', lineHeight: 1.5,
            }}
          />

          {previews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: previews.length === 1 ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt="" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 180 }} />
                  <button onClick={() => { setImages(imgs => imgs.filter((_, idx) => idx !== i)); setPreviews(p => p.filter((_, idx) => idx !== i)) }}
                    style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div style={{ marginBottom: 12 }}>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {tags.map(tag => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, background: 'rgba(168,240,224,0.15)', border: `1px solid ${C.accent}`, fontSize: 11, color: C.accent }}>
                    #{tag}
                    <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 10, padding: 0 }}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                <button key={tag} onClick={() => addTag(tag)} disabled={tags.length >= 5}
                  style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, border: `1px solid ${C.cardBorder}`, background: 'rgba(255,255,255,0.08)', color: C.textSecondary, cursor: 'pointer', fontFamily: font.sans }}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${C.divider}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
              <span style={{ fontSize: 11, color: body.length > MAX * 0.9 ? C.accentAlt : C.textMuted }}>{body.length}/{MAX}</span>
            </div>
            <button onClick={submit} disabled={!body.trim() || loading} style={{
              padding: '7px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500,
              background: body.trim() ? C.btnPrimaryBg : 'rgba(255,255,255,0.2)',
              color: body.trim() ? C.btnPrimaryText : C.textMuted,
              border: 'none', cursor: body.trim() ? 'pointer' : 'default',
              fontFamily: font.sans, transition: 'all 0.14s',
            }}>
              {loading ? '…' : 'Post'}
            </button>
          </div>
          {error && <p style={{ fontSize: 12, color: '#F08080', marginTop: 8 }}>{error}</p>}
        </div>
      </div>
    </div>
  )
}