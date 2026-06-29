export function showXPFloat(x, y, amount) {
  const el = document.createElement('div')
  el.className = 'xp-float-label'
  el.textContent = `+${amount} XP`
  el.style.left = `${x}px`
  el.style.top  = `${y}px`
  el.style.transform = 'translateX(-50%)'
  document.body.appendChild(el)
  el.addEventListener('animationend', () => el.remove(), { once: true })
}
