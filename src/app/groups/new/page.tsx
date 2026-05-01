import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateGroupForm from './CreateGroupForm'
import { C, font } from '@/lib/theme'

export default async function NewGroupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px 96px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, marginBottom: 8 }}>New group</p>
          <h1 style={{ fontFamily: font.serif, fontSize: 36, fontWeight: 400, color: C.textPrimary }}>Create a group</h1>
          <p style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300, marginTop: 6 }}>Bring your community together.</p>
        </div>
        <CreateGroupForm userId={user.id} />
      </main>
    </div>
  )
}