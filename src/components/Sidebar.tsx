'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { C, font, glass } from '@/lib/theme'

const NAV_ITEMS = [
  { id: 'feed', label: 'Feed', href: '/dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'messages', label: 'Messages', href: '/messages', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
  { id: 'about', label: 'About', href: '/about', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { id: 'profile', label: 'Profile', href: '/profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

export default function Sidebar({
  username, userId, allTags, tab, activeTag, onTabChange, onTagChange,
}: {
  username?: string | null
  userId?: string
  allTags?: string[]
  tab?: 'recent' | 'trending'
  activeTag?: string | null
  onTabChange?: (tab: 'recent' | 'trending') => void
  onTagChange?: (tag: string | null) => void
}) {
  const pathname = usePathname()
  const profileHref = `/profile/${username ?? userId ?? ''}`
  const isDashboard = pathname === '/dashboard'

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'rgba(26,42,107,0.5)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: `1px solid ${C.divider}`,
      padding: '24px 0',
      position: 'sticky', top: 56,
      height: 'calc(100vh - 56px)',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Nav */}
      <div style={{ padding: '0 12px', marginBottom: 24 }}>
        {NAV_ITEMS.map(item => {
          const href = item.id === 'profile' ? profileHref : item.href
          const isActive = pathname === href || (item.id === 'profile' && pathname.startsWith('/profile'))
          return (
            <Link key={item.id} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 14px', borderRadius: 10, marginBottom: 2,
              fontSize: 13, fontWeight: 500, fontFamily: font.sans,
              color: isActive ? C.textPrimary : C.textSecondary,
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.14s',
            }}>
              <span style={{ color: isActive ? C.accent : C.textMuted }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Feed controls */}
      {isDashboard && onTabChange && onTagChange && (
        <>
          <div style={{ height: 1, background: C.divider, margin: '0 20px 20px' }} />

          {/* Sort */}
          <div style={{ padding: '0 20px', marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 10, fontFamily: font.sans }}>Sort</p>
            {(['recent', 'trending'] as const).map(t => (
              <button key={t} onClick={() => onTabChange(t)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '7px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, fontWeight: 500, fontFamily: font.sans,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: tab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: tab === t ? C.textPrimary : C.textSecondary,
                transition: 'all 0.14s',
              }}>
                <span style={{ color: tab === t ? C.accent : C.textMuted }}>
                  {t === 'recent'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  }
                </span>
                {t === 'recent' ? 'Recent' : 'Trending'}
              </button>
            ))}
          </div>

          {/* Tags */}
          {allTags && allTags.length > 0 && (
            <div style={{ padding: '0 20px' }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 10, fontFamily: font.sans }}>Filter by tag</p>
              <button onClick={() => onTagChange(null)} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontFamily: font.sans,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTag === null ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeTag === null ? C.textPrimary : C.textSecondary,
                fontWeight: activeTag === null ? 500 : 400, transition: 'all 0.14s',
              }}>All posts</button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => onTagChange(activeTag === tag ? null : tag)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontFamily: font.sans,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: activeTag === tag ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: activeTag === tag ? C.textPrimary : C.textSecondary,
                  fontWeight: activeTag === tag ? 500 : 400, transition: 'all 0.14s',
                }}>
                  <span style={{ color: activeTag === tag ? C.accent : C.divider, fontSize: 10 }}>●</span>
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  )
}