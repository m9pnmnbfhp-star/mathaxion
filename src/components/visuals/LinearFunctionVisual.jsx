import { motion } from 'framer-motion'
import { useState } from 'react'

const W = 280, H = 200, PAD = 30
const STEPS = 5

function toSvg(x, y, xMin, xMax, yMin, yMax) {
  const sx = PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD)
  const sy = (H - PAD) - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD)
  return { sx, sy }
}

export default function LinearFunctionVisual() {
  const [slope, setSlope] = useState(1)
  const [intercept, setIntercept] = useState(0)

  const xMin = -4, xMax = 4, yMin = -5, yMax = 5
  const x1 = xMin, x2 = xMax
  const y1 = slope * x1 + intercept
  const y2 = slope * x2 + intercept

  const p1 = toSvg(x1, y1, xMin, xMax, yMin, yMax)
  const p2 = toSvg(x2, y2, xMin, xMax, yMin, yMax)

  const origin = toSvg(0, 0, xMin, xMax, yMin, yMax)
  const yIntPt = toSvg(0, intercept, xMin, xMax, yMin, yMax)

  const ticks = Array.from({ length: STEPS * 2 + 1 }, (_, i) => i - STEPS)

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0f0f1a', border: '1px solid rgba(139,92,246,0.2)' }}>
      <p className="text-xs font-black tracking-widest uppercase mb-3 text-center" style={{ color: 'var(--fg-3)' }}>
        Γραμμική Συνάρτηση y = αx + β
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
        {/* Grid lines */}
        {ticks.map(t => {
          const px = toSvg(t, 0, xMin, xMax, yMin, yMax)
          const py = toSvg(0, t, xMin, xMax, yMin, yMax)
          return (
            <g key={t}>
              <line x1={px.sx} y1={PAD} x2={px.sx} y2={H - PAD} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1={PAD} y1={py.sy} x2={W - PAD} y2={py.sy} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </g>
          )
        })}

        {/* Axes */}
        <line x1={PAD} y1={origin.sy} x2={W - PAD} y2={origin.sy} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1={origin.sx} y1={PAD} x2={origin.sx} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <text x={W - PAD + 4} y={origin.sy + 4} fill="rgba(255,255,255,0.4)" fontSize="10">x</text>
        <text x={origin.sx + 3} y={PAD - 4} fill="rgba(255,255,255,0.4)" fontSize="10">y</text>

        {/* Function line */}
        <motion.line
          x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy}
          stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"
          key={`${slope}-${intercept}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        />

        {/* Y-intercept point */}
        <motion.circle cx={yIntPt.sx} cy={yIntPt.sy} r="5"
          fill="#f59e0b" stroke="#0f0f1a" strokeWidth="2"
          key={`y-${intercept}`}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
          style={{ transformOrigin: `${yIntPt.sx}px ${yIntPt.sy}px` }}
        />

        {/* Formula label */}
        <text x={W / 2} y={H - 2} textAnchor="middle" fill="rgba(139,92,246,0.9)" fontSize="12" fontWeight="bold">
          y = {slope}x {intercept >= 0 ? `+ ${intercept}` : `− ${Math.abs(intercept)}`}
        </text>
      </svg>

      {/* Controls */}
      <div className="flex gap-4 mt-2 justify-center">
        <div className="text-center">
          <p className="text-[10px] font-bold mb-1" style={{ color: '#a78bfa' }}>Συντελεστής α (κλίση)</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSlope(s => Math.max(-3, s - 1))}
              className="w-6 h-6 rounded-lg text-xs font-black text-violet-400 hover:bg-white/5 transition-colors">−</button>
            <span className="font-black text-white text-sm w-4 text-center">{slope}</span>
            <button onClick={() => setSlope(s => Math.min(3, s + 1))}
              className="w-6 h-6 rounded-lg text-xs font-black text-violet-400 hover:bg-white/5 transition-colors">+</button>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold mb-1" style={{ color: '#fbbf24' }}>Σταθερά β (τεταγμένη)</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setIntercept(i => Math.max(-4, i - 1))}
              className="w-6 h-6 rounded-lg text-xs font-black text-amber-400 hover:bg-white/5 transition-colors">−</button>
            <span className="font-black text-white text-sm w-4 text-center">{intercept}</span>
            <button onClick={() => setIntercept(i => Math.min(4, i + 1))}
              className="w-6 h-6 rounded-lg text-xs font-black text-amber-400 hover:bg-white/5 transition-colors">+</button>
          </div>
        </div>
      </div>
    </div>
  )
}
