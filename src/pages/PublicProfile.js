import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── SVG icon components (real brand marks, not emoji) ──────
const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
)
const IconGitHub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
)
const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.14 0-3.5.01-4.74.07-1.02.05-1.58.21-1.95.36-.49.19-.84.42-1.2.79-.37.36-.6.71-.79 1.2-.15.37-.31.93-.36 1.95-.06 1.24-.07 1.6-.07 4.74s.01 3.5.07 4.74c.05 1.02.21 1.58.36 1.95.19.49.42.84.79 1.2.36.37.71.6 1.2.79.37.15.93.31 1.95.36 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.02-.05 1.58-.21 1.95-.36.49-.19.84-.42 1.2-.79.37-.36.6-.71.79-1.2.15-.37.31-.93.36-1.95.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.05-1.02-.21-1.58-.36-1.95a3.2 3.2 0 0 0-.79-1.2 3.2 3.2 0 0 0-1.2-.79c-.37-.15-.93-.31-1.95-.36-1.24-.06-1.6-.07-4.74-.07zm0 4.12a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2zm0 1.62a3.48 3.48 0 1 0 0 6.96 3.48 3.48 0 0 0 0-6.96zm5.3-3.39a1.19 1.19 0 1 1 0 2.38 1.19 1.19 0 0 1 0-2.38z"/></svg>
)
const IconTelegram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.94 4.5L18.6 20.19c-.25 1.13-.91 1.4-1.84.87l-5.1-3.76-2.46 2.37c-.27.27-.5.5-1.02.5l.37-5.18 9.43-8.52c.41-.37-.09-.57-.64-.2L6.84 13.3 1.8 11.7c-1.1-.34-1.12-1.1.23-1.62L20.56 3.18c.92-.34 1.72.22 1.38 1.32z"/></svg>
)
const IconWebsite = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-3.1a15.7 15.7 0 0 0-1.39-3.92A8.03 8.03 0 0 1 18.93 8zM12 4.06c.79 1.06 1.62 2.6 2.1 3.94H9.9c.48-1.34 1.31-2.88 2.1-3.94zM4.26 14a8.1 8.1 0 0 1 0-4h3.49a16.7 16.7 0 0 0 0 4H4.26zm.81 2h3.1c.34 1.41.84 2.74 1.39 3.92A8.03 8.03 0 0 1 5.07 16zm3.1-8H5.07a8.03 8.03 0 0 1 4.49-3.92A15.7 15.7 0 0 0 8.17 8zM12 19.94c-.79-1.06-1.62-2.6-2.1-3.94h4.2c-.48 1.34-1.31 2.88-2.1 3.94zM14.45 14H9.55a14.7 14.7 0 0 1 0-4h4.9a14.7 14.7 0 0 1 0 4zm.2 5.92c.55-1.18 1.05-2.51 1.39-3.92h3.1a8.03 8.03 0 0 1-4.49 3.92zM16.25 14a16.7 16.7 0 0 0 0-4h3.49a8.1 8.1 0 0 1 0 4h-3.49z"/></svg>
)
const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
)
// TikTok's mark is a layered note (cyan + magenta offset behind a white note) —
// rendered with explicit fills rather than currentColor so the layering reads
// correctly on the dark tile background.
const IconTikTok = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M16.6 5.82a4.28 4.28 0 0 1-2.45-3.32h-.02V2h-3.14v13.4a2.6 2.6 0 1 1-1.84-2.49V9.66a5.74 5.74 0 0 0-.92-.07A5.86 5.86 0 1 0 14.1 15.4V9.1a7.4 7.4 0 0 0 4.32 1.38V7.34a4.25 4.25 0 0 1-1.82-.4l.02-.02a4.3 4.3 0 0 1-2.02-1.1Z" fill="#25F4EE" transform="translate(-0.9,0.6)"/>
    <path d="M16.6 5.82a4.28 4.28 0 0 1-2.45-3.32h-.02V2h-3.14v13.4a2.6 2.6 0 1 1-1.84-2.49V9.66a5.74 5.74 0 0 0-.92-.07A5.86 5.86 0 1 0 14.1 15.4V9.1a7.4 7.4 0 0 0 4.32 1.38V7.34a4.25 4.25 0 0 1-1.82-.4l.02-.02a4.3 4.3 0 0 1-2.02-1.1Z" fill="#FE2C55" transform="translate(0.9,-0.6)"/>
    <path d="M16.6 5.82a4.28 4.28 0 0 1-2.45-3.32h-.02V2h-3.14v13.4a2.6 2.6 0 1 1-1.84-2.49V9.66a5.74 5.74 0 0 0-.92-.07A5.86 5.86 0 1 0 14.1 15.4V9.1a7.4 7.4 0 0 0 4.32 1.38V7.34a4.25 4.25 0 0 1-1.82-.4l.02-.02a4.3 4.3 0 0 1-2.02-1.1Z" fill="#ffffff"/>
  </svg>
)
const IconThreads = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.2 2C7 2.04 4 5.6 4 11.9 4 18 7 22 12.2 22c4 0 6.6-2.1 7.4-5.6l-2.46-.55c-.5 2.1-1.9 3.6-4.7 3.6-3.2 0-5-2.1-5.2-5.7.9.6 2.3 1 3.9 1 3.7 0 6-1.8 6-4.7 0-2.8-2.1-4.6-5.3-4.6-2.6 0-4.6 1.2-5.5 3.1l2.3 1.1c.5-1.1 1.6-1.7 3-1.7 1.5 0 2.5.7 2.5 1.9 0 1.1-1.1 1.7-3.1 1.7-1 0-2-.2-2.8-.5.3-3.1 1.8-4.6 4.3-4.6 2.2 0 3.7 1.1 4.3 3l2.4-.7C18.9 3.6 16.1 2 12.2 2Z"/></svg>
)
const IconLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1h4V6H8a6 6 0 0 0 0 12h4v-1.9H8A4.1 4.1 0 0 1 3.9 12zM9 13h6v-2H9v2zm7-7h-4v1.9h4a4.1 4.1 0 0 1 0 8.2h-4V18h4a6 6 0 0 0 0-12z"/></svg>
)
const IconDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 7V3.5L19.5 9H14zM8 13h8v1.5H8V13zm0 3h8v1.5H8V16zm0-6h4v1.5H8V10z"/></svg>
)
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.5a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"/></svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
)
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM15 9H6V5h9v4z"/></svg>
)
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
)
const IconArrowUpRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
)

// ── Link tile styling: icon, bg, text color, label ─────────
const PLATFORM_META = {
  linkedin:  { Icon: IconLinkedIn,  bg: '#16243d', color: '#3b9eff', label: 'LinkedIn' },
  github:    { Icon: IconGitHub,    bg: '#192025', color: '#f8f8f8', label: 'GitHub' },
  instagram: { Icon: IconInstagram, bg: '#3a1530', color: '#f472b6', label: 'Instagram' },
  facebook:  { Icon: IconFacebook,  bg: '#13233f', color: '#3b82f6', label: 'Facebook' },
  tiktok:    { Icon: IconTikTok,    bg: '#12181c', color: '#f8f8f8', label: 'TikTok' },
  threads:   { Icon: IconThreads,   bg: '#192025', color: '#f8f8f8', label: 'Threads' },
  telegram:  { Icon: IconTelegram,  bg: '#11293a', color: '#38bdf8', label: 'Telegram' },
  website:   { Icon: IconWebsite,   bg: '#1a2e1c', color: '#68d36f', label: 'Website' },
  other:     { Icon: IconLink,      bg: '#192025', color: '#f8f8f8', label: null },
}

const RESUME_META = { Icon: IconDoc, bg: '#1a2e1c', color: '#68d36f', label: 'Resume' }

// Strip a URL down to a clean handle/domain for the card subtitle,
// e.g. "https://github.com/rgidey/" -> "github.com/rgidey"
const displayUrl = (url) => {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
}

// ── Design tokens (matches Dashboard.js) ───────────────────
const C = {
  bg:          '#090e11',
  frameBg:     '#12181c',
  frameBorder: 'rgba(255,255,255,0.08)',
  cardBg:      '#12181c',
  cardBorder:  'rgba(255,255,255,0.08)',
  inputBg:     '#192025',
  surfaceElevated: '#192025',
  inputBorder: 'rgba(255,255,255,0.1)',
  divider:     'rgba(255,255,255,0.08)',
  textPrimary: '#f8f8f8',
  textSecond:  '#8e9aa4',
  textMuted:   '#697178',
  accent:      '#68d36f',
  accentSoft:  '#192025',
  accentHover: '#56c75e',
  accentForeground: '#060d06',
  danger:      '#f94144',
}

const S = {
  page: {
    minHeight: '100vh',
    background: C.bg,
    color: C.textPrimary,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  outer: {
    maxWidth: 440,
    margin: '0 auto',
    padding: 'clamp(16px, 5vw, 28px) clamp(10px, 4vw, 16px) 48px',
    boxSizing: 'border-box',
  },
  frame: {
    background: C.frameBg,
    border: `1px solid ${C.frameBorder}`,
    borderRadius: 26,
    padding: 10,
    boxSizing: 'border-box',
  },
  card: {
    background: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 18,
    padding: 'clamp(20px, 6vw, 28px) clamp(16px, 5vw, 22px) 18px',
    boxSizing: 'border-box',
  },
  divider: {
    height: 1,
    background: C.divider,
    margin: '20px 0',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px',
    background: C.accent,
    color: C.accentForeground,
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  btnOutline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px',
    background: C.surfaceElevated,
    color: C.textPrimary,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  btnGhost: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: C.textSecond,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  btnIconOnly: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    flexShrink: 0,
    background: C.surfaceElevated,
    color: C.textSecond,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 12,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  eyebrow: {
    margin: '0 0 10px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.textMuted,
  },
  avatarWrap: {
    position: 'relative',
    width: 80,
    height: 80,
    flexShrink: 0,
    borderRadius: 10,
    overflow: 'hidden',
    background: C.inputBg,
    boxShadow: `0 0 28px 6px ${C.accent}55`,
  },
  avatarImg: {
    position: 'absolute',
    top: '-3%',
    left: '-3%',
    width: '106%',
    height: '106%',
    objectFit: 'cover',
    display: 'block',
  },
  avatarInitials: {
    position: 'relative',
    zIndex: 1,
    width: 80,
    height: 80,
    borderRadius: 10,
    background: C.accentSoft,
    color: C.accent,
    fontSize: 26,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '-0.5px',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    margin: 0,
    fontSize: 13,
    color: C.textSecond,
  },
  linksHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '0 0 10px 2px',
  },
  linksCount: {
    fontSize: 12,
    color: C.textMuted,
  },
  linkCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '13px 14px',
    marginBottom: 10,
    background: C.inputBg,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 16,
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
}

export default function PublicProfile() {
  const { slug } = useParams()
  const [profile, setProfile] = useState(null)
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const logView = async (profileId) => {
    try {
      await supabase.from('profile_views').insert({ profile_id: profileId })
    } catch (e) {
      // non-blocking — never let analytics break the public page
    }
  }

  const fetchProfile = useCallback(async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (!profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)
    logView(profileData.id)

    // ── Dynamic link preview metadata ──────────────────────
    // CRA renders client-side, so these tags don't exist until JS runs.
    // Most chat apps / Notes / link-preview cards fetch and parse the page
    // (sometimes via a headless renderer) so this still helps there, even
    // though it has no effect on the native camera scanner overlay, which
    // is rendered by the OS before any page content loads at all.
    const title = profileData.display_name
      ? `${profileData.display_name} — Kard`
      : 'Kard'
    const description = [profileData.title, profileData.company].filter(Boolean).join(' · ') || 'View my digital contact card'
    const image = profileData.avatar_url || ''

    document.title = title

    const setMeta = (attr, key, content) => {
      if (!content) return
      let tag = document.querySelector(`meta[${attr}="${key}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attr, key)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'profile')
    setMeta('property', 'og:url', window.location.href)
    if (image) setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:card', image ? 'summary' : 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    if (image) setMeta('name', 'twitter:image', image)
    setMeta('name', 'description', description)

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('sort_order')

    if (linksData) setLinks(linksData)
    setLoading(false)
  }, [slug])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const logSave = async () => {
    if (!profile) return
    try {
      await supabase.from('profile_saves').insert({ profile_id: profile.id })
    } catch (e) {
      // non-blocking
    }
  }

  const logCall = async () => {
    if (!profile) return
    try {
      await supabase.from('profile_calls').insert({ profile_id: profile.id })
    } catch (e) {
      // non-blocking
    }
  }

  const downloadVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:' + profile.display_name,
      profile.title ? 'TITLE:' + profile.title : '',
      profile.company ? 'ORG:' + profile.company : '',
      profile.phone ? 'TEL:' + profile.phone : '',
      profile.email ? 'EMAIL:' + profile.email : '',
      'END:VCARD'
    ].filter(Boolean).join('\n')

    // Using a data: URI instead of a blob: URI here. Blob URLs have no file
    // extension (e.g. blob:https://site.com/uuid), and some mobile browsers
    // won't recognize them as vCard content without one, so they just
    // download the file instead of opening the native "Add Contact" screen.
    // A base64 data URI with an explicit vcard mime type is recognized more
    // consistently by iOS Safari and Android Chrome for that native flow.
    // Desktop browsers will still just download it either way — there's no
    // contacts app to hand it off to there, which is expected.
    const dataUri = 'data:text/vcard;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(vcard)))
    window.location.href = dataUri
    logSave()
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(function(n) { return n[0] }).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.textSecond }}>Loading...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.textSecond }}>Profile not found.</p>
      </div>
    )
  }

  const hasLinks = links.length > 0 || profile.resume_url

  return (
    <div style={S.page}>
      <div style={S.outer}>
        <div style={S.frame}>
          <div style={S.card}>

            {/* Identity */}
            <p style={S.eyebrow}>Public Profile</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
              <div style={S.avatarWrap}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} style={S.avatarImg} />
                ) : (
                  <div style={S.avatarInitials}>{getInitials(profile.display_name)}</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.2px' }}>
                  {profile.display_name}
                </h1>
                {(profile.title || profile.company) && (
                  <p style={{ margin: '0 0 8px', fontSize: 14, color: C.textSecond }}>
                    {profile.title}
                    {profile.title && profile.company ? ' · ' : ''}
                    {profile.company}
                  </p>
                )}
                {profile.location && (
                  <div style={S.locationRow}>
                    <IconPin />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={S.divider} />

            {/* Call + Email + Save, in one row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: hasLinks ? 18 : 0 }}>
              {profile.phone && (
                <a href={'tel:' + profile.phone} onClick={logCall} style={{ ...S.btnPrimary, flex: 1.4 }}>
                  <IconPhone /> Call
                </a>
              )}
              {profile.email && (
                <a href={'mailto:' + profile.email} style={{ ...S.btnOutline, flex: 1.4 }}>
                  <IconMail /> Email
                </a>
              )}
              <button onClick={downloadVCard} style={S.btnIconOnly} aria-label="Save contact" title="Save contact">
                <IconSave />
              </button>
            </div>

            {/* Links (resume folded in) */}
            {hasLinks && (
              <div>
                <div style={S.linksHeaderRow}>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: C.textMuted,
                    textTransform: 'uppercase',
                    margin: 0,
                  }}>
                    Socials &amp; Links
                  </p>
                  <span style={S.linksCount}>
                    {links.length + (profile.resume_url ? 1 : 0)} total
                  </span>
                </div>

                {profile.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noreferrer" style={S.linkCard}>
                    <span style={{ ...S.iconTile, background: RESUME_META.bg, color: RESUME_META.color }}>
                      <RESUME_META.Icon />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                        {RESUME_META.label}
                      </span>
                      <span style={{ display: 'block', fontSize: 12.5, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        View document
                      </span>
                    </span>
                    <span style={{ color: C.textMuted, flexShrink: 0 }}><IconArrowUpRight /></span>
                  </a>
                )}

                {links.map(function(link) {
                  const meta = PLATFORM_META[link.platform] || PLATFORM_META.other
                  const title = link.platform === 'other' ? (link.label || 'Link') : meta.label
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={S.linkCard}>
                      <span style={{ ...S.iconTile, background: meta.bg, color: meta.color }}>
                        <meta.Icon />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                          {title}
                        </span>
                        <span style={{ display: 'block', fontSize: 12.5, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {displayUrl(link.url)}
                        </span>
                      </span>
                      <span style={{ color: C.textMuted, flexShrink: 0 }}><IconArrowUpRight /></span>
                    </a>
                  )
                })}
              </div>
            )}

            <div style={S.divider} />

            {/* Footer */}
            <p style={{
              textAlign: 'center',
              margin: 0,
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: C.textMuted,
            }}>
              Powered by <span style={{ color: C.accent, fontWeight: 700 }}>card.</span>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}