import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import EditProfileForm from '@/components/EditProfileForm'
import { C, font } from '@/lib/theme'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <Navbar user={{ id: user.id, username: profile?.username, full_name: profile?.full_name, avatar_url: profile?.avatar_url, email: user.email }} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px 80px' }}>
        <EditProfileForm profile={profile} userId={user.id} />
      </main>
    </div>
  )
}
