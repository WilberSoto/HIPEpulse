'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { C, font, glass } from '@/lib/theme'
import type { PostWithMeta } from '@/lib/types'

const TAG_COLORS: Record<string, string> = {
  Art: 'rgba(168,240,224,0.25)',
  Music: 'rgba(247,226,88,0.25)',
  Theatre: 'rgba(240,168,224,0.25)',
  Dance: 'rgba(200,196,212,0.25)',
  Writing: 'rgba(212,200,184,0.25)',
  Film: 'rgba(184,200,212,0.25)',
  Photography: 'rgba(212,208,184,0.25)',
  Voice: 'rgba(208,184,212,0.25)',
  Tech: 'rgba(168,224,240,0.25)',
  Gaming: 'rgba(196,212,196,0.25)',
  Design: 'rgba(212,196,184,0.25)',
}

function timeAgo(date: string) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export default function PostCard({ post, currentUserId }: { post: PostWithMeta; currentUserId: string | null }) {
  const [liked, setLiked] = useState(post.liked_by_me ?? false)
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0)
  const [pending, setPending] = useState(false)

  const toggleLike = async () => {
    if (!currentUserId || pending || !post.id) return
    setPending(true)
    const supabase = createClient()
    if (liked) {
      await supabase.from('likes').delete().match({ user_id: currentUserId, post_id: post.id })
      setLiked(false)
      setLikeCount(c => (c ?? 0) - 1)
    } else {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id })
      setLiked(true)
      setLikeCount(c => (c ?? 0) + 1)
    }
    setPending(false)
  }

  const primaryTag = post.tags?.[0]

  return (
    <article style={{ ...glass, padding: 0, overflow: 'hidden', fontFamily: font.sans }}>
      {/* Image */}
      {post.images && post.images.length > 0 && (
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
          <img src={post.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {primaryTag && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 100, color: C.textPrimary,
              background: 'rgba(30,50,140,0.6)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {primaryTag}
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '16px 18px 14px' }}>
        {/* Tag pill (no image) */}
        {(!post.images || post.images.length === 0) && primaryTag && (
          <span style={{
            display: 'inline-block', marginBottom: 8,
            fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: 100, color: C.textPrimary,
            background: TAG_COLORS[primaryTag] ?? 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {primaryTag}
          </span>
        )}

        {/* Body */}
        <p style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: C.textPrimary, marginBottom: 5 }}>
          {post.body}
        </p>

        {/* Author + time */}
        <Link href={`/profile/${post.username ?? post.author_id}`} style={{ fontSize: 12, color: C.textSecondary, fontWeight: 300, textDecoration: 'none', display: 'block', marginBottom: 12 }}>
          {post.full_name ?? post.username ?? 'Anonymous'} · {timeAgo(post.created_at ?? '')}
        </Link>

        {/* Extra tags */}
        {post.tags && post.tags.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {post.tags.slice(1).map(tag => (
              <span key={tag} style={{
                fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 100, color: C.textSecondary,
                background: TAG_COLORS[tag] ?? 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: `1px solid ${C.divider}`, paddingTop: 12 }}>
          <button
            onClick={toggleLike}
            disabled={!currentUserId || pending}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              cursor: currentUserId ? 'pointer' : 'default', fontFamily: font.sans,
              border: liked ? '1px solid rgba(240,100,100,0.4)' : `1px solid ${C.cardBorder}`,
              background: liked ? 'rgba(240,100,100,0.15)' : 'rgba(255,255,255,0.08)',
              color: liked ? '#F08080' : C.textSecondary,
              transition: 'all 0.14s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {likeCount}
          </button>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: 500, border: `1px solid ${C.cardBorder}`,
            background: 'rgba(255,255,255,0.08)', color: C.textSecondary,
            fontFamily: font.sans, cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {post.comment_count ?? 0}
          </button>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: 500, border: `1px solid ${C.cardBorder}`,
            background: 'rgba(255,255,255,0.08)', color: C.textSecondary,
            fontFamily: font.sans, cursor: 'pointer', marginLeft: 'auto',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        </div>
      </div>
    </article>
  )
}