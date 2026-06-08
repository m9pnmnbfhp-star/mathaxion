import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Mail, Crown, LogOut, Eye, EyeOff } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import useStore from '../store/useStore'
import { updateProfile, updatePassword, signOut } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, profile, setProfile, setUser, isPro, setUpgradeModal } = useStore()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-xl font-bold text-white mb-2">Συνδέσου για να δεις τις ρυθμίσεις σου</h2>
        <Link to="/">
          <Button variant="secondary">Επιστροφή στην αρχική</Button>
        </Link>
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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1">Ρυθμίσεις</h1>
        <p className="text-slate-400 text-sm">Διαχειρίσου το προφίλ και τον λογαριασμό σου</p>
      </motion.div>

      <ProfileNameCard profile={profile} userId={user.id} setProfile={setProfile} />
      <PasswordCard />
      <AccountInfoCard user={user} profile={profile} isPro={isPro} setUpgradeModal={setUpgradeModal} />

      <Card>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Αποσύνδεση
        </button>
      </Card>
    </div>
  )
}

function ProfileNameCard({ profile, userId, setProfile }) {
  const [name, setName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) {
      toast.error('Το όνομα δεν μπορεί να είναι κενό')
      return
    }
    setSaving(true)
    try {
      const { data, error } = await updateProfile(userId, { display_name: name.trim() })
      if (error) throw error
      setProfile(data)
      toast.success('Το όνομα ενημερώθηκε! ✨')
    } catch (err) {
      toast.error(err.message || 'Κάτι πήγε στραβά')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="font-bold text-white mb-3 flex items-center gap-2">
        <User size={18} className="text-violet-400" />
        Όνομα προφίλ
      </h2>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Το όνομά σου"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>
        <Button onClick={save} loading={saving} disabled={name.trim() === (profile?.display_name || '')}>
          Αποθήκευση
        </Button>
      </div>
    </Card>
  )
}

function PasswordCard() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (password.length < 6) {
      toast.error('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Οι κωδικοί δεν ταιριάζουν')
      return
    }
    setSaving(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      toast.success('Ο κωδικός άλλαξε! 🎉')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message || 'Κάτι πήγε στραβά')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="font-bold text-white mb-3 flex items-center gap-2">
        <Lock size={18} className="text-violet-400" />
        Αλλαγή κωδικού
      </h2>
      <div className="space-y-2">
        <div className="relative">
          <div className="flex items-center gap-2 bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Νέος κωδικός"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none pr-6"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-300">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Επιβεβαίωση νέου κωδικού"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>
        <Button onClick={save} loading={saving} disabled={!password || !confirmPassword}>
          Αλλαγή κωδικού
        </Button>
      </div>
    </Card>
  )
}

function AccountInfoCard({ user, profile, isPro, setUpgradeModal }) {
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <Card>
      <h2 className="font-bold text-white mb-3 flex items-center gap-2">
        <Mail size={18} className="text-violet-400" />
        Στοιχεία λογαριασμού
      </h2>
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Email</span>
          <span className="text-white">{user.email}</span>
        </div>
        {memberSince && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Μέλος από</span>
            <span className="text-white">{memberSince}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Συνδρομή</span>
          {isPro ? (
            <Badge color="amber"><Crown size={11} /> Pro</Badge>
          ) : (
            <button onClick={() => setUpgradeModal(true)} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
              Free — Αναβάθμιση σε Pro →
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
