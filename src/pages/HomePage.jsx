import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, Sparkles, Zap, BookOpen, Pencil, Layers,
  Bot, Camera, Swords, Crown, Flame, Star,
  CheckCircle2, ChevronRight, GraduationCap
} from 'lucide-react'
import { GRADES } from '../data/curriculum'
import useStore from '../store/useStore'

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.55 }
const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { ...SPRING, delay: i * 0.08 } }),
}

function useCounter(target, duration = 1400, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active || target === 0) return
    let cur = 0
    const step = target / (duration / 16)
    const id = setInterval(() => {
      cur = Math.min(cur + step, target)
      setVal(Math.floor(cur))
      if (cur >= target) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [active, target, duration])
  return val
}

/* Floating mathematical notation — the signature element */
const MATH_SYMBOLS = [
  { char: 'π',  x: '7%',  y: '12%', size: 5.5, delay: 0,  dur: 24 },
  { char: 'Σ',  x: '87%', y: '7%',  size: 4.5, delay: 3,  dur: 30 },
  { char: 'Δ',  x: '72%', y: '42%', size: 6,   delay: 7,  dur: 22 },
  { char: '∫',  x: '18%', y: '68%', size: 7,   delay: 1,  dur: 28 },
  { char: '∞',  x: '52%', y: '78%', size: 4,   delay: 5,  dur: 32 },
  { char: '√',  x: '91%', y: '65%', size: 3.5, delay: 9,  dur: 20 },
  { char: 'θ',  x: '33%', y: '18%', size: 5,   delay: 2,  dur: 26 },
  { char: 'φ',  x: '62%', y: '28%', size: 4.5, delay: 6,  dur: 28 },
  { char: '∂',  x: '80%', y: '22%', size: 6,   delay: 11, dur: 18 },
  { char: '≡',  x: '44%', y: '62%', size: 3.5, delay: 8,  dur: 24 },
  { char: 'λ',  x: '26%', y: '84%', size: 5,   delay: 4,  dur: 22 },
  { char: 'α²', x: '12%', y: '40%', size: 3,   delay: 10, dur: 26 },
]

function MathAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {MATH_SYMBOLS.map(({ char, x, y, size, delay, dur }) => (
        <div key={char + x} className="absolute font-display select-none"
          style={{
            left: x, top: y,
            fontSize: `${size}rem`,
            opacity: 0.028,
            color: '#c4b5fd',
            animation: `math-drift ${dur}s ease-in-out ${delay}s infinite`,
            willChange: 'transform',
          }}>
          {char}
        </div>
      ))}
      {/* Residual depth: one soft violet bloom, one emerald */}
      <div className="blob blob-violet" style={{ width: 560, height: 560, top: -160, left: -160, opacity: 0.55 }} />
      <div className="blob blob-emerald" style={{ width: 380, height: 380, bottom: -80, right: -80, opacity: 0.45 }} />
    </div>
  )
}

export default function HomePage() {
  const { user, setAuthModal, setUpgradeModal, isPro } = useStore()
  const navigate = useNavigate()
  return (
    <div className="relative overflow-x-hidden">
      <MathAtmosphere />
      <div className="relative" style={{ zIndex: 1 }}>
        <HeroSection user={user} setAuthModal={setAuthModal} navigate={navigate} />
        <GradesSection user={user} setAuthModal={setAuthModal} navigate={navigate} />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection user={user} setAuthModal={setAuthModal} setUpgradeModal={setUpgradeModal} isPro={isPro} />
        <CtaSection user={user} setAuthModal={setAuthModal} navigate={navigate} />
        <Footer />
      </div>
    </div>
  )
}

/* ─── HERO ────────────────────────────────────────────────────────── */
function HeroSection({ user, setAuthModal, navigate }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const students = useCounter(1400, 1600, inView)
  const chapters = useCounter(44, 1200, inView)

  return (
    <section ref={ref} className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-8 pb-20 text-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

      <motion.div custom={0} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-violet-300 text-sm font-medium backdrop-blur-sm"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          Βασισμένο στα βιβλία του ΥΠΠΕΘ — όχι γενικό AI
        </div>
      </motion.div>

      <motion.h1
        custom={1} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="font-display font-black leading-[0.9] tracking-tight mb-6 max-w-4xl"
        style={{ fontSize: 'clamp(2.8rem, 8.5vw, 6.5rem)' }}
      >
        <span className="text-white">Λιγότερο από</span>
        <br />
        <span className="text-gradient">έναν καφέ.</span>
        <br />
        <span className="text-white">Καλύτερο από φροντιστήριο.</span>
      </motion.h1>

      <motion.p
        custom={2} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg"
        style={{ color: 'var(--fg-2)' }}
      >
        Απαντάει από τα σχολικά σου βιβλία — ακριβώς η ύλη που θέλει ο καθηγητής σου.
      </motion.p>

      <motion.div
        custom={3} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="flex flex-col sm:flex-row items-center gap-3 mb-16"
      >
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => user ? navigate('/grade/a-gymnasiou') : setAuthModal(true, 'signup')}
          className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white overflow-hidden cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 30px rgba(124,58,237,0.4), 0 4px 24px rgba(0,0,0,0.4)' }}
        >
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} />
          <span className="relative">Ξεκίνα δωρεάν</span>
          <ArrowRight size={17} className="relative group-hover:translate-x-0.5 transition-transform duration-200" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-base text-white/60 hover:text-white transition-all cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Δες πώς λειτουργεί
        </motion.button>
      </motion.div>

      {/* Trust differentiators */}
      <motion.div
        custom={3.5} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-12 text-sm"
        style={{ color: 'var(--fg-3)' }}
      >
        {[
          '📚 Ύλη από τα βιβλία ΥΠΠΕΘ',
          '🇬🇷 Στα Ελληνικά πάντα',
          '✅ Χωρίς rate limit',
          '💸 2€/μήνα — όχι 20€',
        ].map(item => (
          <span key={item}>{item}</span>
        ))}
      </motion.div>

      {/* Stats bar */}
      <motion.div
        custom={4} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="flex flex-wrap justify-center items-stretch divide-x rounded-2xl border overflow-hidden backdrop-blur-md"
        style={{ background: 'rgba(16,16,24,0.7)', borderColor: 'rgba(255,255,255,0.07)', divideColor: 'rgba(255,255,255,0.07)' }}
      >
        {[
          { val: `${students.toLocaleString('el')}+`, label: 'Μαθητές',    color: '#7c3aed' },
          { val: '6',               label: 'Τάξεις',       color: '#10b981' },
          { val: `${chapters}+`,    label: 'Κεφάλαια',     color: '#f59e0b' },
          { val: '∞',               label: 'AI Ασκήσεις',  color: '#06b6d4' },
          { val: '2€',              label: 'πλήρης πρόσβαση', color: '#ec4899' },
        ].map(({ val, label, color }, i) => (
          <div key={i} className="flex flex-col items-center px-5 py-4 sm:px-8" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-2xl font-black font-display tabular-nums" style={{ color }}>{val}</span>
            <span className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--fg-2)' }}>{label}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ color: 'var(--fg-3)' }}
      >
        <span className="text-[10px] tracking-widest uppercase font-medium">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  )
}

/* ─── GRADES ──────────────────────────────────────────────────────── */
function GradesSection({ user, setAuthModal, navigate }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="max-w-6xl mx-auto px-4 py-24">
      <motion.div custom={0} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="text-center mb-14">
        <p className="text-sm font-bold tracking-widest text-violet-400 uppercase mb-3">Πρόγραμμα σπουδών</p>
        <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">Διάλεξε την τάξη σου</h2>
        <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--fg-2)' }}>
          Από Α' Γυμνασίου έως Γ' Λυκείου — όλη η ύλη, οργανωμένη και αναλυτική.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GRADES.map((grade, i) => (
          <GradeCard key={grade.id} grade={grade} index={i} inView={inView}
            user={user} setAuthModal={setAuthModal} navigate={navigate} />
        ))}
      </div>
    </section>
  )
}

function GradeCard({ grade, index, inView, user, setAuthModal, navigate }) {
  const [hovered, setHovered] = useState(false)
  const handleClick = () => {
    if (grade.comingSoon) return
    if (!user) { setAuthModal(true, 'signup'); return }
    navigate(`/grade/${grade.id}`)
  }
  return (
    <motion.div custom={index + 1} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
      <motion.div
        whileHover={grade.comingSoon ? {} : { y: -4 }} whileTap={grade.comingSoon ? {} : { scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handleClick}
        className="relative group p-5 rounded-2xl border overflow-hidden h-full"
        style={{
          background: '#16161f',
          borderColor: hovered && !grade.comingSoon ? `${grade.color}35` : 'rgba(255,255,255,0.07)',
          boxShadow: hovered && !grade.comingSoon ? `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${grade.color}18` : 'none',
          cursor: grade.comingSoon ? 'default' : 'pointer',
          opacity: grade.comingSoon ? 0.55 : 1,
          transition: 'border-color 0.22s, box-shadow 0.22s',
        }}
      >
        {/* Top color bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
          style={{ background: grade.color, opacity: hovered ? 1 : 0.35 }} />

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${grade.color}07, transparent 65%)` }} />

        <div className="relative flex items-start gap-4">
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{ background: `${grade.color}12`, border: `1.5px solid ${grade.color}22` }}>
              {grade.icon}
            </div>
            <span className="text-[9px] font-mono font-black tracking-widest" style={{ color: grade.color }}>
              LVL {String(GRADES.indexOf(grade) + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-display font-bold text-white text-lg leading-tight">{grade.label}</h3>
              {grade.comingSoon && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--fg-3)' }}>
                  Coming Soon
                </span>
              )}
              {!grade.comingSoon && grade.isPanellinies && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Flame size={9} />Πανελλήνιες
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--fg-2)' }}>{grade.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--fg-3)' }}>
                {grade.chapters.length} κεφάλαια
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
                style={{ color: hovered ? grade.color : 'var(--fg-3)' }}>
                Πήγαινε <ChevronRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── FEATURES ────────────────────────────────────────────────────── */
const FEATURES = [
  {
    id: 'ai', icon: Bot, color: '#7c3aed', size: 'large',
    title: 'AI Εξήγηση',
    desc: 'Το Axi AI εξηγεί κάθε θέμα στο δικό σου επίπεδο — από «σαν 10χρονο» μέχρι πλήρη ορολογία. Απεριόριστες εξηγήσεις.',
    preview: (
      <div className="mt-4 space-y-2 text-left">
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Bot size={11} className="text-violet-400" />
          </div>
          <div className="px-3 py-2 rounded-xl rounded-tl-sm text-xs text-slate-300 leading-relaxed max-w-xs" style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)' }}>
            Η παράγωγος <span className="text-violet-300 font-medium">f'(x) = 2x</span> δείχνει τον ρυθμό αλλαγής. Φαντάσου ότι οδηγάς και μετράς επιτάχυνση...
          </div>
        </div>
        <div className="flex justify-end">
          <div className="px-3 py-2 rounded-xl rounded-tr-sm text-xs text-violet-200" style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.2)' }}>
            Εξήγησε με παράδειγμα
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Bot size={11} className="text-violet-400" />
          </div>
          <div className="px-3 py-2 rounded-xl rounded-tl-sm text-xs text-slate-300" style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)' }}>
            Αν <span className="text-emerald-400">x = ταχύτητα</span>, τότε <span className="text-violet-300">f'(x)</span> = επιτάχυνση!
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'exercises', icon: Pencil, color: '#10b981', size: 'small',
    title: 'Ασκήσεις AI',
    desc: 'Απεριόριστες ασκήσεις παραγόμενες από AI, με step-by-step λύσεις και βαθμολόγηση.',
    preview: (
      <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-slate-500 mb-2">Λύσε:</p>
        <p className="text-white font-mono text-sm mb-2">3x² − 12 = 0</p>
        <div className="flex gap-1 flex-wrap">
          {['x = ±2', 'x = 4', 'x = ±4', 'x = 2'].map((opt, i) => (
            <span key={i} className="px-2 py-1 rounded-lg text-[10px] font-medium"
              style={i === 0
                ? { border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#10b981' }
                : { border: '1px solid rgba(255,255,255,0.07)', color: '#4a5568' }}>
              {opt}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'flashcards', icon: Layers, color: '#3b82f6', size: 'small',
    title: 'Flashcards',
    desc: 'Spaced repetition — θυμάσαι περισσότερα σε λιγότερο χρόνο.',
    preview: (
      <div className="mt-3 relative h-16">
        <div className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{ transform: 'rotate(-2.5deg)', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <span className="text-xs text-blue-400 font-medium">Πυθαγόρειο Θεώρημα</span>
        </div>
        <div className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.09)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <span className="text-sm font-mono text-blue-300 font-bold">a² + b² = c²</span>
        </div>
      </div>
    ),
  },
  {
    id: 'battle', icon: Swords, color: '#ec4899', size: 'small',
    title: 'Study Battle',
    desc: 'Πρόκλεσε συμμαθητές σε real-time μαθηματικό 1v1.',
    preview: (
      <div className="mt-3 flex items-center justify-between p-3 rounded-xl" style={{ background: '#1c1c28', border: '1px solid rgba(236,72,153,0.12)' }}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.25)' }}>🎯</div>
          <span className="text-[10px] text-slate-500">Εσύ</span>
          <span className="text-sm font-black text-white">850</span>
        </div>
        <div className="flex flex-col items-center">
          <Swords size={14} className="text-pink-400" />
          <span className="text-[9px] text-pink-400 font-bold mt-0.5">VS</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.25)' }}>⚡</div>
          <span className="text-[10px] text-slate-500">Αντίπαλος</span>
          <span className="text-sm font-black text-white">720</span>
        </div>
      </div>
    ),
  },
  {
    id: 'photo', icon: Camera, color: '#06b6d4', size: 'small',
    title: 'Photo Solver',
    desc: 'Φωτογράφισε άσκηση και λάβε αναλυτική λύση σε δευτερόλεπτα.',
    preview: (
      <div className="mt-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: '#1c1c28', border: '1px solid rgba(6,182,212,0.12)' }}>
        <Camera size={16} className="text-cyan-400 shrink-0" />
        <div className="flex-1">
          <div className="h-1.5 rounded-full mb-1.5" style={{ background: 'rgba(6,182,212,0.3)' }} />
          <div className="h-1.5 rounded-full w-2/3" style={{ background: 'rgba(6,182,212,0.15)' }} />
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">Ανάλυση...</span>
      </div>
    ),
  },
  {
    id: 'panic', icon: Zap, color: '#ef4444', size: 'small',
    title: 'Panic Mode',
    desc: 'Εξεταστική αύριο; Τα 5 πιο κρίσιμα σημεία, σε 10 λεπτά.',
    preview: (
      <div className="mt-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: '#1c1c28', border: '1px solid rgba(239,68,68,0.12)' }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.2)' }}>
          <Zap size={11} className="text-red-400" />
        </div>
        <div>
          <p className="text-[10px] text-red-300 font-bold">PANIC MODE</p>
          <p className="text-[9px] text-slate-600">5 πιθανά θέματα εξετάσεων</p>
        </div>
      </div>
    ),
  },
]

function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const large = FEATURES.find(f => f.size === 'large')
  const small = FEATURES.filter(f => f.size === 'small')

  return (
    <section id="features" ref={ref} className="max-w-6xl mx-auto px-4 py-24">
      <motion.div custom={0} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="text-center mb-14">
        <p className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-3">Λειτουργίες</p>
        <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">Ό,τι χρειάζεσαι σε ένα μέρος</h2>
        <p className="text-lg max-w-md mx-auto" style={{ color: 'var(--fg-2)' }}>
          Μελέτη, εξάσκηση, επανάληψη — όλα powered by AI.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div className="lg:col-span-2" custom={1} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <FeatureCard feature={large} />
        </motion.div>
        {small.map((f, i) => (
          <motion.div key={f.id} custom={i + 2} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <FeatureCard feature={f} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ feature: f }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group p-5 rounded-2xl border overflow-hidden h-full"
      style={{
        background: '#16161f',
        borderColor: hovered ? `${f.color}30` : 'rgba(255,255,255,0.07)',
        boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${f.color}15` : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${f.color}07, transparent 60%)` }} />
      <div className="relative">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
          style={{ background: `${f.color}14`, border: `1px solid ${f.color}22` }}>
          <f.icon size={18} style={{ color: f.color }} />
        </div>
        <h3 className="font-display font-bold text-white text-lg mb-1.5">{f.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{f.desc}</p>
        {f.preview}
      </div>
    </motion.div>
  )
}

/* ─── TESTIMONIALS ────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Αλέξανδρος Π.', grade: 'Γ\' Λυκείου', avatar: 'Α', color: '#7c3aed',
    text: 'Πέρυσι κόπηκα στα Μαθηματικά. Φέτος με το MathAxion πήρα 18.5. Το AI εξηγεί με τρόπο που καταλαβαίνω απόλυτα.',
    stars: 5,
  },
  {
    name: 'Μαρία Κ.', grade: 'Β\' Γυμνασίου', avatar: 'Μ', color: '#10b981',
    text: 'Τα Study Battles με κάνουν να θέλω να μελετάω κάθε μέρα! Είναι σαν παιχνίδι αλλά μαθαίνεις πραγματικά.',
    stars: 5,
  },
  {
    name: 'Δημήτρης Σ.', grade: 'Α\' Λυκείου', avatar: 'Δ', color: '#f59e0b',
    text: 'Ο Photo Solver είναι απίστευτος — φωτογραφίζω την άσκηση από το βιβλίο και παίρνω αναλυτική λύση.',
    stars: 5,
  },
]

function TestimonialsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section ref={ref} className="max-w-6xl mx-auto px-4 py-20">
      <motion.div custom={0} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="text-center mb-12">
        <p className="text-sm font-bold tracking-widest text-amber-400 uppercase mb-3">Τι λένε οι μαθητές</p>
        <h2 className="font-display font-black text-4xl sm:text-5xl text-white">Αληθινά αποτελέσματα</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i} custom={i + 1} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <div className="p-5 rounded-2xl border border-white/[0.07] h-full" style={{ background: '#16161f' }}>
              <div className="flex gap-0.5 mb-3">
                {Array(t.stars).fill(0).map((_, s) => <Star key={s} size={12} fill="#f59e0b" stroke="none" />)}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--fg-2)' }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: `${t.color}15`, color: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--fg-3)' }}>{t.grade}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─── PRICING ─────────────────────────────────────────────────────── */
const PRO_FEATURES = [
  { icon: Bot,    color: '#7c3aed', label: 'Θεωρία AI Απεριόριστη' },
  { icon: Pencil, color: '#10b981', label: 'Ασκήσεις AI Απεριόριστες' },
  { icon: Layers, color: '#3b82f6', label: 'Flashcards' },
  { icon: Bot,    color: '#8b5cf6', label: 'Axi AI Tutor' },
  { icon: Swords, color: '#ec4899', label: 'Study Battles 1v1' },
  { icon: Camera, color: '#06b6d4', label: 'Photo Solver' },
  { icon: Zap,    color: '#ef4444', label: 'Panic Mode' },
  { icon: Star,   color: '#f59e0b', label: 'Adaptive Quiz' },
  { icon: Crown,  color: '#fbbf24', label: 'Leaderboard & XP' },
]

function PricingSection({ user, setAuthModal, setUpgradeModal, isPro }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section ref={ref} className="max-w-2xl mx-auto px-4 py-24">
      <motion.div custom={0} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="text-center mb-12">
        <p className="text-sm font-bold tracking-widest text-pink-400 uppercase mb-3">Τιμολόγηση</p>
        <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">Ένα πλάνο. Τα πάντα.</h2>
        <p className="text-lg max-w-sm mx-auto" style={{ color: 'var(--fg-2)' }}>Πλήρης πρόσβαση σε όλες τις λειτουργίες για μόλις 2€ τον μήνα.</p>
      </motion.div>

      <motion.div custom={1} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1e1530 0%, #16161f 40%, #0f1620 100%)',
            border: '1px solid rgba(124,58,237,0.35)',
            boxShadow: '0 0 80px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.08)',
          }}>

          {/* Top glow line */}
          <div className="absolute top-0 left-12 right-12 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.9), rgba(139,92,246,0.6), transparent)' }} />

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

          <div className="relative p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-violet-400 uppercase tracking-widest mb-3">
                  <Crown size={12} className="text-amber-400" />
                  MathAxion Pro
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-7xl font-black font-display text-white leading-none">2€</span>
                  <div className="mb-2">
                    <p className="text-base" style={{ color: 'var(--fg-2)' }}>/μήνα</p>
                    <p className="text-xs text-violet-400">Ακύρωση ανά πάσα στιγμή</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Star size={11} fill="#fbbf24" stroke="none" />
                  ΠΛΗΡΗΣ ΠΡΟΣΒΑΣΗ
                </span>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
              {PRO_FEATURES.map(({ icon: Icon, color, label }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => user ? setUpgradeModal(true) : setAuthModal(true, 'signup')}
              className="w-full py-4 rounded-2xl font-black text-base text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 30px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.4)' }}
            >
              {isPro ? '✓ Ήδη Pro — Ευχαριστούμε!' : 'Αποκτήσε πλήρη πρόσβαση — 2€/μήνα'}
            </motion.button>

            <p className="text-center text-xs mt-3" style={{ color: 'var(--fg-3)' }}>
              Ακύρωση οποιαδήποτε στιγμή · Χωρίς δεσμεύσεις
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ─── CTA ─────────────────────────────────────────────────────────── */
function CtaSection({ user, setAuthModal, navigate }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section ref={ref} className="max-w-6xl mx-auto px-4 pb-24">
      <motion.div
        custom={0} variants={FADE_UP} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.14) 0%, #16161f 50%, rgba(16,185,129,0.07) 100%)',
          border: '1px solid rgba(124,58,237,0.22)',
          boxShadow: '0 0 80px rgba(124,58,237,0.07)',
        }}
      >
        <div className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.7), transparent)' }} />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <GraduationCap size={28} className="text-violet-400" />
        </div>
        <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
          Έτοιμος να ξεκινήσεις;
        </h2>
        <p className="text-lg mb-8 max-w-sm mx-auto" style={{ color: 'var(--fg-2)' }}>
          Εγγραφή δωρεάν. Χωρίς πιστωτική κάρτα.
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => user ? navigate('/grade/a-gymnasiou') : setAuthModal(true, 'signup')}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white text-lg cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 4px 24px rgba(0,0,0,0.4)' }}
        >
          <Sparkles size={20} />
          Ξεκίνα τώρα — δωρεάν
        </motion.button>
      </motion.div>
    </section>
  )
}

/* ─── FOOTER ──────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="px-4 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <img src="/logo.png" alt="MathAxion" className="h-8 w-auto" />
        <p className="text-sm" style={{ color: 'var(--fg-3)' }}>
          © {new Date().getFullYear()} MathAxion · Μαθηματικά για όλους
        </p>
        <div className="flex items-center gap-5 text-sm" style={{ color: 'var(--fg-3)' }}>
          <Link to="/panellinies" className="hover:text-white transition-colors">Πανελλήνιες</Link>
          <a href="mailto:support@mathaxion.com" className="hover:text-white transition-colors">Επικοινωνία</a>
        </div>
      </div>
    </footer>
  )
}
