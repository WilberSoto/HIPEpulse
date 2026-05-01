import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SearchResults from './SearchResults'
import { C, font } from '@/lib/theme'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const { q = '', tab = 'posts' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentProfile } = user
    ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
    : { data: null }

  let posts: any[] = []
  let users: any[] = []
  let events: any[] = []

  if (q.trim()) {
    const [postsRes, usersRes, eventsRes] = await Promise.all([
      supabase.from('posts_with_meta').select('*').ilike('body', `%${q}%`).limit(20),
      supabase.from('profiles').select('*').or(`username.ilike.%${q}%,full_name.ilike.%${q}%`).limit(20),
      (supabase as any).from('events').select('*').or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`).limit(20),
    ])
    posts = postsRes.data ?? []
    users = usersRes.data ?? []
    events = eventsRes.data ?? []
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '0 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ color: C.textSecondary, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Feed
          </Link>
          <Link href="/"><img src="/logo.webp" alt="Hipe" style={{ height: 32, width: 'auto', display: 'block' }} /></Link>
          <div style={{ width: 60 }} />
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Search bar */}
        <SearchResults
          initialQ={q}
          initialTab={tab}
          posts={posts}
          users={users}
          events={events}
          currentUserId={user?.id ?? null}
          currentUserProfile={currentProfile ?? null}
        />
      </main>
    </div>
  )
}