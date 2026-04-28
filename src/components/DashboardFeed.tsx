'use client'

import PostCard from '@/components/PostCard'
import { C, font } from '@/lib/theme'
import type { PostWithMeta } from '@/lib/types'

export default function DashboardFeed({ posts, currentUserId, initialTab = 'recent', initialTag = null }: {
  posts: PostWithMeta[]
  currentUserId: string
  initialTab?: 'recent' | 'trending'
  initialTag?: string | null
}) {
  const sorted = initialTab === 'trending'
    ? [...posts].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    : posts

  const filtered = initialTag ? sorted.filter(p => p.tags?.includes(initialTag)) : sorted

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 16, fontFamily: font.sans }}>
        {filtered.length} {initialTab === 'trending' ? 'trending' : 'recent'} post{filtered.length !== 1 ? 's' : ''}{initialTag ? ` tagged #${initialTag}` : ''}
      </p>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: C.textSecondary }}>
          <p style={{ fontFamily: font.serif, fontSize: 24, marginBottom: 8 }}>Nothing here yet</p>
          <p style={{ fontSize: 14, fontWeight: 300 }}>Be the first to post{initialTag ? ` with #${initialTag}` : ''}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filtered.map(post => <PostCard key={post.id ?? ''} post={post} currentUserId={currentUserId} />)}
        </div>
      )}
    </div>
  )
}