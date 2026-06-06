import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Globe } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import useStore from '../../store/useStore'
import { signIn, signUp, signInWithGoogle } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthModal() {
  const { authModalOpen, authModalMode, setAuthModal, setUser } = useStore()
  const [mode, setMode] = useState(authModalMode)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })

  const isLogin = mode === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const { data, error } = await signIn(form.email, form.password)
        if (error) throw error
        setUser(data.user)
        toast.success('Καλώς ήρθες! 🎉')
        setAuthModal(false)
      } else {
        const { data, error } = await signUp(form.email, form.password, { display_name: form.name })
        if (error) throw error
        toast.success('Λογαριασμός δημιουργήθηκε! Έλεγξε το email σου. 📬')
        setAuthModal(false)
      }
    } catch (err) {
      toast.error(err.message || 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Σφάλμα σύνδεσης με Google')
    }
  }

  return (
    <Modal open={authModalOpen} onClose={() => setAuthModal(false)} size="sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gradient font-display mb-1">MathAxiom</div>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Σύνδεση στον λογαριασμό σου' : 'Δημιουργία λογαριασμού — δωρεάν'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-[#1c1c28] p-1 gap-1">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Σύνδεση' : 'Εγγραφή'}
            </button>
          ))}
        </div>

        {/* Google */}
        <Button variant="secondary" className="w-full" onClick={handleGoogle} icon={<Globe size={18} />}>
          Συνέχεια με Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2a2a3a]" />
          <span className="text-xs text-slate-500">ή</span>
          <div className="flex-1 h-px bg-[#2a2a3a]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <InputField
                  icon={<User size={16} />}
                  placeholder="Όνομα"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <InputField
            icon={<Mail size={16} />}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />

          <div className="relative">
            <InputField
              icon={<Lock size={16} />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Κωδικός"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {isLogin ? 'Σύνδεση' : 'Εγγραφή'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          {isLogin ? 'Δεν έχεις λογαριασμό;' : 'Έχεις ήδη λογαριασμό;'}{' '}
          <button
            className="text-violet-400 hover:text-violet-300"
            onClick={() => setMode(isLogin ? 'signup' : 'login')}
          >
            {isLogin ? 'Εγγραφή' : 'Σύνδεση'}
          </button>
        </p>
      </div>
    </Modal>
  )
}

function InputField({ icon, type = 'text', placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
      <span className="text-slate-500 shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
      />
    </div>
  )
}
