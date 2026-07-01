import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star, Trophy, Zap } from 'lucide-react'

const SPRING = { type: 'spring', stiffness: 280, damping: 22 }

async function burst(origin = { y: 0.5 }) {
  const confetti = (await import('canvas-confetti')).default
  const colors = ['#7c3aed', '#a78bfa', '#10b981', '#f59e0b', '#ec4899']
  confetti({ particleCount: 180, spread: 100, origin, colors, scalar: 1.3 })
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 130, origin: { ...origin, x: 0.2 }, colors })
    confetti({ particleCount: 80, spread: 130, origin: { ...origin, x: 0.8 }, colors })
  }, 200)
}

export default function ChapterCompleteModal({ chapter, grade, nextChapter, xpEarned = 0, onClose }) {
  const navigate = useNavigate()
  const [stage, setStage] = useState(0) // 0→overlay 1→xp 2→badge 3→next
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    burst({ y: 0.6 })
    const t1 = setTimeout(() => setStage(1), 350)
    const t2 = setTimeout(() => setStage(2), 900)
    const t3 = setTimeout(() => setStage(3), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const goNext = () => {
    onClose()
    if (nextChapter) navigate(`/grade/${grade.id}/chapter/${nextChapter.id}`)
    else navigate(`/grade/${grade.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 px-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} className="flex flex-col items-center max-w-sm w-full">

        {/* Chapter complete headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="text-center mb-6"
        >
          <div className="text-7xl mb-4">{chapter?.emoji || '🎉'}</div>
          <h1 className="font-display font-black text-4xl text-white mb-2 leading-tight">
            Κεφάλαιο<br />
            <span className="text-gradient">Ολοκληρώθηκε!</span>
          </h1>
          <p className="text-slate-400 text-sm">{chapter?.title}</p>
        </motion.div>

        {/* XP earned */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              key="xp"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={SPRING}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl mb-4 w-full justify-center"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <motion.div
                initial={{ rotate: -20, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ ...SPRING, delay: 0.1 }}
              >
                <Zap size={22} className="text-violet-400" />
              </motion.div>
              <div>
                <motion.p
                  className="font-display font-black text-2xl text-white leading-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  +{xpEarned} XP
                </motion.p>
                <p className="text-xs text-slate-500 mt-0.5">προστέθηκαν στο προφίλ σου</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mastery badge */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              key="badge"
              initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={SPRING}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl mb-6 w-full justify-center"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              <Trophy size={20} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-300">Πήρες badge Mastery! 🏅</p>
                <p className="text-xs text-slate-500">Εμφανίζεται στο προφίλ σου</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.4, 1] }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Star size={16} className="text-amber-400" fill="currentColor" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next chapter */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              key="next"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className="w-full space-y-3"
            >
              {nextChapter && (
                <div className="p-4 rounded-2xl w-full"
                  style={{ background: '#16161f', border: `1px solid ${grade?.color || '#7c3aed'}30` }}>
                  <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: 'var(--fg-3)' }}>
                    Επόμενο κεφάλαιο
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{nextChapter.emoji}</span>
                    <p className="font-bold text-white text-sm flex-1">{nextChapter.title}</p>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
              >
                {nextChapter ? 'Επόμενο Κεφάλαιο' : 'Πίσω στην Τάξη'}
                <ArrowRight size={20} />
              </motion.button>

              <button onClick={onClose}
                className="w-full py-2 text-sm font-medium"
                style={{ color: 'var(--fg-3)' }}>
                Συνέχισε εδώ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
