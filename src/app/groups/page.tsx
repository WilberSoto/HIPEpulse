import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { C, font, glass } from '@/lib/theme'

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0', Dance: '#C8A8F0',
  Writing: '#A8D4F0', Film: '#F0C8A8', Photography: '#A8F0B8', Design: '#F0A8A8',
  Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: groups } = await (supabase as any)
    .from('groups')
    .select('*, group_members(count)')
    .eq('is_private', false)
    .order('created_at', { ascending: false })

  // Groups the user is a member of
  const { data: myMemberships } = await (supabase as any)
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', user.id)

  const myGroupIds = new Set((myMemberships ?? []).map((m: any) => m.group_id))

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '0 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ color: C.textSecondary, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Feed
          </Link>
          <Link href="/"><img src="/logo.webp" alt="Hipe" style={{ height: 32, width: 'auto', display: 'block' }} /></Link>
          <Link href="/groups/new" style={{ fontSize: 13, color: C.accent, fontWeight: 500, textDecoration: 'none', border: `1px solid ${C.accent}`, padding: '6px 16px', borderRadius: 100, fontFamily: font.sans }}>
            + New group
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, marginBottom: 8 }}>Community</p>
          <h1 style={{ fontFamily: font.serif, fontSize: 36, fontWeight: 400, color: C.textPrimary }}>Groups</h1>
          <p style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300, marginTop: 6 }}>Find your people. Join groups to chat, share posts, and discover events.</p>
        </div>

        {(groups ?? []).length === 0 ? (
          <div style={{ ...glass, padding: '64px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: font.serif, fontSize: 28, color: C.textPrimary, marginBottom: 10 }}>No groups yet</p>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Be the first to create one.</p>
            <Link href="/groups/new" style={{ padding: '10px 24px', borderRadius: 100, background: C.btnPrimaryBg, color: C.btnPrimaryText, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
              Create a group
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {(groups ?? []).map((group: any) => {
              const isMember = myGroupIds.has(group.id)
              const memberCount = group.group_members?.[0]?.count ?? 0
              return (
                <Link key={group.id} href={`/groups/${group.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ ...glass, padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', gap: 12, transition: 'background 0.14s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {group.avatar_url ? (
                        <img src={group.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: C.accent }}>
                          {group.name[0].toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</p>
                        <p style={{ fontSize: 11, color: C.textMuted }}>{memberCount} member{memberCount !== 1 ? 's' : ''}{group.requires_approval ? ' · Approval required' : ''}</p>
                      </div>
                      {isMember && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(168,240,224,0.15)', color: C.accent, fontWeight: 500, border: `1px solid ${C.accent}`, flexShrink: 0 }}>Joined</span>
                      )}
                    </div>

                    {group.description && (
                      <p style={{ fontSize: 13, color: C.textSecondary, fontWeight: 300, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                        {group.description}
                      </p>
                    )}

                    {group.tags?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {group.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, background: CATEGORY_COLORS[tag] ?? C.accent, color: '#1A2A6B', fontWeight: 600 }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}