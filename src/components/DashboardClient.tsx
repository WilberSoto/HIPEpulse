'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import PostComposer from '@/components/PostComposer'
import DashboardFeed from '@/components/DashboardFeed'
import DashboardCalendar from '@/components/DashboardCalendar'
import type { PostWithMeta, Event } from '@/lib/types'
import { C, font } from '@/lib/theme'

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0',
  Dance: '#C8A8F0', Writing: '#A8D4F0', Film: '#F0C8A8',
  Photography: '#A8F0B8', Design: '#F0A8A8', Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

export default function DashboardClient({
  posts, userId, avatarUrl, username, fullName, userEmail, allTags,
  allEvents, myEvents,
}: {
  posts: PostWithMeta[]
  userId: string
  avatarUrl?: string | null
  username?: string | null
  fullName?: string | null
  userEmail?: string | null
  allTags: string[]
  allEvents: Event[]
  myEvents: Event[]
}) {
  const [tab, setTab] = useState<'recent' | 'trending'>('recent')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [contentType, setContentType] = useState<'all' | 'posts' | 'events'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) setSearch(q)
  }, [])

  const searchFiltered = search.trim()
    ? posts.filter(p =>
        p.body?.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : posts

  const upcomingEvents = allEvents
    .filter(e => new Date(e.starts_at) >= new Date())
    .filter(e => !activeTag || e.tags?.includes(activeTag))
    .slice(0, 10)

  return (
    <>
      <Navbar
        user={{ id: userId, username, full_name: fullName, avatar_url: avatarUrl, email: userEmail }}
        searchValue={search}
        onSearch={setSearch}
      />
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <Sidebar
          username={username}
          userId={userId}
          allTags={allTags}
          tab={tab}
          activeTag={activeTag}
          contentType={contentType}
          onTabChange={setTab}
          onTagChange={setActiveTag}
          onContentTypeChange={setContentType}
        />

        {/* Center feed */}
        <main style={{ flex: 1, padding: '36px 32px 64px', minWidth: 0, overflowY: 'auto', height: '100%' }}>
          <div style={{ marginBottom: 32 }}>
            <PostComposer userId={userId} avatarUrl={avatarUrl} />
          </div>

          {/* Events-only view */}
          {contentType === 'events' && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 16 }}>
                {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}
              </p>
              {upcomingEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, marginBottom: 8 }}>No upcoming events</p>
                  <Link href="/events/new" style={{ fontSize: 13, color: C.accent, textDecoration: 'none' }}>Create one →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {upcomingEvents.map(e => {
                    const d = new Date(e.starts_at)
                    return (
                      <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.divider}`, borderRadius: 12, overflow: 'hidden', display: 'flex', transition: 'background 0.14s' }}>
                          {e.image_url && (
                            <img src={e.image_url} alt="" style={{ width: 100, objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          <div style={{ padding: '14px 18px', flex: 1 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                              {(e.tags ?? []).slice(0, 2).map(tag => (
                                <span key={tag} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, background: CATEGORY_COLORS[tag] ?? C.accent, color: '#1A2A6B', fontWeight: 600 }}>#{tag}</span>
                              ))}
                            </div>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{e.title}</p>
                            <p style={{ fontSize: 12, color: C.textSecondary }}>
                              {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {' · '}{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              {e.location ? ` · ${e.location}` : ''}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Posts or All view */}
          {contentType !== 'events' && (
            <DashboardFeed
              posts={searchFiltered}
              currentUserId={userId}
              initialTab={tab}
              initialTag={activeTag}
            />
          )}
        </main>

        {/* Right calendar panel */}
        <aside style={{
          width: 320, flexShrink: 0,
          borderLeft: `1px solid ${C.divider}`,
          background: 'rgba(26,42,107,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '28px 20px',
          height: '100%',
          overflowY: 'auto',
        }}>
          <DashboardCalendar
            allEvents={allEvents}
            myEvents={myEvents}
            userId={userId}
          />
        </aside>
      </div>
    </>
  )
}