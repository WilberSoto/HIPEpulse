'use client'

import { useState } from 'react'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import type { PostWithMeta, Event } from '@/lib/types'
import { C, font } from '@/lib/theme'

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0',
  Dance: '#C8A8F0', Writing: '#A8D4F0', Film: '#F0C8A8',
  Photography: '#A8F0B8', Design: '#F0A8A8', Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

export default function ProfileContent({
  posts, events, postTags, eventTags, currentUserId,
}: {
  posts: PostWithMeta[]
  events: Event[]
  postTags: string[]
  eventTags: string[]
  currentUserId: string | null
}) {
  const [view, setView] = useState<'posts' | 'events'>('posts')
  const [activePostTag, setActivePostTag] = useState<string | null>(null)
  const [activeEventTag, setActiveEventTag] = useState<string | null>(null)

  const filteredPosts = activePostTag
    ? posts.filter(p => p.tags?.includes(activePostTag))
    : posts

  const filteredEvents = activeEventTag
    ? events.filter(e => e.tags?.includes(activeEventTag))
    : events

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 14px', borderRadius: 100, fontSize: 11, fontWeight: 500,
    cursor: 'pointer', fontFamily: font.sans, transition: 'all 0.14s',
    border: `1px solid ${active ? C.accent : C.divider}`,
    background: active ? 'rgba(168,240,224,0.12)' : 'transparent',
    color: active ? C.accent : C.textMuted,
  })

  return (
    <div>
      {/* Posts / Events toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4 }}>
        <button onClick={() => setView('posts')} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
          fontFamily: font.sans, border: 'none', cursor: 'pointer', transition: 'all 0.14s',
          background: view === 'posts' ? 'rgba(255,255,255,0.15)' : 'transparent',
          color: view === 'posts' ? C.textPrimary : C.textMuted,
        }}>
          Posts ({posts.length})
        </button>
        <button onClick={() => setView('events')} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
          fontFamily: font.sans, border: 'none', cursor: 'pointer', transition: 'all 0.14s',
          background: view === 'events' ? 'rgba(255,255,255,0.15)' : 'transparent',
          color: view === 'events' ? C.textPrimary : C.textMuted,
        }}>
          Events ({events.length})
        </button>
      </div>

      {/* Posts view */}
      {view === 'posts' && (
        <div>
          {postTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              <button onClick={() => setActivePostTag(null)} style={pillStyle(activePostTag === null)}>All</button>
              {postTags.map(tag => (
                <button key={tag} onClick={() => setActivePostTag(activePostTag === tag ? null : tag)} style={pillStyle(activePostTag === tag)}>
                  #{tag}
                </button>
              ))}
            </div>
          )}
          {filteredPosts.length === 0 ? (
            <Empty message="No posts yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredPosts.map(post => (
                <PostCard key={post.id ?? ''} post={post} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events view */}
      {view === 'events' && (
        <div>
          {eventTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              <button onClick={() => setActiveEventTag(null)} style={pillStyle(activeEventTag === null)}>All</button>
              {eventTags.map(tag => (
                <button key={tag} onClick={() => setActiveEventTag(activeEventTag === tag ? null : tag)} style={pillStyle(activeEventTag === tag)}>
                  #{tag}
                </button>
              ))}
            </div>
          )}
          {filteredEvents.length === 0 ? (
            <Empty message="No events yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredEvents.map(e => {
                const d = new Date(e.starts_at)
                const tagColor = CATEGORY_COLORS[(e.tags ?? [])[0]] ?? C.accent
                return (
                  <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.divider}`,
                      borderRadius: 12, overflow: 'hidden', display: 'flex',
                      transition: 'background 0.14s',
                    }}>
                      {e.image_url && (
                        <img src={e.image_url} alt="" style={{ width: 100, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ padding: '14px 18px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          {(e.tags ?? []).slice(0, 2).map(tag => (
                            <span key={tag} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, background: CATEGORY_COLORS[tag] ?? C.accent, color: '#1A2A6B', fontWeight: 600 }}>#{tag}</span>
                          ))}
                        </div>
                        <p style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{e.title}</p>
                        <p style={{ fontSize: 12, color: C.textSecondary }}>
                          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}
                          {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
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
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted }}>
      <p style={{ fontFamily: font.serif, fontSize: 22, marginBottom: 6 }}>{message}</p>
    </div>
  )
}