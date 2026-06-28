import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Lock, BookOpen, RotateCcw, ChevronRight, Crown, Zap, Target, Trophy, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import AIResponse from '../components/ui/AIResponse'
import useStore from '../store/useStore'
import { generatePanelliniesQuestion } from '../lib/anthropic'
import toast from 'react-hot-toast'

const TOPICS = [
  { id: 'synartiseis', label: 'Συναρτήσεις & Όρια', emoji: 'lim', difficulty: 3, color: '#3b82f6' },
  { id: 'paragogos',  label: 'Παράγωγος',           emoji: "f'", difficulty: 4, color: '#8b5cf6' },
  { id: 'efarmogies', label: 'Εφαρμογές Παράγωγου', emoji: '📉', difficulty: 5, color: '#f59e0b' },
  { id: 'oloklirosi', label: 'Ολοκλήρωση',          emoji: '∫',  difficulty: 5, color: '#ef4444' },
  { id: 'emvada',     label: 'Εμβαδά Χωρίων',       emoji: '📐', difficulty: 4, color: '#10b981' },
]

const EXAM_DURATION = 3 * 60 * 60

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.45 }

export default function PanelliniesPage() {
  const { isPro, setUpgradeModal, user, setAuthModal } = useStore()
  const [mode, setMode] = useState('menu')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [examQuestions, setExamQuestions] = useState([])
  const [examIndex, setExamIndex] = useState(0)
  const [examAnswers, setExamAnswers] = useState([])
  const timerRef = useRef(null)

  const loadQuestion = async (topicId, difficulty = 4) => {
    if (!user) { setAuthModal(true); return }
    if (!isPro) { setUpgradeModal(true); return }
    setLoading(true); setQuestion(null); setSubmitted(false); setAnswer('')
    try {
      const topic = TOPICS.find(t => t.id === topicId)
      const raw = await generatePanelliniesQuestion(topic.label, 2024, difficulty)
      setQuestion(extractJSON(raw))
    } catch { toast.error('Σφάλμα φόρτωσης ερώτησης') }
    finally { setLoading(false) }
  }

  const startExam = async () => {
    if (!isPro) { setUpgradeModal(true); return }
    setMode('exam'); setTimeLeft(EXAM_DURATION); setExamIndex(0); setExamAnswers([]); setLoading(true)
    try {
      const qs = []
      for (const topic of TOPICS.slice(0, 3)) {
        const raw = await generatePanelliniesQuestion(topic.label, 2024, topic.difficulty)
        qs.push({ topic: topic.label, ...extractJSON(raw) })
      }
      setExamQuestions(qs)
    } catch { toast.error('Σφάλμα δημιουργίας εξέτασης'); setMode('menu') }
    finally { setLoading(false) }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setMode('results'); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const urgencyColor = timeLeft < 600 ? '#ef4444' : timeLeft < 1800 ? '#f59e0b' : '#a78bfa'

  /* ── PRO LOCK ── */
  if (!isPro) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: SPRING }}
          className="relative max-w-md w-full text-center">

          <div className="relative overflow-hidden rounded-3xl p-8"
            style={{
              background: 'linear-gradient(160deg, #1e1020 0%, #16161f 60%)',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 0 80px rgba(239,68,68,0.08)',
            }}>
            <div className="absolute top-0 left-12 right-12 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.7), transparent)' }} />

            <div className="text-6xl mb-4 select-none">🏛️</div>
            <h1 className="text-2xl font-black text-white font-display mb-2">Πανελλήνιες Simulator</h1>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--fg-2)' }}>
              Ερωτήσεις τύπου Πανελληνίων με χρονομέτρηση, βαθμολόγηση και πλήρεις λύσεις.
              Το μοναδικό AI practice για Γ' Λυκείου.
            </p>

            <div className="flex flex-col gap-2 mb-6 text-sm">
              {['Ερωτήσεις τύπου 2024', 'Χρονόμετρο 3 ωρών', 'Αναλυτικές λύσεις', 'Όλες οι ενότητες'].map(f => (
                <div key={f} className="flex items-center gap-2" style={{ color: 'var(--fg-2)' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <Zap size={9} className="text-red-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1 mb-4 text-sm text-amber-400">
              <Lock size={14} /><span className="font-bold">Απαιτείται Pro</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setUpgradeModal(true)}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}
            >
              <Crown size={15} className="inline mr-2" />
              Αναβάθμιση σε Pro — 2€/μήνα
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: SPRING }}
        className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
          🏛️
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display">Πανελλήνιες Simulator</h1>
          <p className="text-sm" style={{ color: 'var(--fg-2)' }}>Γ' Λυκείου — Μαθηματικά Θετικής Κατεύθυνσης</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* MENU */}
        {mode === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Topics */}
              <div className="lg:col-span-2 space-y-3">
                <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: 'var(--fg-3)' }}>
                  Θεματική Εξάσκηση
                </p>
                {TOPICS.map((topic, i) => (
                  <motion.div key={topic.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, ...SPRING }}>
                    <div
                      className="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                      style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
                      onClick={() => { setSelectedTopic(topic.id); setMode('practice'); loadQuestion(topic.id, topic.difficulty) }}
                      onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${topic.color}35`; e.currentTarget.style.boxShadow = `0 0 16px ${topic.color}10` }}
                      onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-mono text-base font-black shrink-0"
                        style={{ background: `${topic.color}18`, border: `1px solid ${topic.color}30`, color: topic.color }}>
                        {topic.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm mb-1">{topic.label}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-5 h-1 rounded-full"
                              style={{ background: i < topic.difficulty ? topic.color : 'rgba(255,255,255,0.08)' }} />
                          ))}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Full exam card */}
              <div>
                <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: 'var(--fg-3)' }}>
                  Πλήρης Εξέταση
                </p>
                <div className="relative overflow-hidden rounded-2xl p-5"
                  style={{
                    background: 'linear-gradient(160deg, #1a1020, #16161f)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    boxShadow: '0 0 40px rgba(239,68,68,0.05)',
                  }}>
                  <div className="absolute top-0 left-6 right-6 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)' }} />

                  <div className="text-center py-3 mb-4">
                    <div className="text-4xl mb-2 select-none">⏱️</div>
                    <p className="text-white font-bold">Προσομοίωση</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--fg-2)' }}>3 ώρες · Όλες οι ενότητες</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    {['Χρονόμετρο αντίστροφης μέτρησης', 'Ερωτήσεις τύπου Πανελληνίων', 'Πλήρεις λύσεις στο τέλος'].map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--fg-2)' }}>
                        <div className="w-1 h-1 rounded-full bg-red-400 shrink-0" />{f}
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={startExam}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 0 20px rgba(220,38,38,0.3)' }}
                  >
                    <Play size={14} />Έναρξη Εξέτασης
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PRACTICE */}
        {mode === 'practice' && (
          <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setMode('menu')} className="flex items-center gap-2 text-sm cursor-pointer transition-colors"
                style={{ color: 'var(--fg-2)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-2)'}
              >
                <ArrowLeft size={14} />Πίσω
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => loadQuestion(selectedTopic, 4)}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold rounded-xl text-white cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                {loading ? 'Φόρτωση...' : 'Νέα ερώτηση'}
              </motion.button>
            </div>

            {loading && (
              <div className="p-6 rounded-2xl space-y-3" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="shimmer h-4 rounded w-3/4" /><div className="shimmer h-4 rounded w-full" /><div className="shimmer h-4 rounded w-4/5" />
              </div>
            )}

            {question && !loading && (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                      Θέμα {question.marks ? `(${question.marks} μονάδες)` : ''}
                    </span>
                    {question.time_minutes && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--fg-3)' }}>
                        <Timer size={11} />~{question.time_minutes} λεπτά
                      </div>
                    )}
                  </div>

                  <p className="text-white font-medium mb-4 leading-relaxed">{question.question}</p>

                  {question.parts?.length > 0 && (
                    <div className="space-y-2 mb-4 pl-3 border-l-2 border-violet-500/20">
                      {question.parts.map((part, i) => (
                        <div key={i} className="flex gap-2 text-sm" style={{ color: 'var(--fg-2)' }}>
                          <span className="text-violet-400 font-bold shrink-0">{part.split(')')[0]})</span>
                          <span>{part.split(')').slice(1).join(')')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!submitted ? (
                    <div className="space-y-3">
                      <textarea
                        value={answer} onChange={e => setAnswer(e.target.value)}
                        placeholder="Γράψε τη λύση σου..."
                        rows={5}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none transition-colors"
                        style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.08)' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSubmitted(true)} disabled={!answer.trim()}
                        className="w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                        Υποβολή & Έλεγχος
                      </motion.button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p className="text-emerald-300 text-xs font-bold mb-2">Η δική σου λύση:</p>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--fg-2)' }}>{answer}</p>
                    </div>
                  )}
                </div>

                {submitted && question.full_solution && (
                  <div className="p-6 rounded-2xl" style={{ background: '#16161f', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <BookOpen size={15} className="text-violet-400" />Πλήρης Λύση
                    </h3>
                    <AIResponse text={question.full_solution} />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* EXAM */}
        {mode === 'exam' && (
          <motion.div key="exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Timer bar */}
            <div className="relative overflow-hidden flex items-center justify-between p-5 rounded-2xl"
              style={{ background: '#16161f', border: `1px solid ${urgencyColor}30` }}>
              <div className="absolute top-0 left-8 right-8 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${urgencyColor}60, transparent)` }} />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${urgencyColor}15` }}>
                  <Timer size={18} style={{ color: urgencyColor }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--fg-3)' }}>Χρόνος που απομένει</p>
                  <p className="font-mono font-black text-2xl" style={{ color: urgencyColor }}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--fg-3)' }}>Ερώτηση</p>
                <p className="text-xl font-black text-white">{examIndex + 1}<span style={{ color: 'var(--fg-3)' }}>/{examQuestions.length}</span></p>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12" style={{ color: 'var(--fg-2)' }}>
                <div className="text-3xl mb-3">⚙️</div>
                <p className="text-sm">Δημιουργία εξέτασης...</p>
              </div>
            )}

            {examQuestions.length > 0 && !loading && (
              <div className="p-6 rounded-2xl space-y-4" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                  {examQuestions[examIndex]?.topic}
                </span>
                <p className="text-white font-medium leading-relaxed">{examQuestions[examIndex]?.question}</p>
                <textarea
                  value={examAnswers[examIndex] || ''}
                  onChange={e => { const a = [...examAnswers]; a[examIndex] = e.target.value; setExamAnswers(a) }}
                  placeholder="Λύση..."
                  rows={6}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none transition-colors"
                  style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <div className="flex justify-between">
                  <button disabled={examIndex === 0} onClick={() => setExamIndex(p => p - 1)}
                    className="px-4 py-2 text-sm rounded-xl cursor-pointer disabled:opacity-30 transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--fg-2)' }}>
                    ← Πίσω
                  </button>
                  {examIndex < examQuestions.length - 1 ? (
                    <button onClick={() => setExamIndex(p => p + 1)}
                      className="px-4 py-2 text-sm font-bold rounded-xl text-white cursor-pointer"
                      style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Επόμενο →
                    </button>
                  ) : (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { clearInterval(timerRef.current); setMode('results') }}
                      className="px-5 py-2 text-sm font-bold rounded-xl text-white cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      Υποβολή Εξέτασης
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* RESULTS */}
        {mode === 'results' && (
          <motion.div key="results"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: SPRING }}
            className="max-w-md mx-auto text-center space-y-6 py-8">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-6xl select-none">🏆</motion.div>
            <div>
              <h2 className="text-2xl font-black text-white font-display mb-2">Τέλος Εξέτασης!</h2>
              <p className="text-sm" style={{ color: 'var(--fg-2)' }}>Ολοκλήρωσες την προσομοίωση Πανελληνίων</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ερωτήσεις', val: `${examAnswers.filter(Boolean).length}/${examQuestions.length}`, icon: Target },
                { label: 'Χρόνος', val: formatTime(EXAM_DURATION - timeLeft), icon: Timer },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="p-4 rounded-2xl text-center"
                  style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon size={16} className="text-violet-400 mx-auto mb-2" />
                  <p className="text-xs mb-1" style={{ color: 'var(--fg-3)' }}>{label}</p>
                  <p className="text-2xl font-black text-white font-display">{val}</p>
                </div>
              ))}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setMode('menu'); setExamQuestions([]); setExamAnswers([]); setExamIndex(0) }}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 24px rgba(124,58,237,0.3)' }}>
              <RotateCcw size={15} />Νέα Εξέταση
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function extractJSON(text) {
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) } catch { /* */ }
  return { question: text.slice(0, 200), parts: [], full_solution: '', marks: 25, time_minutes: 30 }
}
