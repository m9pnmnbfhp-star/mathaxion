import { Check, Crown, Zap, Camera, Swords, Trophy, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PRO_FEATURES = [
  { icon: Zap, text: 'Απεριόριστο Axi AI' },
  { icon: BookOpen, text: 'Όλα τα επίπεδα ασκήσεων (1-4)' },
  { icon: Camera, text: 'Photo solver — λύσε με φωτογραφία' },
  { icon: Swords, text: 'Study battles με συμμαθητές' },
  { icon: Trophy, text: 'Leaderboard & streak rewards' },
  { icon: Crown, text: 'Πανελλήνιες simulator Γ\' Λυκείου' },
]

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
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            className="inline-flex mb-3"
          >
            <Crown size={40} className="text-amber-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Αναβάθμιση σε Pro</h2>
          <p className="text-slate-400 text-sm mt-1">Ξεκλείδωσε τα πάντα για μόνο</p>
        </div>

        {/* Price */}
        <div className="text-center bg-gradient-to-br from-amber-500/10 to-violet-600/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-end justify-center gap-1">
            <span className="text-5xl font-black text-white">€2</span>
            <span className="text-slate-400 text-lg mb-1">/μήνα</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Ακύρωση οποιαδήποτε στιγμή</p>
        </div>

        {/* Features grid */}
        <div className="space-y-2.5">
          {PRO_FEATURES.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-violet-400" />
              </div>
              <span className="text-sm text-slate-200">{text}</span>
              <Check size={14} className="text-emerald-400 ml-auto shrink-0" />
            </motion.div>
          ))}
        </div>

        <Button variant="gold" size="lg" className="w-full" onClick={handleUpgrade} icon={<Crown size={18} />}>
          Αναβάθμιση τώρα — €2/μήνα
        </Button>

        <p className="text-center text-xs text-slate-500">
          Ασφαλής πληρωμή μέσω Stripe • 30 μέρες εγγύηση επιστροφής
        </p>
      </div>
    </Modal>
  )
}
