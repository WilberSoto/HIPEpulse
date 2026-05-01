'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { C, font } from '@/lib/theme'
import type { PostWithMeta } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0', Dance: '#C8A8F0',
  Writing: '#A8D4F0', Film: '#F0C8A8', Photography: '#A8F0B8', Design: '#F0A8A8',
  Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

type Event = {
  id: string
  title: string
  starts_at: string
  location: string | null
  tags: string[] | null
  image_url: string | null
  description: string | null
}

export default function SearchResults({
  initialQ, initialTab, posts, users, events, currentUserId, currentUserProfile,
}: {
  initialQ: string
  initialTab: string
  posts: PostWithMeta[]
  users: Profile[]
  events: Event[]
  currentUserId: string | null
  currentUserProfile: { username: string | null; full_name: string | null; avatar_url: string | null } | null
}) {
  const [q, setQ] = useState(initialQ)
  const [tab, setTab] = useState(initialTab)
  const router = useRouter()

  const search = (newQ: string) => {
    setQ(newQ)
    if (newQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQ.trim())}&tab=${tab}`)
    }
  }

  const switchTab = (newTab: string) => {
    setTab(newTab)
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}&tab=${newTab}`)
  }

  const tabs = [
    { id: 'posts', label: 'Posts', count: posts.length },
    { id: 'users', label: 'People', count: users.length },
    { id: 'events', label: 'Events', count: events.length },
  ]

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(q)}
          placeholder="Search posts, people, events…"
          autoFocus
          style={{
            width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12,
            fontSize: 15, fontFamily: font.sans, color: C.textPrimary,
            background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.inputBorder}`,
            outline: 'none',
          }}
        />
      </div>

      {!initialQ.trim() ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: C.textMuted }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, marginBottom: 8 }}>Search HIPE</p>
          <p style={{ fontSize: 14, fontWeight: 300 }}>Find posts, people, and events.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.divider}`, paddingBottom: 0 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => switchTab(t.id)} style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 500, fontFamily: font.sans,
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t.id ? C.textPrimary : C.textMuted,
                borderBottom: tab === t.id ? `2px solid ${C.accent}` : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.14s',
              }}>
                {t.label} <span style={{ fontSize: 11, color: C.textMuted }}>({t.count})</span>
              </button>
            ))}
          </div>

          {/* Posts tab */}
          {tab === 'posts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {posts.length === 0
                ? <Empty query={initialQ} type="posts" />
                : posts.map(p => <PostCard key={p.id ?? ''} post={p} currentUserId={currentUserId} />)
              }
            </div>
          )}

          {/* People tab */}
          {tab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {users.length === 0
                ? <Empty query={initialQ} type="people" />
                : users.map(u => (
                  <Link key={u.id} href={`/profile/${u.username ?? u.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.divider}`, borderRadius: 12, transition: 'background 0.14s' }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                        : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: C.accent }}>
                            {(u.full_name ?? u.username ?? '?')[0].toUpperCase()}
                          </div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{u.full_name ?? u.username}</p>
                        {u.username && <p style={{ fontSize: 12, color: C.textMuted }}>@{u.username}</p>}
                        {u.bio && <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</p>}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </Link>
                ))
              }
            </div>
          )}

          {/* Events tab */}
          {tab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {events.length === 0
                ? <Empty query={initialQ} type="events" />
                : events.map(e => {
                  const d = new Date(e.starts_at)
                  return (
                    <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.divider}`, borderRadius: 12, overflow: 'hidden', transition: 'background 0.14s' }}>
                        {e.image_url && <img src={e.image_url} alt="" style={{ width: 90, objectFit: 'cover', flexShrink: 0 }} />}
                        <div style={{ padding: '14px 18px', flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                            {(e.tags ?? []).slice(0, 2).map((tag: string) => (
                              <span key={tag} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, background: CATEGORY_COLORS[tag] ?? C.accent, color: '#1A2A6B', fontWeight: 600 }}>#{tag}</span>
                            ))}
                          </div>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{e.title}</p>
                          <p style={{ fontSize: 12, color: C.textSecondary }}>
                            {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {e.location ? ` · ${e.location}` : ''}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 16 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </Link>
                  )
                })
              }
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Empty({ query, type }: { query: string; type: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted }}>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, marginBottom: 6 }}>No {type} found</p>
      <p style={{ fontSize: 13, fontWeight: 300 }}>No results for "{query}"</p>
    </div>
  )
}