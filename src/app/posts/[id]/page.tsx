import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CommentThread from '@/components/CommentThread'
import { C, font, glass } from '@/lib/theme'

function timeAgo(date: string) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0',
  Dance: '#C8A8F0', Writing: '#A8D4F0', Film: '#F0C8A8',
  Photography: '#A8F0B8', Design: '#F0A8A8', Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

const { data: rawPost } = await supabase
  .from('posts_with_meta')
  .select('*')
  .eq('id', id)
  .single()

const post = rawPost as typeof rawPost & { tags: string[] | null }

  if (!post) notFound()

  const { data: images } = await supabase
    .from('post_images').select('*').eq('post_id', id).order('position')

  const { data: myLike } = user
    ? await supabase.from('likes').select('post_id').match({ user_id: user.id, post_id: id }).single()
    : { data: null }

  const { count: likeCount } = await supabase
    .from('likes').select('*', { count: 'exact', head: true }).eq('post_id', id)

  const { data: currentProfile } = user
    ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
    : { data: null }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '0 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ color: C.textSecondary, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </Link>
          <Link href="/"><img src="logo.webp" alt="Hipe" style={{ height: 32, width: 'auto', display: 'block' }} /></Link>
          <div style={{ width: 60 }} />
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Post card */}
        <div style={{ ...glass, padding: '28px 28px 24px', marginBottom: 32 }}>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Link href={`/profile/${post.username ?? post.author_id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              {post.avatar_url
                ? <img src={post.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: C.accent }}>
                    {(post.full_name ?? post.username ?? '?')[0].toUpperCase()}
                  </div>
              }
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{post.full_name ?? post.username ?? 'Anonymous'}</p>
                {post.username && <p style={{ fontSize: 12, color: C.textMuted }}>@{post.username}</p>}
              </div>
            </Link>
            <span style={{ fontSize: 12, color: C.textMuted }}>{timeAgo(post.created_at ?? '')}</span>
          </div>

          {/* Body */}
          <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 16 }}>{post.body}</p>

          {/* Images */}
          {images && images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: images.length === 1 ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {images.map((img: { id: string; url: string }) => (
                <img key={img.id} src={img.url} alt="" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 360 }} />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {post.tags.map((tag: string) => (
                <span key={tag} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: CATEGORY_COLORS[tag] ?? 'rgba(255,255,255,0.1)', color: CATEGORY_COLORS[tag] ? '#1A2A6B' : C.textSecondary, fontWeight: 600 }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: `1px solid ${C.divider}` }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              ♥ {likeCount ?? 0} {(likeCount ?? 0) === 1 ? 'like' : 'likes'}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div style={{ ...glass, padding: '24px 28px' }}>
          <CommentThread
            resourceId={id}
            resourceType="post"
            currentUserId={user?.id ?? null}
            currentUserProfile={currentProfile ?? null}
          />
        </div>
      </main>
    </div>
  )
}