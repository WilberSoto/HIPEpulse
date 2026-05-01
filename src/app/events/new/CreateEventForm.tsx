'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, font } from '@/lib/theme'

const SUGGESTED_TAGS = ['Art', 'Music', 'Theatre', 'Dance', 'Writing', 'Film', 'Photography', 'Design', 'Tech', 'Gaming']

const field = {
  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
  fontFamily: font.sans, color: C.textPrimary,
  background: C.inputBg, border: `1px solid ${C.inputBorder}`, outline: 'none',
}

export default function CreateEventForm({ userId, avatarUrl }: { userId: string; avatarUrl?: string | null }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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

  const handleImage = (files: FileList | null) => {
    if (!files?.[0]) return
    setImageFile(files[0])
    setImagePreview(URL.createObjectURL(files[0]))
  }

  const submit = async () => {
    if (!title.trim() || !startsAt) { setError('Title and start date are required.'); return }
    setLoading(true); setError(null)
    const supabase = createClient()

    // 1. Upload image if provided
    let imageUrl: string | null = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${userId}/events/${Date.now()}.${ext}`
      const { data: upload } = await supabase.storage.from('post-images').upload(path, imageFile, { upsert: true })
      if (upload) {
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(upload.path)
        imageUrl = publicUrl
      }
    }

    // 2. Create a post for this event
    const postBody = `📅 ${title}${location ? ` — ${location}` : ''}\n${description ?? ''}`
    const { data: post } = await supabase
      .from('posts')
      .insert({ author_id: userId, body: postBody.trim(), tags })
      .select()
      .single()

    // 3. If post has an image, attach it
    if (post && imageUrl) {
      await supabase.from('post_images').insert({ post_id: post.id, url: imageUrl, position: 0 })
    }

    // 4. Create the event
    const { data: event, error: eventError } = await (supabase as any)
      .from('events')
      .insert({
        author_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        starts_at: startsAt,
        ends_at: endsAt || null,
        tags,
        image_url: imageUrl,
        post_id: post?.id ?? null,
      })
      .select()
      .single()

    if (eventError) {
      setError(eventError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Image upload */}
      <div>
        <label style={labelStyle}>Event image</label>
        <button onClick={() => fileRef.current?.click()} style={{
          width: '100%', aspectRatio: '16/9', borderRadius: 12,
          border: `1px dashed ${C.cardBorder}`, background: imagePreview ? 'transparent' : C.inputBg,
          cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {imagePreview ? (
            <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: C.textMuted }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ fontSize: 13, fontFamily: font.sans }}>Click to upload image</p>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files)} />
      </div>

      {/* Title */}
      <div>
        <label style={labelStyle}>Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" style={field as React.CSSProperties} />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell people what this event is about…" rows={4}
          style={{ ...field, resize: 'none', lineHeight: 1.6 } as React.CSSProperties} />
      </div>

      {/* Location */}
      <div>
        <label style={labelStyle}>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Address or venue name" style={field as React.CSSProperties} />
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Start date & time *</label>
          <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} style={field as React.CSSProperties} />
        </div>
        <div>
          <label style={labelStyle}>End date & time</label>
          <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} style={field as React.CSSProperties} />
        </div>
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

      {error && <p style={{ fontSize: 13, color: '#F08080' }}>{error}</p>}

      <button onClick={submit} disabled={loading || !title.trim() || !startsAt}
        style={{
          padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 500,
          background: title.trim() && startsAt ? C.btnPrimaryBg : 'rgba(255,255,255,0.1)',
          color: title.trim() && startsAt ? C.btnPrimaryText : C.textMuted,
          border: 'none', cursor: title.trim() && startsAt ? 'pointer' : 'default',
          fontFamily: font.sans, display: 'flex', alignItems: 'center', gap: 8,
          transition: 'all 0.14s',
        }}>
        {loading ? 'Creating…' : 'Create event & post →'}
      </button>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: C.textMuted, marginBottom: 8, fontFamily: font.sans,
}