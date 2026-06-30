import { useState, useEffect, useCallback, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import PrintCardModal from '../components/PrintCardModal'
import AvatarCropModal from '../components/AvatarCropModal'
import { COUNTRY_CODES, parsePhone, getCountry } from '../data/countryCodes'

const PLATFORMS = ['linkedin', 'github', 'instagram', 'facebook', 'tiktok', 'threads', 'telegram', 'website', 'other']

const PLATFORM_LABELS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  threads: 'Threads',
  telegram: 'Telegram',
  website: 'Website',
  other: 'Other',
}

// Brand background per platform (used behind the icon glyph)
const PLATFORM_BG = {
  linkedin: '#0A66C2',
  github: '#24292F',
  instagram: 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)',
  facebook: '#1877F2',
  tiktok: '#000000',
  threads: '#000000',
  telegram: '#26A5E4',
  website: '#2a2a2a',
  other: '#2a2a2a',
}

// Simple, recognizable glyphs (not official brand SVGs) rendered in white
// on top of the brand-colored badge background above.
function PlatformGlyph({ platform, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' }
  switch (platform) {
    case 'linkedin':
      return (
        <svg {...common}>
          <rect x="3" y="9" width="3.2" height="11" fill="#fff" />
          <circle cx="4.6" cy="4.8" r="2" fill="#fff" />
          <path d="M10.5 9h3v1.7c.6-1 1.7-2 3.5-2 3 0 4 1.9 4 5V20h-3.2v-5.7c0-1.4-.5-2.4-1.8-2.4-1 0-1.6.7-1.9 1.3-.1.3-.1.6-.1 1V20h-3.2c0-7.8 0-9.4 0-11Z" fill="#fff" />
        </svg>
      )
    case 'github':
      return (
        <svg {...common}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.7-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.9-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.94.36.31.68.93.68 1.87v2.78c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"
            fill="#fff"
          />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4.2" stroke="#fff" strokeWidth="1.8" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="#fff" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...common}>
          <path d="M14.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7v2.1H9.2v2.8h2.5V21h2.8Z" fill="#fff" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M16.6 5.82a4.28 4.28 0 0 1-2.45-3.32h-.02V2h-3.14v13.4a2.6 2.6 0 1 1-1.84-2.49V9.66a5.74 5.74 0 0 0-.92-.07A5.86 5.86 0 1 0 14.1 15.4V9.1a7.4 7.4 0 0 0 4.32 1.38V7.34a4.25 4.25 0 0 1-1.82-.4l.02-.02a4.3 4.3 0 0 1-2.02-1.1Z" fill="#25F4EE" transform="translate(-0.9,0.6)" />
          <path d="M16.6 5.82a4.28 4.28 0 0 1-2.45-3.32h-.02V2h-3.14v13.4a2.6 2.6 0 1 1-1.84-2.49V9.66a5.74 5.74 0 0 0-.92-.07A5.86 5.86 0 1 0 14.1 15.4V9.1a7.4 7.4 0 0 0 4.32 1.38V7.34a4.25 4.25 0 0 1-1.82-.4l.02-.02a4.3 4.3 0 0 1-2.02-1.1Z" fill="#FE2C55" transform="translate(0.9,-0.6)" />
          <path d="M16.6 5.82a4.28 4.28 0 0 1-2.45-3.32h-.02V2h-3.14v13.4a2.6 2.6 0 1 1-1.84-2.49V9.66a5.74 5.74 0 0 0-.92-.07A5.86 5.86 0 1 0 14.1 15.4V9.1a7.4 7.4 0 0 0 4.32 1.38V7.34a4.25 4.25 0 0 1-1.82-.4l.02-.02a4.3 4.3 0 0 1-2.02-1.1Z" fill="#ffffff" />
        </svg>
      )
    case 'threads':
      return (
        <svg {...common}>
          <path
            d="M12 2C6.8 2 4 5.6 4 11.9 4 18 6.8 22 12 22c4 0 6.5-2 7.3-5.4l-2.5-.6c-.5 2-1.7 3.4-4.3 3.4-3 0-4.6-2-4.8-5.3.9.6 2.2.9 3.7.9 3.5 0 5.7-1.7 5.7-4.4 0-2.6-2-4.3-5-4.3-2.5 0-4.4 1.1-5.3 3l2.3 1.1c.5-1 1.5-1.6 2.8-1.6 1.4 0 2.3.6 2.3 1.7 0 1-1 1.6-2.9 1.6-.9 0-1.8-.2-2.6-.5.3-3 1.7-4.4 4-4.4 2 0 3.4 1 4 2.8l2.4-.8C18.8 3.6 16.2 2 12 2Z"
            fill="#fff"
          />
        </svg>
      )
    case 'telegram':
      return (
        <svg {...common}>
          <path d="M21 4 2.5 11.3c-.7.3-.7 1.3.1 1.5l4.4 1.4 1.7 5.3c.2.7 1.1.9 1.6.3l2.4-2.6 4.6 3.4c.6.4 1.4.1 1.6-.6L22 4.8c.2-.7-.5-1.3-1-.8ZM8 13.9l8.4-6c.3-.2.6.2.3.4l-6.8 6.3-.3 3-1.6-3.7Z" fill="#fff" />
        </svg>
      )
    case 'website':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="4" ry="9" stroke="#fff" strokeWidth="1.6" />
          <path d="M3 12h18M4.2 7.5h15.6M4.2 16.5h15.6" stroke="#fff" strokeWidth="1.6" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path
            d="M9.5 14.5 14.5 9.5M8 11l-1.5 1.5a3 3 0 0 0 4.2 4.2L12 15.4M16 13l1.5-1.5a3 3 0 0 0-4.2-4.2L12 8.6"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}

function PlatformBadge({ platform, size = 34 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.28),
      background: PLATFORM_BG[platform] || '#2a2a2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <PlatformGlyph platform={platform} size={Math.round(size * 0.52)} />
    </div>
  )
}

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'links', label: 'Links' },
  { id: 'qr', label: 'QR Code' },
  { id: 'preview', label: 'Preview' },
]

// Pulls the storage path (e.g. "userid/avatar-12345.jpg") back out of a
// Supabase public URL, so we can delete the previous avatar file on re-upload.
function extractAvatarPath(publicUrl) {
  const marker = '/avatars/'
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length).split('?')[0]
}

// ── Design tokens ──────────────────────────────────────────
const C = {
  bg:          '#0a0a0a',
  cardBg:      '#111111',
  cardBorder:  '#222222',
  inputBg:     '#1a1a1a',
  inputBorder: '#2a2a2a',
  inputFocus:  '#22c55e',
  textPrimary: '#ffffff',
  textSecond:  '#888888',
  textMuted:   '#555555',
  accent:      '#22c55e',
  accentSoft:  '#15301f',
  accentHover: '#16a34a',
  danger:      '#ef4444',
}

const S = {
  page: {
    minHeight: '100vh',
    background: C.bg,
    color: C.textPrimary,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  container: {
    maxWidth: 560,
    margin: '0 auto',
    padding: 'clamp(20px, 5vw, 40px) clamp(12px, 4vw, 20px) 80px',
    boxSizing: 'border-box',
  },
  card: {
    background: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 16,
    padding: 'clamp(16px, 4vw, 24px)',
    marginBottom: 16,
    boxSizing: 'border-box',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: C.textPrimary,
    margin: '0 0 20px 0',
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: C.textSecond,
    marginBottom: 8,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '12px 14px',
    marginBottom: 16,
    background: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 10,
    fontSize: 14,
    color: C.textPrimary,
    boxSizing: 'border-box',
    outline: 'none',
  },
  btnPrimary: {
    display: 'block',
    width: '100%',
    padding: '14px',
    background: C.accent,
    color: '#000',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnGhost: {
    padding: '8px 14px',
    background: 'transparent',
    color: C.textSecond,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },
  errorMsg: {
    fontSize: 13,
    color: C.danger,
    marginBottom: 12,
  },
  successMsg: {
    fontSize: 13,
    color: C.accent,
    marginBottom: 12,
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    display_name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    slug: '',
    avatar_url: null,
    published: true,
  })
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingLinks, setSavingLinks] = useState(false)
  const [message, setMessage] = useState(null)
  const [linksMessage, setLinksMessage] = useState(null)
  const [stats, setStats] = useState({ totalViews: 0, weekViews: 0, saves: 0, calls: 0 })
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState('ET')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cropFile, setCropFile] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const fileInputRef = useRef(null)

  const fetchProfile = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      const parsed = parsePhone(data.phone)
      setPhoneCountry(parsed.iso2)
      setPhoneNumber(parsed.number)
    } else {
      const baseSlug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
      setProfile(prev => ({ ...prev, slug: baseSlug, email: user.email }))
    }

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', user.id)
      .order('sort_order')

    if (linksData) setLinks(linksData)
    setLoading(false)
    fetchStats(user.id)
  }, [user])

  const fetchStats = async (profileId) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [totalViews, weekViews, saves, calls] = await Promise.all([
      supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('profile_id', profileId),
      supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('profile_id', profileId).gte('created_at', weekAgo),
      supabase.from('profile_saves').select('id', { count: 'exact', head: true }).eq('profile_id', profileId),
      supabase.from('profile_calls').select('id', { count: 'exact', head: true }).eq('profile_id', profileId),
    ])

    setStats({
      totalViews: totalViews.count || 0,
      weekViews: weekViews.count || 0,
      saves: saves.count || 0,
      calls: calls.count || 0,
    })
  }

  useEffect(() => {
    if (user) fetchProfile()
  }, [user, fetchProfile])

  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)
    const dial = getCountry(phoneCountry).dial
    const combinedPhone = phoneNumber ? `+${dial}${phoneNumber.replace(/[^0-9]/g, '')}` : ''
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...profile, phone: combinedPhone, id: user.id })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setProfile(prev => ({ ...prev, phone: combinedPhone }))
      setMessage({ type: 'success', text: 'Profile saved!' })
    }
    setSaving(false)
  }

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) setCropFile(file)
    e.target.value = '' // allow re-selecting the same file later
  }

  const handleAvatarCropConfirm = async (blob) => {
    setCropFile(null)
    setUploadingAvatar(true)
    try {
      const path = `${user.id}/avatar-${Date.now()}.jpg`
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(path, blob, { upsert: false, contentType: 'image/jpeg' })

      if (uploadError) {
        setMessage({ type: 'error', text: uploadError.message })
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const oldPath = profile.avatar_url ? extractAvatarPath(profile.avatar_url) : null

      setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }))
      setMessage({ type: 'success', text: 'Photo updated — click Save profile to confirm.' })

      // Best-effort cleanup of the previous avatar file (non-blocking, ignore failures)
      if (oldPath) {
        supabase.storage.from('avatars').remove([oldPath]).catch(() => {})
      }
    } finally {
      setUploadingAvatar(false)
    }
  }

  const addLink = () => {
    setLinks([...links, {
      id: crypto.randomUUID(),
      profile_id: user.id,
      platform: 'linkedin',
      url: '',
      label: '',
      sort_order: links.length,
      isNew: true,
    }])
  }

  const updateLink = (id, field, value) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const removeLink = async (id, isNew) => {
    if (!isNew) {
      await supabase.from('links').delete().eq('id', id)
    }
    setLinks(links.filter(l => l.id !== id))
  }

  const saveLinks = async () => {
    setSavingLinks(true)
    setLinksMessage(null)
    for (const link of links) {
      const linkData = { ...link }
      delete linkData.isNew
      await supabase.from('links').upsert(linkData)
    }
    setLinksMessage({ type: 'success', text: 'Links saved!' })
    setSavingLinks(false)
  }

  const downloadQR = () => {
    const svg = document.getElementById('kard-qr-download')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = 'kard-qr.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const getInitials = () => {
    const name = profile.display_name || user?.email || ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const publicUrl = window.location.origin + '/r/' + profile.slug

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.textSecond }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.5px' }}>
            kard<span style={{ color: C.accent }}>.</span>
          </span>
          <button style={S.btnGhost} onClick={handleSignOut}>Sign out</button>
        </div>

        {/* Identity row: avatar + name + slug, left-aligned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: C.accent,
            color: '#000',
            fontSize: 18,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: '-0.5px',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.display_name || 'Your name'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: C.textSecond }}>
              kard.app/r/{profile.slug || '...'}
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === tab.id ? C.inputBg : 'transparent',
                color: activeTab === tab.id ? C.textPrimary : C.textSecond,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ───────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div style={S.card}>
            {/* Photo upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: C.inputBg,
                border: `1px solid ${C.inputBorder}`, overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: C.textSecond,
              }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials()}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  style={S.btnGhost}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? 'Uploading...' : profile.avatar_url ? 'Change photo' : 'Upload photo'}
                </button>
              </div>
            </div>

            <label style={S.label}>Display name</label>
            <input
              style={S.input}
              value={profile.display_name}
              onChange={e => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="Robel Haile"
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={S.label}>Title</label>
                <input
                  style={S.input}
                  value={profile.title}
                  onChange={e => setProfile({ ...profile, title: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={S.label}>Company</label>
                <input
                  style={S.input}
                  value={profile.company}
                  onChange={e => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <label style={S.label}>Email</label>
            <input
              style={S.input}
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              placeholder="robel@example.com"
            />

            <label style={S.label}>Phone</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <select
                style={{ ...S.input, marginBottom: 0, width: 'auto', flexShrink: 0, paddingRight: 8 }}
                value={phoneCountry}
                onChange={e => setPhoneCountry(e.target.value)}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.iso2} value={c.iso2}>
                    {c.flag} +{c.dial}
                  </option>
                ))}
              </select>
              <input
                style={{ ...S.input, marginBottom: 0, flex: 1 }}
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="911223344"
                inputMode="numeric"
              />
            </div>

            <label style={S.label}>Public slug</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: 16, gap: 0 }}>
              <span style={{
                padding: '12px 10px 12px 14px',
                background: C.inputBg,
                border: `1px solid ${C.inputBorder}`,
                borderRight: 'none',
                borderRadius: '10px 0 0 10px',
                fontSize: 13,
                color: C.textMuted,
                whiteSpace: 'nowrap',
              }}>
                kard.app/r/
              </span>
              <input
                style={{ ...S.input, marginBottom: 0, borderRadius: '0 10px 10px 0', flex: 1, minWidth: 100 }}
                value={profile.slug}
                onChange={e => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="your-name"
              />
            </div>

            {message && (
              <p style={message.type === 'error' ? S.errorMsg : S.successMsg}>
                {message.text}
              </p>
            )}

            <button style={S.btnPrimary} onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        )}

        {/* ── LINKS TAB ─────────────────────────────────────── */}
        {activeTab === 'links' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ ...S.cardTitle, marginBottom: 0, fontSize: 17 }}>Links</p>
              <button
                onClick={addLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: C.accentSoft,
                  color: C.accent,
                  border: 'none',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add link
              </button>
            </div>

            {links.length === 0 && (
              <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 4 }}>
                No links yet. Add your first one.
              </p>
            )}

            {links.map(link => (
              <div
                key={link.id}
                style={{
                  background: C.inputBg,
                  border: `1px solid ${C.inputBorder}`,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                {/* Top row: icon badge, platform select, remove button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <PlatformBadge platform={link.platform} size={34} />

                  <select
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: C.textPrimary,
                      fontSize: 15,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                    value={link.platform}
                    onChange={e => updateLink(link.id, 'platform', e.target.value)}
                  >
                    {PLATFORMS.map(p => (
                      <option key={p} value={p} style={{ background: C.inputBg, color: C.textPrimary }}>
                        {PLATFORM_LABELS[p]}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeLink(link.id, link.isNew)}
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      border: 'none',
                      color: C.textSecond,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* URL input */}
                <input
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 14px',
                    background: C.cardBg,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 10,
                    fontSize: 14,
                    color: C.textPrimary,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  value={link.url}
                  onChange={e => updateLink(link.id, 'url', e.target.value)}
                  placeholder="https://..."
                />

                {/* Label input — only for "other" platform */}
                {link.platform === 'other' && (
                  <input
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 14px',
                      marginTop: 8,
                      background: C.cardBg,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 10,
                      fontSize: 14,
                      color: C.textPrimary,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    value={link.label}
                    onChange={e => updateLink(link.id, 'label', e.target.value)}
                    placeholder="Label"
                  />
                )}
              </div>
            ))}

            {linksMessage && (
              <p style={{ ...(linksMessage.type === 'error' ? S.errorMsg : S.successMsg), marginTop: 4 }}>
                {linksMessage.text}
              </p>
            )}

            {links.length > 0 && (
              <button
                style={{
                  ...S.btnPrimary,
                  marginTop: 12,
                  background: C.accent,
                  borderRadius: 999,
                  padding: '15px',
                  fontSize: 15,
                }}
                onClick={saveLinks}
                disabled={savingLinks}
              >
                {savingLinks ? 'Saving...' : 'Save links'}
              </button>
            )}
          </div>
        )}

        {/* ── QR CODE TAB ───────────────────────────────────── */}
        {activeTab === 'qr' && profile.slug && (
          <div style={S.card}>
            {/* Header row: avatar, name, slug pill, Live badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: C.accentSoft,
                color: C.accent,
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1.5px solid ${C.accent}`,
              }}>
                {getInitials()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile.display_name || 'Your name'}
                </p>
                <span style={{
                  display: 'inline-block',
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: C.accent,
                  background: 'rgba(34,197,94,0.1)',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}>
                  kard.app/r/{profile.slug}
                </span>
              </div>
              <span style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 600,
                color: C.accent,
                background: 'rgba(34,197,94,0.12)',
                padding: '4px 10px',
                borderRadius: 12,
              }}>
                {profile.published ? 'Live' : 'Hidden'}
              </span>
            </div>

            {/* Hidden full-resolution QR, used only by downloadQR */}
            <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
              <QRCodeSVG id="kard-qr-download" value={publicUrl} size={300} />
            </div>

            {/* QR code + stat grid, side by side */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{
                flexShrink: 0,
                width: 132,
                background: '#ffffff',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
                boxSizing: 'border-box',
              }}>
                <QRCodeSVG
                  id="kard-qr"
                  value={publicUrl}
                  size={112}
                />
              </div>

              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: 10,
              }}>
                {[
                  { label: 'Total views', value: stats.totalViews },
                  { label: 'This week', value: stats.weekViews },
                  { label: 'Saves', value: stats.saves },
                  { label: 'Calls', value: stats.calls },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: C.inputBg,
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 700, color: C.textPrimary }}>
                      {stat.value}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: C.textSecond }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action row: Copy / Download / Print */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...S.btnGhost, flex: 1, textAlign: 'center', padding: '10px' }}
                onClick={() => navigator.clipboard.writeText(publicUrl)}
              >
                Copy
              </button>
              <button
                style={{ ...S.btnGhost, flex: 1, textAlign: 'center', padding: '10px' }}
                onClick={downloadQR}
              >
                Download
              </button>
              <button
                style={{
                  ...S.btnPrimary,
                  flex: 1,
                  width: 'auto',
                  padding: '10px',
                }}
                onClick={() => setPrintModalOpen(true)}
              >
                Print
              </button>
            </div>
          </div>
        )}

        <PrintCardModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          profile={profile}
          publicUrl={publicUrl}
        />

        {activeTab === 'qr' && !profile.slug && (
          <div style={S.card}>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
              Set a public slug on the Profile tab to generate your QR code.
            </p>
          </div>
        )}

        {/* ── PREVIEW TAB ───────────────────────────────────── */}
        {activeTab === 'preview' && profile.slug && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ ...S.cardTitle, marginBottom: 0 }}>Public page preview</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btnGhost} onClick={() => setPreviewKey(k => k + 1)}>
                  Refresh
                </button>
                <a href={publicUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={S.btnGhost}>Open in new tab</button>
                </a>
              </div>
            </div>
            <div style={{
              border: `1px solid ${C.inputBorder}`,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#000',
            }}>
              <iframe
                key={previewKey}
                src={publicUrl}
                title="Public page preview"
                style={{ width: '100%', height: 560, border: 'none', display: 'block' }}
              />
            </div>
            <p style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>
              Save your profile first — this shows the live public page, not unsaved edits.
            </p>
          </div>
        )}

        {activeTab === 'preview' && !profile.slug && (
          <div style={S.card}>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
              Set a public slug on the Profile tab to preview your page.
            </p>
          </div>
        )}

        {cropFile && (
          <AvatarCropModal
            file={cropFile}
            onCancel={() => setCropFile(null)}
            onConfirm={handleAvatarCropConfirm}
          />
        )}

      </div>
    </div>
  )
}