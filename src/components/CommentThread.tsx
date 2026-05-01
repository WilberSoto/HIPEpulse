'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { C, font } from '@/lib/theme'

type Comment = {
  id: string
  author_id: string
  body: string
  created_at: string | null
  parent_id: string | null
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

function timeAgo(date: string) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function Avatar({ profile, size = 32 }: { profile: Comment['profiles']; size?: number }) {
  const name = profile?.full_name ?? profile?.username ?? '?'
  return profile?.avatar_url
    ? <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, color: C.accent, flexShrink: 0 }}>{name[0].toUpperCase()}</div>
}

function CommentInput({
  onSubmit, placeholder = 'Write a comment…', autoFocus = false,
}: {
  onSubmit: (body: string) => Promise<void>
  placeholder?: string
  autoFocus?: boolean
}) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!body.trim()) return
    setLoading(true)
    await onSubmit(body.trim())
    setBody('')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={2}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
        style={{
          flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.inputBorder}`,
          borderRadius: 10, padding: '8px 12px', fontSize: 13, color: C.textPrimary,
          fontFamily: font.sans, resize: 'none', outline: 'none', lineHeight: 1.5,
        }}
      />
      <button onClick={submit} disabled={!body.trim() || loading} style={{
        padding: '8px 16px', borderRadius: 100, fontSize: 12, fontWeight: 500,
        background: body.trim() ? C.btnPrimaryBg : 'rgba(255,255,255,0.1)',
        color: body.trim() ? C.btnPrimaryText : C.textMuted,
        border: 'none', cursor: body.trim() ? 'pointer' : 'default',
        fontFamily: font.sans, transition: 'all 0.14s', flexShrink: 0,
      }}>
        {loading ? '…' : 'Post'}
      </button>
    </div>
  )
}

function CommentItem({
  comment, replies, currentUserId, onReply, onDelete,
}: {
  comment: Comment
  replies: Comment[]
  currentUserId: string | null
  onReply: (parentId: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [showReply, setShowReply] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const name = comment.profiles?.full_name ?? comment.profiles?.username ?? 'Anonymous'

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Avatar profile={comment.profiles} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{name}</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>{timeAgo(comment.created_at ?? '')}</span>
            </div>
            <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{comment.body}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingLeft: 4, marginBottom: 8 }}>
            {currentUserId && (
              <button onClick={() => setShowReply(r => !r)} style={{ fontSize: 11, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font.sans }}>
                Reply
              </button>
            )}
            {replies.length > 0 && (
              <button onClick={() => setShowReplies(r => !r)} style={{ fontSize: 11, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font.sans }}>
                {showReplies ? `Hide` : `Show`} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
            {currentUserId === comment.author_id && (
              <button onClick={() => onDelete(comment.id)} style={{ fontSize: 11, color: '#F08080', background: 'none', border: 'none', cursor: 'pointer', fontFamily: font.sans }}>
                Delete
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReply && (
            <div style={{ marginBottom: 10 }}>
              <CommentInput
                placeholder={`Reply to ${name}…`}
                autoFocus
                onSubmit={async (body) => {
                  await onReply(comment.id, body)
                  setShowReply(false)
                  setShowReplies(true)
                }}
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div style={{ borderLeft: `2px solid rgba(255,255,255,0.1)`, paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {replies.map(reply => {
                const replyName = reply.profiles?.full_name ?? reply.profiles?.username ?? 'Anonymous'
                return (
                  <div key={reply.id} style={{ display: 'flex', gap: 8 }}>
                    <Avatar profile={reply.profiles} size={26} />
                    <div style={{ flex: 1 }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{replyName}</span>
                          <span style={{ fontSize: 10, color: C.textMuted }}>{timeAgo(reply.created_at ?? '')}</span>
                        </div>
                        <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{reply.body}</p>
                      </div>
                      {currentUserId === reply.author_id && (
                        <button onClick={() => onDelete(reply.id)} style={{ fontSize: 10, color: '#F08080', background: 'none', border: 'none', cursor: 'pointer', fontFamily: font.sans, marginTop: 3, paddingLeft: 4 }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentThread({
  resourceId,
  resourceType,
  currentUserId,
  currentUserProfile,
}: {
  resourceId: string
  resourceType: 'post' | 'event'
  currentUserId: string | null
  currentUserProfile: { username: string | null; full_name: string | null; avatar_url: string | null } | null
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, full_name, avatar_url)')
      .eq('resource_id', resourceId)
      .eq('resource_type', resourceType)
      .order('created_at', { ascending: true })
    setComments((data ?? []) as Comment[])
    setLoading(false)
  }

  useEffect(() => { fetchComments() }, [resourceId])

  const addComment = async (body: string, parentId: string | null = null) => {
    if (!currentUserId) return
    const supabase = createClient()
    await supabase.from('comments').insert({
      author_id: currentUserId,
      resource_id: resourceId,
      resource_type: resourceType,
      body,
      parent_id: parentId,
    })
    await fetchComments()
  }

  const deleteComment = async (id: string) => {
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', id)
    setComments(c => c.filter(x => x.id !== id && x.parent_id !== id))
  }

  const topLevel = comments.filter(c => !c.parent_id)
  const repliesMap = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = []
      acc[c.parent_id].push(c)
    }
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Comments
        </h3>
        <span style={{ fontSize: 12, color: C.textMuted }}>({topLevel.length})</span>
      </div>

      {/* New comment input */}
      {currentUserId ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <Avatar profile={currentUserProfile} size={32} />
          <div style={{ flex: 1 }}>
            <CommentInput onSubmit={(body) => addComment(body, null)} />
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24 }}>
          <a href="/login" style={{ color: C.accent }}>Sign in</a> to comment.
        </p>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: C.textMuted }}>Loading comments…</p>
      ) : topLevel.length === 0 ? (
        <p style={{ fontSize: 13, color: C.textMuted }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topLevel.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={repliesMap[comment.id] ?? []}
              currentUserId={currentUserId}
              onReply={(parentId, body) => addComment(body, parentId)}
              onDelete={deleteComment}
            />
          ))}
        </div>
      )}
    </div>
  )
}