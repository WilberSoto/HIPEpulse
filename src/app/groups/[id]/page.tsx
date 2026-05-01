import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import GroupClient from './GroupClient'
import { C, font, glass } from '@/lib/theme'

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/groups/${id}`)

  const { data: group } = await (supabase as any)
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (!group) notFound()

  // Get current user's membership
  const { data: membership } = await (supabase as any)
    .from('group_members')
    .select('role')
    .match({ group_id: id, user_id: user.id })
    .single()

  const role = membership?.role ?? null
  const isMember = role && role !== 'pending'
  const isPending = role === 'pending'
  const isAdmin = role === 'owner' || role === 'admin'

  // If private and not a member, show restricted view
  if (group.is_private && !isMember) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
        <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '0 32px' }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center' }}>
            <Link href="/groups" style={{ color: C.textSecondary, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Groups
            </Link>
          </div>
        </header>
        <main style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ ...glass, padding: '48px 32px' }}>
            <p style={{ fontSize: 32, marginBottom: 16 }}>🔒</p>
            <h1 style={{ fontFamily: font.serif, fontSize: 28, color: C.textPrimary, marginBottom: 8 }}>{group.name}</h1>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>This is a private group. Request to join to see the content.</p>
            {isPending
              ? <p style={{ fontSize: 13, color: C.accent }}>Your request is pending approval.</p>
              : <JoinButton groupId={id} userId={user.id} requiresApproval={group.requires_approval} />
            }
          </div>
        </main>
      </div>
    )
  }

  // Get members
  const { data: members } = await (supabase as any)
    .from('group_members')
    .select('*, profiles(id, username, full_name, avatar_url)')
    .eq('group_id', id)
    .neq('role', 'pending')
    .order('joined_at')

  // Get pending members (admin only)
  const { data: pendingMembers } = isAdmin
    ? await (supabase as any)
      .from('group_members')
      .select('*, profiles(id, username, full_name, avatar_url)')
      .eq('group_id', id)
      .eq('role', 'pending')
    : { data: [] }

  const { data: currentProfile } = await supabase
    .from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <header style={{ background: C.header, borderBottom: `1px solid ${C.headerBorder}`, padding: '0 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/groups" style={{ color: C.textSecondary, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Groups
          </Link>
          <Link href="/"><img src="/logo.webp" alt="Hipe" style={{ height: 32, width: 'auto', display: 'block' }} /></Link>
          <div style={{ width: 60 }} />
        </div>
      </header>

      <GroupClient
        group={group}
        members={members ?? []}
        pendingMembers={pendingMembers ?? []}
        currentUserId={user.id}
        currentUserProfile={currentProfile}
        role={role}
        isMember={!!isMember}
        isAdmin={!!isAdmin}
      />
    </div>
  )
}

// Server-side join button placeholder — actual logic in GroupClient
function JoinButton({ groupId, userId, requiresApproval }: { groupId: string; userId: string; requiresApproval: boolean }) {
  return (
    <form action={async () => {
      'use server'
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      await (supabase as any).from('group_members').insert({
        group_id: groupId,
        user_id: userId,
        role: requiresApproval ? 'pending' : 'member',
      })
      const { redirect } = await import('next/navigation')
      redirect(`/groups/${groupId}`)
    }}>
      <button type="submit" style={{
        padding: '10px 28px', borderRadius: 100, fontSize: 13, fontWeight: 500,
        background: C.btnPrimaryBg, color: C.btnPrimaryText,
        border: 'none', cursor: 'pointer', fontFamily: font.sans,
      }}>
        {requiresApproval ? 'Request to join' : 'Join group'}
      </button>
    </form>
  )
}