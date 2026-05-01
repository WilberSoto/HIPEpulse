import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'
import type { PostWithMeta, PostImage, Event } from '@/lib/types'
import { C, font } from '@/lib/theme'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Posts
  const { data: rawPosts } = await supabase
    .from('posts_with_meta').select('*').order('created_at', { ascending: false }).limit(100)

  const postIds = (rawPosts ?? [])
    .map((p: PostWithMeta) => p.id)
    .filter((id): id is string => id !== null)

  const { data: allImages } = postIds.length
    ? await supabase.from('post_images').select('*').in('post_id', postIds)
    : { data: [] }

  const { data: myLikes } = await supabase.from('likes').select('post_id').eq('user_id', user.id)
  const likedSet = new Set((myLikes ?? []).map((l: { post_id: string }) => l.post_id))

  const posts: PostWithMeta[] = (rawPosts ?? []).map((p: PostWithMeta) => ({
    ...p,
    images: (allImages ?? [])
      .filter((img: PostImage) => img.post_id === p.id)
      .sort((a: PostImage, b: PostImage) => a.position - b.position),
    liked_by_me: p.id ? likedSet.has(p.id) : false,
  }))

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags ?? []))).sort()

  // All events
  const { data: allEvents } = await (supabase as any)
    .from('events').select('*').order('starts_at', { ascending: true })

  // My events (interested in)
  const { data: interests } = await (supabase as any)
    .from('event_interests').select('event_id').eq('user_id', user.id)

  const myEventIds = (interests ?? []).map((i: { event_id: string }) => i.event_id)
  const { data: myEvents } = myEventIds.length
    ? await (supabase as any).from('events').select('*').in('id', myEventIds).order('starts_at')
    : { data: [] }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <DashboardClient
        posts={posts}
        userId={user.id}
        avatarUrl={profile?.avatar_url}
        username={profile?.username}
        fullName={profile?.full_name}
        userEmail={user.email}
        allTags={allTags}
        allEvents={allEvents ?? []}
        myEvents={myEvents ?? []}
      />
    </div>
  )
}
 