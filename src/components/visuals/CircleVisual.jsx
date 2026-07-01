import { motion } from 'framer-motion'

const CX = 130, CY = 110, R = 80

export default function CircleVisual() {
  const circumference = 2 * Math.PI * R
  const diameter = 2 * R
  const area = Math.PI * R * R

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0f0f1a', border: '1px solid rgba(59,130,246,0.2)' }}>
      <p className="text-xs font-black tracking-widest uppercase mb-3 text-center" style={{ color: 'var(--fg-3)' }}>
        Κύκλος — Ακτίνα, Διάμετρος, Περίμετρος
      </p>

      <svg viewBox="0 0 260 220" className="w-full" style={{ maxHeight: 200 }}>
        {/* Circle outline */}
        <motion.circle
          cx={CX} cy={CY} r={R}
          fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Animated circumference trace */}
        <motion.circle
          cx={CX} cy={CY} r={R}
          fill="none" stroke="#3b82f6" strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
        />

        {/* Diameter */}
        <motion.line
          x1={CX - R} y1={CY} x2={CX + R} y2={CY}
          stroke="#10b981" strokeWidth="2" strokeDasharray="4 3"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        />

        {/* Radius */}
        <motion.line
          x1={CX} y1={CY} x2={CX} y2={CY - R}
          stroke="#f59e0b" strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
        />

        {/* Center dot */}
        <motion.circle cx={CX} cy={CY} r="4" fill="#f59e0b"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: 'spring' }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Labels */}
        <motion.text x={CX + 6} y={CY - R / 2 + 4} fill="#f59e0b" fontSize="13" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          ρ
        </motion.text>
        <motion.text x={CX + 4} y={CY - 6} fill="#10b981" fontSize="12" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          2ρ
        </motion.text>

        {/* Formulas on the right */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          <text x={220} y={80} textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">Π = 2πρ</text>
          <text x={220} y={100} textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">Δ = 2ρ</text>
          <text x={220} y={120} textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">Ε = πρ²</text>
          <line x1={195} y1={60} x2={255} y2={60} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </motion.g>
      </svg>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="flex justify-center gap-4 mt-1"
      >
        {[{ color: '#f59e0b', label: 'ρ = ακτίνα' }, { color: '#10b981', label: '2ρ = διάμετρος' }, { color: '#3b82f6', label: 'Π = περίμετρος' }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-1 rounded-full" style={{ background: color }} />
            <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
