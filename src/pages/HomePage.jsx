import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Brain, Camera, Swords, Target, Flame, Crown, Sparkles, ChevronRight, BookOpen, Layers } from 'lucide-react'
import { GRADES } from '../data/curriculum'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import useStore from '../store/useStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { setSelectedGrade, setAuthModal, setUpgradeModal, user, isPro } = useStore()

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade)
    navigate(`/grade/${grade.id}`)
  }

  const scrollToGrades = () => {
    document.getElementById('grade-selector')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <HeroSection user={user} isPro={isPro} setAuthModal={setAuthModal} setUpgradeModal={setUpgradeModal} scrollToGrades={scrollToGrades} />
      <GradeSection grades={GRADES} onSelect={handleGradeSelect} />
      <FeaturesSection />
      <PricingSection isPro={isPro} setUpgradeModal={setUpgradeModal} />
      <Footer />
    </div>
  )
}

function HeroSection({ user, isPro, setAuthModal, setUpgradeModal, scrollToGrades }) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden px-4 py-20">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-1/5 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/2 w-[300px] h-[300px] bg-amber-600/08 rounded-full blur-[110px]" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium mb-8"
          >
            <Zap size={13} className="text-amber-400" />
            AI-Powered · Γυμνάσιο & Λύκειο · Βασισμένο ΥΠΠΕΘ
          </motion.div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-black text-white mb-6 leading-[0.88] tracking-tight">
            Level up<br />
            <span className="text-gradient">τα μαθηματικά</span><br />
            σου.
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Το <strong className="text-violet-400 font-bold">Axi AI</strong> εξηγεί κάθε θέμα με τον τρόπο που εσύ καταλαβαίνεις.
            Exercises, battles, photo solver —{' '}
            <strong className="text-white">όλα στα Ελληνικά.</strong>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Button
              size="xl"
              onClick={() => !user ? setAuthModal(true, 'signup') : scrollToGrades()}
              iconRight={<ArrowRight size={20} />}
              className="glow-purple min-w-[220px]"
            >
              {user ? 'Επέλεξε τάξη' : 'Ξεκίνα δωρεάν'}
            </Button>
            {!isPro && (
              <Button
                variant="secondary"
                size="xl"
                onClick={() => setUpgradeModal(true)}
                icon={<Crown size={18} />}
                className="min-w-[220px]"
              >
                Pro — €2/μήνα
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 sm:gap-14">
            {[
              { value: '6', label: 'Τάξεις', color: '#a855f7' },
              { value: '40+', label: 'Κεφάλαια', color: '#10b981' },
              { value: '∞', label: 'AI Ασκήσεις', color: '#f59e0b' },
              { value: '€2', label: 'Μόνο/μήνα', color: '#ec4899' },
            ].map(({ value, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-black leading-none mb-1" style={{ color }}>{value}</div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function SectionDivider({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2a3a] to-[#2a2a3a]" />
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-[0.15em] uppercase shrink-0">
        <Icon size={13} />
        {label}
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#2a2a3a] to-[#2a2a3a]" />
    </div>
  )
}

function GradeSection({ grades, onSelect }) {
  return (
    <section id="grade-selector" className="px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <SectionDivider icon={Target} label="Επέλεξε τάξη" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.map((grade, i) => (
            <GradeCard key={grade.id} grade={grade} index={i} onClick={() => onSelect(grade)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function GradeCard({ grade, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative group cursor-pointer rounded-2xl overflow-hidden"
    >
      {/* Gradient border wrapper */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${grade.color}40, transparent 60%)` }}
      />
      <div className="absolute inset-[1px] rounded-[15px] bg-[#16161f]" />

      {/* Top color strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: grade.color }} />

      <div className="relative p-5">
        {/* Level label + badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono font-bold tracking-[0.12em] uppercase" style={{ color: `${grade.color}99` }}>
            Lvl {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex gap-1 items-center">
            {grade.isPanellinies && (
              <Badge color="red" size="xs"><Flame size={10} />Πανελλήνιες</Badge>
            )}
            <Badge color="slate" size="xs">{grade.level === 'gymnasio' ? 'Γυμνάσιο' : 'Λύκειο'}</Badge>
          </div>
        </div>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${grade.color}18`, border: `1px solid ${grade.color}35` }}
        >
          {grade.icon}
        </div>

        {/* Content */}
        <h3 className="font-black text-white text-lg mb-1 group-hover:text-violet-100 transition-colors">{grade.label}</h3>
        <p className="text-slate-400 text-xs mb-4 leading-relaxed">{grade.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {grade.chapters.slice(0, 2).map(c => (
              <span key={c.id} className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] text-slate-500">
                {c.emoji} {c.title}
              </span>
            ))}
            {grade.chapters.length > 2 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] text-slate-600">
                +{grade.chapters.length - 2}
              </span>
            )}
          </div>
          <ChevronRight size={16} className="shrink-0 ml-2 transition-all duration-300 group-hover:translate-x-1" style={{ color: grade.color }} />
        </div>
      </div>
    </motion.div>
  )
}

const BENTO_FEATURES = [
  {
    icon: Brain, label: 'Axi AI Εξηγήσεις', color: '#7c3aed', span: 'lg:col-span-2',
    desc: 'Simplicity slider — από «σαν 10χρονο» μέχρι πλήρη ορολογία. Το AI προσαρμόζεται σε σένα.',
    extra: ['Απλά', 'Κανονικά', 'Αναλυτικά', 'Ορολογία'],
  },
  { icon: Target, label: 'Adaptive Exercises', color: '#10b981', desc: '4 επίπεδα δυσκολίας — δεν σε προχωράει πριν κατακτήσεις το τρέχον.' },
  { icon: Zap, label: 'Panic Mode', color: '#ef4444', desc: '5 κρίσιμα, 3 φόρμουλες, 2 λάθη — για λεπτό πριν το τεστ.' },
  { icon: Camera, label: 'Photo Solver', color: '#3b82f6', desc: 'Φωτογράφησε άσκηση, πάρε λύση βήμα-βήμα.' },
  { icon: Swords, label: 'Study Battles', color: '#ec4899', desc: 'Quiz duels με συμμαθητές σε real-time.' },
  { icon: Flame, label: 'Streak System', color: '#f59e0b', desc: 'Καθημερινές προκλήσεις, leaderboard, XP.' },
]

function FeaturesSection() {
  return (
    <section className="px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <SectionDivider icon={Sparkles} label="Features" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENTO_FEATURES.map(({ icon: Icon, label, color, desc, span, extra }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative p-6 bg-[#16161f] rounded-2xl border border-[#2a2a3a] overflow-hidden ${span || ''}`}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at top left, ${color}0c 0%, transparent 65%)` }}
              />
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="font-black text-white text-lg mb-2">{label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                {extra && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {extra.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: `${color}15`, color: `${color}cc`, border: `1px solid ${color}25` }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ isPro, setUpgradeModal }) {
  return (
    <section className="px-4 py-16">
      <div className="max-w-md mx-auto">
        <SectionDivider icon={Crown} label="Pricing" />

        {/* Glow border card */}
        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/40 via-violet-500/10 to-amber-500/20" />
          <div className="relative p-8 bg-[#16161f] rounded-2xl space-y-5">
            <div className="text-center">
              <Badge color="violet" size="md" dot>Pro · Πλήρης πρόσβαση</Badge>
            </div>
            <div className="text-center">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-6xl font-black text-white leading-none">€2</span>
                <span className="text-slate-400 text-lg mb-1">/μήνα</span>
              </div>
              <p className="text-xs text-slate-500">Ακύρωση οποιαδήποτε στιγμή</p>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              {[
                ['Απεριόριστο Axi AI', '#7c3aed'],
                ['Όλα τα επίπεδα ασκήσεων (1-4)', '#10b981'],
                ['Photo Solver', '#3b82f6'],
                ['Study Battles & Leaderboard', '#ec4899'],
                ['Πανελλήνιες Simulator', '#ef4444'],
                ['Adaptive Quiz', '#f59e0b'],
              ].map(([f, c]) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black" style={{ background: `${c}25`, color: c }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {isPro ? (
              <Button variant="secondary" size="lg" className="w-full" disabled icon={<Crown size={16} />}>
                Είσαι ήδη Pro ✓
              </Button>
            ) : (
              <Button variant="gold" size="lg" className="w-full glow-gold" onClick={() => setUpgradeModal(true)} icon={<Crown size={18} />}>
                Αναβάθμιση — €2/μήνα
              </Button>
            )}

            <p className="text-center text-xs text-slate-600">Ασφαλής πληρωμή μέσω Stripe</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#2a2a3a] px-4 py-8 mt-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <img src="/logo.png" alt="MathAxion" className="h-10 w-auto" />
        <p className="text-slate-600 text-sm text-center">Powered by Claude AI · Βασισμένο στα βιβλία ΥΠΠΕΘ</p>
        <p className="text-slate-600 text-xs">© 2026 MathAxion</p>
      </div>
    </footer>
  )
}
