import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, glow = false, onClick, padding = 'p-5' }) {
  const base = `bg-[#16161f] border border-[#2a2a3a] rounded-2xl ${padding}`
  const glowStyle = glow ? 'shadow-[0_0_30px_rgba(124,58,237,0.15)]' : ''
  const hoverStyle = hover ? 'hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)] transition-all duration-200 cursor-pointer' : ''

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={`${base} ${glowStyle} ${hoverStyle} ${className}`}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={`${base} ${glowStyle} ${className}`}>
      {children}
    </div>
  )
}
