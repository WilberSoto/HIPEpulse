'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, font } from '@/lib/theme'

const SUGGESTED_TAGS = ['Art', 'Music', 'Theatre', 'Dance', 'Writing', 'Film', 'Photography', 'Design', 'Tech', 'Gaming']

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
  fontFamily: font.sans, color: C.textPrimary,
  background: C.inputBg, border: `1px solid ${C.inputBorder}`, outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: C.textMuted, marginBottom: 8, fontFamily: font.sans,
}

export default function CreateGroupForm({ userId }: { userId: string }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const addTag = (tag: string) => {
    const clean = tag.trim()
    if (!clean || tags.includes(clean) || tags.length >= 5) return
    setTags(t => [...t, clean])
  }
  const removeTag = (tag: string) => setTags(t => t.filter(x => x !== tag))

  const submit = async () => {
    if (!name.trim()) { setError('Group name is required.'); return }
    setLoading(true); setError(null)
    const supabase = createClient()

    let avatarUrl: string | null = null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `groups/${userId}/${Date.now()}.${ext}`
      const { data: upload } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (upload) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(upload.path)
        avatarUrl = publicUrl
      }
    }

    const { data: group, error: groupError } = await (supabase as any)
      .from('groups')
      .insert({
        owner_id: userId,
        name: name.trim(),
        description: description.trim() || null,
        tags,
        avatar_url: avatarUrl,
        is_private: isPrivate,
        requires_approval: requiresApproval,
      })
      .select()
      .single()

    if (groupError) { setError(groupError.message); setLoading(false); return }

    // Add creator as owner member
    await (supabase as any).from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'owner',
    })

    router.push(`/groups/${group.id}`)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Avatar */}
      <div>
        <label style={labelStyle}>Group avatar</label>
        <button onClick={() => fileRef.current?.click()} style={{
          width: 80, height: 80, borderRadius: 16, border: `1px dashed ${C.cardBorder}`,
          background: avatarPreview ? 'transparent' : C.inputBg,
          cursor: 'pointer', overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {avatarPreview
            ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 24, color: C.textMuted }}>+</span>
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) } }} />
      </div>

      <div>
        <label style={labelStyle}>Group name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NYC Jazz Collective" style={fieldStyle} />
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What is this group about?" rows={3}
          style={{ ...fieldStyle, resize: 'none', lineHeight: 1.6 } as React.CSSProperties} />
      </div>

      {/* Tags */}
      <div>
        <label style={labelStyle}>Tags (up to 5)</label>
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {tags.map(tag => (
              <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 100, background: C.btnSecBg, border: `1px solid ${C.cardBorder}`, fontSize: 12, color: C.textSecondary }}>
                #{tag}
                <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 11, padding: 0 }}>✕</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
            <button key={tag} onClick={() => addTag(tag)} disabled={tags.length >= 5}
              style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', fontFamily: font.sans }}>
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy settings */}
      <div style={{ border: `1px solid ${C.divider}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.divider}` }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>Private group</p>
            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Only visible to members</p>
          </div>
          <Toggle value={isPrivate} onChange={setIsPrivate} />
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>Require approval to join</p>
            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>You approve new members before they can participate</p>
          </div>
          <Toggle value={requiresApproval} onChange={setRequiresApproval} />
        </div>
      </div>

      {error && <p style={{ fontSize: 13, color: '#F08080' }}>{error}</p>}

      <button onClick={submit} disabled={loading || !name.trim()} style={{
        padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 500,
        background: name.trim() ? C.btnPrimaryBg : 'rgba(255,255,255,0.1)',
        color: name.trim() ? C.btnPrimaryText : C.textMuted,
        border: 'none', cursor: name.trim() ? 'pointer' : 'default',
        fontFamily: font.sans, transition: 'all 0.14s',
      }}>
        {loading ? 'Creating…' : 'Create group →'}
      </button>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
      background: value ? C.accent : 'rgba(255,255,255,0.15)',
      position: 'relative', flexShrink: 0, transition: 'background 0.2s',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: value ? 23 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}