import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Swords, Clock, Lock, Zap, Share2, Copy } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import useStore from '../../store/useStore'
import { generateExercise } from '../../lib/anthropic'
import toast from 'react-hot-toast'

const BATTLE_DURATION = 120
const QUESTIONS_PER_BATTLE = 10
const randomDifficultyLevel = () => Math.ceil(Math.random() * 3)

export default function StudyBattle({ grade, chapter }) {
  const { isPro, user, setUpgradeModal, setAuthModal, addXP } = useStore()
  const [phase, setPhase] = useState('lobby') // lobby | countdown | battle | results
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [roomCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase())
  const timerRef = useRef(null)

  const startSolo = async () => {
    if (!user) { setAuthModal(true); return }
    if (!isPro) { setUpgradeModal(true); return }

    setPhase('countdown')
    let c = 3
    const interval = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) {
        clearInterval(interval)
        loadQuestionsAndStart()
      }
    }, 1000)
  }

  const loadQuestionsAndStart = async () => {
    try {
      const chapterTopics = chapter.concepts || ['Βασικές έννοιες']
      const COUNT = 5
      const results = await Promise.all(
        Array.from({ length: COUNT }, (_, i) => {
          const topic = chapterTopics[i % chapterTopics.length]
          return generateExercise(topic, chapter.title, grade, randomDifficultyLevel())
            .then(raw => ({ ...extractJSON(raw), topic }))
            .catch(() => null)
        })
      )
      const qs = results.filter(Boolean)
      if (!qs.length) throw new Error('no questions')
      setQuestions(qs)
      setPhase('battle')
      setTimeLeft(BATTLE_DURATION)

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setPhase('results')
            simulateOpponent()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Simulate opponent
      simulateOpponentRealtime()
    } catch {
      toast.error('Σφάλμα φόρτωσης ερωτήσεων')
      setPhase('lobby')
    }
  }

  const simulateOpponentRealtime = () => {
    const interval = setInterval(() => {
      setOpponentScore(prev => {
        const newScore = prev + (Math.random() > 0.4 ? 1 : 0)
        if (newScore >= QUESTIONS_PER_BATTLE) {
          clearInterval(interval)
          return newScore
        }
        return newScore
      })
    }, 8000 + Math.random() * 12000)
  }

  const simulateOpponent = () => {
    setOpponentScore(Math.floor(Math.random() * QUESTIONS_PER_BATTLE))
  }

  const submitAnswer = () => {
    if (!input.trim() || currentQ >= questions.length) return
    const q = questions[currentQ]
    const correct = checkAnswer(input, q.answer)
    if (correct) {
      setScore(prev => prev + 1)
      addXP(15)
      toast.success('+15 XP! 🎯', { duration: 1000 })
    }
    setAnswers(prev => [...prev, { question: q.question, myAnswer: input, correct }])
    setInput('')
    if (currentQ + 1 >= questions.length) {
      clearInterval(timerRef.current)
      setTimeout(() => setPhase('results'), 500)
    } else {
      setCurrentQ(prev => prev + 1)
    }
  }

  const pct = (timeLeft / BATTLE_DURATION) * 100
  const timeColor = pct > 50 ? '#10b981' : pct > 25 ? '#f59e0b' : '#ef4444'

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-5">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          ⚔️
        </motion.div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-white">Study Battle</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Μάχεσαι σε quiz real-time με συμμαθητές ή AI αντίπαλο!
          </p>
          <div className="flex items-center gap-1 justify-center">
            <Lock size={14} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Απαιτείται Pro</span>
          </div>
        </div>
        <Button variant="gold" onClick={() => setUpgradeModal(true)} icon={<Swords size={16} />}>
          Αναβάθμιση για Battles
        </Button>
      </div>
    )
  }

  if (phase === 'lobby') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">⚔️</div>
          <h3 className="text-xl font-bold text-white">Study Battle</h3>
          <p className="text-slate-400 text-sm">
            {QUESTIONS_PER_BATTLE} ερωτήσεις · {BATTLE_DURATION / 60} λεπτά
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center space-y-2 cursor-pointer hover:border-violet-500/40 transition-colors" onClick={startSolo}>
            <div className="text-3xl">🤖</div>
            <p className="text-sm font-medium text-white">Vs AI</p>
            <p className="text-xs text-slate-500">Solo practice</p>
          </Card>

          <Card className="text-center space-y-2 cursor-pointer opacity-60" onClick={() => toast('Σύντομα! Multiplayer coming soon', { icon: '🚀' })}>
            <div className="text-3xl">👥</div>
            <p className="text-sm font-medium text-white">Multiplayer</p>
            <p className="text-xs text-amber-400">Coming soon</p>
          </Card>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#1c1c28] rounded-xl border border-[#2a2a3a]">
          <div className="text-sm text-slate-400">Room code:</div>
          <div className="flex-1 font-mono font-bold text-violet-400 text-lg tracking-widest">{roomCode}</div>
          <button
            onClick={() => { navigator.clipboard?.writeText(roomCode); toast.success('Αντιγράφηκε!') }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black text-violet-400"
        >
          {countdown > 0 ? countdown : '🚀'}
        </motion.div>
        <p className="text-slate-400">
          {countdown > 0 ? 'Έτοιμοι;' : 'Φόρτωση ερωτήσεων...'}
        </p>
        {countdown <= 0 && (
          <div className="flex gap-1 mt-2">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (phase === 'battle' && questions.length > 0) {
    const q = questions[currentQ]
    return (
      <div className="space-y-4">
        {/* Timer + Scores */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a]">
            <Clock size={14} style={{ color: timeColor }} />
            <span className="font-mono font-bold text-sm" style={{ color: timeColor }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1 h-2 rounded-full bg-[#2a2a3a] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: timeColor }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Score */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center py-3">
            <div className="text-sm text-slate-400">Εσύ</div>
            <div className="text-3xl font-black text-emerald-400">{score}</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-sm text-slate-400">AI</div>
            <div className="text-3xl font-black text-red-400">{opponentScore}</div>
          </Card>
        </div>

        {/* Question */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-slate-500">{currentQ + 1}/{questions.length}</span>
            <span className="text-xs text-violet-400">{q.topic}</span>
          </div>
          <p className="text-white font-medium mb-4">{q.question}</p>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              placeholder="Η απάντησή σου..."
              className="flex-1 bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50"
            />
            <Button onClick={submitAnswer} disabled={!input.trim()} icon={<Zap size={16} />}>
              Γρήγορα!
            </Button>
          </div>
        </Card>

        {/* Answer history */}
        <div className="flex gap-1">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full ${a.correct ? 'bg-emerald-400' : 'bg-red-400'}`}
            />
          ))}
          {Array.from({ length: questions.length - answers.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 h-1.5 rounded-full bg-[#2a2a3a]" />
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    const won = score > opponentScore
    const tied = score === opponentScore
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center"
      >
        <div className="text-6xl">
          {won ? '🏆' : tied ? '🤝' : '😤'}
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">
            {won ? 'Κέρδισες!' : tied ? 'Ισοπαλία!' : 'Ήττα — Προσπάθησε ξανά!'}
          </h3>
          {won && <p className="text-emerald-400 text-sm mt-1">+50 XP Bonus!</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center py-4">
            <div className="text-sm text-slate-400 mb-1">Εσύ</div>
            <div className={`text-4xl font-black ${won ? 'text-emerald-400' : 'text-white'}`}>{score}</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-sm text-slate-400 mb-1">AI</div>
            <div className={`text-4xl font-black ${!won ? 'text-emerald-400' : 'text-white'}`}>{opponentScore}</div>
          </Card>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={() => {
            setPhase('lobby')
            setScore(0)
            setOpponentScore(0)
            setCurrentQ(0)
            setAnswers([])
            setQuestions([])
          }}>
            Νέο Battle
          </Button>
          <Button variant="ghost" onClick={() => toast.success('Copied!', { icon: '📋' })} icon={<Share2 size={14} />}>
            Μοιράσου
          </Button>
        </div>
      </motion.div>
    )
  }

  return null
}

function checkAnswer(a, b) {
  const n = (s) => s.toString().toLowerCase().replace(/\s/g, '').replace(',', '.')
  const u = n(a), c = n(b)
  if (u === c) return true
  const nu = parseFloat(u), nc = parseFloat(c)
  return !isNaN(nu) && !isNaN(nc) && Math.abs(nu - nc) < 0.01
}

function extractJSON(text) {
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch { /* */ }
  return { question: text.slice(0, 100), answer: '—', hint: '', solution_steps: [] }
}
