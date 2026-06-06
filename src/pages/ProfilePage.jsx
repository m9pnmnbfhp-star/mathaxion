import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Star, Trophy, Target, BookOpen, Clock, TrendingUp, Crown, Brain } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GRADES, getGrade } from '../data/curriculum'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import useStore from '../store/useStore'
import { generateAdaptiveQuiz } from '../lib/anthropic'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, profile, streak, xp, totalXP, progress, wrongAnswers, isPro, setUpgradeModal } = useStore()
  const [adaptiveQuiz, setAdaptiveQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-white mb-2">Συνδέσου για να δεις το προφίλ σου</h2>
        <p className="text-slate-400 text-sm mb-6">Παρακολούθησε την πρόοδό σου, τα streaks και τα XP σου</p>
        <Link to="/">
          <Button variant="secondary">Επιστροφή στην αρχική</Button>
        </Link>
      </div>
    )
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Μαθητής'

  const totalChapters = GRADES.reduce((acc, g) => acc + g.chapters.length, 0)
  const startedChapters = Object.keys(progress).length
  const masteredChapters = Object.values(progress).filter(p => (p.completedExercises || 0) >= 8).length

  const weakConcepts = [...new Map(
    wrongAnswers.slice(0, 20).map(w => [w.concept, w])
  ).values()].slice(0, 5)

  const loadAdaptiveQuiz = async () => {
    if (weakConcepts.length === 0) {
      toast('Δεν έχεις λάθη ακόμα — συνέχισε να λύνεις ασκήσεις!')
      return
    }
    setQuizLoading(true)
    try {
      const raw = await generateAdaptiveQuiz(weakConcepts, null, 5)
      const arr = extractJSONArray(raw)
      setAdaptiveQuiz(arr)
    } catch {
      toast.error('Σφάλμα φόρτωσης quiz')
    } finally {
      setQuizLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5"
      >
        <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-3xl font-black text-violet-300">
          {displayName[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white">{displayName}</h1>
            {isPro && <Crown size={20} className="text-amber-400" />}
          </div>
          <p className="text-slate-400">{user.email}</p>
          {!isPro && (
            <button
              onClick={() => setUpgradeModal(true)}
              className="text-xs text-amber-400 hover:text-amber-300 mt-1 transition-colors"
            >
              Αναβάθμιση σε Pro →
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Flame} value={streak.current} label="Streak" color="#f59e0b"
          sub={`Μέγιστο: ${streak.longest}`} />
        <StatCard icon={Star} value={xp.toLocaleString('el')} label="XP" color="#7c3aed" sub="Σύνολο" />
        <StatCard icon={BookOpen} value={startedChapters} label="Κεφάλαια" color="#10b981"
          sub={`από ${totalChapters}`} />
        <StatCard icon={Trophy} value={masteredChapters} label="Κατακτημένα" color="#fbbf24" />
      </div>

      {/* Progress per grade */}
      <Card>
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-violet-400" />
          Πρόοδος ανά τάξη
        </h2>
        <div className="space-y-4">
          {GRADES.map(grade => {
            const done = grade.chapters.filter(c => {
              const p = progress[`${grade.id}/${c.id}`]
              return p && (p.completedExercises || 0) > 0
            }).length
            const pct = (done / grade.chapters.length) * 100
            return (
              <div key={grade.id}>
                <div className="flex justify-between text-sm mb-1">
                  <Link to={`/grade/${grade.id}`} className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                    <span style={{ color: grade.color }}>{grade.icon}</span>
                    {grade.label}
                  </Link>
                  <span className="text-slate-500 text-xs">{done}/{grade.chapters.length} κεφάλαια</span>
                </div>
                <ProgressBar value={pct} color={grade.color} height={6} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Adaptive Quiz section */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-white flex items-center gap-2">
              <Brain size={18} className="text-violet-400" />
              Adaptive Quiz
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">Εξάσκηση στα αδύνατα σημεία σου</p>
          </div>
          <Button size="sm" onClick={loadAdaptiveQuiz} loading={quizLoading}>
            {adaptiveQuiz ? 'Νέο Quiz' : 'Ξεκίνα'}
          </Button>
        </div>

        {weakConcepts.length > 0 ? (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-slate-500 font-medium">Αδύνατα σημεία:</p>
            <div className="flex flex-wrap gap-2">
              {weakConcepts.map((wc, i) => (
                <Badge key={i} color="red" size="sm">{wc.concept}</Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-4">Δεν έχεις λάθη ακόμα. Συνέχισε να εξασκείσαι!</p>
        )}

        {adaptiveQuiz && (
          <div className="space-y-3">
            {adaptiveQuiz.map((q, i) => (
              <AdaptiveQuestion key={i} question={q} index={i} />
            ))}
          </div>
        )}
      </Card>

      {/* Recent wrong answers */}
      {wrongAnswers.length > 0 && (
        <Card>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Target size={18} className="text-red-400" />
            Πρόσφατα λάθη
          </h2>
          <div className="space-y-2">
            {wrongAnswers.slice(0, 5).map((w, i) => (
              <div key={i} className="p-3 bg-[#1c1c28] rounded-xl border border-red-500/10 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-slate-300 line-clamp-1">{w.question}</p>
                    <p className="text-xs text-red-400 mt-0.5">Απάντησα: {w.myAnswer}</p>
                    <p className="text-xs text-emerald-400">Σωστό: {w.correctAnswer}</p>
                  </div>
                  <Badge color="slate" size="xs">{w.concept}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Streak calendar placeholder */}
      <Card>
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          Streak — {streak.current} μέρες συνεχόμενα
        </h2>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => {
            const isActive = i >= 28 - streak.current
            return (
              <div
                key={i}
                className={`h-7 rounded-md ${
                  isActive ? 'bg-orange-500/60 border border-orange-500/30' : 'bg-[#1c1c28] border border-[#2a2a3a]'
                }`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-2">
          <span>28 ημέρες πριν</span>
          <span>Σήμερα</span>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, value, label, sub, color }) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="text-2xl font-black text-white">{value}</div>
      </div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </Card>
  )
}

function AdaptiveQuestion({ question, index }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)

  const check = () => {
    const n = s => s.toString().toLowerCase().replace(/\s/g, '').replace(',', '.')
    setIsCorrect(n(answer) === n(question.answer))
    setSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-3 bg-[#1c1c28] rounded-xl border border-[#2a2a3a] space-y-2"
    >
      <div className="flex gap-2">
        <span className="text-violet-400 font-mono text-sm shrink-0">{index + 1}.</span>
        <p className="text-sm text-slate-200">{question.question}</p>
      </div>
      {question.hint && <p className="text-xs text-amber-300/70 pl-5">💡 {question.hint}</p>}
      {!submitted ? (
        <div className="flex gap-2 pl-5">
          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && answer.trim() && check()}
            placeholder="Απάντηση..."
            className="flex-1 bg-[#16161f] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-sm text-white outline-none"
          />
          <button onClick={check} className="px-3 py-1.5 bg-violet-600/50 rounded-lg text-xs text-white">✓</button>
        </div>
      ) : (
        <div className={`pl-5 text-xs ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCorrect ? '✓ Σωστό!' : `✗ Σωστό: ${question.answer}`}
        </div>
      )}
    </motion.div>
  )
}

function extractJSONArray(text) {
  try { const m = text.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]) } catch { /* */ }
  return []
}
