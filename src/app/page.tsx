import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CalendarGrid from '@/components/CalendarGrid'
import { C, font } from '@/lib/theme'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: events } = await (supabase as any)
    .from('events')
    .select('id, title, starts_at, ends_at, tags, image_url, location')
    .order('starts_at', { ascending: true })

  const allTags = Array.from(
    new Set((events ?? []).flatMap((e: { tags: string[] }) => e.tags ?? []))
  ).sort() as string[]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>

      {/* ── Header ── */}
      <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '0 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/">
            <img src="/logo.webp" alt="Hipe" style={{ height: 32, width: 'auto', display: 'block' }} />
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                <Link href="/calendar" style={{ fontSize: 13, color: C.textSecondary, textDecoration: 'none', padding: '6px 12px', borderRadius: 8 }}>My calendar</Link>
                <Link href="/events/new" style={{ fontSize: 13, color: C.accent, textDecoration: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 500 }}>+ New event</Link>
                <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
                <Link href="/dashboard" style={{ fontSize: 13, color: C.textSecondary, textDecoration: 'none', padding: '6px 12px', borderRadius: 8 }}>Feed</Link>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 13, color: C.textSecondary, textDecoration: 'none', padding: '6px 12px' }}>Sign in</Link>
                <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: C.btnPrimaryText, background: C.btnPrimaryBg, textDecoration: 'none', padding: '7px 18px', borderRadius: 100 }}>Join free</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.bgDeep} 0%, ${C.bg} 60%, #7B9FF9 100%)`,
        padding: '72px 32px 64px', textAlign: 'center',
        borderBottom: `1px solid ${C.headerBorder}`,
      }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.accent, marginBottom: 14, fontFamily: font.sans }}>
          Creative community for CUNY
        </p>
        <h1 style={{ fontFamily: font.serif, fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 400, color: C.textPrimary, lineHeight: 1.1, marginBottom: 14 }}>
          Where <em style={{ fontStyle: 'italic', color: C.accent }}>creatives</em> find each other
        </h1>
        <p style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          Discover events, share your work, and connect with collaborators across CUNY.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {user ? (
            <>
              <Link href="/events/new" style={{ padding: '10px 24px', borderRadius: 100, background: C.btnPrimaryBg, color: C.btnPrimaryText, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: font.sans }}>
                Create an event
              </Link>
              <Link href="/dashboard" style={{ padding: '10px 24px', borderRadius: 100, border: `1px solid ${C.btnSecBorder}`, background: C.btnSecBg, color: C.textPrimary, fontSize: 13, textDecoration: 'none', fontFamily: font.sans }}>
                Go to feed →
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: '10px 24px', borderRadius: 100, background: C.btnPrimaryBg, color: C.btnPrimaryText, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: font.sans }}>
                Join the community
              </Link>
              <Link href="/about" style={{ padding: '10px 24px', borderRadius: 100, border: `1px solid ${C.btnSecBorder}`, background: C.btnSecBg, color: C.textPrimary, fontSize: 13, textDecoration: 'none', fontFamily: font.sans }}>
                Learn more →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Calendar ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>
              {(events ?? []).length} upcoming event{(events ?? []).length !== 1 ? 's' : ''}
            </p>
            <h2 style={{ fontFamily: font.serif, fontSize: 28, fontWeight: 400, color: C.textPrimary }}>
              What's happening
            </h2>
          </div>
          {user && (
            <Link href="/events/new" style={{ fontSize: 13, color: C.textPrimary, textDecoration: 'none', border: `1px solid ${C.cardBorder}`, background: C.btnSecBg, padding: '8px 18px', borderRadius: 100, fontWeight: 500, fontFamily: font.sans }}>
              + Add event
            </Link>
          )}
        </div>

        <CalendarGrid events={events ?? []} allTags={allTags} />
      </main>
    </div>
  )
}