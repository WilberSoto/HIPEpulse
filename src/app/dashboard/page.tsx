import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import DashboardLayout from '@/components/DashboardLayout'
import { C, font } from '@/lib/theme'
import type { PostWithMeta, PostImage } from '@/lib/types'
 
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
 
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
 
  const { data: rawPosts } = await supabase
    .from('posts_with_meta').select('*').order('created_at', { ascending: false }).limit(100)
 
  const postIds = (rawPosts ?? []).map((p: PostWithMeta) => p.id).filter((id): id is string => id !== null)
  const { data: allImages } = postIds.length
    ? await supabase.from('post_images').select('*').in('post_id', postIds)
    : { data: [] }
 
  const { data: myLikes } = await supabase.from('likes').select('post_id').eq('user_id', user.id)
  const likedSet = new Set((myLikes ?? []).map((l: { post_id: string }) => l.post_id))
 
  const posts: PostWithMeta[] = (rawPosts ?? []).map((p: PostWithMeta) => ({
    ...p,
    images: (allImages ?? []).filter((img: PostImage) => img.post_id === p.id).sort((a: PostImage, b: PostImage) => a.position - b.position),
    liked_by_me: p.id ? likedSet.has(p.id) : false,
  }))
 
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags ?? []))).sort()
 
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <DashboardLayout posts={posts} userId={user.id} avatarUrl={profile?.avatar_url} username={profile?.username} allTags={allTags} />
    </div>
  )
}
 