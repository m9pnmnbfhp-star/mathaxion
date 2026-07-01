import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { countUpEl } from '../lib/gsapAnimations'
import { Flame, Star, Trophy, Target, BookOpen, TrendingUp, Crown, Brain, User, Lightbulb, Zap, ChevronRight, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GRADES } from '../data/curriculum'
import RadarChart from '../components/profile/RadarChart'
import ShareCardModal from '../components/profile/ShareCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import useStore from '../store/useStore'
import { getPeerStats, compareLabel } from '../lib/peerStats'
import { generateAdaptiveQuiz } from '../lib/anthropic'
import toast from 'react-hot-toast'

function CompareStatCard({ icon: Icon, value, label, pct, color, delay }) {
  const ref = useRef(null)
  const numRef = useRef(null)
  const pctRef = useRef(null)
  const inView = useInView(ref, { once: true })
  const animated = useRef(false)

  useEffect(() => {
    if (inView && !animated.current && numRef.current) {
      animated.current = true
      if (typeof value === 'number') countUpEl(numRef.current, 0, value, 0.85)
      else numRef.current.textContent = value
    }
  }, [inView, value])

  useEffect(() => {
    if (inView && pctRef.current && pct != null) {
      countUpEl(pctRef.current, 0, pct, 0.7)
    }
  }, [inView, pct])

  const barWidth = pct != null ? `${pct}%` : '0%'
  const barColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : pct >= 40 ? '#7c3aed' : '#64748b'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 22 }}
      className="relative p-4 bg-[#16161f] rounded-2xl border border-[#2a2a3a] overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{ background: `radial-gradient(ellipse at top left, ${color}08, transparent 70%)` }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={15} style={{ color }} />
          </div>
          {pct != null && (
            <div className="text-right">
              <span ref={pctRef} className="text-lg font-black" style={{ color: barColor }}>0</span>
              <span className="text-sm font-bold" style={{ color: barColor }}>%</span>
            </div>
          )}
        </div>
        <div ref={numRef} className="text-2xl font-black text-white mb-0.5">{value}</div>
        <div className="text-xs font-medium text-slate-400 mb-2">{label}</div>
        {pct != null && (
          <>
            <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: barColor }}
                initial={{ width: 0 }}
                animate={{ width: barWidth }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay + 0.2 }} />
            </div>
            <p className="text-[10px] leading-tight" style={{ color: 'var(--fg-3)' }}>
              {compareLabel(pct)}
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}

function getLevel(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 8)) + 1
}

function getXPForLevel(level) {
  return Math.pow(level - 1, 2) * 8
}

export default function ProfilePage() {
  const { user, profile, streak, xp, progress, wrongAnswers, isPro, setUpgradeModal, onboarding, weeklyXP } = useStore()
  const [adaptiveQuiz, setAdaptiveQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [peerPct, setPeerPct] = useState(null)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="w-24 h-24 rounded-3xl bg-[#1c1c28] border border-[#2a2a3a] flex items-center justify-center mb-6">
          <User size={40} className="text-slate-600" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Συνδέσου πρώτα</h2>
        <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">Παρακολούθησε την πρόοδό σου, τα streaks και τα XP σου</p>
        <Link to="/">
          <Button variant="secondary">Επιστροφή στην αρχική</Button>
        </Link>
      </div>
    )
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Μαθητής'
  const level = getLevel(xp)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForLevel(level + 1)
  const levelProgress = Math.min(100, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)

  const totalChapters = GRADES.reduce((acc, g) => acc + g.chapters.length, 0)
  const startedChapters = Object.keys(progress).length
  const masteredChapters = Object.values(progress).filter(p => (p.completedExercises || 0) >= 8).length

  const overallMastery = (() => {
    const allChapters = GRADES.flatMap(g => g.chapters.map(ch => {
      const p = progress[`${g.id}/${ch.id}`]
      return Math.min(100, (p?.completedExercises || 0) * 10)
    }))
    if (allChapters.length === 0) return 0
    return Math.round(allChapters.reduce((a, b) => a + b, 0) / allChapters.length)
  })()

  // Fetch peer percentiles once on mount
  useEffect(() => {
    const gradeId = onboarding?.grade || null
    getPeerStats({
      gradeId,
      weeklyXP: weeklyXP?.thisWeek || 0,
      totalXP: xp,
      streak: streak.current,
      masteredChapters,
      onRealData: (real) => setPeerPct(real),
    }).then(modeled => setPeerPct(p => p || modeled))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const shareStats = {
    name: displayName,
    initial: displayName[0].toUpperCase(),
    level,
    xp,
    streak: streak.current,
    masteredChapters,
    overallMastery,
  }

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

      {/* Profile hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#2a2a3a] bg-[#16161f] p-6"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/05 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex items-start gap-5 flex-wrap">
          {/* Avatar with SVG progress ring */}
          <div className="relative shrink-0">
            <svg width="88" height="88" viewBox="0 0 88 88" className="absolute -inset-[4px]" style={{ zIndex: 1 }}>
              <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="3" />
              <motion.circle
                cx="44" cy="44" r="40" fill="none"
                stroke="url(#profileRing)" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - levelProgress / 100) }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                style={{ transformOrigin: '44px 44px', rotate: '-90deg' }}
              />
              <defs>
                <linearGradient id="profileRing" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/30 to-violet-800/30 border-2 border-violet-500/40 flex items-center justify-center text-3xl font-black text-violet-200 relative z-10">
              {displayName[0].toUpperCase()}
            </div>
            {isPro && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 border-2 border-[#16161f] flex items-center justify-center" style={{ zIndex: 12 }}>
                <Crown size={11} className="text-black" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-white truncate">{displayName}</h1>
              {isPro && <Badge color="amber" size="xs"><Crown size={10} />Pro</Badge>}
            </div>
            <p className="text-slate-500 text-sm mb-3">{user.email}</p>

            {/* Level + XP bar */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-black text-violet-400 shrink-0">Lv.{level}</span>
              <div className="flex-1 h-2 bg-[#1c1c28] rounded-full overflow-hidden border border-[#2a2a3a]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                />
              </div>
              <span className="text-xs text-slate-600 shrink-0">Lv.{level + 1}</span>
            </div>
            <p className="text-xs text-slate-600">
              <span className="text-amber-400 font-bold">{xp.toLocaleString('el')}</span> XP · {(nextLevelXP - xp).toLocaleString('el')} μέχρι το επόμενο level
            </p>

            {!isPro && (
              <button onClick={() => setUpgradeModal(true)} className="text-xs text-amber-400 hover:text-amber-300 mt-2 transition-colors flex items-center gap-1">
                <Crown size={11} />Αναβάθμιση σε Pro <ChevronRight size={11} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats grid — with peer comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CompareStatCard icon={Flame}    value={streak.current}  label={`Streak${streak.longest > streak.current ? ` (max ${streak.longest})` : ''}`}    pct={peerPct?.streak}   color="#f59e0b" delay={0.10} />
        <CompareStatCard icon={Star}     value={xp}              label="Συνολικό XP"            pct={peerPct?.totalXP}  color="#7c3aed" delay={0.16} />
        <CompareStatCard icon={TrendingUp} value={weeklyXP?.thisWeek || 0} label="XP αυτή την εβδ."  pct={peerPct?.weeklyXP} color="#10b981" delay={0.22} />
        <CompareStatCard icon={Trophy}   value={masteredChapters} label="Κατακτημένα κεφ."     pct={peerPct?.chapters} color="#fbbf24" delay={0.28} />
      </div>

      {/* Skill radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
        className="rounded-2xl p-6"
        style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <RadarChart progress={progress} />
      </motion.div>

      {/* Share button */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => setShareOpen(true)}
        className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--fg-2)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.color = 'white' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--fg-2)' }}
      >
        <Share2 size={15} />Μοιράσου την πρόοδό σου
      </motion.button>

      <ShareCardModal open={shareOpen} onClose={() => setShareOpen(false)} stats={shareStats} />

      {/* XP hint */}
      <p className="text-xs text-slate-600 flex items-start gap-1.5 -mt-1">
        <Lightbulb size={12} className="text-violet-400 shrink-0 mt-0.5" />
        <span>Κερδίζεις <span className="text-violet-300 font-medium">XP</span> διαβάζοντας θεωρία, λύνοντας ασκήσεις και παίζοντας Study Battles — όσο πιο πολλά συγκεντρώνεις, τόσο ανεβαίνεις level.</span>
      </p>

      {/* Grade progress */}
      <Card>
        <h2 className="font-bold text-white mb-5 flex items-center gap-2">
          <TrendingUp size={16} className="text-violet-400" />
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
                <div className="flex justify-between text-sm mb-1.5">
                  <Link to={`/grade/${grade.id}`} className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
                    <span>{grade.icon}</span>
                    <span className="font-medium">{grade.label}</span>
                  </Link>
                  <span className="text-slate-600 text-xs">{done}/{grade.chapters.length}</span>
                </div>
                <ProgressBar value={pct} color={grade.color} height={5} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Adaptive Quiz */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-white flex items-center gap-2 mb-0.5">
              <Brain size={16} className="text-violet-400" />
              Adaptive Quiz
            </h2>
            <p className="text-sm text-slate-500">Εξάσκηση στα αδύνατα σημεία σου</p>
          </div>
          <Button size="sm" onClick={loadAdaptiveQuiz} loading={quizLoading}>
            {adaptiveQuiz ? 'Νέο Quiz' : 'Ξεκίνα'}
          </Button>
        </div>

        {weakConcepts.length > 0 ? (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Αδύνατα σημεία</p>
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
            {adaptiveQuiz.map((q, i) => <AdaptiveQuestion key={i} question={q} index={i} />)}
          </div>
        )}
      </Card>

      {/* Recent wrong answers */}
      {wrongAnswers.length > 0 && (
        <Card>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Target size={16} className="text-red-400" />
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

      {/* Streak calendar */}
      <Card>
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          Streak — <span className="text-orange-400">{streak.current}</span> μέρες συνεχόμενα
        </h2>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 28 }).map((_, i) => {
            const isActive = i >= 28 - streak.current
            return (
              <div
                key={i}
                className={`h-8 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-b from-orange-500/70 to-orange-600/50 border border-orange-500/40'
                    : 'bg-[#1c1c28] border border-[#2a2a3a]'
                }`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-700 mt-2.5">
          <span>28 ημέρες πριν</span>
          <span>Σήμερα</span>
        </div>
      </Card>
    </div>
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
      transition={{ delay: index * 0.08 }}
      className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
        submitted
          ? isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
          : 'bg-[#1c1c28] border-[#2a2a3a]'
      }`}
    >
      <div className="flex gap-2">
        <span className="text-violet-400 font-black text-sm shrink-0">{index + 1}.</span>
        <p className="text-sm text-slate-200">{question.question}</p>
      </div>
      {question.hint && (
        <p className="text-xs text-amber-300/70 pl-5 flex items-start gap-1">
          <Lightbulb size={11} className="shrink-0 mt-0.5 text-amber-400" />
          {question.hint}
        </p>
      )}
      {!submitted ? (
        <div className="flex gap-2 pl-5">
          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && answer.trim() && check()}
            placeholder="Απάντηση..."
            className="flex-1 bg-[#16161f] border border-[#2a2a3a] focus:border-violet-500/50 rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors"
          />
          <button
            onClick={check}
            className="px-4 py-2 bg-violet-600/40 hover:bg-violet-600/60 border border-violet-500/30 rounded-xl text-xs font-bold text-white transition-colors"
          >
            OK
          </button>
        </div>
      ) : (
        <div className={`pl-5 text-sm font-medium ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
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
