import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CalendarGrid from '@/components/CalendarGrid'
import { C, font, glass } from '@/lib/theme'

export default async function PersonalCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: interests } = await (supabase as any)
    .from('event_interests')
    .select('event_id')
    .eq('user_id', user.id)

  const eventIds = (interests ?? []).map((i: { event_id: string }) => i.event_id)

  const { data: events } = eventIds.length
    ? await (supabase as any).from('events').select('*').in('id', eventIds).order('starts_at')
    : { data: [] }

  const allTags = Array.from(new Set((events ?? []).flatMap((e: { tags: string[] }) => e.tags ?? []))).sort() as string[]

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
          <Link href="/">
            <img src="/logo.png" alt="Hipe" style={{ height: 32, width: 'auto', display: 'block' }} />
          </Link>
          <Link href="/events/new" style={{ fontSize: 13, color: C.accent, textDecoration: 'none', fontWeight: 500, border: `1px solid ${C.accent}`, padding: '6px 14px', borderRadius: 100, fontFamily: font.sans }}>
            + New event
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, marginBottom: 6, fontFamily: font.sans }}>My calendar</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: C.textPrimary }}>Your events</h1>
            <p style={{ fontSize: 13, color: C.textMuted, fontWeight: 300, marginTop: 4 }}>Events you've marked as interested.</p>
          </div>
          <Link href="/" style={{ fontSize: 13, color: C.textSecondary, textDecoration: 'none', border: `1px solid ${C.divider}`, padding: '7px 16px', borderRadius: 100, fontFamily: font.sans }}>
            Browse all events →
          </Link>
        </div>

        {eventIds.length === 0 ? (
          <div style={{ ...glass, padding: '64px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: C.textPrimary, marginBottom: 10 }}>No events yet</p>
            <p style={{ fontSize: 14, color: C.textMuted, fontWeight: 300, marginBottom: 24 }}>Mark events as interested on the homepage to add them here.</p>
            <Link href="/" style={{ padding: '10px 24px', borderRadius: 100, background: C.btnPrimaryBg, color: C.btnPrimaryText, fontSize: 13, fontWeight: 500, textDecoration: 'none', fontFamily: font.sans }}>
              Browse events
            </Link>
          </div>
        ) : (
          <CalendarGrid events={events ?? []} allTags={allTags} />
        )}
      </main>
    </div>
  )
}