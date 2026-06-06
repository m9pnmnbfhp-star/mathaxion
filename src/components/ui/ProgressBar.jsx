import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, color = '#7c3aed', height = 8, label, showPercent = false, animated = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-slate-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-[#1c1c28]"
        style={{ height }}
      >
        <motion.div
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>
    </div>
  )
}

export function LevelProgress({ level, progress, max = 100 }) {
  const colors = { 1: '#10b981', 2: '#3b82f6', 3: '#8b5cf6', 4: '#ef4444' }
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Επίπεδο {level}</span>
        <span>{progress}/{max}</span>
      </div>
      <ProgressBar value={progress} max={max} color={colors[level] || '#7c3aed'} />
    </div>
  )
}
