'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import PostComposer from '@/components/PostComposer'
import DashboardFeed from '@/components/DashboardFeed'
import type { PostWithMeta } from '@/lib/types'

export default function DashboardClient({ posts, userId, avatarUrl, username, fullName, userEmail, allTags }: {
  posts: PostWithMeta[]
  userId: string
  avatarUrl?: string | null
  username?: string | null
  fullName?: string | null
  userEmail?: string | null
  allTags: string[]
}) {
  const [tab, setTab] = useState<'recent' | 'trending'>('recent')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Read ?q= from URL client-side only — no useSearchParams
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

  return (
    <>
      <Navbar
        user={{ id: userId, username, full_name: fullName, avatar_url: avatarUrl, email: userEmail }}
        searchValue={search}
        onSearch={setSearch}
      />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        <Sidebar
          username={username}
          userId={userId}
          allTags={allTags}
          tab={tab}
          activeTag={activeTag}
          onTabChange={setTab}
          onTagChange={setActiveTag}
        />
        <main style={{ flex: 1, padding: '36px 40px 64px', maxWidth: 720, minWidth: 0 }}>
          <div style={{ marginBottom: 32 }}>
            <PostComposer userId={userId} avatarUrl={avatarUrl} />
          </div>
          <DashboardFeed
            posts={searchFiltered}
            currentUserId={userId}
            initialTab={tab}
            initialTag={activeTag}
          />
        </main>
      </div>
    </>
  )
}