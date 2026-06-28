import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Search, CheckCircle2, Flame, Lock, Zap } from 'lucide-react'
import { GRADES, getGrade } from '../data/curriculum'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import useStore from '../store/useStore'

const DIFFICULTY_LABELS = { 1: 'Εύκολο', 2: 'Μέτριο', 3: 'Δύσκολο', 4: 'Προχωρημένο', 5: 'Εξεταστικό' }
const DIFFICULTY_COLORS = { 1: 'green', 2: 'blue', 3: 'violet', 4: 'amber', 5: 'red' }

export default function GradePage() {
  const { gradeId } = useParams()
  const navigate = useNavigate()
  const { getChapterProgress, isPro, setUpgradeModal, user, setAuthModal } = useStore()

  const grade = getGrade(gradeId)
  if (!grade) return <NotFound />

  const otherGrades = GRADES.filter(g => g.id !== gradeId)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Αρχική
      </Link>

      {/* Grade header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
            style={{ background: `${grade.color}18`, border: `2px solid ${grade.color}35`, color: grade.color }}
          >
            {grade.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-3xl font-black text-white">{grade.label}</h1>
              {grade.isPanellinies && <Badge color="red" size="sm"><Flame size={11} />Πανελλήνιες</Badge>}
            </div>
            <p className="text-slate-400">{grade.description}</p>
            <div className="flex gap-4 text-xs text-slate-600 mt-1.5">
              <span>{grade.chapters.length} κεφάλαια</span>
              <span>·</span>
              <span>{grade.chapters.reduce((acc, c) => acc + c.estimatedHours, 0)}+ ώρες</span>
              <span>·</span>
              <span>{grade.level === 'gymnasio' ? 'Γυμνάσιο' : 'Λύκειο'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chapters */}
      <div className="space-y-3 mb-12">
        {grade.chapters.map((chapter, i) => {
          const progress = getChapterProgress(grade.id, chapter.id)
          const completionPct = Math.min(100, (progress.completedExercises || 0) * 10)
          const isStarted = (progress.completedExercises || 0) > 0
          const isMastered = completionPct >= 80
          const isLocked = !user || !isPro

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={`group relative p-5 bg-[#16161f] rounded-2xl border transition-all overflow-hidden ${
                  isLocked
                    ? 'border-[#2a2a3a] opacity-75 cursor-pointer'
                    : 'border-[#2a2a3a] hover:border-[#3a3a50] cursor-pointer'
                }`}
                onClick={() => {
                  if (!user) { setAuthModal(true, 'signup'); return }
                  if (!isPro) { setUpgradeModal(true); return }
                  navigate(`/grade/${grade.id}/chapter/${chapter.id}`)
                }}
              >
                {/* Left color accent */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: grade.color }}
                />

                {/* Mastered glow */}
                {isMastered && (
                  <div className="absolute inset-0 opacity-[0.03]" style={{ background: '#10b981' }} />
                )}

                <div className="flex items-start gap-4">
                  {/* Number + emoji */}
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#1c1c28] border border-[#2a2a3a] group-hover:border-[#3a3a50] flex flex-col items-center justify-center transition-colors">
                      <span className="text-[10px] text-slate-600 font-mono font-bold">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-xl leading-none">{chapter.emoji}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="font-bold text-white group-hover:text-violet-200 transition-colors">
                        {chapter.title}
                      </h2>
                      {isMastered && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 size={12} />Κατακτημένο
                        </span>
                      )}
                      <Badge color={DIFFICULTY_COLORS[chapter.difficulty] || 'slate'} size="xs">
                        {DIFFICULTY_LABELS[chapter.difficulty]}
                      </Badge>
                    </div>

                    <p className="text-slate-400 text-sm mb-3 leading-relaxed">{chapter.description}</p>

                    {/* Concept tags */}
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {chapter.concepts.map(c => (
                        <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] text-slate-500">
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* Progress */}
                    {isStarted && (
                      <ProgressBar value={completionPct} color={grade.color} height={4} />
                    )}
                  </div>

                  {/* Right side */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Clock size={11} />
                      <span>{chapter.estimatedHours}h</span>
                    </div>
                    {isLocked ? (
                      <Lock size={15} className="text-slate-600" />
                    ) : (
                      <ArrowRight size={16} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
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
        <p className="text-xs font-bold text-slate-600 tracking-widest uppercase mb-3">Άλλες τάξεις</p>
        <div className="flex gap-2 flex-wrap">
          {otherGrades.map(g => (
            <button
              key={g.id}
              onClick={() => navigate(`/grade/${g.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border border-[#2a2a3a] text-slate-400 hover:text-white hover:border-[#3a3a50] transition-all"
            >
              <span>{g.icon}</span>
              {g.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Search size={48} className="text-slate-700 mb-4" />
      <p className="text-white font-bold text-xl">Η τάξη δεν βρέθηκε</p>
      <Link to="/" className="mt-4 text-violet-400 hover:text-violet-300 transition-colors">
        Επιστροφή στην αρχική
      </Link>
    </div>
  )
}
