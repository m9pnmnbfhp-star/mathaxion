import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Star, User, Settings, LogOut, Crown, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import useStore from '../../store/useStore'
import Button from '../ui/Button'
import { signOut } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Header() {
  const { user, profile, streak, xp, isPro, setAuthModal, setUser, setUpgradeModal } = useStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    toast('Αποσυνδέθηκες')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/logo.png"
            alt="MathAxion"
            className="h-10 w-auto"
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Streak */}
              <Link to="/profile" title="Δες την πρόοδό σου">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] hover:border-violet-500/40 transition-colors cursor-pointer"
                >
                  <Flame size={14} className={streak.current > 0 ? 'text-orange-400' : 'text-slate-500'} />
                  <span className="text-sm font-semibold text-white">{streak.current}</span>
                </motion.div>
              </Link>

              {/* XP */}
              <Link to="/profile" title="Πόντοι εμπειρίας — δες πώς τους κερδίζεις">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] hover:border-violet-500/40 transition-colors cursor-pointer hidden sm:flex"
                >
                  <Star size={14} className="text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">{xp.toLocaleString('el')}</span>
                </motion.div>
              </Link>

              {/* PRO badge or upgrade */}
              {!isPro && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setUpgradeModal(true)}
                  icon={<Crown size={14} />}
                  className="hidden sm:flex"
                >
                  Pro
                </Button>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] hover:border-violet-500/40 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-xs text-violet-300 font-bold">
                    {profile?.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  {isPro && <Crown size={12} className="text-amber-400" />}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#16161f] border border-[#2a2a3a] rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2.5 border-b border-[#2a2a3a]">
                        <p className="text-sm font-medium text-white truncate">
                          {profile?.display_name || 'Μαθητής'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User size={14} />
                        Προφίλ
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings size={14} />
                        Ρυθμίσεις
                      </Link>
                      {!isPro && (
                        <button
                          onClick={() => { setDropdownOpen(false); setUpgradeModal(true) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <Crown size={14} />
                          Αναβάθμιση σε Pro
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border-t border-[#2a2a3a] mt-1"
                      >
                        <LogOut size={14} />
                        Αποσύνδεση
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setAuthModal(true, 'login')}>
                Σύνδεση
              </Button>
              <Button variant="primary" size="sm" onClick={() => setAuthModal(true, 'signup')}>
                Εγγραφή
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
