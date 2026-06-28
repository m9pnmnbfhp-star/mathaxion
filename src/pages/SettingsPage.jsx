import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Mail, Crown, LogOut, Eye, EyeOff, Shield, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'
import { updateProfile, updatePassword, signOut } from '../lib/supabase'
import toast from 'react-hot-toast'

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.45 }

function Section({ icon: Icon, color = '#7c3aed', title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <h2 className="font-bold text-white text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Input({ icon: Icon, type = 'text', placeholder, value, onChange, suffix }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-colors"
      style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.08)' }}
      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      {Icon && <Icon size={15} style={{ color: 'var(--fg-3)' }} className="shrink-0" />}
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
      />
      {suffix}
    </div>
  )
}

export default function SettingsPage() {
  const { user, profile, setProfile, setUser, isPro, setUpgradeModal } = useStore()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Shield size={32} style={{ color: 'var(--fg-3)' }} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Συνδέσου πρώτα</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--fg-2)' }}>Για να δεις τις ρυθμίσεις σου χρειάζεται σύνδεση.</p>
        <Link to="/" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">← Αρχική</Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    toast('Αποσυνδέθηκες')
    navigate('/')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: SPRING }}>
        <h1 className="text-2xl font-black text-white font-display mb-1">Ρυθμίσεις</h1>
        <p className="text-sm" style={{ color: 'var(--fg-2)' }}>Διαχειρίσου το προφίλ και τον λογαριασμό σου</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, ...SPRING }}>
        <ProfileNameCard profile={profile} userId={user.id} setProfile={setProfile} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...SPRING }}>
        <PasswordCard />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...SPRING }}>
        <AccountInfoCard user={user} profile={profile} isPro={isPro} setUpgradeModal={setUpgradeModal} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...SPRING }}>
        <div className="overflow-hidden rounded-2xl" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm transition-colors cursor-pointer"
              style={{ color: 'var(--fg-2)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-2)'}
            >
              <LogOut size={15} />Αποσύνδεση
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ProfileNameCard({ profile, userId, setProfile }) {
  const [name, setName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) { toast.error('Το όνομα δεν μπορεί να είναι κενό'); return }
    setSaving(true)
    try {
      const { data, error } = await updateProfile(userId, { display_name: name.trim() })
      if (error) throw error
      setProfile(data)
      toast.success('Αποθηκεύτηκε!')
    } catch (err) { toast.error(err.message || 'Κάτι πήγε στραβά') }
    finally { setSaving(false) }
  }

  return (
    <Section icon={User} title="Όνομα προφίλ">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input icon={User} placeholder="Το όνομά σου" value={name} onChange={setName} />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={save} disabled={saving || name.trim() === (profile?.display_name || '')}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          {saving ? '...' : 'Αποθήκευση'}
        </motion.button>
      </div>
    </Section>
  )
}

function PasswordCard() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (password.length < 6) { toast.error('Τουλάχιστον 6 χαρακτήρες'); return }
    if (password !== confirmPassword) { toast.error('Οι κωδικοί δεν ταιριάζουν'); return }
    setSaving(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      toast.success('Ο κωδικός άλλαξε!')
      setPassword(''); setConfirmPassword('')
    } catch (err) { toast.error(err.message || 'Κάτι πήγε στραβά') }
    finally { setSaving(false) }
  }

  const toggle = <button type="button" onClick={() => setShowPassword(s => !s)}
    className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
  </button>

  return (
    <Section icon={Lock} title="Αλλαγή κωδικού">
      <div className="space-y-2">
        <Input icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Νέος κωδικός"
          value={password} onChange={setPassword} suffix={toggle} />
        <Input icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Επιβεβαίωση κωδικού"
          value={confirmPassword} onChange={setConfirmPassword} />
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          onClick={save} disabled={saving || !password || !confirmPassword}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-40 mt-2"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          {saving ? 'Αλλαγή...' : 'Αλλαγή κωδικού'}
        </motion.button>
      </div>
    </Section>
  )
}

function AccountInfoCard({ user, profile, isPro, setUpgradeModal }) {
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('el-GR', { year: 'numeric', month: 'long' })
    : null

  return (
    <Section icon={Mail} title="Στοιχεία λογαριασμού">
      <div className="space-y-3">
        {[
          { label: 'Email', value: user.email },
          memberSince && { label: 'Μέλος από', value: memberSince },
        ].filter(Boolean).map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--fg-2)' }}>{label}</span>
            <span className="text-sm text-white font-medium">{value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-sm" style={{ color: 'var(--fg-2)' }}>Συνδρομή</span>
          {isPro ? (
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 px-2 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Crown size={11} />Pro
            </span>
          ) : (
            <button onClick={() => setUpgradeModal(true)}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
              Αναβάθμιση σε Pro<ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </Section>
  )
}
