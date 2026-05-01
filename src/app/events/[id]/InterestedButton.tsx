'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InterestedButton({
  userId, eventId, initialInterested, initialCount,
}: {
  userId: string
  eventId: string
  initialInterested: boolean
  initialCount: number
}) {
  const [interested, setInterested] = useState(initialInterested)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  const toggle = async () => {
    if (pending) return
    setPending(true)
    const supabase = createClient()
    if (interested) {
      await supabase.from('event_interests').delete().match({ user_id: userId, event_id: eventId })
      setInterested(false)
      setCount(c => c - 1)
    } else {
      await supabase.from('event_interests').insert({ user_id: userId, event_id: eventId })
      setInterested(true)
      setCount(c => c + 1)
    }
    setPending(false)
  }

  return (
    <button onClick={toggle} disabled={pending} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 24px', borderRadius: 100, fontSize: 13, fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.14s',
      background: interested ? '#1a1814' : 'transparent',
      color: interested ? '#f5f0e8' : '#1a1814',
      border: '1px solid #1a1814',
    }}>
      <span>{interested ? '★' : '☆'}</span>
      {interested ? `Interested · ${count}` : `Mark as interested · ${count}`}
    </button>
  )
}