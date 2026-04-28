'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { C, font } from '@/lib/theme'

interface NavbarProps {
  user?: {
    id: string
    username?: string | null
    full_name?: string | null
    avatar_url?: string | null
    email?: string | null
  } | null
  searchValue?: string
  onSearch?: (value: string) => void
}

function NavbarInner({ user, searchValue, onSearch }: NavbarProps) {
  const router = useRouter()
  const [localSearch, setLocalSearch] = useState('')

  // Read ?q= from URL client-side only — no useSearchParams
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) setLocalSearch(q)
  }, [])

  const isDashboardSearch = onSearch !== undefined
  const currentSearch = isDashboardSearch ? (searchValue ?? '') : localSearch

  const handleSearch = (value: string) => {
    if (isDashboardSearch) {
      onSearch(value)
    } else {
      setLocalSearch(value)
      if (value.trim()) {
        router.push(`/dashboard?q=${encodeURIComponent(value.trim())}`)
      }
    }
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const profileHref = `/profile/${user?.username ?? user?.id ?? ''}`
  const displayName = user?.username ?? user?.full_name ?? user?.email?.split('@')[0] ?? 'Profile'

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: C.header,
      borderBottom: `1px solid ${C.headerBorder}`,
      display: 'flex', alignItems: 'center',
      height: 60, padding: '0 24px', gap: 16,
    }}>
      <Link href={user ? '/dashboard' : '/'} style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <img src="/logo.webp" alt="Pulse" style={{ height: 32, width: 'auto', display: 'block' }} />
      </Link>

      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

      {(user || onSearch !== undefined) && (
        <div style={{ flex: 1, position: 'relative', maxWidth: 480 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Search posts, artists, tags…"
            value={currentSearch}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !isDashboardSearch && localSearch.trim()) {
                router.push(`/dashboard?q=${encodeURIComponent(localSearch.trim())}`)
              }
            }}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '8px 14px 8px 36px',
              fontFamily: font.sans, fontSize: 13,
              color: C.textPrimary, outline: 'none',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)' }} />

        {user ? (
          <>
            <Link href={profileHref} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontSize: 12, fontWeight: 500 }}>
                  {displayName[0].toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 13, color: C.textSecondary, fontFamily: font.sans }}>{displayName}</span>
            </Link>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)' }} />
            <button onClick={signOut} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: 'rgba(255,255,255,0.08)', color: C.textSecondary,
              border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              fontFamily: font.sans, transition: 'all 0.15s',
            }}>
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 16px', borderRadius: 8,
            fontFamily: font.sans, fontSize: 13, fontWeight: 500,
            background: C.btnPrimaryBg, color: C.btnPrimaryText,
            textDecoration: 'none', transition: 'all 0.15s',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}

export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.header, borderBottom: `1px solid ${C.headerBorder}`, height: 60 }} />
    }>
      <NavbarInner {...props} />
    </Suspense>
  )
}