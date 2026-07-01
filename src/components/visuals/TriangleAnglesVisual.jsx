import { motion } from 'framer-motion'
import { useState } from 'react'

const W = 280, H = 200

export default function TriangleAnglesVisual() {
  const [a1, setA1] = useState(60)
  const a2 = 80
  const a3 = Math.max(1, 180 - a1 - a2)

  // Build triangle from angles
  const toRad = d => (d * Math.PI) / 180
  const base = 180

  const Ax = (W - base) / 2, Ay = H - 30
  const Bx = Ax + base, By = Ay

  // Find C using law of sines
  const sinA = Math.sin(toRad(a1)), sinB = Math.sin(toRad(a2))
  const AB = base
  const BC = (AB * sinA) / Math.sin(toRad(a3))
  const Cx = Bx - BC * Math.cos(toRad(a2))
  const Cy = By - BC * Math.sin(toRad(a2))

  const COLORS = ['#7c3aed', '#10b981', '#f59e0b']

  const arcPath = (px, py, from, to, r = 20) => {
    const fx = px + r * Math.cos(toRad(from))
    const fy = py + r * Math.sin(toRad(from))
    const tx = px + r * Math.cos(toRad(to))
    const ty = py + r * Math.sin(toRad(to))
    const large = Math.abs(to - from) > 180 ? 1 : 0
    return `M ${fx} ${fy} A ${r} ${r} 0 ${large} 1 ${tx} ${ty}`
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0f0f1a', border: '1px solid rgba(124,58,237,0.2)' }}>
      <p className="text-xs font-black tracking-widest uppercase mb-3 text-center" style={{ color: 'var(--fg-3)' }}>
        Γωνίες Τριγώνου — Άθροισμα = 180°
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
        {/* Triangle */}
        <motion.polygon
          points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`}
          fill="rgba(124,58,237,0.07)"
          stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
          key={a1}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        />

        {/* Angle arcs */}
        <path d={arcPath(Ax, Ay, -10, -70)} fill="none" stroke={COLORS[0]} strokeWidth="2" />
        <path d={arcPath(Bx, By, 180 + 10, 180 + a2 - 5)} fill="none" stroke={COLORS[1]} strokeWidth="2" />

        {/* Angle labels */}
        <motion.text x={Ax - 14} y={Ay - 24} fill={COLORS[0]} fontSize="13" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {a1}°
        </motion.text>
        <motion.text x={Bx + 6} y={By - 18} fill={COLORS[1]} fontSize="13" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {a2}°
        </motion.text>
        <motion.text x={Math.min(W - 30, Math.max(10, Cx - 10))} y={Cy - 8} fill={COLORS[2]} fontSize="13" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          {a3}°
        </motion.text>

        {/* Sum */}
        <motion.text x={W / 2} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          {a1}° + {a2}° + {a3}° = 180°
        </motion.text>
      </svg>

      {/* Interactive control */}
      <div className="mt-2 flex items-center gap-3 justify-center">
        <span className="text-xs font-bold" style={{ color: COLORS[0] }}>Γωνία Α:</span>
        <input type="range" min="20" max="140" value={a1}
          onChange={e => setA1(+e.target.value)}
          className="w-28 h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: COLORS[0] }}
        />
        <span className="text-xs font-bold text-white">{a1}°</span>
      </div>
    </div>
  )
}
