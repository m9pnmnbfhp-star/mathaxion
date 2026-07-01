import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { GRADES, DIMOTIKO_GRADES } from '../../data/curriculum'
import useStore from '../../store/useStore'
import { updateProfile, signUp, signInWithGoogle } from '../../lib/supabase'
import toast from 'react-hot-toast'

const ALL_GRADES = [...DIMOTIKO_GRADES, ...GRADES.filter(g => !g.comingSoon)]

const GOALS = [
  { id: 'lesson',      emoji: '📖', label: 'Να καταλάβω το σημερινό μάθημα' },
  { id: 'tests',       emoji: '📝', label: 'Να προετοιμαστώ για διαγωνίσματα' },
  { id: 'panellinies', emoji: '🎓', label: 'Πανελλαδικές' },
  { id: 'grades',      emoji: '💯', label: 'Να βελτιώσω τον βαθμό μου' },
  { id: 'love',        emoji: '❤️', label: 'Μου αρέσουν τα μαθηματικά' },
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

const PERSONALITIES = [
  { id: 'funny',        emoji: '😄', label: 'Αστεία',        desc: 'Με χιούμορ και jokes' },
  { id: 'friendly',     emoji: '😊', label: 'Φιλικά',        desc: 'Σαν φίλος που σε βοηθά' },
  { id: 'serious',      emoji: '📚', label: 'Σοβαρά',        desc: 'Straight to the point' },
  { id: 'professional', emoji: '👔', label: 'Επαγγελματικά', desc: 'Σαν καθηγητής' },
  { id: 'motivational', emoji: '🚀', label: 'Με ενθάρρυνση', desc: '"Μπράβο! Τα πας τέλεια!"' },
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

const TOTAL_STEPS = 6
const SIGNUP_STEP  = 7
const FINISH_STEP  = 8

export default function OnboardingFlow({ preAuth = false }) {
  const { user, completeOnboarding, setPreAuthOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [dir,  setDir]  = useState(1)
  const [ans,  setAns]  = useState({ grade: null, goal: null, confidence: null, time: null, frustration: null, personality: null })

  const name = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Μαθητή'
  const progress = step === 0 ? 0 : step >= TOTAL_STEPS + 1 ? 100 : ((step - 1) / TOTAL_STEPS) * 100

  const go = (next) => { setDir(next > step ? 1 : -1); setStep(next) }

  const pick = (key, value, nextStep) => {
    setAns(prev => ({ ...prev, [key]: value }))
    setTimeout(() => go(nextStep), 280)
  }

  const pickPersonality = (value) => {
    const final = { ...ans, personality: value, completedAt: Date.now() }
    setAns(final)
    setDir(1)
    fireConfetti()

    if (preAuth) {
      localStorage.setItem('pendingOnboarding', JSON.stringify(final))
      setStep(SIGNUP_STEP)
    } else {
      setStep(SIGNUP_STEP) // in post-auth mode SIGNUP_STEP renders FinishScreen
      if (user?.id) {
        updateProfile(user.id, {
          onboarding: final,
          onboarding_completed: true,
          grade: final.grade,
        }).catch(() => {})
      }
      useStore.setState({ onboarding: final })
    }
  }

  const onSignupDone = (userData, enrichedAnswers) => {
    if (userData?.id) {
      updateProfile(userData.id, {
        onboarding: enrichedAnswers,
        onboarding_completed: true,
        grade: enrichedAnswers.grade,
      }).catch(() => {})
    }
    useStore.setState({ onboarding: enrichedAnswers, onboardingCompleted: true })
    localStorage.removeItem('pendingOnboarding')
    setPreAuthOnboarding(false)
    setAns(enrichedAnswers)
    go(FINISH_STEP)
  }

  const dismiss = () => {
    completeOnboarding(ans)
    if (preAuth) setPreAuthOnboarding(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4"
      style={{ background: '#0a0a0f' }}>

      {/* Progress bar */}
      {step > 0 && step <= TOTAL_STEPS && (
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
              <WelcomeScreen name={preAuth ? null : name} onStart={() => go(1)} />
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
                onSelect={(v) => pick('frustration', v, 6)} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="personality" {...slide(dir)}>
              <PersonalityScreen selected={ans.personality} onBack={() => go(5)} onSelect={pickPersonality} />
            </motion.div>
          )}

          {/* Step 7: signup (pre-auth) OR finish (post-auth) */}
          {step === SIGNUP_STEP && preAuth && (
            <motion.div key="signup" {...slide(dir)}>
              <SignupScreen answers={ans} onBack={() => go(6)} onDone={onSignupDone} />
            </motion.div>
          )}

          {step === SIGNUP_STEP && !preAuth && (
            <motion.div key="finish-direct" {...slide(dir)}>
              <FinishScreen name={name} answers={ans} onDone={dismiss} />
            </motion.div>
          )}

          {/* Step 8: finish after pre-auth signup */}
          {step === FINISH_STEP && (
            <motion.div key="finish-postauth" {...slide(dir)}>
              <FinishScreen name={ans.signupName || 'Μαθητή'} answers={ans} onDone={dismiss} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Step dots */}
      {step > 0 && step <= TOTAL_STEPS && (
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
        {name ? `Γεια σου, ${name}!` : 'Καλώς ήρθες στο'}<br />
        {name
          ? <span className="text-gradient">Φτιάχνουμε το πρόγραμμά σου.</span>
          : <span className="text-gradient">MathAxion!</span>}
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

/* ─── PERSONALITY ─────────────────────────────────────────────────── */
function PersonalityScreen({ selected, onBack, onSelect }) {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-display font-black text-2xl text-white leading-snug">
          🤖 Πώς θέλεις να σου μιλάει ο Axi;
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--fg-3)' }}>
          Αυτό αλλάζει τα πάντα — εξηγήσεις, ασκήσεις, ειδοποιήσεις
        </p>
      </div>

      <div className="space-y-2.5">
        {PERSONALITIES.map(p => (
          <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(p.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left cursor-pointer"
            style={{
              background: selected === p.id ? 'rgba(124,58,237,0.18)' : '#16161f',
              border: `1.5px solid ${selected === p.id ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
              transition: 'background 0.15s, border-color 0.15s',
            }}>
            <span className="text-2xl">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{p.label}</p>
              <p className="text-[11px]" style={{ color: 'var(--fg-3)' }}>{p.desc}</p>
            </div>
            {selected === p.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                <CheckCircle2 size={18} className="text-violet-400 shrink-0" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <BackBtn onClick={onBack} />
    </div>
  )
}

/* ─── SIGNUP (pre-auth only) ─────────────────────────────────────── */
function SignupScreen({ answers, onBack, onDone }) {
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleEmail = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Τουλάχιστον 6 χαρακτήρες'); return }
    setLoading(true)
    try {
      const { data, error } = await signUp(form.email, form.password, { display_name: form.name })
      if (error) throw error
      const enriched = { ...answers, signupName: form.name }
      onDone(data?.user, enriched)
      toast.success('Καλώς ήρθες! 🎉')
    } catch (err) {
      toast.error(err.message || 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    localStorage.setItem('pendingOnboarding', JSON.stringify(answers))
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      toast.error(err.message || 'Σφάλμα σύνδεσης με Google')
    }
  }

  return (
    <div>
      <div className="text-center mb-7">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-5xl mb-4 select-none">🔐</motion.div>
        <h2 className="font-display font-black text-2xl text-white mb-1">
          Αποθήκευσε το πρόγραμμά σου
        </h2>
        <p className="text-sm" style={{ color: 'var(--fg-3)' }}>
          Δημιούργησε δωρεάν λογαριασμό για να μην χαθεί τίποτα.
        </p>
      </div>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium mb-4 cursor-pointer transition-colors"
        style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--fg-2)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--fg-2)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Συνέχεια με Google
      </motion.button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[11px]" style={{ color: 'var(--fg-3)' }}>ή με email</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <form onSubmit={handleEmail} className="space-y-2.5">
        <InputField icon={User} placeholder="Όνομα" value={form.name}
          onChange={v => setForm({ ...form, name: v })} />
        <InputField icon={Mail} type="email" placeholder="Email" value={form.email}
          onChange={v => setForm({ ...form, email: v })} />
        <InputField icon={Lock} type={showPass ? 'text' : 'password'} placeholder="Κωδικός (6+ χαρακτήρες)"
          value={form.password} onChange={v => setForm({ ...form, password: v })}
          suffix={
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 cursor-pointer">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          } />

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-black text-white cursor-pointer disabled:opacity-60 mt-1"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
          {loading ? 'Δημιουργία...' : 'Δημιουργία λογαριασμού →'}
        </motion.button>
      </form>

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

const PERSONALITY_LABEL = {
  funny:        '😄 Αστεία',
  friendly:     '😊 Φιλικά',
  serious:      '📚 Σοβαρά',
  professional: '👔 Επαγγελματικά',
  motivational: '🚀 Με ενθάρρυνση',
}

// What Axi commits to, built from the student's answers
function buildAxiPromises(answers) {
  const items = []

  const personalityLine = {
    funny:        { emoji: '😄', text: 'Θα μαθαίνουμε μαθηματικά — αλλά θα γελάμε και λίγο.' },
    friendly:     { emoji: '😊', text: 'Θα σου εξηγώ τα πάντα σαν φίλος, ζεστά και απλά.' },
    serious:      { emoji: '📚', text: 'Κατευθείαν στο θέμα, χωρίς χαμένο χρόνο.' },
    professional: { emoji: '👔', text: 'Σωστή ορολογία, δομημένες εξηγήσεις, ακρίβεια.' },
    motivational: { emoji: '🚀', text: 'Κάθε σωστή απάντηση είναι νίκη — θα το ζεις αυτό!' },
  }[answers.personality] || { emoji: '🤝', text: 'Θα συνεργαζόμαστε με τον δικό σου ρυθμό.' }
  items.push(personalityLine)

  if (answers.time) {
    items.push({ emoji: '⏰', text: `Θα μελετάμε περίπου ${answers.time} λεπτά τη μέρα.` })
  }

  const goalLine = {
    grades:      { emoji: '💯', text: 'Θα σε βοηθήσω να βελτιώσεις τους βαθμούς σου.' },
    tests:       { emoji: '📝', text: 'Θα εστιάσουμε στην προετοιμασία για διαγωνίσματα.' },
    panellinies: { emoji: '🎓', text: 'Μαζί θα ετοιμαστούμε για τις Πανελλήνιες.' },
    lesson:      { emoji: '📖', text: 'Θα σε βοηθώ να καταλαβαίνεις κάθε σημερινό μάθημα.' },
    love:        { emoji: '❤️', text: 'Θα κάνουμε τα μαθηματικά ακόμα πιο ενδιαφέροντα.' },
  }[answers.goal]
  if (goalLine) items.push(goalLine)

  const frustLine = {
    theory:   { emoji: '🔎', text: 'Θα εξηγώ κάθε έννοια από την αρχή, βήμα-βήμα.' },
    mistakes: { emoji: '🎯', text: 'Θα δίνουμε extra προσοχή στα επαναλαμβανόμενα λάθη.' },
    forget:   { emoji: '🔁', text: 'Κάθε session ξεκινά με γρήγορη επανάληψη.' },
    time:     { emoji: '⚡', text: 'Θα είμαι συνοπτικός — σεβόμαστε τον χρόνο σου.' },
    start:    { emoji: '🧭', text: 'Θα σου δίνω πάντα το πρώτο βήμα όταν κολλάς.' },
  }[answers.frustration]
  if (frustLine) items.push(frustLine)

  return items
}

function FinishScreen({ name, answers, onDone }) {
  const items = buildAxiPromises(answers)
  // Each item appears after a base delay + stagger
  const BASE = 0.85  // greeting finishes around here
  const STAGGER = 0.28

  return (
    <div className="px-2">

      {/* Axi avatar */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-4xl mb-5 mx-auto select-none"
        style={{ background: 'rgba(124,58,237,0.15)', border: '1.5px solid rgba(124,58,237,0.35)', boxShadow: '0 0 32px rgba(124,58,237,0.25)' }}>
        🤖
      </motion.div>

      {/* Greeting */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45, delay: 0.2 }}
        className="font-display font-black text-2xl text-white mb-1 leading-tight">
        Γεια σου, {name}!<br />
        <span style={{ color: '#a78bfa' }}>Χάρηκα για τη γνωριμία.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm mb-6" style={{ color: 'var(--fg-3)' }}>
        Βάσει αυτά που μου είπες, να τι θα κάνουμε:
      </motion.p>

      {/* Staggered promise cards */}
      <div className="space-y-2 mb-7">
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4, delay: BASE + i * STAGGER }}
            className="flex items-start gap-3 p-3.5 rounded-2xl"
            style={{ background: '#14141e', border: '1px solid rgba(124,58,237,0.15)' }}>
            <span className="text-xl shrink-0 mt-px">{item.emoji}</span>
            <p className="text-sm font-bold text-white leading-snug">{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA — appears after all items */}
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45, delay: BASE + items.length * STAGGER + 0.15 }}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={onDone}
        className="w-full py-4 rounded-2xl font-black text-lg text-white cursor-pointer flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 40px rgba(124,58,237,0.45)' }}>
        Έτοιμος; Αρχίζουμε! <ArrowRight size={20} />
      </motion.button>
    </div>
  )
}

/* ─── SHARED ─────────────────────────────────────────────────────── */
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

function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, suffix }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-colors"
      style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.08)' }}
      onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
      <Icon size={15} style={{ color: 'var(--fg-3)' }} className="shrink-0" />
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required
        className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none" />
      {suffix}
    </div>
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
