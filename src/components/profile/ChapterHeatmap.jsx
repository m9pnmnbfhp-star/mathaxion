import { useState } from 'react'
import { motion } from 'framer-motion'

function masteryPct(completedExercises) {
  return Math.min(100, (completedExercises || 0) * 10)
}

function masteryColor(pct) {
  if (pct === 0) return { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' }
  if (pct <= 40) return { bg: `rgba(239,68,68,${0.1 + (pct / 40) * 0.25})`, border: 'rgba(239,68,68,0.3)' }
  if (pct <= 70) return { bg: `rgba(245,158,11,${0.15 + ((pct - 40) / 30) * 0.3})`, border: 'rgba(245,158,11,0.35)' }
  return { bg: `rgba(16,185,129,${0.2 + ((pct - 70) / 30) * 0.35})`, border: 'rgba(16,185,129,0.4)' }
}

export default function ChapterHeatmap({ grade, getChapterProgress, navigate }) {
  const [tooltip, setTooltip] = useState(null)

  const cells = grade.chapters.map((chapter) => {
    const progress = getChapterProgress(grade.id, chapter.id)
    const pct = masteryPct(progress.completedExercises)
    return { chapter, pct, ...masteryColor(pct) }
  })

  const masteredCount = cells.filter(c => c.pct >= 80).length

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--fg-3)' }}>
          Mastery Overview
        </p>
        <p className="text-xs" style={{ color: 'var(--fg-3)' }}>
          <span className="text-emerald-400 font-bold">{masteredCount}</span>/{grade.chapters.length} κατακτημένα
        </p>
      </div>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}>
        {cells.map(({ chapter, pct, bg, border }, i) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02, ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            className="relative aspect-square rounded-xl cursor-pointer flex flex-col items-center justify-center"
            style={{ background: bg, border: `1px solid ${border}` }}
            onClick={() => navigate(`/grade/${grade.id}/chapter/${chapter.id}`)}
            onMouseEnter={() => setTooltip({ chapter, pct })}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="text-base leading-none select-none">{chapter.emoji}</span>
            {pct > 0 && (
              <span className="text-[8px] font-black mt-0.5 tabular-nums" style={{
                color: pct >= 71 ? '#6ee7b7' : pct >= 41 ? '#fcd34d' : '#fca5a5'
              }}>
                {pct}%
              </span>
            )}

            {/* Tooltip */}
            {tooltip?.chapter.id === chapter.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white whitespace-nowrap"
                  style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  {chapter.title}
                  <span className="ml-2 font-black" style={{ color: pct >= 71 ? '#10b981' : pct >= 41 ? '#f59e0b' : pct > 0 ? '#ef4444' : 'var(--fg-3)' }}>
                    {pct > 0 ? `${pct}%` : 'Δεν έχει ξεκινήσει'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
