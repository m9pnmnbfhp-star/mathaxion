import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb, RefreshCw, Lock } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import AIResponse from '../ui/AIResponse'
import { LEVEL_DESCRIPTIONS } from '../../data/curriculum'
import { generateExercise, explainWrongAnswer, generateSimilarExercises } from '../../lib/anthropic'
import { correctMessage, levelUpMessage, streakMessage, proximityMessage } from '../../lib/personalizedMessages'
import { showXPFloat } from '../../lib/xpFloat'
import { flashCorrect, flashWrong, levelUpBurst, streakMilestoneBurst } from '../../lib/gsapAnimations'
import { EGG, getRandom } from '../../lib/easterEggs'
import AxiLoading, { LOADING_MSGS } from '../ui/AxiLoading'
import confetti from 'canvas-confetti'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

const XP_PER_CORRECT = { 1: 10, 2: 20, 3: 35, 4: 60 }
const REQUIRED_CORRECT_TO_ADVANCE = 3

const CONFIDENCE_START_LEVEL = { love: 3, ok: 2, struggle: 1, hard: 1 }

export default function ExerciseSystem({ grade, chapter, topic, onXPGained, onChapterComplete }) {
  const { isPro, addXP, setUpgradeModal, addWrongAnswer, onboarding, updateChapterProgress, getChapterProgress, addMilestone, recordQuestion } = useStore()
  const startLevel = CONFIDENCE_START_LEVEL[onboarding?.confidence] ?? 1
  const [currentLevel, setCurrentLevel] = useState(startLevel)
  const [exercise, setExercise] = useState(null)
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [explanationLoading, setExplanationLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [hadWrong, setHadWrong] = useState(false)
  const [usedExercises, setUsedExercises] = useState([])
  const [similarExercises, setSimilarExercises] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)
  const resultRef = useRef(null)
  const submitBtnRef = useRef(null)
  const cardRef = useRef(null)

  // Shake + red flash on wrong answer
  useEffect(() => {
    if (submitted && isCorrect === false && resultRef.current) {
      const el = resultRef.current
      el.classList.remove('is-shaking')
      void el.offsetWidth
      el.classList.add('is-shaking')
      flashWrong(cardRef.current)
      const t = setTimeout(() => el.classList.remove('is-shaking'), 300)
      return () => clearTimeout(t)
    }
  }, [submitted, isCorrect])

  const loadExercise = useCallback(async (level = currentLevel) => {
    if (!isPro) {
      setUpgradeModal(true)
      return
    }
    setLoading(true)
    setSubmitted(false)
    setIsCorrect(null)
    setAnswer('')
    setShowHint(false)
    setShowSolution(false)
    setExplanation('')
    setSimilarExercises([])

    try {
      const raw = await generateExercise(topic, chapter.title, grade, level, usedExercises)
      const json = extractJSON(raw)
      setExercise(json)
      setUsedExercises(prev => [...prev, json.question].slice(-10))
    } catch {
      toast.error('Σφάλμα φόρτωσης άσκησης')
    } finally {
      setLoading(false)
    }
  }, [currentLevel, topic, chapter, grade, usedExercises, isPro, setUpgradeModal])

  const handleSubmit = async () => {
    if (!answer.trim() || !exercise) return
    setSubmitted(true)

    const correct = checkAnswer(answer, exercise.answer)
    setIsCorrect(correct)
    recordQuestion(correct)

    if (correct) {
      const xp = XP_PER_CORRECT[currentLevel]
      addXP(xp)
      onXPGained?.(xp)
      flashCorrect(cardRef.current)
      if (submitBtnRef.current) {
        const r = submitBtnRef.current.getBoundingClientRect()
        showXPFloat(r.left + r.width / 2, r.top - 8, xp)
      }
      const newStreak = correctStreak + 1
      setCorrectStreak(newStreak)
      setTotalCorrect(prev => prev + 1)
      setWrongCount(0)

      // Track chapter progress persistently
      const prev = getChapterProgress(grade?.id, chapter?.id)
      const prevCount = prev.completedExercises || 0
      const newCount = prevCount + 1
      updateChapterProgress(grade?.id, chapter?.id, { completedExercises: newCount })

      // Chapter mastered threshold
      if (prevCount < 8 && newCount >= 8) {
        addMilestone({
          type: 'chapter_complete',
          key: `chapter-${grade?.id}-${chapter?.id}`,
          title: `Ολοκλήρωσες "${chapter?.title}"`,
          emoji: chapter?.emoji || '📚',
          desc: grade?.label || '',
          gradeId: grade?.id,
          chapterId: chapter?.id,
        })

        // Perfect score Easter egg — no wrong answers in this session
        if (!hadWrong) {
          setTimeout(() => {
            confetti({ particleCount: 220, spread: 120, origin: { y: 0.5 }, colors: ['#7c3aed','#a78bfa','#10b981','#fbbf24','#ef4444'] })
            const msg = getRandom(EGG.perfectScore)
            toast.custom(() => (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-xs"
                style={{ background: '#16161f', border: '1.5px solid rgba(124,58,237,0.5)', boxShadow: '0 0 32px rgba(124,58,237,0.35)' }}
              >
                <span className="text-2xl shrink-0">🤖</span>
                <div>
                  <p className="text-[11px] font-black text-violet-400 mb-1 uppercase tracking-wider">Axi</p>
                  <p className="text-sm text-white leading-snug">{msg}</p>
                </div>
              </motion.div>
            ), { duration: 7000 })
          }, 600)
        }

        setTimeout(() => onChapterComplete?.({ xpEarned: xp, level: currentLevel }), 700)
      }

      // Proximity toast: 1-2 exercises left
      const remaining = 8 - newCount
      if (remaining === 1 || remaining === 2) {
        setTimeout(() => toast(proximityMessage(remaining), { icon: remaining === 1 ? '👏' : '💪' }), 500)
      }

      if (newStreak % 5 === 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
        streakMilestoneBurst(newStreak)
      }

      if (totalCorrect + 1 >= REQUIRED_CORRECT_TO_ADVANCE && currentLevel < 4) {
        setTimeout(() => {
          levelUpBurst(currentLevel + 1)
          setCurrentLevel(prev => prev + 1)
          setCorrectStreak(0)
          setTotalCorrect(0)
        }, 900)
      }
    } else {
      setCorrectStreak(0)
      setWrongCount(prev => prev + 1)
      setHadWrong(true)

      addWrongAnswer({
        gradeId: grade?.id,
        chapterId: chapter?.id,
        concept: topic,
        question: exercise.question,
        myAnswer: answer,
        correctAnswer: exercise.answer,
        timestamp: Date.now(),
      })

      setExplanationLoading(true)
      try {
        const exp = await explainWrongAnswer(exercise.question, answer, exercise.answer)
        setExplanation(exp)
      } catch { /* silent */ } finally {
        setExplanationLoading(false)
      }

      if (wrongCount >= 1) {
        try {
          const raw = await generateSimilarExercises(exercise.question, topic, grade, 3)
          const arr = extractJSONArray(raw)
          setSimilarExercises(arr)
        } catch { /* silent */ }
      }
    }
  }

  const levelInfo = LEVEL_DESCRIPTIONS[currentLevel]

  return (
    <div className="space-y-4">
      {/* Level selector */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((level) => {
          const info = LEVEL_DESCRIPTIONS[level]
          const locked = !isPro
          const active = currentLevel === level
          return (
            <motion.button
              key={level}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (locked) { setUpgradeModal(true); return }
                setCurrentLevel(level)
                setExercise(null)
                setSubmitted(false)
                setTotalCorrect(0)
                setCorrectStreak(0)
              }}
              className={`relative p-2 rounded-xl border text-center transition-all ${
                active
                  ? 'border-violet-500/60 bg-violet-600/15'
                  : 'border-[#2a2a3a] hover:border-[#3a3a50] bg-[#16161f]'
              } ${locked ? 'opacity-60' : ''}`}
            >
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                  <Lock size={14} className="text-amber-400" />
                </div>
              )}
              <div className="text-lg">{info.icon}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{info.sub}</div>
            </motion.button>
          )
        })}
      </div>

      {/* Progress to next level */}
      {currentLevel < 4 && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex gap-1">
            {Array.from({ length: REQUIRED_CORRECT_TO_ADVANCE }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < totalCorrect ? 'bg-emerald-400' : 'bg-[#2a2a3a]'
                }`}
              />
            ))}
          </div>
          <span>{totalCorrect}/{REQUIRED_CORRECT_TO_ADVANCE} για επόμενο επίπεδο</span>
        </div>
      )}

      {/* Exercise card */}
      <AnimatePresence mode="wait">
        {!exercise && !loading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <div className="text-5xl">{levelInfo.icon}</div>
            <p className="text-slate-400 text-sm text-center">
              Εξάσκηση στο <strong className="text-white">{topic}</strong>
              <br />
              <span style={{ color: levelInfo.color }}>{levelInfo.sub}</span>
            </p>
            <Button onClick={() => loadExercise(currentLevel)} size="lg">
              Ξεκίνα άσκηση
            </Button>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" className="py-8">
            <Card>
              <div className="space-y-3">
                <AxiLoading messages={LOADING_MSGS.exercise} />
                <div className="shimmer h-5 rounded w-full" />
                <div className="shimmer h-5 rounded w-4/5" />
                <div className="shimmer h-10 rounded w-full mt-4" />
              </div>
            </Card>
          </motion.div>
        )}

        {exercise && !loading && (
          <motion.div
            key={exercise.question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div ref={cardRef}><Card>
              <div className="space-y-4">
                {/* Question */}
                <div>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold"
                      style={{ background: `${levelInfo.color}20`, color: levelInfo.color }}
                    >
                      ?
                    </div>
                    <p className="text-white font-medium leading-relaxed">{exercise.question}</p>
                  </div>
                </div>

                {/* Hint */}
                {exercise.hint && !submitted && (
                  <AnimatePresence>
                    {showHint ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200"
                      >
                        <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <span>{exercise.hint}</span>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowHint(true)}
                        className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
                      >
                        💡 Εμφάνιση υπόδειξης
                      </button>
                    )}
                  </AnimatePresence>
                )}

                {/* Answer input */}
                {!submitted && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Η απάντησή σου..."
                      className="flex-1 bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50 transition-colors"
                    />
                    <div ref={submitBtnRef}>
                      <Button onClick={handleSubmit} disabled={!answer.trim()}>
                        Έλεγχος
                      </Button>
                    </div>
                  </div>
                )}

                {/* Result */}
                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      ref={resultRef}
                      initial={{ opacity: 0, y: 14, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                      className={`t-shake result-pop rounded-2xl border overflow-hidden ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      {/* Top accent bar */}
                      <div className="h-1 w-full" style={{ background: isCorrect ? '#10b981' : '#ef4444' }} />
                      <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {isCorrect ? (
                          <>
                            <span className="t-success-wrap correct-text-bounce" data-state="in">
                              <CheckCircle size={22} className="text-emerald-400" />
                            </span>
                            <div>
                              <p className="font-black text-emerald-300 text-base leading-tight correct-text-bounce">{correctMessage(XP_PER_CORRECT[currentLevel])}</p>
                              <span className="xp-earned-badge mt-0.5">+{XP_PER_CORRECT[currentLevel]} XP</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle size={22} className="text-red-400 shrink-0" />
                            <div>
                              <p className="font-black text-red-300 text-base leading-tight">Λάθος!</p>
                              <p className="text-sm text-slate-400">Σωστό: <strong className="text-white">{exercise.answer}</strong></p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Show solution steps */}
                      {exercise.solution_steps && (
                        <button
                          onClick={() => setShowSolution(!showSolution)}
                          className="text-xs text-violet-400 hover:text-violet-300 mt-1"
                        >
                          {showSolution ? 'Κρύψε' : 'Δείξε'} πλήρη λύση
                        </button>
                      )}
                      <AnimatePresence>
                        {showSolution && exercise.solution_steps && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-3 space-y-1"
                          >
                            {exercise.solution_steps.map((step, i) => (
                              <div key={i} className="flex gap-2 text-sm text-slate-300">
                                <span className="text-violet-400 font-mono shrink-0">{i + 1}.</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI explanation for wrong answer */}
                {submitted && !isCorrect && (
                  <AIResponse text={explanation} loading={explanationLoading} loadingContext="explanation" />
                )}

                {/* Similar exercises after wrong */}
                {similarExercises.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Παρόμοιες ασκήσεις για εξάσκηση:</p>
                    {similarExercises.map((ex, i) => (
                      <SimilarExercise key={i} exercise={ex} index={i} />
                    ))}
                  </div>
                )}

                {/* Next exercise button */}
                {submitted && (
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      onClick={() => loadExercise(currentLevel)}
                      icon={<RefreshCw size={14} />}
                    >
                      Επόμενη άσκηση
                    </Button>
                  </div>
                )}
              </div>
            </Card></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SimilarExercise({ exercise, index }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-3 bg-[#1c1c28] rounded-xl border border-[#2a2a3a] space-y-2"
    >
      <p className="text-sm text-slate-300">{exercise.question}</p>
      {!submitted ? (
        <div className="flex gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && answer.trim()) {
                setIsCorrect(checkAnswer(answer, exercise.answer))
                setSubmitted(true)
              }
            }}
            placeholder="Απάντηση..."
            className="flex-1 bg-[#16161f] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 outline-none"
          />
          <button
            onClick={() => {
              if (answer.trim()) {
                setIsCorrect(checkAnswer(answer, exercise.answer))
                setSubmitted(true)
              }
            }}
            className="px-3 py-1.5 bg-violet-600/50 hover:bg-violet-600/70 rounded-lg text-xs text-white transition-colors"
          >
            ✓
          </button>
        </div>
      ) : (
        <div className={`flex items-center gap-2 text-xs ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{isCorrect ? 'Σωστό!' : `Σωστό: ${exercise.answer}`}</span>
        </div>
      )}
    </motion.div>
  )
}

function checkAnswer(userAnswer, correctAnswer) {
  const normalize = (s) => s.toString().toLowerCase()
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/[()]/g, '')
    .trim()

  const u = normalize(userAnswer)
  const c = normalize(correctAnswer)

  if (u === c) return true
  const uNum = parseFloat(u.replace(',', '.'))
  const cNum = parseFloat(c.replace(',', '.'))
  if (!isNaN(uNum) && !isNaN(cNum)) return Math.abs(uNum - cNum) < 0.001
  return false
}

function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch { /* fall through */ }
  return {
    question: text.slice(0, 200),
    answer: 'Δες την εξήγηση',
    hint: '',
    solution_steps: [],
    difficulty: 1,
  }
}

function extractJSONArray(text) {
  try {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch { /* fall through */ }
  return []
}
