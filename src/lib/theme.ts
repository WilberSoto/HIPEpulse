// Pulse design tokens — import wherever inline styles are used

export const C = {
  bg:             '#5879F7',
  bgDeep:         '#3D5CE8',
  header:         '#1A2A6B',
  headerBorder:   '#2A3D8F',
  card:           'rgba(255,255,255,0.12)',
  cardHover:      'rgba(255,255,255,0.18)',
  cardBorder:     'rgba(255,255,255,0.20)',
  cardSolid:      'rgba(30,50,140,0.6)',
  textPrimary:    '#FFFFFF',
  textSecondary:  '#BDC9FC',
  textMuted:      '#8FA0F5',
  accent:         '#A8F0E0',
  accentAlt:      '#F7E258',
  inputBg:        'rgba(255,255,255,0.10)',
  inputBorder:    'rgba(255,255,255,0.25)',
  btnPrimaryBg:   '#FFFFFF',
  btnPrimaryText: '#1A2A6B',
  btnSecBg:       'rgba(255,255,255,0.10)',
  btnSecBorder:   'rgba(255,255,255,0.25)',
  divider:        'rgba(255,255,255,0.15)',
} as const

export const glass = {
  background:   'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border:       '1px solid rgba(255,255,255,0.20)',
  borderRadius: 16,
} as const

export const glassCard = {
  ...glass,
  padding: '20px',
} as const

export const font = {
  sans:  "'DM Sans', sans-serif",
  serif: "'Cormorant Garamond', serif",
} as const