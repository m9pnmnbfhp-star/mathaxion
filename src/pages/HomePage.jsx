import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Brain, Camera, Swords, Target, Flame, Star, Crown, BookOpen } from 'lucide-react'
import { GRADES } from '../data/curriculum'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import useStore from '../store/useStore'

const FEATURES = [
  { icon: Brain, label: 'AI Εξηγήσεις', desc: 'Simplicity slider — από «σαν 10χρονο» μέχρι πλήρη ορολογία', color: '#7c3aed' },
  { icon: Target, label: 'Adaptive Exercises', desc: '4 επίπεδα — το AI δεν σε προχωράει πριν κατακτήσεις το τρέχον', color: '#10b981' },
  { icon: Zap, label: 'Panic Mode', desc: '5 κρίσιμα, 3 φόρμουλες, 2 λάθη — για λεπτό πριν το τεστ', color: '#ef4444' },
  { icon: Camera, label: 'Photo Solver', desc: 'Φωτογράφησε άσκηση και πάρε λύση βήμα-βήμα', color: '#3b82f6' },
  { icon: Swords, label: 'Study Battles', desc: 'Quiz duels με συμμαθητές σε real-time', color: '#ec4899' },
  { icon: Flame, label: 'Streak System', desc: 'Καθημερινές προκλήσεις, leaderboard, ανταγωνισμός', color: '#f59e0b' },
]

const STATS = [
  { value: '6', label: 'Τάξεις' },
  { value: '40+', label: 'Κεφάλαια' },
  { value: '∞', label: 'AI Ασκήσεις' },
  { value: '€2', label: 'το μήνα' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { setSelectedGrade, setAuthModal, setUpgradeModal, user } = useStore()

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade)
    navigate(`/grade/${grade.id}`)
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge color="violet" size="md" dot className="mb-6 inline-flex">
              ✨ MathAxiom · AI-Powered · Για Γυμνάσιο & Λύκειο
            </Badge>

            <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-[0.95] tracking-tight">
              Τα μαθηματικά
              <br />
              <span className="text-gradient">επιτέλους</span> εύκολα.
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Το <strong className="text-violet-400">Axi AI</strong> εξηγεί κάθε θέμα με τον τρόπο που εσύ καταλαβαίνεις.
              Adaptive ασκήσεις, photo solver, battles — όλα στα <strong className="text-white">Ελληνικά</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="xl"
                onClick={() => !user ? setAuthModal(true, 'signup') : document.getElementById('grade-selector')?.scrollIntoView({ behavior: 'smooth' })}
                iconRight={<ArrowRight size={20} />}
                className="glow-purple"
              >
                Ξεκίνα δωρεάν
              </Button>
              <Button
                variant="secondary"
                size="xl"
                onClick={() => setUpgradeModal(true)}
                icon={<Crown size={18} />}
              >
                Pro — €2/μήνα
              </Button>
            </div>

            <p className="text-slate-600 text-sm mt-4">Δωρεάν για πάντα · Χωρίς πιστωτική κάρτα</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="text-center p-4 bg-[#16161f] rounded-2xl border border-[#2a2a3a]"
            >
              <div className="text-3xl font-black text-gradient">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Grade Selector */}
      <section id="grade-selector" className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Επέλεξε τάξη</h2>
            <p className="text-slate-400">Από Α\' Γυμνασίου ως Γ\' Λυκείου — βασισμένο στα επίσημα βιβλία του ΥΠΠΕΘ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GRADES.map((grade, i) => (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <GradeCard grade={grade} onClick={() => handleGradeSelect(grade)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-2">Γιατί MathAxiom;</h2>
            <p className="text-slate-400">Δεν είναι άλλη μία πλατφόρμα. Είναι το AI που ήθελες να έχεις δίπλα σου.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-5 bg-[#16161f] rounded-2xl border border-[#2a2a3a] hover:border-[#3a3a50] transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="font-bold text-white mb-1">{label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Τιμολόγηση</h2>
            <p className="text-slate-400">Απλή και δίκαιη</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free */}
            <div className="p-6 bg-[#16161f] rounded-2xl border border-[#2a2a3a] space-y-4">
              <div>
                <div className="text-lg font-bold text-white">Δωρεάν</div>
                <div className="text-4xl font-black text-white mt-1">€0</div>
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                {['Θεωρία & simplicity slider', 'Επίπεδα 1 & 2 ασκήσεων', '3 AI μηνύματα/ημέρα', 'Βασικό progress tracking'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-emerald-400">✓</span>{f}</li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full" onClick={() => setAuthModal(true, 'signup')}>
                Εγγραφή δωρεάν
              </Button>
            </div>

            {/* Pro */}
            <div className="relative p-6 bg-gradient-to-br from-violet-900/30 to-violet-600/10 rounded-2xl border border-violet-500/30 space-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge color="violet" size="md">⭐ Πιο δημοφιλές</Badge>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-white">Pro</div>
                  <Crown size={16} className="text-amber-400" />
                </div>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-4xl font-black text-white">€2</span>
                  <span className="text-slate-400 mb-1">/μήνα</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  'Απεριόριστο Axi AI',
                  'Όλα τα επίπεδα (1-4)',
                  'Photo Solver',
                  'Study Battles & Leaderboard',
                  'Πανελλήνιες Simulator',
                  'Adaptive Quiz',
                ].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-violet-400">✓</span>{f}</li>
                ))}
              </ul>
              <Button variant="gold" className="w-full" onClick={() => setUpgradeModal(true)} icon={<Crown size={16} />}>
                Αναβάθμιση — €2/μήνα
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3a] px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img src="/logo.png" alt="MathAxion" className="h-36 w-auto" />
          </div>
          <p className="text-slate-600 text-sm text-center">
            Powered by Claude AI · Βασισμένο στα βιβλία ΥΠΠΕΘ
          </p>
          <p className="text-slate-600 text-xs">© 2026 MathAxiom</p>
        </div>
      </footer>
    </div>
  )
}

function GradeCard({ grade, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer p-5 bg-[#16161f] rounded-2xl border border-[#2a2a3a] hover:border-[#3a3a50] transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black transition-transform group-hover:scale-110"
          style={{ background: `${grade.color}20`, border: `1px solid ${grade.color}30`, color: grade.color }}
        >
          {grade.icon}
        </div>
        <div className="flex items-center gap-1">
          {grade.isPanellinies && (
            <Badge color="red" size="xs">🔥 Πανελλήνιες</Badge>
          )}
          <Badge color="slate" size="xs">{grade.level === 'gymnasio' ? 'Γυμνάσιο' : 'Λύκειο'}</Badge>
        </div>
      </div>

      <h3 className="font-bold text-white text-lg">{grade.label}</h3>
      <p className="text-slate-400 text-xs mt-1 mb-3">{grade.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs">{grade.chapters.length} κεφάλαια</span>
        <ArrowRight size={16} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
      </div>

      {/* Chapter preview */}
      <div className="flex gap-1 mt-3 flex-wrap">
        {grade.chapters.slice(0, 3).map(c => (
          <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] text-slate-500">
            {c.emoji} {c.title}
          </span>
        ))}
        {grade.chapters.length > 3 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] text-slate-600">
            +{grade.chapters.length - 3}
          </span>
        )}
      </div>
    </motion.div>
  )
}
