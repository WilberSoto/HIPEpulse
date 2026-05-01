'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, font, glass } from '@/lib/theme'

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0', Dance: '#C8A8F0',
  Writing: '#A8D4F0', Film: '#F0C8A8', Photography: '#A8F0B8', Design: '#F0A8A8',
  Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

type Message = {
  id: string
  body: string
  created_at: string
  author_id: string
  profiles: { username: string | null; full_name: string | null; avatar_url: string | null } | null
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

function Avatar({ profile, size = 32 }: { profile: any; size?: number }) {
  const name = profile?.full_name ?? profile?.username ?? '?'
  return profile?.avatar_url
    ? <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, color: C.accent, flexShrink: 0 }}>{name[0].toUpperCase()}</div>
}

export default function GroupClient({
  group, members, pendingMembers, currentUserId, currentUserProfile, role, isMember, isAdmin,
}: {
  group: any
  members: any[]
  pendingMembers: any[]
  currentUserId: string
  currentUserProfile: any
  role: string | null
  isMember: boolean
  isAdmin: boolean
}) {
  const [tab, setTab] = useState<'chat' | 'posts' | 'events' | 'members'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [groupPosts, setGroupPosts] = useState<any[]>([])
  const [groupEvents, setGroupEvents] = useState<any[]>([])
  const [joining, setJoining] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch chat messages
  const fetchMessages = async () => {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('group_messages')
      .select('*, profiles(username, full_name, avatar_url)')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .limit(100)
    setMessages(data ?? [])
  }

  // Fetch shared posts
  const fetchPosts = async () => {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('group_posts')
      .select('*, posts_with_meta(*)')
      .eq('group_id', group.id)
      .order('shared_at', { ascending: false })
    setGroupPosts(data ?? [])
  }

  // Fetch shared events
  const fetchEvents = async () => {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('group_events')
      .select('*, events(*)')
      .eq('group_id', group.id)
      .order('shared_at', { ascending: false })
    setGroupEvents(data ?? [])
  }

  useEffect(() => {
    if (!isMember) return
    fetchMessages()
    fetchPosts()
    fetchEvents()

    // Realtime subscription for chat
    const supabase = createClient()
    const channel = supabase
      .channel(`group-${group.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${group.id}` },
        () => fetchMessages()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isMember])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    const supabase = createClient()
    await (supabase as any).from('group_messages').insert({
      group_id: group.id,
      author_id: currentUserId,
      body: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)
    await fetchMessages()
  }

  const join = async () => {
    setJoining(true)
    const supabase = createClient()
    await (supabase as any).from('group_members').insert({
      group_id: group.id,
      user_id: currentUserId,
      role: group.requires_approval ? 'pending' : 'member',
    })
    router.refresh()
  }

  const leave = async () => {
    const supabase = createClient()
    await (supabase as any).from('group_members').delete().match({ group_id: group.id, user_id: currentUserId })
    router.push('/groups')
  }

  const approveMember = async (userId: string) => {
    const supabase = createClient()
    await (supabase as any).from('group_members').update({ role: 'member' }).match({ group_id: group.id, user_id: userId })
    router.refresh()
  }

  const denyMember = async (userId: string) => {
    const supabase = createClient()
    await (supabase as any).from('group_members').delete().match({ group_id: group.id, user_id: userId })
    router.refresh()
  }

  const tabBtn = (t: typeof tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      padding: '8px 16px', fontSize: 13, fontWeight: 500, fontFamily: font.sans,
      background: 'none', border: 'none', cursor: 'pointer',
      color: tab === t ? C.textPrimary : C.textMuted,
      borderBottom: tab === t ? `2px solid ${C.accent}` : '2px solid transparent',
      transition: 'all 0.14s', marginBottom: -1,
    }}>{label}</button>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* Group header */}
      <div style={{ ...glass, padding: '24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        {group.avatar_url
          ? <img src={group.avatar_url} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
          : <div style={{ width: 64, height: 64, borderRadius: 14, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: C.accent }}>{group.name[0].toUpperCase()}</div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontFamily: font.serif, fontSize: 24, fontWeight: 600, color: C.textPrimary }}>{group.name}</h1>
            {group.is_private && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, border: `1px solid ${C.divider}`, color: C.textMuted }}>Private</span>}
            {group.requires_approval && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, border: `1px solid ${C.divider}`, color: C.textMuted }}>Approval required</span>}
          </div>
          {group.description && <p style={{ fontSize: 13, color: C.textSecondary, fontWeight: 300, marginBottom: 8 }}>{group.description}</p>}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{members.length} member{members.length !== 1 ? 's' : ''}</span>
            {group.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {group.tags.map((tag: string) => (
                  <span key={tag} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, background: CATEGORY_COLORS[tag] ?? C.accent, color: '#1A2A6B', fontWeight: 600 }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isMember ? (
            <button onClick={join} disabled={joining} style={{ padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: C.btnPrimaryBg, color: C.btnPrimaryText, border: 'none', cursor: 'pointer', fontFamily: font.sans }}>
              {joining ? '…' : group.requires_approval ? 'Request to join' : 'Join'}
            </button>
          ) : role !== 'owner' ? (
            <button onClick={leave} style={{ padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: 'transparent', color: C.textMuted, border: `1px solid ${C.divider}`, cursor: 'pointer', fontFamily: font.sans }}>
              Leave
            </button>
          ) : null}
        </div>
      </div>

      {isMember && (
        <>
          {/* Pending approvals (admin only) */}
          {isAdmin && pendingMembers.length > 0 && (
            <div style={{ ...glass, padding: '16px 20px', marginBottom: 20, borderLeft: `3px solid ${C.accent}` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 12 }}>{pendingMembers.length} pending request{pendingMembers.length !== 1 ? 's' : ''}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingMembers.map((m: any) => (
                  <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar profile={m.profiles} size={28} />
                    <span style={{ flex: 1, fontSize: 13, color: C.textPrimary }}>{m.profiles?.full_name ?? m.profiles?.username ?? 'Unknown'}</span>
                    <button onClick={() => approveMember(m.user_id)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: C.btnPrimaryBg, color: C.btnPrimaryText, border: 'none', cursor: 'pointer', fontFamily: font.sans }}>Approve</button>
                    <button onClick={() => denyMember(m.user_id)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'transparent', color: C.textMuted, border: `1px solid ${C.divider}`, cursor: 'pointer', fontFamily: font.sans }}>Deny</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.divider}`, marginBottom: 20 }}>
            {tabBtn('chat', 'Chat')}
            {tabBtn('posts', `Posts (${groupPosts.length})`)}
            {tabBtn('events', `Events (${groupEvents.length})`)}
            {tabBtn('members', `Members (${members.length})`)}
          </div>

          {/* Chat */}
          {tab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ ...glass, padding: '16px', minHeight: 400, maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                {messages.length === 0
                  ? <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', margin: 'auto' }}>No messages yet. Say hello!</p>
                  : messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Avatar profile={msg.profiles} size={30} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{msg.profiles?.full_name ?? msg.profiles?.username ?? 'Unknown'}</span>
                          <span style={{ fontSize: 10, color: C.textMuted }}>{timeAgo(msg.created_at)}</span>
                        </div>
                        <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                      </div>
                    </div>
                  ))
                }
                <div ref={bottomRef} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Avatar profile={currentUserProfile} size={32} />
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Message the group…"
                    style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.textPrimary, fontFamily: font.sans, outline: 'none' }}
                  />
                  <button onClick={sendMessage} disabled={!newMessage.trim() || sending} style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: newMessage.trim() ? C.btnPrimaryBg : 'rgba(255,255,255,0.1)', color: newMessage.trim() ? C.btnPrimaryText : C.textMuted, border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default', fontFamily: font.sans }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          {tab === 'posts' && (
            <div>
              {groupPosts.length === 0
                ? <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: '48px 0' }}>No posts shared yet.</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {groupPosts.map((gp: any) => {
                    const p = gp.posts_with_meta
                    if (!p) return null
                    return (
                      <Link key={gp.post_id} href={`/posts/${p.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ ...glass, padding: '14px 18px' }}>
                          <p style={{ fontFamily: font.serif, fontSize: 17, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{p.body}</p>
                          <p style={{ fontSize: 11, color: C.textMuted }}>{p.full_name ?? p.username} · {p.like_count ?? 0} likes · {p.comment_count ?? 0} comments</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              }
            </div>
          )}

          {/* Events */}
          {tab === 'events' && (
            <div>
              {groupEvents.length === 0
                ? <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', padding: '48px 0' }}>No events shared yet.</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {groupEvents.map((ge: any) => {
                    const e = ge.events
                    if (!e) return null
                    const d = new Date(e.starts_at)
                    return (
                      <Link key={ge.event_id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ ...glass, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                          {e.image_url && <img src={e.image_url} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                          <div>
                            <p style={{ fontFamily: font.serif, fontSize: 17, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>{e.title}</p>
                            <p style={{ fontSize: 12, color: C.textMuted }}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{e.location ? ` · ${e.location}` : ''}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              }
            </div>
          )}

          {/* Members */}
          {tab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map((m: any) => (
                <Link key={m.user_id} href={`/profile/${m.profiles?.username ?? m.user_id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.divider}`, borderRadius: 10 }}>
                    <Avatar profile={m.profiles} size={36} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{m.profiles?.full_name ?? m.profiles?.username ?? 'Unknown'}</p>
                      {m.profiles?.username && <p style={{ fontSize: 11, color: C.textMuted }}>@{m.profiles.username}</p>}
                    </div>
                    {(m.role === 'owner' || m.role === 'admin') && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(168,240,224,0.15)', color: C.accent, border: `1px solid ${C.accent}`, fontWeight: 500 }}>{m.role}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}