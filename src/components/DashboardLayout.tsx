'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import PostComposer from '@/components/PostComposer'
import DashboardFeed from '@/components/DashboardFeed'
import type { PostWithMeta } from '@/lib/types'

export default function DashboardLayout({ posts, userId, avatarUrl, username, allTags, userEmail }: {
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

  // Filter posts by search across body, username, full_name
  const searchFiltered = search.trim()
    ? posts.filter(p =>
        p.body?.toLowerCase().includes(search.toLowerCase()) ||
        p.username?.toLowerCase().includes(search.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : posts

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar
        user={{ id: userId, username, avatar_url: avatarUrl, email: userEmail }}
        searchValue={search}
        onSearch={setSearch}
      />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        <Sidebar username={username} userId={userId} allTags={allTags} tab={tab} activeTag={activeTag} onTabChange={setTab} onTagChange={setActiveTag} />
        <main style={{ flex: 1, padding: '36px 40px 64px', maxWidth: 720, minWidth: 0 }}>
          <div style={{ marginBottom: 32 }}>
            <PostComposer userId={userId} avatarUrl={avatarUrl} />
          </div>
          <DashboardFeed posts={searchFiltered} currentUserId={userId} initialTab={tab} initialTag={activeTag} />
        </main>
      </div>
    </div>
  )
}