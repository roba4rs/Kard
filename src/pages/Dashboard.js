import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const PLATFORMS = ['linkedin', 'github', 'instagram', 'telegram', 'website', 'other']

const PLATFORM_ICONS = {
  linkedin: '💼',
  github: '🐙',
  instagram: '📷',
  telegram: '✈️',
  website: '🌐',
  other: '🔗',
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
    fontSize: 13,
    fontWeight: 500,
    color: C.textSecond,
    marginBottom: 6,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    marginBottom: 16,
    background: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 8,
    fontSize: 14,
    color: C.textPrimary,
    boxSizing: 'border-box',
    outline: 'none',
  },
  btnPrimary: {
    display: 'block',
    width: '100%',
    padding: '11px',
    background: C.accent,
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
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
  const [profile, setProfile] = useState({
    display_name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    slug: '',
    published: true,
  })
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingLinks, setSavingLinks] = useState(false)
  const [message, setMessage] = useState(null)
  const [linksMessage, setLinksMessage] = useState(null)

  const fetchProfile = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
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
  }, [user])

  useEffect(() => {
    if (user) fetchProfile()
  }, [user, fetchProfile])

  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...profile, id: user.id })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile saved!' })
    }
    setSaving(false)
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
    const svg = document.getElementById('kard-qr')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.5px' }}>
            kard<span style={{ color: C.accent }}>.</span>
          </span>
          <button style={S.btnGhost} onClick={handleSignOut}>Sign out</button>
        </div>

        {/* Profile Section */}
        <div style={S.card}>
          <p style={S.cardTitle}>Your profile</p>

          {/* Avatar initials */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: C.accent,
              color: '#000',
              fontSize: 22,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '-1px',
            }}>
              {getInitials()}
            </div>
          </div>

          <label style={S.label}>Display name</label>
          <input
            style={S.input}
            value={profile.display_name}
            onChange={e => setProfile({ ...profile, display_name: e.target.value })}
            placeholder="Robel Haile"
          />

          <label style={S.label}>Title</label>
          <input
            style={S.input}
            value={profile.title}
            onChange={e => setProfile({ ...profile, title: e.target.value })}
            placeholder="Software Engineer"
          />

          <label style={S.label}>Company</label>
          <input
            style={S.input}
            value={profile.company}
            onChange={e => setProfile({ ...profile, company: e.target.value })}
            placeholder="Acme Inc."
          />

          <label style={S.label}>Email (shown on card)</label>
          <input
            style={S.input}
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
            placeholder="robel@example.com"
          />

          <label style={S.label}>Phone (shown on card)</label>
          <input
            style={S.input}
            value={profile.phone || ''}
            onChange={e => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+251911223344"
          />

          <label style={S.label}>Slug</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: 16, gap: 0 }}>
            <span style={{
              padding: '10px 10px 10px 14px',
              background: C.inputBg,
              border: `1px solid ${C.inputBorder}`,
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              fontSize: 13,
              color: C.textMuted,
              whiteSpace: 'nowrap',
            }}>
              kard.app/r/
            </span>
            <input
              style={{ ...S.input, marginBottom: 0, borderRadius: '0 8px 8px 0', flex: 1, minWidth: 100 }}
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

          {profile.slug && (
            <p style={{ marginTop: 14, fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
              Public page:{' '}
              <a
                href={'/r/' + profile.slug}
                target="_blank"
                rel="noreferrer"
                style={{ color: C.accent, textDecoration: 'none' }}
              >
                kard.app/r/{profile.slug}
              </a>
            </p>
          )}
        </div>

        {/* QR Code Section */}
        {profile.slug && (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <p style={S.cardTitle}>QR code</p>
            <div style={{
              display: 'inline-block',
              background: '#ffffff',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
            }}>
              <QRCodeSVG
                id="kard-qr"
                value={publicUrl}
                size={160}
              />
            </div>
            <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 16, wordBreak: 'break-all' }}>
              {publicUrl}
            </p>
            <button style={S.btnGhost} onClick={downloadQR}>
              Download PNG
            </button>
          </div>
        )}

        {/* Links Section */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ ...S.cardTitle, marginBottom: 0 }}>Links</p>
            <button style={S.btnGhost} onClick={addLink}>+ Add link</button>
          </div>

          {links.length === 0 && (
            <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 4 }}>
              No links yet. Add your first one.
            </p>
          )}

          {links.map(link => (
            <div key={link.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <select
                style={{ ...S.input, marginBottom: 0, width: 148, flex: '1 1 140px' }}
                value={link.platform}
                onChange={e => updateLink(link.id, 'platform', e.target.value)}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>
                    {PLATFORM_ICONS[p]} {p}
                  </option>
                ))}
              </select>

              <input
                style={{ ...S.input, marginBottom: 0, flex: '3 1 180px' }}
                value={link.url}
                onChange={e => updateLink(link.id, 'url', e.target.value)}
                placeholder="https://..."
              />

              {link.platform === 'other' && (
                <input
                  style={{ ...S.input, marginBottom: 0, flex: '1 1 110px' }}
                  value={link.label}
                  onChange={e => updateLink(link.id, 'label', e.target.value)}
                  placeholder="Label"
                />
              )}

              <button
                onClick={() => removeLink(link.id, link.isNew)}
                style={{
                  ...S.btnGhost,
                  flexShrink: 0,
                  padding: '8px 10px',
                  color: C.danger,
                  borderColor: 'transparent',
                  fontSize: 13,
                }}
              >
                ✕
              </button>
            </div>
          ))}

          {linksMessage && (
            <p style={{ ...(linksMessage.type === 'error' ? S.errorMsg : S.successMsg), marginTop: 12 }}>
              {linksMessage.text}
            </p>
          )}

          {links.length > 0 && (
            <button style={{ ...S.btnPrimary, marginTop: 12 }} onClick={saveLinks} disabled={savingLinks}>
              {savingLinks ? 'Saving...' : 'Save links'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}