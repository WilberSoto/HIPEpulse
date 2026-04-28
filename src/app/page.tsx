'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { C, font } from '@/lib/theme'

const TRENDING_POSTS = [
  { id: 1, title: 'Open call: experimental film score', author: 'Mara Osei', category: 'Music', likes: 214, comments: 38, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80' },
  { id: 2, title: 'Seeking lead soprano for summer opera', author: 'City Lyric Co.', category: 'Theatre', likes: 189, comments: 52, image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80' },
  { id: 3, title: 'New mural commission — downtown district', author: 'Felix Adama', category: 'Visual Art', likes: 301, comments: 67, image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=600&q=80' },
  { id: 4, title: 'Dance film auditions — contemporary', author: 'Studio Nomad', category: 'Dance', likes: 143, comments: 29, image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&q=80' },
  { id: 5, title: 'Residency: writer in the mountains', author: 'Alpine Arts Found.', category: 'Writing', likes: 278, comments: 44, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80' },
  { id: 6, title: 'Jazz quartet needs bassist — touring', author: 'The Ember Quartet', category: 'Music', likes: 167, comments: 33, image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80' },
  { id: 7, title: "Illustration commission: children's book", author: 'Leila Nour', category: 'Visual Art', likes: 92, comments: 18, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80' },
  { id: 8, title: 'Short film casting — lead + supporting', author: 'Dusk Pictures', category: 'Film', likes: 311, comments: 71, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80' },
]

const GIGS_POSTS = [
  { id: 9, title: 'Wedding band needed — August 14', author: 'Private Event', category: 'Music', likes: 44, comments: 9, image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80' },
  { id: 10, title: 'Portrait photographer for gallery opening', author: 'Meridian Gallery', category: 'Photography', likes: 61, comments: 14, image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80' },
  { id: 11, title: 'Voiceover artist — podcast intro', author: 'Wavehouse Pod', category: 'Voice', likes: 38, comments: 7, image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80' },
  { id: 12, title: 'Muralist for community centre lobby', author: 'Southside CC', category: 'Visual Art', likes: 129, comments: 31, image: 'https://images.unsplash.com/photo-1561059488-916d69792237?w=600&q=80' },
  { id: 13, title: 'Choreographer for music video shoot', author: 'Vex Records', category: 'Dance', likes: 88, comments: 22, image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&q=80' },
  { id: 14, title: 'Script editor needed — feature draft', author: 'Anon Writer', category: 'Writing', likes: 53, comments: 11, image: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=600&q=80' },
  { id: 15, title: 'Jazz pianist for restaurant residency', author: 'The Linden Room', category: 'Music', likes: 77, comments: 19, image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80' },
  { id: 16, title: 'Graphic novelist — collab on sci-fi', author: 'Marco T.', category: 'Visual Art', likes: 102, comments: 26, image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&q=80' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Music:        'rgba(247,226,88,0.25)',
  Theatre:      'rgba(240,168,224,0.25)',
  'Visual Art': 'rgba(168,240,224,0.25)',
  Dance:        'rgba(200,196,240,0.25)',
  Writing:      'rgba(240,220,168,0.25)',
  Film:         'rgba(168,200,240,0.25)',
  Photography:  'rgba(220,240,168,0.25)',
  Voice:        'rgba(220,168,240,0.25)',
}

function PostCard({ post, onPostClick }: { post: typeof TRENDING_POSTS[0]; onPostClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      onClick={onPostClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.20)',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.2)' : 'none',
        transition: 'all 0.18s ease',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
        <img
          src={post.image}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }}
        />
        <span style={{
          position: 'absolute', top: 10, left: 10,
          fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '4px 9px', borderRadius: 100,
          color: C.textPrimary,
          background: CATEGORY_COLORS[post.category] ?? 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          fontFamily: font.sans,
        }}>
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 14px' }}>
        <h3 style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: C.textPrimary, marginBottom: 5 }}>
          {post.title}
        </h3>
        <p style={{ fontSize: 12, color: C.textSecondary, fontWeight: 300, marginBottom: 14, fontFamily: font.sans }}>
          by {post.author}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: C.textSecondary, fontFamily: font.sans }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.likes}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: C.textSecondary, fontFamily: font.sans }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {post.comments}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted, fontFamily: font.sans }}>
            Sign in to view →
          </span>
        </div>
      </div>
    </article>
  )
}

export default function HomePage() {
  const [tab, setTab] = useState<'trending' | 'gigs'>('trending')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const posts = tab === 'trending' ? TRENDING_POSTS : GIGS_POSTS

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const goToLogin = () => router.push('/login')

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <Navbar searchValue={search} onSearch={setSearch} />

      {/* Hero */}
      <div style={{ background: C.header, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '56px 32px 48px', textAlign: 'center' }}>
        <img src="/logo.webp" alt="Pulse" style={{ height: 56, width: 'auto', margin: '0 auto 24px', display: 'block' }} />
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.accent, marginBottom: 12, fontFamily: font.sans }}>
          Creative community for CUNY
        </p>
        <h1 style={{ fontFamily: font.serif, fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 400, color: C.textPrimary, lineHeight: 1.1, marginBottom: 14 }}>
          Where <em style={{ fontStyle: 'italic', color: C.accent }}>creatives</em> find each other
        </h1>
        <p style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300, marginBottom: 28 }}>
          Discover opportunities, share your work, and connect with collaborators.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={() => router.push('/login')} style={{
            padding: '10px 28px', borderRadius: 100, fontSize: 13, fontWeight: 500,
            background: C.btnPrimaryBg, color: C.btnPrimaryText, border: 'none', cursor: 'pointer', fontFamily: font.sans,
          }}>
            Join Pulse
          </button>
          <button onClick={() => router.push('/login')} style={{
            padding: '10px 28px', borderRadius: 100, fontSize: 13, fontWeight: 500,
            background: 'rgba(255,255,255,0.1)', color: C.textPrimary,
            border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: font.sans,
          }}>
            Sign in
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '24px 32px 0' }}>
        {(['trending', 'gigs'] as const).map((t, i) => (
          <>
            {i > 0 && <div key={`sep-${t}`} style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />}
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '9px 28px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', border: '1px solid transparent', fontFamily: font.sans,
                transition: 'all 0.18s',
                background: tab === t ? C.btnPrimaryBg : 'transparent',
                color: tab === t ? C.btnPrimaryText : C.textSecondary,
                borderColor: tab === t ? 'transparent' : 'rgba(255,255,255,0.2)',
              }}
            >
              {t === 'trending' ? '↑ Trending' : 'Gigs & Auditions'}
            </button>
          </>
        ))}
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 60px' }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 20 }}>
          {filtered.length} {tab === 'trending' ? 'trending posts' : 'opportunities'}{search ? ` matching "${search}"` : ''}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.length > 0
            ? filtered.map(post => <PostCard key={post.id} post={post} onPostClick={goToLogin} />)
            : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: C.textSecondary }}>
                <p style={{ fontFamily: font.serif, fontSize: 24, marginBottom: 8 }}>Nothing found</p>
                <p style={{ fontSize: 14, fontWeight: 300 }}>Try a different search term.</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}