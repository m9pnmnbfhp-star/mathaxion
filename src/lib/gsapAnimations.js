import { gsap } from 'gsap'

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function makeOverlay(color) {
  const div = document.createElement('div')
  div.style.cssText = `position:absolute;inset:0;border-radius:inherit;background:${color};pointer-events:none;z-index:20;opacity:0`
  return div
}

export function flashCorrect(el) {
  if (!el || reduced()) return
  const overlay = makeOverlay('#10b981')
  el.style.position = 'relative'
  el.appendChild(overlay)
  gsap.timeline({ onComplete: () => overlay.remove() })
    .to(overlay, { opacity: 0.28, duration: 0.07, ease: 'none' })
    .to(overlay, { opacity: 0, duration: 0.55, ease: 'power2.out' })
}

export function flashWrong(el) {
  if (!el || reduced()) return
  const overlay = makeOverlay('#ef4444')
  el.style.position = 'relative'
  el.appendChild(overlay)
  gsap.timeline({ onComplete: () => overlay.remove() })
    .to(overlay, { opacity: 0.22, duration: 0.07, ease: 'none' })
    .to(overlay, { opacity: 0, duration: 0.55, ease: 'power2.out' })
}

export function countUpEl(el, from, to, duration = 1.1) {
  if (!el) return
  const obj = { val: from }
  gsap.to(obj, {
    val: to,
    duration,
    ease: 'power2.out',
    onUpdate() { el.textContent = Math.round(obj.val) },
  })
}

export function levelUpBurst(levelNum) {
  if (reduced()) return

  // canvas-confetti burst
  import('canvas-confetti').then(({ default: confetti }) => {
    const colors = ['#7c3aed', '#a78bfa', '#10b981', '#f59e0b', '#ec4899']
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 }, colors, scalar: 1.2 })
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 130, origin: { y: 0.5, x: 0.2 }, colors })
      confetti({ particleCount: 80, spread: 130, origin: { y: 0.5, x: 0.8 }, colors })
    }, 200)
  })

  // Text burst overlay
  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center'

  const box = document.createElement('div')
  box.style.cssText = `
    display:flex;flex-direction:column;align-items:center;gap:8px;
    font-family:'Space Grotesk',sans-serif;font-weight:900;color:white;text-align:center;
  `
  box.innerHTML = `
    <div style="font-size:clamp(3rem,12vw,5.5rem);line-height:1;filter:drop-shadow(0 0 20px #f59e0b)">⭐</div>
    <div style="font-size:clamp(1.6rem,6vw,2.8rem);text-shadow:0 0 40px rgba(124,58,237,1),0 0 80px rgba(167,139,250,0.7)">ΕΠΙΠΕΔΟ ${levelNum}! 🚀</div>
    <div style="font-size:clamp(0.9rem,3vw,1.1rem);opacity:0.7;font-weight:600">Συνέχισε έτσι!</div>
  `
  wrap.appendChild(box)
  document.body.appendChild(wrap)

  gsap.set(box, { scale: 0, opacity: 0, y: 30 })
  gsap.timeline({ onComplete: () => wrap.remove() })
    .to(box, { scale: 1.12, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(3)' })
    .to(box, { scale: 1, duration: 0.2, ease: 'power2.inOut' })
    .to(box, { opacity: 0, y: -32, scale: 0.88, duration: 0.5, delay: 1.1, ease: 'power3.in' })
}

export function streakMilestoneBurst(streakCount) {
  if (reduced()) return
  import('canvas-confetti').then(({ default: confetti }) => {
    const colors = ['#f97316', '#fb923c', '#fbbf24', '#f59e0b']
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors })
  })

  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center'
  const box = document.createElement('div')
  box.style.cssText = `font-family:'Space Grotesk',sans-serif;font-weight:900;color:white;text-align:center`
  box.innerHTML = `
    <div style="font-size:clamp(3rem,12vw,5rem);filter:drop-shadow(0 0 24px #f97316)">🔥</div>
    <div style="font-size:clamp(1.4rem,5vw,2.2rem);text-shadow:0 0 30px rgba(249,115,22,0.9)">${streakCount} ΣΩΣΤΑ ΣΤΗΝ ΣΕΙΡΑ!</div>
  `
  wrap.appendChild(box)
  document.body.appendChild(wrap)

  gsap.set(box, { scale: 0, opacity: 0 })
  gsap.timeline({ onComplete: () => wrap.remove() })
    .to(box, { scale: 1.1, opacity: 1, duration: 0.4, ease: 'back.out(2.5)' })
    .to(box, { scale: 1, duration: 0.15 })
    .to(box, { opacity: 0, y: -24, duration: 0.45, delay: 1.0, ease: 'power2.in' })
}
