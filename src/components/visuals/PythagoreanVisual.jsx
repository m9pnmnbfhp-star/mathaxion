import { motion } from 'framer-motion'

const W = 320, H = 240
const A = { x: 40, y: 200 }   // right angle corner
const B = { x: 40, y: 60 }    // top-left
const C = { x: 280, y: 200 }  // bottom-right

const VIOLET = '#7c3aed'
const EMERALD = '#10b981'
const AMBER = '#f59e0b'

function pathD(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
}

function dist(p1, p2) {
  return Math.round(Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2))
}

export default function PythagoreanVisual() {
  const a = Math.round(Math.abs(B.y - A.y))  // vertical side
  const b = Math.round(Math.abs(C.x - A.x))  // horizontal side
  const c = Math.round(dist(B, C))            // hypotenuse

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (delay = 0) => ({ pathLength: 1, opacity: 1, transition: { pathLength: { duration: 0.7, delay, ease: 'easeInOut' }, opacity: { duration: 0.01, delay } } }),
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0f0f1a', border: '1px solid rgba(124,58,237,0.2)' }}>
      <p className="text-xs font-black tracking-widest uppercase mb-3 text-center" style={{ color: 'var(--fg-3)' }}>
        Πυθαγόρειο Θεώρημα
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>

        {/* Triangle fill */}
        <motion.path
          d={pathD([A, B, C])}
          fill="rgba(124,58,237,0.07)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.4 }}
        />

        {/* Side a (vertical) — blue */}
        <motion.line x1={A.x} y1={A.y} x2={B.x} y2={B.y}
          stroke={VIOLET} strokeWidth="3" strokeLinecap="round"
          variants={draw} initial="hidden" animate="visible" custom={0.1}
        />
        {/* Side b (horizontal) — green */}
        <motion.line x1={A.x} y1={A.y} x2={C.x} y2={C.y}
          stroke={EMERALD} strokeWidth="3" strokeLinecap="round"
          variants={draw} initial="hidden" animate="visible" custom={0.4}
        />
        {/* Hypotenuse c — amber */}
        <motion.line x1={B.x} y1={B.y} x2={C.x} y2={C.y}
          stroke={AMBER} strokeWidth="3" strokeLinecap="round"
          variants={draw} initial="hidden" animate="visible" custom={0.8}
        />

        {/* Right angle square */}
        <motion.rect x={A.x} y={A.y - 16} width={16} height={16}
          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        />

        {/* Labels */}
        <motion.text x={A.x - 18} y={(A.y + B.y) / 2 + 5} fill={VIOLET} fontSize="14" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          α
        </motion.text>
        <motion.text x={(A.x + C.x) / 2 - 4} y={A.y + 18} fill={EMERALD} fontSize="14" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          β
        </motion.text>
        <motion.text x={(B.x + C.x) / 2 + 8} y={(B.y + C.y) / 2 - 8} fill={AMBER} fontSize="14" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          γ
        </motion.text>

        {/* Formula */}
        <motion.text x={W / 2} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="13" fontWeight="bold"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.5 }}>
          α² + β² = γ²
        </motion.text>
      </svg>

      {/* Color legend */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="flex justify-center gap-4 mt-2"
      >
        {[{ color: VIOLET, label: 'α (κάθετη)' }, { color: EMERALD, label: 'β (οριζόντια)' }, { color: AMBER, label: 'γ (υποτείνουσα)' }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-1 rounded-full" style={{ background: color }} />
            <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
