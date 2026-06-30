import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'

const VIEWPORT = 260 // on-screen crop square size, px
const OUTPUT = 480    // exported image size, px (square)

const C = {
  cardBg:      '#111111',
  cardBorder:  '#222222',
  inputBorder: '#2a2a2a',
  textPrimary: '#ffffff',
  textSecond:  '#888888',
  accent:      '#22c55e',
}

export default function AvatarCropModal({ file, onCancel, onConfirm }) {
  const [imgUrl] = useState(() => URL.createObjectURL(file))
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [naturalSize, setNaturalSize] = useState(null) // { w, h }
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startOffset: { x: 0, y: 0 } })
  const frameRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  // "Cover" sizing computed manually, in px — html2canvas does not
  // reliably honor CSS object-fit when rasterizing, so we avoid it
  // entirely and size the <img> explicitly instead.
  const baseScale = naturalSize
    ? Math.max(VIEWPORT / naturalSize.w, VIEWPORT / naturalSize.h)
    : 1
  const imgWidth = naturalSize ? naturalSize.w * baseScale : VIEWPORT
  const imgHeight = naturalSize ? naturalSize.h * baseScale : VIEWPORT

  const startDrag = (clientX, clientY) => {
    dragRef.current = { dragging: true, startX: clientX, startY: clientY, startOffset: offset }
  }
  const moveDrag = (clientX, clientY) => {
    if (!dragRef.current.dragging) return
    const dx = clientX - dragRef.current.startX
    const dy = clientY - dragRef.current.startY
    setOffset({ x: dragRef.current.startOffset.x + dx, y: dragRef.current.startOffset.y + dy })
  }
  const endDrag = () => { dragRef.current.dragging = false }

  const handleConfirm = async () => {
    if (!frameRef.current) return
    setUploading(true)
    try {
      const canvas = await html2canvas(frameRef.current, {
        scale: OUTPUT / VIEWPORT,
        backgroundColor: null,
        width: VIEWPORT,
        height: VIEWPORT,
        windowWidth: VIEWPORT,
        windowHeight: VIEWPORT,
        useCORS: true,
      })
      canvas.toBlob(blob => {
        URL.revokeObjectURL(imgUrl)
        onConfirm(blob)
      }, 'image/jpeg', 0.92)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    URL.revokeObjectURL(imgUrl)
    onCancel()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: 16, boxSizing: 'border-box',
      }}
    >
      <div style={{
        background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 16,
        padding: 24, maxWidth: 360, width: '100%', boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <p style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#fff' }}>
          Adjust your photo
        </p>

        {/* Crop viewport */}
        <div
          ref={frameRef}
          onMouseDown={e => startDrag(e.clientX, e.clientY)}
          onMouseMove={e => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={endDrag}
          style={{
            width: VIEWPORT, height: VIEWPORT, margin: '0 auto 16px',
            borderRadius: 16, overflow: 'hidden', position: 'relative',
            background: '#000', cursor: 'grab', touchAction: 'none',
            border: `2px solid ${C.accent}`,
          }}
        >
          <img
            src={imgUrl}
            alt="crop preview"
            draggable={false}
            onLoad={e => setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: imgWidth,
              height: imgHeight,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              pointerEvents: 'none', userSelect: 'none',
            }}
          />
        </div>

        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textSecond, marginBottom: 8 }}>
          ZOOM
        </label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))}
          style={{ width: '100%', marginBottom: 20, accentColor: C.accent }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCancel}
            style={{
              flex: 1, padding: '12px', background: 'transparent', color: C.textPrimary,
              border: `1px solid ${C.inputBorder}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={uploading}
            style={{
              flex: 1, padding: '12px', background: C.accent, color: '#000',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {uploading ? 'Saving...' : 'Use photo'}
          </button>
        </div>
      </div>
    </div>
  )
}