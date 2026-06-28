import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import Modal from '../ui/Modal'
import useStore from '../../store/useStore'
import { signIn, signUp, signInWithGoogle, resetPasswordForEmail, updatePassword } from '../../lib/supabase'
import toast from 'react-hot-toast'

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.35 }

export default function AuthModal() {
  const { authModalOpen, authModalMode, setAuthModal, setUser } = useStore()
  const [mode, setMode] = useState(authModalMode)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', confirmPassword: '' })

  const [wasOpen, setWasOpen] = useState(authModalOpen)
  if (authModalOpen !== wasOpen) {
    setWasOpen(authModalOpen)
    if (authModalOpen) setMode(authModalMode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'forgot') {
        const { error } = await resetPasswordForEmail(form.email)
        if (error) throw error
        toast.success('Email επαναφοράς στάλθηκε!')
        setMode('login')
      } else if (mode === 'reset') {
        if (form.password.length < 6) { toast.error('Τουλάχιστον 6 χαρακτήρες'); return }
        if (form.password !== form.confirmPassword) { toast.error('Οι κωδικοί δεν ταιριάζουν'); return }
        const { error } = await updatePassword(form.password)
        if (error) throw error
        toast.success('Ο κωδικός άλλαξε!')
        setAuthModal(false)
      } else if (mode === 'login') {
        const { data, error } = await signIn(form.email, form.password)
        if (error) throw error
        setUser(data.user)
        toast.success('Καλώς ήρθες!')
        setAuthModal(false)
      } else {
        const { error } = await signUp(form.email, form.password, { display_name: form.name })
        if (error) throw error
        toast.success('Λογαριασμός δημιουργήθηκε! Έλεγξε το email σου.')
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
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      toast.error(err.message || 'Σφάλμα σύνδεσης με Google')
    }
  }

  const isAuth = mode === 'login' || mode === 'signup'

  return (
    <Modal open={authModalOpen} onClose={() => setAuthModal(false)} size="sm">
      <div className="space-y-5">
        {/* Brand header */}
        <div className="text-center pb-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <span className="text-xl">π</span>
          </div>
          <p className="font-black text-white font-display text-lg">
            {mode === 'login' && 'Σύνδεση'}
            {mode === 'signup' && 'Δημιουργία λογαριασμού'}
            {mode === 'forgot' && 'Επαναφορά κωδικού'}
            {mode === 'reset' && 'Νέος κωδικός'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-3)' }}>
            {mode === 'login' && 'Συνέχισε από εκεί που σταμάτησες'}
            {mode === 'signup' && 'Ξεκίνα το μαθηματικό σου ταξίδι'}
            {mode === 'forgot' && 'Θα σου στείλουμε σύνδεσμο επαναφοράς'}
            {mode === 'reset' && 'Εισάγαι έναν νέο κωδικό πρόσβασης'}
          </p>
        </div>

        {/* Tab switcher */}
        {isAuth && (
          <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
                style={{
                  background: mode === m ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--fg-2)',
                  boxShadow: mode === m ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
                }}>
                {m === 'login' ? 'Σύνδεση' : 'Εγγραφή'}
              </button>
            ))}
          </div>
        )}

        {/* Google */}
        {isAuth && (
          <>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--fg-2)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--fg-2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Συνέχεια με Google
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[11px]" style={{ color: 'var(--fg-3)' }}>ή με email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={SPRING} className="overflow-hidden">
                <InputField icon={User} placeholder="Όνομα" value={form.name}
                  onChange={v => setForm({ ...form, name: v })} />
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== 'reset' && (
            <InputField icon={Mail} type="email" placeholder="Email"
              value={form.email} onChange={v => setForm({ ...form, email: v })} />
          )}

          {mode !== 'forgot' && (
            <InputField icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'reset' ? 'Νέος κωδικός' : 'Κωδικός'}
              value={form.password} onChange={v => setForm({ ...form, password: v })}
              suffix={
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          )}

          {mode === 'reset' && (
            <InputField icon={Lock}
              type={showPassword ? 'text' : 'password'} placeholder="Επιβεβαίωση κωδικού"
              value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} />
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button type="button" onClick={() => setMode('forgot')}
                className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors cursor-pointer">
                Ξέχασες τον κωδικό;
              </button>
            </div>
          )}

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer disabled:opacity-60 mt-1"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
            {loading ? 'Φόρτωση...' : mode === 'login' ? 'Σύνδεση' : mode === 'signup' ? 'Εγγραφή' : mode === 'forgot' ? 'Αποστολή' : 'Αλλαγή κωδικού'}
          </motion.button>
        </form>

        {isAuth && (
          <p className="text-center text-[11px]" style={{ color: 'var(--fg-3)' }}>
            {mode === 'login' ? 'Δεν έχεις λογαριασμό;' : 'Έχεις ήδη λογαριασμό;'}{' '}
            <button className="text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Εγγραφή' : 'Σύνδεση'}
            </button>
          </p>
        )}

        {mode === 'forgot' && (
          <p className="text-center text-[11px]">
            <button className="text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
              onClick={() => setMode('login')}>
              ← Πίσω στη σύνδεση
            </button>
          </p>
        )}
      </div>
    </Modal>
  )
}

function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, suffix }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-colors"
      style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.08)' }}
      onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      <Icon size={15} style={{ color: 'var(--fg-3)' }} className="shrink-0" />
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required
        className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none" />
      {suffix}
    </div>
  )
}
