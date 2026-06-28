import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, Lock, Zap, BookOpen, Target } from 'lucide-react'
import { GRADES, getGrade } from '../data/curriculum'
import ProgressBar from '../components/ui/ProgressBar'
import useStore from '../store/useStore'

const DIFFICULTY_LABELS = { 1: 'Εύκολο', 2: 'Μέτριο', 3: 'Δύσκολο', 4: 'Προχωρημένο', 5: 'Εξεταστικό' }
const DIFFICULTY_COLORS = {
  1: ['#10b981', 'rgba(16,185,129,0.12)'],
  2: ['#3b82f6', 'rgba(59,130,246,0.12)'],
  3: ['#8b5cf6', 'rgba(139,92,246,0.12)'],
  4: ['#f59e0b', 'rgba(245,158,11,0.12)'],
  5: ['#ef4444', 'rgba(239,68,68,0.12)'],
}

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.45 }

export default function GradePage() {
  const { gradeId } = useParams()
  const navigate = useNavigate()
  const { getChapterProgress, isPro, setUpgradeModal, user, setAuthModal } = useStore()

  const grade = getGrade(gradeId)
  if (!grade) return <NotFound />

  const otherGrades = GRADES.filter(g => g.id !== gradeId)
  const totalChapters = grade.chapters.length
  const startedCount = grade.chapters.filter(c => {
    const p = getChapterProgress(grade.id, c.id)
    return (p.completedExercises || 0) > 0
  }).length
  const masteredCount = grade.chapters.filter(c => {
    const p = getChapterProgress(grade.id, c.id)
    return (p.completedExercises || 0) >= 8
  }).length

  return (
    <div className="relative min-h-screen">
      {/* Grade-tinted subtle background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-[600px] h-[400px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${grade.color}08 0%, transparent 70%)`, filter: 'blur(60px)' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8" style={{ zIndex: 1 }}>
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors group"
          style={{ color: 'var(--fg-3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-3)'}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Αρχική
        </Link>

        {/* Grade header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: SPRING }} className="mb-10">
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
            style={{
              background: `linear-gradient(135deg, ${grade.color}12 0%, #16161f 50%)`,
              border: `1px solid ${grade.color}25`,
            }}>
            {/* Top glow */}
            <div className="absolute top-0 left-12 right-12 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${grade.color}60, transparent)` }} />

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
                style={{ background: `${grade.color}18`, border: `2px solid ${grade.color}30` }}>
                {grade.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-3xl font-black text-white font-display">{grade.label}</h1>
                  {grade.isPanellinies && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                      <Zap size={9} />ΠΑΝΕΛΛΉΝΙΕΣ
                    </span>
                  )}
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--fg-2)' }}>{grade.description}</p>
                <div className="flex gap-4 text-xs" style={{ color: 'var(--fg-3)' }}>
                  <span className="flex items-center gap-1"><BookOpen size={11} />{grade.chapters.length} κεφάλαια</span>
                  <span>·</span>
                  <span><Clock size={11} className="inline mr-1" />{grade.chapters.reduce((a, c) => a + c.estimatedHours, 0)}+ ώρες</span>
                  <span>·</span>
                  <span>{grade.level === 'gymnasio' ? 'Γυμνάσιο' : 'Λύκειο'}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3 sm:gap-4 shrink-0">
                {[
                  { val: startedCount, label: 'Ξεκίνησαν', color: grade.color },
                  { val: masteredCount, label: 'Κατακτήθηκαν', color: '#10b981' },
                  { val: totalChapters, label: 'Σύνολο', color: 'var(--fg-3)' },
                ].map(({ val, label, color }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-black font-display" style={{ color }}>{val}</p>
                    <p className="text-[10px]" style={{ color: 'var(--fg-3)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chapter list */}
        <div className="space-y-3 mb-12">
          {grade.chapters.map((chapter, i) => {
            const progress = getChapterProgress(grade.id, chapter.id)
            const completionPct = Math.min(100, (progress.completedExercises || 0) * 10)
            const isStarted = (progress.completedExercises || 0) > 0
            const isMastered = completionPct >= 80
            const isLocked = !user || !isPro
            const [diffColor, diffBg] = DIFFICULTY_COLORS[chapter.difficulty] || ['#8892a4', 'rgba(136,146,164,0.1)']

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ...SPRING }}
              >
                <div
                  className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: '#16161f',
                    border: `1px solid ${isMastered ? '#10b98130' : 'rgba(255,255,255,0.06)'}`,
                  }}
                  onClick={() => {
                    if (!user) { setAuthModal(true, 'signup'); return }
                    if (!isPro) { setUpgradeModal(true); return }
                    navigate(`/grade/${grade.id}/chapter/${chapter.id}`)
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `1px solid ${grade.color}35`
                    e.currentTarget.style.boxShadow = `0 0 20px ${grade.color}10`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = `1px solid ${isMastered ? '#10b98130' : 'rgba(255,255,255,0.06)'}`
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(180deg, ${grade.color}, ${grade.color}60)` }} />

                  {/* Mastered glow overlay */}
                  {isMastered && <div className="absolute inset-0 opacity-[0.025]" style={{ background: '#10b981' }} />}

                  <div className="flex items-start gap-4 p-5">
                    {/* Index + emoji */}
                    <div className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors"
                      style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-[9px] font-black tabular-nums" style={{ color: 'var(--fg-3)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-lg leading-none">{chapter.emoji}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="font-bold text-white group-hover:text-violet-200 transition-colors text-[15px]">
                          {chapter.title}
                        </h2>
                        {isMastered && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 size={11} />Κατακτημένο
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: diffBg, color: diffColor }}>
                          {DIFFICULTY_LABELS[chapter.difficulty]}
                        </span>
                      </div>

                      <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--fg-2)' }}>
                        {chapter.description}
                      </p>

                      {/* Concept tags */}
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {chapter.concepts.slice(0, 4).map(c => (
                          <span key={c} className="text-[11px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--fg-3)' }}>
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Progress bar */}
                      {isStarted && (
                        <div className="flex items-center gap-2">
                          <ProgressBar value={completionPct} color={grade.color} height={3} />
                          <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--fg-3)' }}>
                            {completionPct}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
                      <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--fg-3)' }}>
                        <Clock size={10} />{chapter.estimatedHours}h
                      </div>
                      {isLocked ? (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <Lock size={13} style={{ color: 'var(--fg-3)' }} />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: `${grade.color}20` }}>
                          <ArrowRight size={13} style={{ color: grade.color }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Other grades */}
        <div>
          <p className="text-[11px] font-black tracking-widest uppercase mb-3" style={{ color: 'var(--fg-3)' }}>
            Άλλες τάξεις
          </p>
          <div className="flex gap-2 flex-wrap">
            {otherGrades.map(g => (
              <motion.button
                key={g.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/grade/${g.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all cursor-pointer"
                style={{ border: `1px solid rgba(255,255,255,0.08)`, color: 'var(--fg-2)', background: '#16161f' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${g.color}40`; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--fg-2)' }}
              >
                <span>{g.icon}</span>{g.shortLabel}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Target size={32} style={{ color: 'var(--fg-3)' }} />
      </div>
      <p className="text-white font-bold text-xl mb-2">Η τάξη δεν βρέθηκε</p>
      <p className="text-sm mb-6" style={{ color: 'var(--fg-2)' }}>Ίσως ο σύνδεσμος να μην είναι σωστός.</p>
      <Link to="/" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
        ← Αρχική
      </Link>
    </div>
  )
}
