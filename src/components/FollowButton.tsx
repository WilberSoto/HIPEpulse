'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { C, font } from '@/lib/theme'

export default function FollowButton({ currentUserId, profileId, initialFollowing }: { currentUserId: string; profileId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, setPending] = useState(false)

  const toggle = async () => {
    setPending(true)
    const supabase = createClient()
    if (following) {
      await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: profileId })
      setFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profileId })
      setFollowing(true)
    }
    setPending(false)
  }

  return (
    <button onClick={toggle} disabled={pending} style={{
      padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500,
      fontFamily: font.sans, cursor: 'pointer', transition: 'all 0.15s',
      background: following ? 'rgba(255,255,255,0.1)' : C.btnPrimaryBg,
      color: following ? C.textPrimary : C.btnPrimaryText,
      border: following ? `1px solid ${C.cardBorder}` : 'none',
      opacity: pending ? 0.6 : 1,
    }}>
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
