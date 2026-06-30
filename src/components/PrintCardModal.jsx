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

// ── Shared contact-row extraction, used by every layout ─────
function getContactRows(profile) {
  return [
    profile.email && { icon: '✉', text: profile.email },
    profile.phone && { icon: '📞', text: profile.phone },
    profile.slug && { icon: '🔗', text: `kard.app/r/${profile.slug}` },
  ].filter(Boolean)
}

function getInitials(profile) {
  const name = profile.display_name || '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── Layout 1: Classic ─────────────────────────────────────────
// Vertical accent bar top-left, contact rows below, QR top-right.
function LayoutClassic({ profile, publicUrl, accentHex, qrId }) {
  const rows = getContactRows(profile)
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 14,
      background: `linear-gradient(135deg, #111111, ${accentHex}18)`,
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
      padding: '20px 20px 20px 26px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 18, bottom: 18, width: 4,
        borderRadius: 4, background: accentHex,
      }} />
      <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
        {profile.display_name || 'Your name'}
      </p>
      <p style={{ margin: '3px 0 14px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: accentHex }}>
        {profile.title || 'Title'}{profile.company ? ` · ${profile.company}` : ''}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 10, width: 14, textAlign: 'center', opacity: 0.85 }}>{r.icon}</span>
            <span style={{ fontSize: 10.5, color: '#bbbbbb' }}>{r.text}</span>
          </div>
        ))}
      </div>
      <div style={{
        position: 'absolute', top: 16, right: 16, background: '#fff',
        borderRadius: 8, padding: 6, display: 'flex',
      }}>
        <QRCodeSVG id={qrId} value={publicUrl} size={62} />
      </div>
      <div style={{ position: 'absolute', bottom: 16, right: 18, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentHex }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>kard<span style={{ color: accentHex }}>.</span></span>
      </div>
    </div>
  )
}

// ── Layout 2: Centered ───────────────────────────────────────
// Everything center-aligned, QR sits below the name/title block.
function LayoutCentered({ profile, publicUrl, accentHex, qrId }) {
  const rows = getContactRows(profile)
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 14,
      background: '#0d0d0d', position: 'relative', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '16px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
        {profile.display_name || 'Your name'}
      </p>
      <p style={{ margin: '3px 0 10px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentHex }}>
        {profile.title || 'Title'}{profile.company ? ` · ${profile.company}` : ''}
      </p>
      <div style={{ width: 30, height: 2, borderRadius: 2, background: accentHex, marginBottom: 10 }} />
      <div style={{ background: '#fff', borderRadius: 8, padding: 5, display: 'inline-flex', marginBottom: 8 }}>
        <QRCodeSVG id={qrId} value={publicUrl} size={46} />
      </div>
      {rows[0] && <p style={{ margin: 0, fontSize: 9.5, color: '#999' }}>{rows[0].text}</p>}
      <div style={{ position: 'absolute', bottom: 10, right: 14 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#666' }}>kard<span style={{ color: accentHex }}>.</span></span>
      </div>
    </div>
  )
}

// ── Layout 3: Split ──────────────────────────────────────────
// Solid accent panel with initials on the left, info on dark right side.
function LayoutSplit({ profile, publicUrl, accentHex, qrId }) {
  const rows = getContactRows(profile)
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 14,
      display: 'flex', overflow: 'hidden', boxSizing: 'border-box',
      background: '#111111', fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        width: 110, flexShrink: 0, background: accentHex,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: '#000' }}>{getInitials(profile)}</span>
      </div>
      <div style={{ flex: 1, position: 'relative', padding: '18px 16px', minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>
          {profile.display_name || 'Your name'}
        </p>
        <p style={{ margin: '3px 0 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: accentHex }}>
          {profile.title || 'Title'}{profile.company ? ` · ${profile.company}` : ''}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {rows.map((r, i) => (
            <span key={i} style={{ fontSize: 9.5, color: '#999' }}>{r.text}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 14, right: 14, background: '#fff', borderRadius: 6, padding: 4, display: 'flex' }}>
          <QRCodeSVG id={qrId} value={publicUrl} size={40} />
        </div>
      </div>
    </div>
  )
}

// ── Layout 4: Minimal ────────────────────────────────────────
// Black background, thin accent underline, small mono contact rows.
function LayoutMinimal({ profile, publicUrl, accentHex, qrId }) {
  const rows = getContactRows(profile)
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 14,
      background: '#000000', border: `1px solid ${C.inputBorder}`,
      position: 'relative', boxSizing: 'border-box',
      padding: '20px 22px', fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <span style={{ position: 'absolute', top: 16, right: 18, fontSize: 9, fontWeight: 700, color: '#555' }}>
        kard<span style={{ color: accentHex }}>.</span>
      </span>
      <p style={{ margin: '40px 0 0', fontSize: 21, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
        {profile.display_name || 'Your name'}
      </p>
      <div style={{ width: 22, height: 2, background: accentHex, margin: '8px 0 10px', borderRadius: 2 }} />
      <p style={{ margin: 0, fontSize: 10, color: '#888' }}>
        {profile.title || 'Title'}{profile.company ? ` · ${profile.company}` : ''}
      </p>
      <div style={{ position: 'absolute', bottom: 16, left: 22, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {rows.slice(0, 2).map((r, i) => (
          <span key={i} style={{ fontSize: 9, color: '#666', fontFamily: 'monospace' }}>{r.text}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 14, right: 16, background: '#fff', borderRadius: 6, padding: 4, display: 'flex' }}>
        <QRCodeSVG id={qrId} value={publicUrl} size={34} />
      </div>
    </div>
  )
}

// ── Layout 5: Bold ───────────────────────────────────────────
// Full-bleed accent-color background, oversized name, QR small top-left.
function LayoutBold({ profile, publicUrl, accentHex, qrId }) {
  const rows = getContactRows(profile)
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 14,
      background: accentHex, position: 'relative', overflow: 'hidden',
      boxSizing: 'border-box', padding: '18px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 140, height: 140,
        borderRadius: '50%', background: 'rgba(0,0,0,0.12)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, background: '#fff', display: 'inline-flex', borderRadius: 6, padding: 4, marginBottom: 12 }}>
        <QRCodeSVG id={qrId} value={publicUrl} size={36} />
      </div>
      <p style={{ position: 'relative', zIndex: 1, margin: 0, fontSize: 24, fontWeight: 800, color: '#000', lineHeight: 1.05 }}>
        {profile.display_name || 'Your name'}
      </p>
      <p style={{ position: 'relative', zIndex: 1, margin: '4px 0 0', fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.65)' }}>
        {profile.title || 'Title'}{profile.company ? ` · ${profile.company}` : ''}
      </p>
      <div style={{ position: 'absolute', bottom: 14, left: 20, display: 'flex', gap: 10 }}>
        {rows.slice(0, 2).map((r, i) => (
          <span key={i} style={{ fontSize: 9, color: 'rgba(0,0,0,0.6)' }}>{r.text}</span>
        ))}
      </div>
    </div>
  )
}

// ── Layout 6: QR Focus ───────────────────────────────────────
// Large QR on the left, info stacked vertically beside it.
function LayoutQrFocus({ profile, publicUrl, accentHex, qrId }) {
  const rows = getContactRows(profile)
  return (
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 14,
      background: `linear-gradient(160deg, #111111, ${accentHex}14)`,
      display: 'flex', alignItems: 'center', gap: 18,
      boxSizing: 'border-box', padding: '20px 22px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 8, flexShrink: 0, display: 'flex' }}>
        <QRCodeSVG id={qrId} value={publicUrl} size={84} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
          {profile.display_name || 'Your name'}
        </p>
        <p style={{ margin: '3px 0 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: accentHex }}>
          {profile.title || 'Title'}{profile.company ? ` · ${profile.company}` : ''}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {rows.map((r, i) => (
            <span key={i} style={{ fontSize: 9, color: '#999' }}>{r.text}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const LAYOUTS = [
  { id: 'classic',  name: 'Classic',  Component: LayoutClassic },
  { id: 'centered', name: 'Centered', Component: LayoutCentered },
  { id: 'split',    name: 'Split',    Component: LayoutSplit },
  { id: 'minimal',  name: 'Minimal',  Component: LayoutMinimal },
  { id: 'bold',     name: 'Bold',     Component: LayoutBold },
  { id: 'qrfocus',  name: 'QR Focus', Component: LayoutQrFocus },
]

export default function PrintCardModal({ isOpen, onClose, profile, publicUrl }) {
  const [selectedColorId, setSelectedColorId] = useState('green')
  const [selectedLayoutId, setSelectedLayoutId] = useState('classic')
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
  const SelectedLayout = LAYOUTS.find(l => l.id === selectedLayoutId).Component

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 6,
        backgroundColor: null,
        width: CARD_W,
        height: CARD_H,
        windowWidth: CARD_W,
        windowHeight: CARD_H,
        useCORS: true,
      })
      const a = document.createElement('a')
      a.download = `kard-card-${selectedLayoutId}-${selectedColorId}.png`
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
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Customize your card</p>
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
            <SelectedLayout profile={profile} publicUrl={publicUrl} accentHex={accentHex} qrId="kard-qr-preview" />
          </div>
        </div>

        {/* Layout carousel — swipe/scroll horizontally to browse */}
        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.textSecond }}>
          Layout
        </p>
        <style>{`
          .kard-layout-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        <div
          className="kard-layout-scroll"
          style={{
            display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, marginBottom: 22,
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}
        >
          {LAYOUTS.map(layout => {
            const { Component } = layout
            const selected = layout.id === selectedLayoutId
            const scale = 0.26
            return (
              <button
                key={layout.id}
                onClick={() => setSelectedLayoutId(layout.id)}
                style={{
                  flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer',
                  background: 'transparent', border: 'none', padding: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
              >
                <div style={{
                  width: CARD_W * scale, height: CARD_H * scale, borderRadius: 6,
                  overflow: 'hidden', position: 'relative',
                  border: selected ? `2px solid ${accentHex}` : '2px solid transparent',
                  boxShadow: selected ? `0 0 0 1px ${accentHex}` : '0 0 0 1px rgba(255,255,255,0.06)',
                }}>
                  <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                    <Component profile={profile} publicUrl={publicUrl} accentHex={accentHex} qrId={`kard-qr-thumb-${layout.id}`} />
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: selected ? C.textPrimary : C.textSecond }}>
                  {layout.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Color swatches */}
        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.textSecond }}>
          Color
        </p>
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