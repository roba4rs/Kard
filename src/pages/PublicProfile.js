import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const PLATFORM_ICONS = {
  linkedin: '💼',
  github: '🐙',
  instagram: '📸',
  telegram: '✈️',
  website: '🌐',
  other: '🔗'
}

// ── Design tokens (matches Dashboard.js) ───────────────────
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
    maxWidth: 480,
    margin: '0 auto',
    padding: '48px 20px 80px',
  },
  card: {
    background: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  btnPrimary: {
    display: 'block',
    padding: '13px',
    background: C.accent,
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  btnGhost: {
    display: 'block',
    width: '100%',
    padding: '13px',
    background: 'transparent',
    color: C.textPrimary,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
}

export default function PublicProfile() {
  const { slug } = useParams()
  const [profile, setProfile] = useState(null)
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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

  const downloadVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:' + profile.display_name,
      profile.title ? 'TITLE:' + profile.title : '',
      profile.company ? 'ORG:' + profile.company : '',
      profile.phone && profile.phone_verified ? 'TEL:' + profile.phone : '',
      profile.email ? 'EMAIL:' + profile.email : '',
      'END:VCARD'
    ].filter(Boolean).join('\n')

    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = profile.display_name + '.vcf'
    a.click()
    URL.revokeObjectURL(url)
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

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* Identity */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: 16,
                border: `1px solid ${C.cardBorder}`,
              }}
            />
          ) : (
            <div style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: C.accent,
              color: '#000',
              fontSize: 28,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '-1px',
              margin: '0 auto 16px',
            }}>
              {getInitials(profile.display_name)}
            </div>
          )}
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: C.textPrimary }}>
            {profile.display_name}
          </h1>
          {(profile.title || profile.company) && (
            <p style={{ margin: 0, fontSize: 14, color: C.textSecond }}>
              {profile.title}
              {profile.title && profile.company ? ' · ' : ''}
              {profile.company}
            </p>
          )}
        </div>

        {/* Call + Email, side by side */}
        {(profile.phone && profile.phone_verified) || profile.email ? (
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {profile.phone && profile.phone_verified && (
              <a href={'tel:' + profile.phone} style={{ ...S.btnPrimary, flex: 1 }}>
                📞 Call
              </a>
            )}
            {profile.email && (
              <a href={'mailto:' + profile.email} style={{ ...S.btnPrimary, flex: 1 }}>
                ✉️ Email
              </a>
            )}
          </div>
        ) : null}

        {/* Save contact */}
        <button onClick={downloadVCard} style={{ ...S.btnGhost, marginBottom: 10 }}>
          💾 Save contact
        </button>

        {/* Resume */}
        {profile.resume_url && (
          <a
            href={profile.resume_url}
            target="_blank"
            rel="noreferrer"
            style={{ ...S.btnGhost, marginBottom: 10 }}
          >
            📄 View resume
          </a>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {links.map(function(link) {
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...S.card,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    marginBottom: 8,
                    textDecoration: 'none',
                  }}
                >
                  <span>{PLATFORM_ICONS[link.platform] || '🔗'}</span>
                  <span style={{ flex: 1, fontSize: 14, color: C.textPrimary }}>
                    {link.platform === 'other'
                      ? link.label
                      : link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  </span>
                  <span style={{ color: C.textMuted }}>›</span>
                </a>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}