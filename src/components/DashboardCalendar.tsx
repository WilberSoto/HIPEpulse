'use client'

import { useState } from 'react'
import Link from 'next/link'
import { C, font } from '@/lib/theme'
import type { Event } from '@/lib/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['S','M','T','W','T','F','S']

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0',
  Dance: '#C8A8F0', Writing: '#A8D4F0', Film: '#F0C8A8',
  Photography: '#A8F0B8', Design: '#F0A8A8', Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function DashboardCalendar({
  allEvents, myEvents, userId,
}: {
  allEvents: Event[]
  myEvents: Event[]
  userId: string
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [calendarType, setCalendarType] = useState<'all' | 'mine'>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const events = calendarType === 'mine' ? myEvents : allEvents

  // Collect tags from current event set
  const allTags = Array.from(new Set(events.flatMap(e => e.tags ?? []))).sort()

  const filtered = activeTag ? events.filter(e => e.tags?.includes(activeTag)) : events

  // Group by day
  const byDay: Record<string, Event[]> = {}
  filtered.forEach(e => {
    const d = new Date(e.starts_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(e)
  })

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1); setSelectedDay(null) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1); setSelectedDay(null) }

  const selectedEvents = selectedDay ? (byDay[selectedDay] ?? []) : []

  // Upcoming events (next 5 in current filter)
  const now = new Date()
  const upcoming = filtered
    .filter(e => new Date(e.starts_at) >= now)
    .slice(0, 5)

  return (
    <div style={{ fontFamily: font.sans }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, letterSpacing: '0.04em' }}>Calendar</h3>
        <Link href="/events/new" style={{ fontSize: 11, color: C.accent, textDecoration: 'none', fontWeight: 500, border: `1px solid ${C.accent}`, padding: '3px 10px', borderRadius: 100 }}>
          + New
        </Link>
      </div>

      {/* Toggle: All / Mine */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 3 }}>
        {(['all', 'mine'] as const).map(type => (
          <button key={type} onClick={() => { setCalendarType(type); setActiveTag(null); setSelectedDay(null) }} style={{
            flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 12, fontWeight: 500,
            fontFamily: font.sans, border: 'none', cursor: 'pointer', transition: 'all 0.14s',
            background: calendarType === type ? 'rgba(255,255,255,0.15)' : 'transparent',
            color: calendarType === type ? C.textPrimary : C.textMuted,
          }}>
            {type === 'all' ? 'All events' : 'My calendar'}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
          <button onClick={() => setActiveTag(null)} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: font.sans, border: `1px solid ${activeTag === null ? C.accent : C.divider}`, background: activeTag === null ? 'rgba(168,240,224,0.15)' : 'transparent', color: activeTag === null ? C.accent : C.textMuted }}>
            All
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: font.sans, border: `1px solid ${activeTag === tag ? C.accent : C.divider}`, background: activeTag === tag ? 'rgba(168,240,224,0.15)' : 'transparent', color: activeTag === tag ? C.accent : C.textMuted }}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 16, padding: '2px 6px' }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{FULL_MONTHS[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 16, padding: '2px 6px' }}>›</button>
      </div>

      {/* Mini calendar grid */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 8px', marginBottom: 16 }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, color: C.textMuted, padding: '2px 0', textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = byDay[key] ?? []
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = selectedDay === key
            const hasEvents = dayEvents.length > 0
            const dotColor = hasEvents ? (CATEGORY_COLORS[(dayEvents[0].tags ?? [])[0]] ?? C.accent) : null


            return (
              <div key={key} onClick={() => hasEvents && setSelectedDay(isSelected ? null : key)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '2px 0', cursor: hasEvents ? 'pointer' : 'default',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: isToday ? 700 : 400,
                  background: isSelected ? C.accent : isToday ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: isSelected ? '#1A2A6B' : isToday ? C.textPrimary : hasEvents ? C.textPrimary : C.textMuted,
                  transition: 'all 0.12s',
                }}>
                  {day}
                </div>
                {dotColor && !isSelected && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor, marginTop: 1 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedEvents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 8 }}>
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedEvents.map(e => (
              <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.divider}`, borderRadius: 8, padding: '8px 12px', transition: 'background 0.14s' }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 2 }}>{e.title}</p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>
                    {new Date(e.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {e.location ? ` · ${e.location}` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: C.divider, margin: '4px 0 16px' }} />

      {/* Upcoming */}
      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 10 }}>
        Upcoming
      </p>

      {upcoming.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 12, color: C.textMuted }}>
            {calendarType === 'mine' ? 'No events saved yet.' : 'No upcoming events.'}
          </p>
          {calendarType === 'mine' && (
            <Link href="/" style={{ fontSize: 11, color: C.accent, textDecoration: 'none' }}>Browse events →</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcoming.map(e => {
            const d = new Date(e.starts_at)
            const tagColor = CATEGORY_COLORS[(e.tags ?? [])[0]] ?? C.accent
            return (
              <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.divider}`, transition: 'background 0.14s' }}>
                  {/* Date badge */}
                  <div style={{ flexShrink: 0, width: 36, textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 0' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{MONTHS[d.getMonth()]}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{d.getDate()}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
                    <p style={{ fontSize: 11, color: C.textMuted }}>
                      {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {e.location ? ` · ${e.location}` : ''}
                    </p>
                    {e.tags?.[0] && (
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 100, background: tagColor, color: '#1A2A6B', fontWeight: 600, display: 'inline-block', marginTop: 4 }}>
                        #{e.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
          <Link href="/" style={{ fontSize: 11, color: C.textMuted, textDecoration: 'none', textAlign: 'center', display: 'block', paddingTop: 4 }}>
            View full calendar →
          </Link>
        </div>
      )}
    </div>
  )
}