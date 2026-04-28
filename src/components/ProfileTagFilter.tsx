'use client'

import { useState } from 'react'
import PostCard from '@/components/PostCard'
import { C, font } from '@/lib/theme'
import type { PostWithMeta } from '@/lib/types'

export default function ProfileTagFilter({ tags, posts, currentUserId }: { tags: string[]; posts: PostWithMeta[]; currentUserId: string | null }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const filtered = activeTag ? posts.filter(p => p.tags?.includes(activeTag)) : posts

  return (
    <div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {['All', ...tags].map(tag => {
            const isAll = tag === 'All'
            const isActive = isAll ? activeTag === null : activeTag === tag
            return (
              <button key={tag} onClick={() => setActiveTag(isAll ? null : (activeTag === tag ? null : tag))}
                style={{
                  padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: font.sans, transition: 'all 0.14s',
                  background: isActive ? C.btnPrimaryBg : 'rgba(255,255,255,0.1)',
                  color: isActive ? C.btnPrimaryText : C.textSecondary,
                  border: isActive ? 'none' : `1px solid rgba(255,255,255,0.2)`,
                }}>
                {isAll ? 'All' : `#${tag}`}
              </button>
            )
          })}
        </div>
      )}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.textSecondary }}>
          <p style={{ fontFamily: font.serif, fontSize: 22, marginBottom: 6 }}>No posts yet</p>
          <p style={{ fontSize: 13, fontWeight: 300 }}>Nothing here yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filtered.map(post => <PostCard key={post.id ?? ''} post={post} currentUserId={currentUserId} />)}
        </div>
      )}
    </div>
  )
}