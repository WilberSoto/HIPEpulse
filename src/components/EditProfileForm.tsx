'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, font, glass } from '@/lib/theme'
import type { Profile } from '@/lib/types'

const SUGGESTED_TAGS = ['Music', 'Visual Art', 'Film', 'Theatre', 'Dance', 'Writing', 'Photography', 'Design', 'Tech', 'Gaming', 'Voice', 'Poetry', 'Fashion', 'Architecture']

export default function EditProfileForm({
  profile,
  userId,
  isOnboarding = false,
}: {
  profile: Profile | null
  userId: string
  isOnboarding?: boolean
}) {
  const [fullName, setFullName]   = useState(profile?.full_name ?? '')
  const [username, setUsername]   = useState(profile?.username ?? '')
  const [bio, setBio]             = useState(profile?.bio ?? '')
  const [website, setWebsite]     = useState(profile?.website ?? '')
  const [twitter, setTwitter]     = useState(profile?.twitter ?? '')
  const [github, setGithub]       = useState(profile?.github ?? '')
  const [instagram, setInstagram] = useState(profile?.instagram ?? '')
  const [tags, setTags]           = useState<string[]>((profile as any)?.tags ?? [])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAvatar = (files: FileList | null) => {
    if (!files?.[0]) return
    setAvatarFile(files[0])
    setAvatarPreview(URL.createObjectURL(files[0]))
  }

  const addTag = (tag: string) => {
    if (!tag || tags.includes(tag) || tags.length >= 8) return
    setTags(t => [...t, tag])
  }

  const removeTag = (tag: string) => setTags(t => t.filter(x => x !== tag))

  const save = async () => {
    setLoading(true); setError(null)
    const supabase = createClient()
    let avatarUrl = profile?.avatar_url ?? null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { data, error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (uploadError) { setError(uploadError.message); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path)
      avatarUrl = publicUrl
    }

    const { error: updateError } = await supabase.from('profiles').update({
      full_name:  fullName.trim() || null,
      username:   username.trim() || null,
      bio:        bio.trim() || null,
      website:    website.trim() || null,
      twitter:    twitter.trim().replace(/^@/, '') || null,
      github:     github.trim().replace(/^@/, '') || null,
      instagram:  instagram.trim().replace(/^@/, '') || null,
      avatar_url: avatarUrl,
      tags,
    }).eq('id', userId)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    router.push(isOnboarding ? '/dashboard' : `/profile/${username.trim() || userId}`)
    router.refresh()
  }

  const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  fontSize: 14, fontFamily: font.sans,
  color: '#FFFFFF',
  background: 'rgba(255,255,255,0.18)',
  border: '1px solid rgba(255,255,255,0.25)',
  outline: 'none',
}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Onboarding header */}
      {isOnboarding && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{ fontFamily: font.serif, fontSize: 32, color: C.textPrimary, marginBottom: 8 }}>
            Set up your profile
          </h1>
          <p style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300 }}>
            Tell the Pulse community who you are and what you create.
          </p>
        </div>
      )}

      {/* Avatar */}
      <div style={{ ...glass, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => fileRef.current?.click()} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          {avatarPreview
            ? <img src={avatarPreview} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.cardBorder}` }} />
            : <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.inputBg, border: `2px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: C.accent }}>
                {(fullName || username || '?')[0]?.toUpperCase()}
              </div>
          }
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: C.btnPrimaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.btnPrimaryText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </button>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Profile photo</p>
          <p style={{ fontSize: 12, color: C.textSecondary }}>Click to upload</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleAvatar(e.target.files)} />
      </div>

      {/* Basic info */}
      <div style={{ ...glass, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Full name">
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" style={inputStyle} />
        </Field>
        <Field label="Username">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textSecondary, fontSize: 14 }}>@</span>
            <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="username" style={{ ...inputStyle, paddingLeft: 28 }} />
          </div>
        </Field>
        <Field label="Bio">
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the world about yourself" rows={3} maxLength={160} style={{ ...inputStyle, resize: 'none' }} />
        </Field>
      </div>

      {/* Discipline tags */}
      <div style={{ ...glass, padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Your disciplines</p>
        <p style={{ fontSize: 12, color: C.textSecondary, marginBottom: 16 }}>Select up to 8 tags that describe your creative practice.</p>

        {/* Selected tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {tags.map(tag => (
              <span key={tag} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 100,
                background: 'rgba(168,240,224,0.15)', border: `1px solid ${C.accent}`,
                fontSize: 12, color: C.accent, fontFamily: font.sans,
              }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 10, padding: 0, lineHeight: 1 }}>✕</button>
              </span>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              disabled={tags.length >= 8}
              style={{
                padding: '5px 12px', borderRadius: 100, fontSize: 12,
                border: `1px solid ${C.cardBorder}`, background: 'rgba(255,255,255,0.08)',
                color: C.textSecondary, cursor: tags.length >= 8 ? 'not-allowed' : 'pointer',
                fontFamily: font.sans, opacity: tags.length >= 8 ? 0.4 : 1,
                transition: 'all 0.14s',
              }}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Social links */}
      <div style={{ ...glass, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>Social links</p>
        <Field label="Website">
          <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" style={inputStyle} />
        </Field>
        <Field label="Twitter / X">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textSecondary, fontSize: 14 }}>@</span>
            <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="handle" style={{ ...inputStyle, paddingLeft: 28 }} />
          </div>
        </Field>
        <Field label="GitHub">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textSecondary, fontSize: 14 }}>@</span>
            <input type="text" value={github} onChange={e => setGithub(e.target.value)} placeholder="handle" style={{ ...inputStyle, paddingLeft: 28 }} />
          </div>
        </Field>
        <Field label="Instagram">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textSecondary, fontSize: 14 }}>@</span>
            <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="handle" style={{ ...inputStyle, paddingLeft: 28 }} />
          </div>
        </Field>
      </div>

      {error && <p style={{ fontSize: 13, color: '#F08080' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={save} disabled={loading} style={{
          flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 500,
          background: C.btnPrimaryBg, color: C.btnPrimaryText, border: 'none',
          cursor: 'pointer', fontFamily: font.sans, opacity: loading ? 0.6 : 1,
          transition: 'all 0.14s',
        }}>
          {loading ? 'Saving…' : isOnboarding ? 'Finish setup →' : 'Save changes'}
        </button>
        {!isOnboarding && (
          <button onClick={() => router.back()} style={{
            padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            background: 'rgba(255,255,255,0.1)', color: C.textPrimary,
            border: `1px solid ${C.cardBorder}`, cursor: 'pointer', fontFamily: font.sans,
          }}>
            Cancel
          </button>
        )}
        {isOnboarding && (
          <button onClick={() => router.push('/dashboard')} style={{
            padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            background: 'transparent', color: C.textSecondary,
            border: `1px solid ${C.cardBorder}`, cursor: 'pointer', fontFamily: font.sans,
          }}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 500, fontFamily: font.sans, letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  )
}
