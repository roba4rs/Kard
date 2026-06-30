import { useState, useRef, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'

// ── Card dimensions: standard business card, 3.5in x 2in ───
const CARD_W = 350
const CARD_H = 200

const C = {
  cardBg:      '#111111',
  cardBorder:  '#222222',
  inputBg:     '#1a1a1a',
  inputBorder: '#2a2a2a',
  textPrimary: '#ffffff',
  textSecond:  '#888888',
}

// ── Accent color presets ─────────────────────────────────────
const COLORS = [
  { id: 'black',  hex: '#e5e5e5', swatch: '#000000', name: 'Black' },
  { id: 'green',  hex: '#22c55e', swatch: '#22c55e', name: 'Green' },
  { id: 'yellow', hex: '#eab308', swatch: '#eab308', name: 'Yellow' },
  { id: 'pink',   hex: '#ec4899', swatch: '#ec4899', name: 'Pink' },
  { id: 'blue',   hex: '#3b82f6', swatch: '#3b82f6', name: 'Blue' },
  { id: 'purple', hex: '#a855f7', swatch: '#a855f7', name: 'Purple' },
  { id: 'orange', hex: '#f97316', swatch: '#f97316', name: 'Orange' },
]

// ── The single base card layout ──────────────────────────────
// Dark contact card: name + vertical accent bar top-left, contact
// rows with icons below, QR top-right, small brand tag bottom-right.
function CardTemplate({ profile, publicUrl, accentHex, qrId }) {
  const rows = [
    profile.email && { icon: '✉', text: profile.email },
    profile.phone && { icon: '📞', text: profile.phone },
    profile.slug && { icon: '🔗', text: `kard.app/r/${profile.slug}` },
  ].filter(Boolean)

  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 14,
      background: `linear-gradient(135deg, #111111, ${accentHex}18)`,
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
      padding: '20px 20px 20px 26px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Vertical accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 18, bottom: 18, width: 4,
        borderRadius: 4, background: accentHex,
      }} />

      {/* Name + title */}
      <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
        {profile.display_name || 'Your name'}
      </p>
      <p style={{ margin: '3px 0 14px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: accentHex }}>
        {profile.title || 'Title'}{profile.company ? ` · ${profile.company}` : ''}
      </p>

      {/* Contact rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 10, width: 14, textAlign: 'center', opacity: 0.85 }}>{r.icon}</span>
            <span style={{ fontSize: 10.5, color: '#bbbbbb' }}>{r.text}</span>
          </div>
        ))}
      </div>

      {/* QR code, top-right */}
      <div style={{
        position: 'absolute', top: 16, right: 16, background: '#fff',
        borderRadius: 8, padding: 6, display: 'flex',
      }}>
        <QRCodeSVG id={qrId} value={publicUrl} size={62} />
      </div>

      {/* Brand tag, bottom-right */}
      <div style={{ position: 'absolute', bottom: 16, right: 18, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentHex }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>kard<span style={{ color: accentHex }}>.</span></span>
      </div>
    </div>
  )
}

export default function PrintCardModal({ isOpen, onClose, profile, publicUrl }) {
  const [selectedColorId, setSelectedColorId] = useState('green')
  const [downloading, setDownloading] = useState(false)
  const previewRef = useRef(null)

  // Inject print-only CSS once, mounted alongside the modal.
  useEffect(() => {
    if (!isOpen) return
    const style = document.createElement('style')
    style.id = 'kard-print-style'
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .kard-printable-card, .kard-printable-card * { visibility: visible; }
        .kard-printable-card {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }
        @page { size: 3.5in 2in; margin: 0; }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [isOpen])

  if (!isOpen) return null

  const accentHex = COLORS.find(c => c.id === selectedColorId).hex

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 4, backgroundColor: null })
      const a = document.createElement('a')
      a.download = `kard-card-${selectedColorId}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16, boxSizing: 'border-box',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 16,
          padding: 24, maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Choose your color</p>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: C.textSecond, fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Card preview (also the printable + downloadable node) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div ref={previewRef} className="kard-printable-card">
            <CardTemplate profile={profile} publicUrl={publicUrl} accentHex={accentHex} qrId="kard-qr-preview" />
          </div>
        </div>

        {/* Color swatches */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedColorId(c.id)}
              title={c.name}
              style={{
                width: 34, height: 34, borderRadius: '50%', background: c.swatch,
                border: selectedColorId === c.id ? '3px solid #fff' : '3px solid transparent',
                outline: selectedColorId === c.id ? `1px solid ${c.swatch}` : 'none',
                cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1, padding: '12px', background: 'transparent', color: C.textPrimary,
              border: `1px solid ${C.inputBorder}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {downloading ? 'Generating...' : 'Download PNG'}
          </button>
          <button
            onClick={handlePrint}
            style={{
              flex: 1, padding: '12px', background: accentHex, color: '#000',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  )
}