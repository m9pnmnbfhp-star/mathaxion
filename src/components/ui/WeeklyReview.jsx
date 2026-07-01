import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, Share2, Target, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import useStore from '../../store/useStore'
import { GRADES, DIMOTIKO_GRADES, getGrade } from '../../data/curriculum'

function getMondayStr() {
  const d = new Date()
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  const mon = new Date(d); mon.setDate(d.getDate() - day)
  return mon.toDateString()
}

function burst() {
  const opts = { particleCount: 60, spread: 70, origin: { y: 0.5 }, colors: ['#7c3aed', '#a78bfa', '#10b981', '#fbbf24'] }
  confetti({ ...opts, origin: { x: 0.3, y: 0.5 } })
  setTimeout(() => confetti({ ...opts, origin: { x: 0.7, y: 0.5 } }), 180)
}

function StatRow({ emoji, value, label, color, delay, big }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4, delay }}
      className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
    >
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${color}15` }}>
        {emoji}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold" style={{ color: 'var(--fg-3)' }}>{label}</p>
      </div>
      <div className={`font-black ${big ? 'text-2xl' : 'text-lg'} text-white tabular-nums`}
        style={{ color }}>
        {value}
      </div>
    </motion.div>
  )
}

function AccuracyRow({ accuracy, prevAccuracy, delay }) {
  const delta = prevAccuracy != null ? accuracy - prevAccuracy : null
  const color = delta == null ? '#a78bfa' : delta > 0 ? '#10b981' : delta < 0 ? '#ef4444' : '#64748b'
  const valueStr = delta == null
    ? `${accuracy}%`
    : delta > 0 ? `${accuracy}% (+${delta}%)` : delta < 0 ? `${accuracy}% (${delta}%)` : `${accuracy}%`

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4, delay }}
      className="flex items-center gap-4 py-3 border-b border-white/5"
    >
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${color}15` }}>
        📈
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold" style={{ color: 'var(--fg-3)' }}>Ακρίβεια</p>
        <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay + 0.2 }}
            style={{ background: color }} />
        </div>
      </div>
      <div className="font-black text-lg tabular-nums shrink-0" style={{ color }}>{valueStr}</div>
    </motion.div>
  )
}

function suggestGoal(onboarding, progress) {
  if (!onboarding?.grade) return null
  const grade = getGrade(onboarding.grade)
  if (!grade) return null
  // Find the first chapter that's in progress or not started
  for (const chapter of grade.chapters) {
    const p = progress[`${grade.id}/${chapter.id}`]
    const done = p?.completedExercises || 0
    if (done < 8) {
      return { chapter, grade, done }
    }
  }
  return null
}

export default function WeeklyReview({ open, onClose }) {
  const { user, profile, weeklyStats, weeklyXP, streak, progress, onboarding, lastReviewWeek, setLastReviewWeek } = useStore()
  const navigate = useNavigate()
  const fired = useRef(false)

  useEffect(() => {
    if (open && !fired.current) {
      fired.current = true
      setTimeout(() => burst(), 400)
      setLastReviewWeek(getMondayStr())
    }
    if (!open) fired.current = false
  }, [open])

  if (!open) return null

  const answered = weeklyStats?.answered || 0
  const correct = weeklyStats?.correct || 0
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null
  const prevAccuracy = weeklyStats?.prevAccuracy ?? null

  // Chapters studied this week
  const oneWeekAgo = Date.now() - 7 * 86400000
  const allGrades = [...DIMOTIKO_GRADES, ...GRADES]
  const chaptersThisWeek = Object.entries(progress).filter(([, p]) => (p.updatedAt || 0) > oneWeekAgo).length

  const name = profile?.display_name || user?.email?.split('@')[0] || 'Μαθητή'
  const goal = suggestGoal(onboarding, progress)

  const weekStart = new Date(Date.now() - 6 * 86400000).toLocaleDateString('el-GR', { day: 'numeric', month: 'long' })
  const weekEnd = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long' })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa,#10b981)' }} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: '#7c3aed' }}>
                    Εβδομαδιαία Αναφορά
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-display font-black text-2xl text-white leading-tight">
                    Τι πέτυχες αυτή την εβδομάδα, {name}!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>
                    {weekStart} – {weekEnd}
                  </motion.p>
                </div>
                <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors mt-1">
                  <X size={18} />
                </button>
              </div>

              {/* Stats */}
              <div className="mt-5">
                <StatRow emoji="📚" value={chaptersThisWeek}           label="Κεφάλαια αυτή την εβδ."   color="#10b981" delay={0.2} />
                <StatRow emoji="🧠" value={answered}                   label="Ερωτήσεις που απάντησες"   color="#a78bfa" delay={0.27} big />
                <StatRow emoji="🔥" value={`${streak.current} μέρες`} label="Συνεχόμενο streak"          color="#ef4444" delay={0.34} />
                <StatRow emoji="⭐" value={`+${weeklyXP?.thisWeek || 0} XP`} label="XP κερδίσατε"       color="#f59e0b" delay={0.41} />
                {accuracy != null && (
                  <AccuracyRow accuracy={accuracy} prevAccuracy={prevAccuracy} delay={0.48} />
                )}
              </div>

              {/* Goal next week */}
              {goal && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4, delay: 0.55 }}
                  className="mt-5 rounded-2xl p-4"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={13} className="text-violet-400 shrink-0" />
                    <p className="text-xs font-black tracking-widest uppercase text-violet-400">Στόχος επόμενης εβδομάδας</p>
                  </div>
                  <button
                    onClick={() => { onClose(); navigate(`/grade/${goal.grade.id}/chapter/${goal.chapter.id}`) }}
                    className="flex items-center gap-3 w-full group">
                    <span className="text-2xl">{goal.chapter.emoji}</span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-white truncate">{goal.chapter.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--fg-3)' }}>
                        {goal.done > 0 ? `${goal.done}/8 ασκήσεις — συνέχισε` : 'Ξεκίνα εδώ'}
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-violet-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="flex gap-2 mt-5">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--fg-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  Κλείσιμο
                </button>
                <button
                  onClick={() => { onClose(); navigate('/journey') }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                  Το ταξίδι μου
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
