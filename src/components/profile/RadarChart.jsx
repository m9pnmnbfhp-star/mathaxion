import { motion } from 'framer-motion'
import { GRADES } from '../../data/curriculum'

function masteryPct(completedExercises) {
  return Math.min(100, (completedExercises || 0) * 10)
}

function getGradeMastery(gradeId, progress) {
  const grade = GRADES.find(g => g.id === gradeId)
  if (!grade || grade.chapters.length === 0) return 0
  const total = grade.chapters.reduce((sum, ch) => {
    const p = progress[`${gradeId}/${ch.id}`]
    return sum + masteryPct(p?.completedExercises)
  }, 0)
  return Math.round(total / grade.chapters.length)
}

const AXES = [
  { id: 'a-gymnasiou',  label: "Α'Γυμ" },
  { id: 'b-gymnasiou',  label: "Β'Γυμ" },
  { id: 'g-gymnasiou',  label: "Γ'Γυμ" },
  { id: 'a-lykeiou',   label: "Α'Λυκ" },
  { id: 'b-lykeiou',   label: "Β'Λυκ" },
  { id: 'g-lykeiou',   label: "Γ'Λυκ" },
]

const SIZE = 200
const CX = SIZE / 2
const CY = SIZE / 2
const R = 80

function polarToXY(angle, radius) {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

export default function RadarChart({ progress }) {
  const n = AXES.length
  const values = AXES.map(a => getGradeMastery(a.id, progress))
  const hasAnyProgress = values.some(v => v > 0)

  const points = values.map((v, i) => {
    const angle = (i / n) * 360
    const r = (v / 100) * R
    return polarToXY(angle, r)
  })

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ')

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1].map(scale => {
    const ringPts = AXES.map((_, i) => {
      const angle = (i / n) * 360
      return polarToXY(angle, R * scale)
    })
    return ringPts.map(p => `${p.x},${p.y}`).join(' ')
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--fg-3)' }}>
          Skill Radar
        </p>
        {!hasAnyProgress && (
          <p className="text-xs" style={{ color: 'var(--fg-3)' }}>Ξεκίνα μαθήματα για να δεις τo radar</p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center"
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Grid rings */}
          {rings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          ))}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = (i / n) * 360
            const end = polarToXY(angle, R)
            return (
              <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            )
          })}

          {/* Data polygon */}
          <polygon points={polyPoints}
            fill="rgba(124,58,237,0.2)"
            stroke="#7c3aed"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Data dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3"
              fill="#7c3aed" stroke="#a78bfa" strokeWidth="1" />
          ))}

          {/* Labels */}
          {AXES.map((axis, i) => {
            const angle = (i / n) * 360
            const pos = polarToXY(angle, R + 16)
            return (
              <text key={i} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.5)"
                fontFamily="DM Sans, sans-serif">
                {axis.label}
              </text>
            )
          })}
        </svg>
      </motion.div>
    </div>
  )
}
