'use client'

import { useState } from 'react'
import Link from 'next/link'
import { C, font } from '@/lib/theme'

type CalendarEvent = {
  id: string
  title: string
  starts_at: string
  tags: string[]
  image_url: string | null
  location: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  Art: '#A8F0E0', Music: '#F7E258', Theatre: '#F0A8D0',
  Dance: '#C8A8F0', Writing: '#A8D4F0', Film: '#F0C8A8',
  Photography: '#A8F0B8', Design: '#F0A8A8', Tech: '#A8C8F0', Gaming: '#D4A8F0',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarGrid({ events, allTags }: { events: CalendarEvent[]; allTags: string[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = activeTag ? events.filter(e => e.tags?.includes(activeTag)) : events

  const byDay: Record<string, CalendarEvent[]> = {}
  filtered.forEach(e => {
    const d = new Date(e.starts_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(e)
  })

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1); setSelected(null) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1); setSelected(null) }

  const selectedKey = selected
  const selectedEvents = selectedKey ? (byDay[selectedKey] ?? []) : []

  return (
    <div style={{ fontFamily: font.sans }}>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          <button onClick={() => setActiveTag(null)} style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: activeTag === null ? `1px solid ${C.textPrimary}` : `1px solid ${C.cardBorder}`, background: activeTag === null ? C.btnPrimaryBg : C.btnSecBg, color: activeTag === null ? C.btnPrimaryText : C.textSecondary, fontFamily: font.sans }}>All</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: activeTag === tag ? `1px solid ${C.textPrimary}` : `1px solid ${C.cardBorder}`, background: activeTag === tag ? C.btnPrimaryBg : C.btnSecBg, color: activeTag === tag ? C.btnPrimaryText : C.textSecondary, fontFamily: font.sans }}>#{tag}</button>
          ))}
        </div>
      )}

      {/* Calendar */}
      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.cardBorder}` }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 18, padding: '4px 8px' }}>‹</button>
          <h2 style={{ fontFamily: font.serif, fontSize: 22, fontWeight: 600, color: C.textPrimary }}>{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecondary, fontSize: 18, padding: '4px 8px' }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${C.cardBorder}` }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: C.textMuted, textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: 80, borderRight: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}`, background: 'rgba(0,0,0,0.05)' }} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = byDay[key] ?? []
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = selected === key

            return (
              <div key={key} onClick={() => setSelected(isSelected ? null : key)} style={{
                minHeight: 80, padding: '6px 8px',
                borderRight: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}`,
                cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                background: isSelected ? 'rgba(255,255,255,0.12)' : 'transparent',
                transition: 'background 0.14s',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: isToday ? 600 : 400,
                  background: isToday ? C.btnPrimaryBg : 'transparent',
                  color: isToday ? C.btnPrimaryText : C.textSecondary,
                  marginBottom: 4,
                }}>
                  {day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayEvents.slice(0, 3).map(e => {
                    const tagColor = e.tags?.[0] ? (CATEGORY_COLORS[e.tags[0]] ?? C.accent) : C.accent
                    return (
                      <div key={e.id} style={{
                        fontSize: 10, padding: '2px 5px', borderRadius: 4,
                        background: tagColor, color: '#1A2A6B',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500,
                      }}>
                        {e.title}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: 10, color: C.textMuted }}>+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedEvents.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted, marginBottom: 12 }}>
            Events on {new Date(selectedKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedEvents.map(e => (
              <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', backdropFilter: 'blur(16px)' }}>
                  {e.image_url && (
                    <img src={e.image_url} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{e.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: C.textSecondary }}>
                        {new Date(e.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {e.location && <span style={{ fontSize: 12, color: C.textMuted }}>· {e.location}</span>}
                    </div>
                    {e.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        {e.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: CATEGORY_COLORS[tag] ?? C.accent, color: '#1A2A6B', fontWeight: 500 }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted }}>
          <p style={{ fontFamily: font.serif, fontSize: 24, marginBottom: 8 }}>No events yet</p>
          <p style={{ fontSize: 14, fontWeight: 300 }}>Be the first to create one.</p>
        </div>
      )}
    </div>
  )
}