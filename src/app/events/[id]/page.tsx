import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import InterestedButton from './InterestedButton'
import CommentThread from '@/components/CommentThread'
import { C, font, glass } from '@/lib/theme'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const { redirect } = await import('next/navigation')
      redirect(`/login?redirectTo=/events/${id}`)
    }

    const { data: event, error: eventError } = await (supabase as any)
      .from('events')
      .select('*, profiles!events_author_id_fkey(username, full_name, avatar_url)')
      .eq('id', id)
      .single()

    if (eventError) {
      console.error('Event fetch error:', eventError)
    }

    if (!event) notFound()

    const { count: interestCount } = await (supabase as any)
      .from('event_interests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)

    let isInterested = false
    if (user) {
      const { data } = await (supabase as any)
        .from('event_interests')
        .select('user_id')
        .match({ user_id: user.id, event_id: id })
        .single()
      isInterested = !!data
    }

    const { data: currentProfile } = user
      ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
      : { data: null }

    const profile = event.profiles as { username: string | null; full_name: string | null; avatar_url: string | null } | null
    const startDate = new Date(event.starts_at)
    const endDate = event.ends_at ? new Date(event.ends_at) : null
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const endTimeStr = endDate ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null

    const CATEGORY_COLORS: Record<string, string> = {
      Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0', Dance: '#C8A8F0',
      Writing: '#A8D4F0', Film: '#F0C8A8', Photography: '#A8F0B8', Design: '#F0A8A8',
      Tech: '#A8C8F0', Gaming: '#D4A8F0',
    }

    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
        <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '0 32px', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ color: C.textSecondary, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </Link>
            <Link href="/"><img src="/logo.webp" alt="Hipe" style={{ height: 32, width: 'auto', display: 'block' }} /></Link>
            <div style={{ width: 60 }} />
          </div>
        </header>

        <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

          {event.image_url && (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 28, aspectRatio: '16/9' }}>
              <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {event.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {event.tags.map((tag: string) => (
                <span key={tag} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: CATEGORY_COLORS[tag] ?? C.accent, color: '#1A2A6B' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily: font.serif, fontSize: 42, fontWeight: 400, color: C.textPrimary, lineHeight: 1.15, marginBottom: 20 }}>
            {event.title}
          </h1>

          <div style={{ ...glass, padding: '18px 22px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MetaRow icon="📅" label={`${dateStr} · ${timeStr}${endTimeStr ? ` – ${endTimeStr}` : ''}`} />
            {event.location && <MetaRow icon="📍" label={event.location} />}
            <MetaRow icon="👥" label={`${interestCount ?? 0} interested`} />
          </div>

          {user && (
            <div style={{ marginBottom: 28 }}>
              <InterestedButton userId={user.id} eventId={event.id} initialInterested={isInterested} initialCount={interestCount ?? 0} />
            </div>
          )}

          {!user && (
            <div style={{ marginBottom: 28 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 100, fontSize: 13, fontWeight: 500, border: `1px solid ${C.cardBorder}`, color: C.textSecondary, textDecoration: 'none', fontFamily: font.sans }}>
                Sign in to save this event
              </Link>
            </div>
          )}

          {event.description && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 10 }}>About</p>
              <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.75, fontWeight: 300, whiteSpace: 'pre-wrap' }}>{event.description}</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 28, borderBottom: `1px solid ${C.divider}`, marginBottom: 32 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
              : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.accent }}>
                  {(profile?.full_name ?? profile?.username ?? '?')[0].toUpperCase()}
                </div>
            }
            <div>
              <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 300 }}>Organized by</p>
              <Link href={`/profile/${profile?.username ?? event.author_id}`} style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500, textDecoration: 'none' }}>
                {profile?.full_name ?? profile?.username ?? 'Unknown'}
              </Link>
            </div>
          </div>

          <div style={{ ...glass, padding: '24px 28px' }}>
            <CommentThread
              resourceId={id}
              resourceType="event"
              currentUserId={user?.id ?? null}
              currentUserProfile={currentProfile ?? null}
            />
          </div>
        </main>
      </div>
    )
  } catch (e) {
    console.error('Event page error:', e)
    throw e
  }
}

function MetaRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300 }}>{label}</span>
    </div>
  )
}