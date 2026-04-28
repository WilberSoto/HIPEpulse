import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { C, font, glass } from '@/lib/theme'

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <Navbar user={user ? { id: user.id, username: profile?.username, full_name: profile?.full_name, avatar_url: profile?.avatar_url, email: user.email } : null} />

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>Creative community for CUNY</p>
          <h1 style={{ fontFamily: font.serif, fontSize: 48, fontWeight: 400, color: C.textPrimary, lineHeight: 1.1, marginBottom: 16 }}>
            Where <em style={{ fontStyle: 'italic', color: C.accent }}>creatives</em> find each other
          </h1>
          <p style={{ fontSize: 15, color: C.textSecondary, fontWeight: 300, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Welcome to Pulse — the platform dedicated to connecting CUNY's creative community. Whether you're a musician, filmmaker, visual artist, writer, dancer, or anything in between, Pulse is your space to share work, find collaborators, and discover opportunities.
          </p>
        </div>

        <div style={{ height: 1, background: C.divider, marginBottom: 56 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { eyebrow: 'Our mission', title: 'Make it easier for CUNY creatives to find each other', body: 'Through our platform, artists can post and discover gigs, auditions, commissions, and build a profile that represents who they are and what they make.' },
            { eyebrow: 'Community', title: 'Great creative work happens when the right people connect', body: "We're building a space where CUNY students can showcase their practice, collaborate across disciplines, and turn their creative ambitions into real opportunities." },
            { eyebrow: 'Get started', title: 'Share your work, find your collaborators', body: 'Join the community today. Post your work, tag it by discipline, follow other creatives, and start building something together.' },
          ].map(({ eyebrow, title, body }) => (
            <div key={eyebrow} style={{ ...glass, padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, paddingTop: 4 }}>{eyebrow}</p>
              <div>
                <h2 style={{ fontFamily: font.serif, fontSize: 22, fontWeight: 600, color: C.textPrimary, lineHeight: 1.3, marginBottom: 8 }}>{title}</h2>
                <p style={{ fontSize: 14, color: C.textSecondary, fontWeight: 300, lineHeight: 1.7 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <Link href={user ? '/dashboard' : '/login'} style={{ display: 'inline-block', padding: '12px 32px', borderRadius: 100, background: C.btnPrimaryBg, color: C.btnPrimaryText, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            {user ? 'Go to the feed →' : 'Join Pulse →'}
          </Link>
        </div>
      </main>
    </div>
  )
}
 
 