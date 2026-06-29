import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40',
  secondary: 'bg-[#1c1c28] hover:bg-[#252535] text-slate-200 border border-[#2a2a3a] hover:border-violet-500/50',
  ghost: 'hover:bg-white/5 text-slate-300 hover:text-white',
  danger: 'bg-red-600/90 hover:bg-red-500 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40',
  gold: 'bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-900/40',
  outline: 'border border-violet-500/50 hover:border-violet-400 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

function ripple(e) {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top  - size / 2
  const span = document.createElement('span')
  span.className = 'btn-ripple-el'
  span.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`
  btn.appendChild(span)
  span.addEventListener('animationend', () => span.remove(), { once: true })
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon,
  iconRight,
  disabled,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={(e) => { ripple(e); onClick?.(e) }}
      disabled={disabled || loading}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-colors duration-150 cursor-pointer select-none relative overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </motion.button>
  )
}
