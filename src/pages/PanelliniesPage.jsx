import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Trophy, Play, Lock, BookOpen, Target, RotateCcw, ChevronRight } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import AIResponse from '../components/ui/AIResponse'
import useStore from '../store/useStore'
import { generatePanelliniesQuestion } from '../lib/anthropic'
import toast from 'react-hot-toast'

const TOPICS = [
  { id: 'synartiseis', label: 'Συναρτήσεις & Όρια', emoji: 'lim', difficulty: 3 },
  { id: 'paragogos', label: 'Παράγωγος', emoji: 'f\'', difficulty: 4 },
  { id: 'efarmogies', label: 'Εφαρμογές Παράγωγου', emoji: '📉', difficulty: 5 },
  { id: 'oloklirosi', label: 'Ολοκλήρωση', emoji: '∫', difficulty: 5 },
  { id: 'emvada', label: 'Εμβαδά Χωρίων', emoji: '📐', difficulty: 4 },
]

const EXAM_DURATION = 3 * 60 * 60 // 3 hours

export default function PanelliniesPage() {
  const { isPro, setUpgradeModal, user, setAuthModal } = useStore()
  const [mode, setMode] = useState('menu') // menu | practice | exam | results
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

    setLoading(true)
    setQuestion(null)
    setSubmitted(false)
    setAnswer('')
    try {
      const topic = TOPICS.find(t => t.id === topicId)
      const raw = await generatePanelliniesQuestion(topic.label, 2024, difficulty)
      const json = extractJSON(raw)
      setQuestion(json)
    } catch {
      toast.error('Σφάλμα φόρτωσης ερώτησης')
    } finally {
      setLoading(false)
    }
  }

  const startExam = async () => {
    if (!isPro) { setUpgradeModal(true); return }
    setMode('exam')
    setTimeLeft(EXAM_DURATION)
    setExamIndex(0)
    setExamAnswers([])
    setLoading(true)

    try {
      const qs = []
      for (const topic of TOPICS.slice(0, 3)) {
        const raw = await generatePanelliniesQuestion(topic.label, 2024, topic.difficulty)
        qs.push({ topic: topic.label, ...extractJSON(raw) })
      }
      setExamQuestions(qs)
    } catch {
      toast.error('Σφάλμα δημιουργίας εξέτασης')
      setMode('menu')
    } finally {
      setLoading(false)
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setMode('results')
          return 0
        }
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

  if (!isPro) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl"
        >
          🏛️
        </motion.div>
        <h1 className="text-3xl font-black text-white">Πανελλήνιες Simulator</h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Εξασκήσου σε ερωτήσεις τύπου Πανελληνίων Γ\' Λυκείου με χρονομέτρηση και πλήρεις λύσεις.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Lock size={16} className="text-amber-400" />
          <span className="text-amber-400 font-medium">Απαιτείται Pro</span>
        </div>
        <Button variant="gold" size="xl" onClick={() => setUpgradeModal(true)}>
          Αναβάθμιση σε Pro — €2/μήνα
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-2xl">
          🏛️
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Πανελλήνιες Simulator</h1>
          <p className="text-slate-400 text-sm">Γ\' Λυκείου — Μαθηματικά Θετικής Κατεύθυνσης</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Practice mode */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-bold text-white">Θεματική Εξάσκηση</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOPICS.map(topic => (
                    <Card
                      key={topic.id}
                      hover
                      onClick={() => {
                        setSelectedTopic(topic.id)
                        setMode('practice')
                        loadQuestion(topic.id, topic.difficulty)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-lg font-mono text-red-400">
                          {topic.emoji}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{topic.label}</p>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-1 rounded-full ${i < topic.difficulty ? 'bg-red-500' : 'bg-[#2a2a3a]'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-600" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right: Full exam */}
              <div className="space-y-4">
                <h2 className="font-bold text-white">Πλήρης Εξέταση</h2>
                <Card className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-5xl mb-3">⏱️</div>
                    <p className="text-white font-bold">Προσομοίωση Εξετάσεων</p>
                    <p className="text-slate-400 text-sm mt-1">3 ώρες · Θέματα όλων των ενοτήτων</p>
                  </div>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex gap-2"><span className="text-violet-400">•</span>Χρονόμετρο αντίστροφης μέτρησης</div>
                    <div className="flex gap-2"><span className="text-violet-400">•</span>Ερωτήσεις τύπου Πανελληνίων</div>
                    <div className="flex gap-2"><span className="text-violet-400">•</span>Πλήρεις λύσεις στο τέλος</div>
                  </div>
                  <Button variant="danger" className="w-full" onClick={startExam} loading={loading} icon={<Play size={16} />}>
                    Έναρξη Εξέτασης
                  </Button>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'practice' && (
          <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setMode('menu')}>← Πίσω</Button>
              <Button size="sm" onClick={() => loadQuestion(selectedTopic, 4)} loading={loading}>
                Νέα ερώτηση
              </Button>
            </div>

            {loading && (
              <Card>
                <div className="space-y-3">
                  <div className="shimmer h-5 rounded w-3/4" />
                  <div className="shimmer h-5 rounded w-full" />
                  <div className="shimmer h-5 rounded w-4/5" />
                </div>
              </Card>
            )}

            {question && !loading && (
              <div className="space-y-4">
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <Badge color="red" size="sm">Θέμα {question.marks ? `(${question.marks} μονάδες)` : ''}</Badge>
                    {question.time_minutes && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Timer size={12} />
                        <span>~{question.time_minutes} λεπτά</span>
                      </div>
                    )}
                  </div>

                  <p className="text-white font-medium mb-4">{question.question}</p>

                  {question.parts && question.parts.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {question.parts.map((part, i) => (
                        <div key={i} className="flex gap-2 text-slate-300 text-sm">
                          <span className="text-violet-400 font-medium">{part.split(')')[0]})</span>
                          <span>{part.split(')').slice(1).join(')')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!submitted ? (
                    <div className="space-y-3">
                      <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Γράψε τη λύση σου..."
                        rows={5}
                        className="w-full bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50 resize-none"
                      />
                      <Button className="w-full" onClick={() => setSubmitted(true)} disabled={!answer.trim()}>
                        Υποβολή & Έλεγχος
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <p className="text-emerald-300 text-sm font-medium mb-1">Η δική σου λύση:</p>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{answer}</p>
                      </div>
                    </div>
                  )}
                </Card>

                {submitted && question.full_solution && (
                  <Card>
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <BookOpen size={16} className="text-violet-400" />
                      Πλήρης Λύση
                    </h3>
                    <AIResponse text={question.full_solution} />
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        )}

        {mode === 'exam' && (
          <motion.div key="exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Timer */}
            <div className="flex items-center justify-between p-4 bg-red-600/10 border border-red-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <Timer size={20} className="text-red-400" />
                <div>
                  <p className="text-xs text-slate-400">Χρόνος που απομένει</p>
                  <p className="font-mono font-black text-2xl text-red-300">{formatTime(timeLeft)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Ερώτηση</p>
                <p className="text-xl font-bold text-white">{examIndex + 1}/{examQuestions.length}</p>
              </div>
            </div>

            {loading && <p className="text-center text-slate-400">Δημιουργία εξέτασης...</p>}

            {examQuestions.length > 0 && !loading && (
              <Card>
                <Badge color="slate" size="sm" className="mb-3">{examQuestions[examIndex]?.topic}</Badge>
                <p className="text-white font-medium mb-4">{examQuestions[examIndex]?.question}</p>
                <textarea
                  value={examAnswers[examIndex] || ''}
                  onChange={e => {
                    const newAnswers = [...examAnswers]
                    newAnswers[examIndex] = e.target.value
                    setExamAnswers(newAnswers)
                  }}
                  placeholder="Λύση..."
                  rows={6}
                  className="w-full bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none"
                />
                <div className="flex justify-between mt-3">
                  <Button variant="ghost" size="sm" disabled={examIndex === 0} onClick={() => setExamIndex(prev => prev - 1)}>
                    ← Πίσω
                  </Button>
                  {examIndex < examQuestions.length - 1 ? (
                    <Button size="sm" onClick={() => setExamIndex(prev => prev + 1)}>
                      Επόμενο →
                    </Button>
                  ) : (
                    <Button variant="success" size="sm" onClick={() => { clearInterval(timerRef.current); setMode('results') }}>
                      Υποβολή Εξέτασης
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {mode === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
            <div className="text-7xl">🏆</div>
            <h2 className="text-2xl font-black text-white">Τέλος Εξέτασης!</h2>
            <p className="text-slate-400">Ολοκλήρωσες την προσομοίωση Πανελληνίων</p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <Card className="text-center py-4">
                <p className="text-slate-400 text-sm">Ερωτήσεις</p>
                <p className="text-3xl font-black text-white">{examAnswers.filter(Boolean).length}/{examQuestions.length}</p>
              </Card>
              <Card className="text-center py-4">
                <p className="text-slate-400 text-sm">Χρόνος</p>
                <p className="text-3xl font-black text-white">{formatTime(EXAM_DURATION - timeLeft)}</p>
              </Card>
            </div>
            <Button onClick={() => { setMode('menu'); setExamQuestions([]); setExamAnswers([]); setExamIndex(0) }} icon={<RotateCcw size={16} />}>
              Νέα Εξέταση
            </Button>
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
