'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, font, glass } from '@/lib/theme'

type Provider = 'google' | 'github'
type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const anyLoading = emailLoading || oauthLoading !== null

  const signInWith = async (provider: Provider) => {
    setOauthLoading(provider)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    })
    if (error) { setError(error.message); setOauthLoading(null) }
  }

  const handleEmailSubmit = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setEmailLoading(true); setError(null); setSuccessMsg(null)
    const supabase = createClient()
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` } })
      if (error) setError(error.message)
      else setSuccessMsg('Check your email for a confirmation link.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else { router.push(redirectTo); router.refresh() }
    }
    setEmailLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: font.sans }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <img src="/logo.webp" alt="Pulse" style={{ height: 56, width: 'auto', margin: '0 auto 20px', display: 'block' }} />
          <h1 style={{ color: C.textPrimary, fontSize: 22, fontWeight: 600, fontFamily: font.sans, marginBottom: 4 }}>
            {mode === 'signin' ? 'Welcome back' : 'Join Pulse'}
          </h1>
          <p style={{ color: C.textSecondary, fontSize: 13, fontWeight: 300 }}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account for free'}
          </p>
        </div>

        {/* Form */}
        <div style={{ ...glass, padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
              placeholder="Email" disabled={anyLoading}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14, fontFamily: font.sans, color: C.textPrimary, background: C.inputBg, border: `1px solid ${C.inputBorder}`, outline: 'none' }}
            />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
              placeholder="Password" disabled={anyLoading}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14, fontFamily: font.sans, color: C.textPrimary, background: C.inputBg, border: `1px solid ${C.inputBorder}`, outline: 'none' }}
            />
            <button onClick={handleEmailSubmit} disabled={anyLoading} style={{
              width: '100%', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 500,
              background: C.btnPrimaryBg, color: C.btnPrimaryText, border: 'none', cursor: 'pointer',
              fontFamily: font.sans, opacity: anyLoading ? 0.6 : 1, transition: 'all 0.14s',
            }}>
              {emailLoading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: C.textSecondary, marginBottom: 16 }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccessMsg(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13, fontFamily: font.sans, textDecoration: 'underline' }}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: C.divider }} />
            <span style={{ fontSize: 12, color: C.textMuted }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.divider }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['google', 'github'] as Provider[]).map(provider => (
              <button key={provider} onClick={() => signInWith(provider)} disabled={anyLoading} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.cardBorder}`,
                color: C.textPrimary, cursor: 'pointer', fontFamily: font.sans,
                opacity: anyLoading ? 0.6 : 1, transition: 'all 0.14s',
              }}>
                {oauthLoading === provider ? '…' : provider === 'google' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                )}
                Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>

          {error && <p style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#F08080' }}>{error}</p>}
          {successMsg && <p style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: C.accent }}>{successMsg}</p>}
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: C.textMuted }}>
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: C.textSecondary, textDecoration: 'underline' }}>Terms</a>
          {' '}and{' '}
          <a href="#" style={{ color: C.textSecondary, textDecoration: 'underline' }}>Privacy Policy</a>
        </p>
      </div>
    </main>
  )
}