import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'

export default function MagneticButton({ children, strength = 0.38, className = '' }) {
  const ref = useRef(null)

  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left - width  / 2) * strength
    const y = (e.clientY - top  - height / 2) * strength
    gsap.to(el, { x, y, duration: 0.28, ease: 'power2.out' })
  }, [strength])

  const onLeave = useCallback(() => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)' })
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  )
}
