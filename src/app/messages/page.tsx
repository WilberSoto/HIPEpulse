import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import MessagesClient from '@/components/MessagesClient'
import { C, font } from '@/lib/theme'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: conversations } = await supabase
    .from('conversations').select('*')
    .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const otherIds = (conversations ?? []).map(c => c.participant1 === user.id ? c.participant2 : c.participant1)
  const { data: otherProfiles } = otherIds.length ? await supabase.from('profiles').select('*').in('id', otherIds) : { data: [] }

  const convIds = (conversations ?? []).map(c => c.id)
  const { data: lastMessages } = convIds.length
    ? await supabase.from('messages').select('*').in('conversation_id', convIds).order('created_at', { ascending: false })
    : { data: [] }

  const enrichedConversations = (conversations ?? []).map(conv => {
    const otherId = conv.participant1 === user.id ? conv.participant2 : conv.participant1
    const otherProfile = (otherProfiles ?? []).find(p => p.id === otherId)
    const lastMessage = (lastMessages ?? []).find(m => m.conversation_id === conv.id)
    return { ...conv, otherProfile, lastMessage }
  })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <Navbar user={{ id: user.id, username: profile?.username, full_name: profile?.full_name, avatar_url: profile?.avatar_url, email: user.email }} />
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        <Sidebar username={profile?.username} userId={user.id} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <MessagesClient conversations={enrichedConversations} currentUserId={user.id} currentProfile={profile} />
        </div>
      </div>
    </div>
  )
}