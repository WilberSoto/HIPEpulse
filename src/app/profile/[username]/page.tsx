import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import FollowButton from '@/components/FollowButton'
import ProfileTagFilter from '@/components/ProfileTagFilter'
import { C, font, glass } from '@/lib/theme'
import type { PostWithMeta, PostImage } from '@/lib/types'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  const finalProfile = profile ?? (await supabase
    .from('profiles')
    .select('*')
    .eq('id', username)
    .maybeSingle()
  ).data
  
  console.log('username param:', username)
  console.log('profile result:', profile)
  console.log('finalProfile:', finalProfile)

  if (!finalProfile) notFound()

  const { data: currentProfile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const isOwner = user?.id === finalProfile.id

  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', finalProfile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', finalProfile.id),
  ])

  let isFollowing = false
  if (user && !isOwner) {
    const { data } = await supabase.from('follows').select('follower_id').match({ follower_id: user.id, following_id: finalProfile.id }).single()
    isFollowing = !!data
  }

  const { data: rawPosts } = await supabase.from('posts_with_meta').select('*').eq('author_id', finalProfile.id).order('created_at', { ascending: false })
  const postIds = (rawPosts ?? []).map((p: PostWithMeta) => p.id).filter((id): id is string => id !== null)
  const { data: allImages } = postIds.length ? await supabase.from('post_images').select('*').in('post_id', postIds) : { data: [] }
  const { data: myLikes } = user ? await supabase.from('likes').select('post_id').eq('user_id', user.id) : { data: [] }
  const likedSet = new Set((myLikes ?? []).map((l: { post_id: string }) => l.post_id))

  const posts: PostWithMeta[] = (rawPosts ?? []).map((p: PostWithMeta) => ({
    ...p,
    images: (allImages ?? []).filter((img: PostImage) => img.post_id === p.id).sort((a: PostImage, b: PostImage) => a.position - b.position),
    liked_by_me: p.id ? likedSet.has(p.id) : false,
  }))

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags ?? []))).sort()
  const socialLinks = [
    finalProfile.website   && { href: finalProfile.website, label: finalProfile.website.replace(/^https?:\/\//, '') },
    finalProfile.twitter   && { href: `https://twitter.com/${finalProfile.twitter}`, label: `@${finalProfile.twitter}` },
    finalProfile.github    && { href: `https://github.com/${finalProfile.github}`, label: finalProfile.github },
    finalProfile.instagram && { href: `https://instagram.com/${finalProfile.instagram}`, label: finalProfile.instagram },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <Navbar user={user ? { id: user.id, username: currentProfile?.username, full_name: currentProfile?.full_name, avatar_url: currentProfile?.avatar_url, email: user.email } : null} />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 64px' }}>
        <div style={{ ...glass, padding: '40px 32px 32px', marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            {finalProfile.avatar_url
              ? <img src={finalProfile.avatar_url} alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
              : <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: C.accent }}>{(finalProfile.full_name ?? finalProfile.username ?? '?')[0].toUpperCase()}</div>
            }
          </div>

          {finalProfile.full_name && <h1 style={{ fontFamily: font.serif, fontSize: 28, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{finalProfile.full_name}</h1>}

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '4px 8px', marginBottom: 14 }}>
            {finalProfile.username && <span style={{ fontSize: 13, color: C.textSecondary }}>@{finalProfile.username}</span>}
            {socialLinks.map(link => (
              <span key={link.href} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.divider }}>|</span>
                <a href={link.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.accent, textDecoration: 'none' }}>{link.label}</a>
              </span>
            ))}
          </div>

          {finalProfile.bio && <p style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 18px' }}>{finalProfile.bio}</p>}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 20, fontSize: 13 }}>
            <span><strong style={{ color: C.textPrimary }}>{posts.length}</strong> <span style={{ color: C.textMuted }}>posts</span></span>
            <span><strong style={{ color: C.textPrimary }}>{followerCount ?? 0}</strong> <span style={{ color: C.textMuted }}>followers</span></span>
            <span><strong style={{ color: C.textPrimary }}>{followingCount ?? 0}</strong> <span style={{ color: C.textMuted }}>following</span></span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {isOwner ? (
              <a href="/profile/edit" style={{ padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)', color: C.textPrimary, textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}>Edit profile</a>
            ) : user ? (
              <>
                <FollowButton currentUserId={user.id} profileId={finalProfile.id} initialFollowing={isFollowing} />
                <a href="/messages" style={{ padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)', color: C.textPrimary, textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}>Message</a>
              </>
            ) : null}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.divider}` }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted }}>Posts</span>
          </div>
          <ProfileTagFilter tags={allTags} posts={posts} currentUserId={user?.id ?? null} />
        </div>
      </main>
    </div>
  )
}