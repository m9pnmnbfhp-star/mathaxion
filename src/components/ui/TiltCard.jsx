import { useRef, useCallback } from 'react'

export default function TiltCard({
  children,
  className = '',
  style,
  onClick,
  onHoverChange,
  maxDeg = 9,
}) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)

  const track = useCallback((e) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const r = outer.getBoundingClientRect()
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    outer.classList.add('is-hover')
    inner.classList.add('is-tilting')
    inner.style.setProperty('--tilt-ry', ((px - 0.5) * maxDeg).toFixed(2) + 'deg')
    inner.style.setProperty('--tilt-rx', ((0.5 - py) * maxDeg).toFixed(2) + 'deg')
    inner.style.setProperty('--tilt-gx', (px * 100).toFixed(1) + '%')
    inner.style.setProperty('--tilt-gy', (py * 100).toFixed(1) + '%')
  }, [maxDeg])

  const reset = useCallback(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    outer.classList.remove('is-hover')
    inner.classList.remove('is-tilting')
    inner.style.setProperty('--tilt-rx', '0deg')
    inner.style.setProperty('--tilt-ry', '0deg')
    onHoverChange?.(false)
  }, [onHoverChange])

  return (
    <div
      ref={outerRef}
      className="t-tilt"
      onPointerEnter={() => onHoverChange?.(true)}
      onPointerMove={track}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') reset() }}
      onPointerUp={reset}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') {
          try { outerRef.current?.setPointerCapture(e.pointerId) } catch (_) {}
        }
      }}
    >
      <div
        ref={innerRef}
        className={`t-tilt-card ${className}`}
        style={style}
        onClick={onClick}
      >
        {children}
        <div className="t-tilt-glare" />
      </div>
    </div>
  )
}
