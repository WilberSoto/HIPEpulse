'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { C, font, glass } from '@/lib/theme'
import type { Profile } from '@/lib/types'

type ConversationWithMeta = {
  id: string
  participant1: string
  participant2: string
  created_at: string | null
  otherProfile: Profile | undefined
  lastMessage: { body: string; created_at: string | null; sender_id: string } | undefined
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string | null
}

function timeAgo(date: string) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export default function MessagesClient({ conversations, currentUserId, currentProfile }: {
  conversations: ConversationWithMeta[]
  currentUserId: string
  currentProfile: Profile | null
}) {
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0]?.id ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [convList, setConvList] = useState(conversations)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const activeConv = convList.find(c => c.id === activeConvId)

  useEffect(() => {
    if (!activeConvId) return
    supabase.from('messages').select('*').eq('conversation_id', activeConvId).order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))
  }, [activeConvId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (!activeConvId) return
    const channel = supabase.channel(`messages:${activeConvId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvId}` },
        payload => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeConvId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvId || sending) return
    setSending(true)
    await supabase.from('messages').insert({ conversation_id: activeConvId, sender_id: currentUserId, body: newMessage.trim() })
    setNewMessage('')
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
      {/* Conversations list */}
      <div style={{ width: 280, flexShrink: 0, background: 'rgba(26,42,107,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: `1px solid ${C.divider}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.divider}` }}>
          <h2 style={{ fontFamily: font.serif, fontSize: 22, fontWeight: 600, color: C.textPrimary }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convList.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: C.textSecondary }}>
              <p style={{ fontFamily: font.serif, fontSize: 18, marginBottom: 6 }}>No messages yet</p>
              <p style={{ fontSize: 12, fontWeight: 300 }}>Visit a profile and hit Message to start a conversation.</p>
            </div>
          ) : convList.map(conv => {
            const isActive = conv.id === activeConvId
            const other = conv.otherProfile
            return (
              <button key={conv.id} onClick={() => setActiveConvId(conv.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderLeft: isActive ? `3px solid ${C.accent}` : '3px solid transparent',
                transition: 'all 0.14s',
              }}>
                {other?.avatar_url
                  ? <img src={other.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.inputBg, border: `1px solid ${C.cardBorder}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontSize: 14, fontWeight: 500 }}>{(other?.full_name ?? other?.username ?? '?')[0].toUpperCase()}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 2, fontFamily: font.sans }}>{other?.full_name ?? other?.username ?? 'Unknown'}</p>
                  {conv.lastMessage && <p style={{ fontSize: 12, color: C.textMuted, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage.sender_id === currentUserId ? 'You: ' : ''}{conv.lastMessage.body}</p>}
                </div>
                {conv.lastMessage && <span style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>{timeAgo(conv.lastMessage.created_at ?? '')}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Message pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeConv ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.divider}`, background: 'rgba(26,42,107,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 12 }}>
              {activeConv.otherProfile?.avatar_url
                ? <img src={activeConv.otherProfile.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.inputBg, border: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontSize: 13 }}>{(activeConv.otherProfile?.full_name ?? '?')[0].toUpperCase()}</div>
              }
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary, fontFamily: font.sans }}>{activeConv.otherProfile?.full_name ?? activeConv.otherProfile?.username ?? 'Unknown'}</p>
                {activeConv.otherProfile?.username && <p style={{ fontSize: 12, color: C.textMuted }}>@{activeConv.otherProfile.username}</p>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSecondary }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: font.serif, fontSize: 20, marginBottom: 6, color: C.textPrimary }}>Start the conversation</p>
                    <p style={{ fontSize: 13, fontWeight: 300 }}>Say hello to {activeConv.otherProfile?.full_name ?? 'them'}.</p>
                  </div>
                </div>
              ) : messages.map(msg => {
                const isMe = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && (
                      activeConv.otherProfile?.avatar_url
                        ? <img src={activeConv.otherProfile.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }} />
                        : <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.inputBg, border: `1px solid ${C.cardBorder}`, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.accent }}>{(activeConv.otherProfile?.full_name ?? '?')[0].toUpperCase()}</div>
                    )}
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? C.btnPrimaryBg : 'rgba(255,255,255,0.12)',
                        color: isMe ? C.btnPrimaryText : C.textPrimary,
                        border: isMe ? 'none' : `1px solid ${C.cardBorder}`,
                        backdropFilter: isMe ? 'none' : 'blur(8px)',
                        fontSize: 14, lineHeight: 1.5, fontFamily: font.sans,
                      }}>
                        {msg.body}
                      </div>
                      <p style={{ fontSize: 10, color: C.textMuted, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>{timeAgo(msg.created_at ?? '')}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.divider}`, background: 'rgba(26,42,107,0.3)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Write a message…"
                rows={1}
                style={{ flex: 1, resize: 'none', border: `1px solid ${C.inputBorder}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: font.sans, color: C.textPrimary, background: C.inputBg, outline: 'none', lineHeight: 1.5 }}
              />
              <button onClick={sendMessage} disabled={!newMessage.trim() || sending} style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: newMessage.trim() ? C.btnPrimaryBg : 'rgba(255,255,255,0.15)',
                color: newMessage.trim() ? C.btnPrimaryText : C.textMuted,
                fontSize: 13, fontWeight: 500, cursor: newMessage.trim() ? 'pointer' : 'default',
                fontFamily: font.sans, transition: 'all 0.14s', flexShrink: 0,
              }}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSecondary }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: font.serif, fontSize: 26, marginBottom: 8, color: C.textPrimary }}>Your messages</p>
              <p style={{ fontSize: 14, fontWeight: 300 }}>Select a conversation or visit a profile to start one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}