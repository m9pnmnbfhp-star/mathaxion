import { motion } from 'framer-motion'
import { Check, Crown, Zap, Camera, Swords, Trophy, BookOpen, Star } from 'lucide-react'
import Modal from '../ui/Modal'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PRO_FEATURES = [
  { icon: Zap,      color: '#8b5cf6', text: 'Axi AI Tutor — Απεριόριστο' },
  { icon: BookOpen, color: '#3b82f6', text: 'Ασκήσεις AI όλων των επιπέδων' },
  { icon: Camera,   color: '#06b6d4', text: 'Photo Solver — λύσε με φωτογραφία' },
  { icon: Swords,   color: '#ec4899', text: 'Study Battles 1v1 με συμμαθητές' },
  { icon: Trophy,   color: '#f59e0b', text: 'Leaderboard & streak rewards' },
  { icon: Crown,    color: '#ef4444', text: 'Πανελλήνιες Simulator Γ\' Λυκείου' },
]

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.4 }

export default function UpgradeModal() {
  const { upgradeModalOpen, setUpgradeModal, user, setAuthModal } = useStore()

  const handleUpgrade = async () => {
    if (!user) {
      setUpgradeModal(false)
      setAuthModal(true, 'signup')
      return
    }
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const { sessionId } = await res.json()
      const stripe = await stripePromise
      await stripe.redirectToCheckout({ sessionId })
    } catch {
      toast.error('Σφάλμα. Δοκίμασε ξανά.')
    }
  }

  return (
    <Modal open={upgradeModalOpen} onClose={() => setUpgradeModal(false)} size="md">
      <div className="space-y-5">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(160deg, #1e1530 0%, #16161f 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
          <div className="absolute top-0 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7), transparent)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', transform: 'translate(-50%, -40%)' }} />

          <motion.div
            animate={{ rotate: [0, 8, -8, 0], y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            className="inline-flex mb-3">
            <Crown size={36} className="text-amber-400" />
          </motion.div>
          <h2 className="text-xl font-black text-white font-display">MathAxion Pro</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-2)' }}>Πλήρης πρόσβαση σε όλα</p>

          <div className="flex items-end justify-center gap-1 mt-4">
            <span className="text-5xl font-black text-white font-display leading-none">2€</span>
            <span className="text-base mb-1" style={{ color: 'var(--fg-2)' }}>/μήνα</span>
          </div>
          <p className="text-[11px] mt-1 text-amber-400/70">Ακύρωση οποιαδήποτε στιγμή</p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {PRO_FEATURES.map(({ icon: Icon, color, text }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, ...SPRING }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}15` }}>
                <Icon size={13} style={{ color }} />
              </div>
              <span className="text-sm flex-1" style={{ color: 'var(--fg-2)' }}>{text}</span>
              <Check size={13} className="text-emerald-400 shrink-0" />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleUpgrade}
          className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
          <Crown size={15} className="text-amber-300" />
          Αποκτήσε Pro — 2€/μήνα
        </motion.button>

        <p className="text-center text-[11px]" style={{ color: 'var(--fg-3)' }}>
          Ασφαλής πληρωμή μέσω Stripe · Ακύρωση οποιαδήποτε στιγμή
        </p>
      </div>
    </Modal>
  )
}
