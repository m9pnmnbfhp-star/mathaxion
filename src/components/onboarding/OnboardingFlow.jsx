import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { GRADES, DIMOTIKO_GRADES } from '../../data/curriculum'
import useStore from '../../store/useStore'
import { updateProfile } from '../../lib/supabase'

const ALL_GRADES = [...DIMOTIKO_GRADES, ...GRADES.filter(g => !g.comingSoon)]

const GOALS = [
  { id: 'lesson',     emoji: '📖', label: 'Να καταλάβω το σημερινό μάθημα' },
  { id: 'tests',      emoji: '📝', label: 'Να προετοιμαστώ για διαγωνίσματα' },
  { id: 'panellinies',emoji: '🎓', label: 'Πανελλαδικές' },
  { id: 'grades',     emoji: '💯', label: 'Να βελτιώσω τον βαθμό μου' },
  { id: 'love',       emoji: '❤️', label: 'Μου αρέσουν τα μαθηματικά' },
]

const CONFIDENCE = [
  { id: 'love',     emoji: '😄', label: 'Τα λατρεύω!' },
  { id: 'ok',       emoji: '🙂', label: 'Τα πάω καλά' },
  { id: 'struggle', emoji: '😕', label: 'Δυσκολεύομαι κάποιες φορές' },
  { id: 'hard',     emoji: '😣', label: 'Με δυσκολεύουν πολύ' },
]

const TIMES = [
  { id: '10', label: '10 λεπτά',  desc: 'Σύντομη συνεδρία' },
  { id: '20', label: '20 λεπτά',  desc: 'Ιδανικό ξεκίνημα' },
  { id: '30', label: '30 λεπτά',  desc: 'Πλήρης μελέτη' },
  { id: '45', label: '45+ λεπτά', desc: 'Σοβαρή εξάσκηση' },
]

const FRUSTRATIONS = [
  { id: 'theory',   emoji: '📖', label: 'Δεν καταλαβαίνω τη θεωρία' },
  { id: 'mistakes', emoji: '❌', label: 'Κάνω λάθη από αφηρημάδα' },
  { id: 'forget',   emoji: '🧠', label: 'Ξεχνάω ό,τι έμαθα' },
  { id: 'time',     emoji: '⏱️', label: 'Δεν μου φτάνει ο χρόνος στα τεστ' },
  { id: 'start',    emoji: '🤷', label: 'Δεν ξέρω από πού να αρχίσω' },
]

const SPRING = { type: 'spring', stiffness: 360, damping: 28 }

function slide(dir) {
  return {
    initial:  { x: dir > 0 ? '55%' : '-55%', opacity: 0 },
    animate:  { x: 0, opacity: 1, transition: SPRING },
    exit:     { x: dir > 0 ? '-55%' : '55%', opacity: 0, transition: { duration: 0.22 } },
  }
}

async function fireConfetti() {
  const confetti = (await import('canvas-confetti')).default
  const colors = ['#7c3aed', '#8b5cf6', '#a78bfa', '#10b981', '#f59e0b', '#ec4899']
  confetti({ particleCount: 120, spread: 80,  origin: { y: 0.65 }, colors })
  setTimeout(() => {
    confetti({ particleCount: 70, spread: 110, origin: { y: 0.65, x: 0.25 }, colors })
    confetti({ particleCount: 70, spread: 110, origin: { y: 0.65, x: 0.75 }, colors })
  }, 350)
}

export default function OnboardingFlow() {
  const { user, completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [dir,  setDir]  = useState(1)
  const [ans,  setAns]  = useState({ grade: null, goal: null, confidence: null, time: null, frustration: null })

  const name = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Μαθητή'
  const TOTAL_STEPS = 5 // grade, goal, confidence, time, frustration
  const progress = step === 0 ? 0 : step === 6 ? 100 : ((step - 1) / TOTAL_STEPS) * 100

  const go = (next) => { setDir(next > step ? 1 : -1); setStep(next) }

  const pick = (key, value, nextStep) => {
    setAns(prev => ({ ...prev, [key]: value }))
    setTimeout(() => go(nextStep), 280)
  }

  const pickFrustration = (value) => {
    const final = { ...ans, frustration: value, completedAt: Date.now() }
    setAns(final)
    setDir(1)
    setStep(6)
    fireConfetti()
    // Persist — best effort to Supabase
    if (user?.id) {
      updateProfile(user.id, {
        onboarding: final,
        onboarding_completed: true,
        grade: final.grade,
      }).catch(() => {})
    }
    // Will completeOnboarding when user clicks "Αρχίζουμε"
    // Store the data now so it's ready
    useStore.setState({ onboarding: final })
  }

  const dismiss = () => completeOnboarding(ans)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4"
      style={{ background: '#0a0a0f' }}>

      {/* Progress bar */}
      {step > 0 && step < 6 && (
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full" initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
            style={{ background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' }} />
        </div>
      )}

      <div className="w-full max-w-md overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>

          {step === 0 && (
            <motion.div key="welcome" {...slide(dir)}>
              <WelcomeScreen name={name} onStart={() => go(1)} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="grade" {...slide(dir)}>
              <GradeScreen selected={ans.grade} onBack={() => go(0)}
                onSelect={(v) => pick('grade', v, 2)} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="goal" {...slide(dir)}>
              <ChoiceScreen
                question="🎯 Ποιος είναι ο στόχος σου;" options={GOALS}
                selected={ans.goal} onBack={() => go(1)}
                onSelect={(v) => pick('goal', v, 3)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="confidence" {...slide(dir)}>
              <ChoiceScreen
                question="😊 Πώς νιώθεις για τα Μαθηματικά;" options={CONFIDENCE}
                selected={ans.confidence} onBack={() => go(2)}
                onSelect={(v) => pick('confidence', v, 4)} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="time" {...slide(dir)}>
              <TimeScreen selected={ans.time} onBack={() => go(3)}
                onSelect={(v) => pick('time', v, 5)} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="frustration" {...slide(dir)}>
              <ChoiceScreen
                question="✨ Τι σε δυσκολεύει περισσότερο;" options={FRUSTRATIONS}
                selected={ans.frustration} onBack={() => go(4)}
                onSelect={pickFrustration} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="finish" {...slide(dir)}>
              <FinishScreen name={name} answers={ans} onDone={dismiss} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Step dots */}
      {step > 0 && step < 6 && (
        <div className="absolute bottom-8 flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i < step ? '#7c3aed' : 'rgba(255,255,255,0.15)', transform: i === step - 1 ? 'scale(1.4)' : 'scale(1)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── WELCOME ─────────────────────────────────────────────────────── */
function WelcomeScreen({ name, onStart }) {
  return (
    <div className="text-center px-4">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-7xl mb-6 select-none">
        👋
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...SPRING }}
        className="font-display font-black text-4xl text-white mb-3 leading-tight">
        Καλώς ήρθες στο<br />
        <span className="text-gradient">MathAxion!</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...SPRING }}
        className="text-lg mb-2" style={{ color: 'var(--fg-2)' }}>
        Φτιάχνουμε το δικό σου πρόγραμμα μαθηματικών.
      </motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-sm mb-10" style={{ color: 'var(--fg-3)' }}>
        30 δευτερόλεπτα και είσαι έτοιμος/η.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ...SPRING }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={onStart}
        className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-lg text-white cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
        Ξεκινάμε <ArrowRight size={20} />
      </motion.button>
    </div>
  )
}

/* ─── GRADE ───────────────────────────────────────────────────────── */
function GradeScreen({ selected, onBack, onSelect }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-display font-black text-2xl text-white">📚 Σε ποια τάξη είσαι;</h2>
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

        {/* Δημοτικό group */}
        <p className="text-[10px] font-black tracking-widest uppercase mb-1 px-1" style={{ color: 'var(--fg-3)' }}>Δημοτικό</p>
        {DIMOTIKO_GRADES.map(g => (
          <OptionBtn key={g.id} selected={selected === g.id} onClick={() => onSelect(g.id)}
            left={<span className="text-xl">{g.icon}</span>}
            label={g.label} />
        ))}

        <p className="text-[10px] font-black tracking-widest uppercase mt-3 mb-1 px-1" style={{ color: 'var(--fg-3)' }}>Γυμνάσιο & Λύκειο</p>
        {GRADES.filter(g => !g.comingSoon).map(g => (
          <OptionBtn key={g.id} selected={selected === g.id} onClick={() => onSelect(g.id)}
            left={<span className="text-xl">{g.icon}</span>}
            label={g.label} />
        ))}
      </div>

      <BackBtn onClick={onBack} />
    </div>
  )
}

/* ─── CHOICE ──────────────────────────────────────────────────────── */
function ChoiceScreen({ question, options, selected, onBack, onSelect }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-display font-black text-2xl text-white leading-snug">{question}</h2>
      </div>

      <div className="space-y-2.5">
        {options.map(opt => (
          <OptionBtn key={opt.id} selected={selected === opt.id} onClick={() => onSelect(opt.id)}
            left={<span className="text-2xl">{opt.emoji}</span>}
            label={opt.label} />
        ))}
      </div>

      <BackBtn onClick={onBack} />
    </div>
  )
}

/* ─── TIME ────────────────────────────────────────────────────────── */
function TimeScreen({ selected, onBack, onSelect }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-display font-black text-2xl text-white">⏰ Πόσο χρόνο έχεις για μελέτη;</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--fg-3)' }}>τις περισσότερες μέρες</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TIMES.map(t => (
          <motion.button key={t.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(t.id)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer transition-all"
            style={{
              background: selected === t.id ? 'rgba(124,58,237,0.2)' : '#16161f',
              border: `1.5px solid ${selected === t.id ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
            }}>
            <span className="font-black text-xl text-white font-display">{t.label}</span>
            <span className="text-[11px] mt-1" style={{ color: 'var(--fg-3)' }}>{t.desc}</span>
            {selected === t.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <CheckCircle2 size={16} className="text-violet-400 mt-2" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <BackBtn onClick={onBack} />
    </div>
  )
}

/* ─── FINISH ──────────────────────────────────────────────────────── */
const FRUSTRATION_AI = {
  theory:   '📖 Ο Axi θα σου εξηγεί πάντα βήμα-βήμα',
  mistakes: '🔍 Ο Axi εντοπίζει ακριβώς πού κάνεις λάθος',
  forget:   '🔁 Κάθε session ξεκινά με γρήγορη επανάληψη',
  time:     '⚡ Ο Axi δίνει τις πιο γρήγορες λύσεις',
  start:    '🧭 Ο Axi σου δίνει πάντα το πρώτο βήμα',
}

function FinishScreen({ name, answers, onDone }) {
  const grade = ALL_GRADES.find(g => g.id === answers.grade)

  return (
    <div className="text-center px-2">
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
        className="text-6xl mb-5 select-none">
        🎉
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="font-display font-black text-3xl text-white mb-2">
        Το πρόγραμμά σου είναι έτοιμο!
      </motion.h2>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-base mb-6" style={{ color: 'var(--fg-2)' }}>
        Φτιάξαμε το προσωπικό σου learning plan, {name}.
      </motion.p>

      {/* Plan summary card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="text-left rounded-2xl p-5 mb-6 space-y-3"
        style={{ background: '#16161f', border: '1px solid rgba(124,58,237,0.25)' }}>

        {grade && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{grade.icon}</span>
            <div>
              <p className="text-[11px]" style={{ color: 'var(--fg-3)' }}>Τάξη</p>
              <p className="font-bold text-white text-sm">{grade.label}</p>
            </div>
          </div>
        )}

        {answers.frustration && (
          <div className="flex items-center gap-3 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-lg">🤖</span>
            <p className="text-sm font-medium" style={{ color: '#a78bfa' }}>
              {FRUSTRATION_AI[answers.frustration]}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-lg">⏰</span>
          <div>
            <p className="text-[11px]" style={{ color: 'var(--fg-3)' }}>Στόχος ημέρας</p>
            <p className="font-bold text-white text-sm">{answers.time} λεπτά μελέτης</p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={onDone}
        className="w-full py-4 rounded-2xl font-black text-lg text-white cursor-pointer flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 40px rgba(124,58,237,0.45)' }}>
        Αρχίζουμε <ArrowRight size={20} />
      </motion.button>
    </div>
  )
}

/* ─── SHARED COMPONENTS ──────────────────────────────────────────── */
function OptionBtn({ selected, onClick, left, label }) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left cursor-pointer"
      style={{
        background: selected ? 'rgba(124,58,237,0.18)' : '#16161f',
        border: `1.5px solid ${selected ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
        transition: 'background 0.15s, border-color 0.15s',
      }}>
      {left}
      <span className="flex-1 font-medium text-white text-sm">{label}</span>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
          <CheckCircle2 size={18} className="text-violet-400 shrink-0" />
        </motion.div>
      )}
    </motion.button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="mt-5 text-sm flex items-center gap-1 transition-colors cursor-pointer"
      style={{ color: 'var(--fg-3)' }}
      onMouseEnter={e => e.currentTarget.style.color = 'white'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-3)'}>
      ← Πίσω
    </button>
  )
}
