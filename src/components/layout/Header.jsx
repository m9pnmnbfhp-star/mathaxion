import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Star, User, Settings, LogOut, Crown, ChevronDown, Zap } from 'lucide-react'
import { useState } from 'react'
import useStore from '../../store/useStore'
import Button from '../ui/Button'
import { signOut } from '../../lib/supabase'
import toast from 'react-hot-toast'

function getLevel(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 8)) + 1
}

export default function Header() {
  const { user, profile, streak, xp, isPro, setAuthModal, setUser, setUpgradeModal } = useStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const level = getLevel(xp)

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    toast('Αποσυνδέθηκες')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl">
      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/logo.png"
            alt="MathAxion"
            className="h-20 w-auto"
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Streak pill */}
              <Link to="/profile" title="Streak" className="hidden sm:flex">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] hover:border-orange-500/40 transition-colors cursor-pointer"
                >
                  <Flame size={14} className={streak.current > 0 ? 'text-orange-400' : 'text-slate-500'} />
                  <span className="text-sm font-bold text-white">{streak.current}</span>
                </motion.div>
              </Link>

              {/* XP + Level pill */}
              <Link to="/profile" title="XP & Level" className="hidden sm:flex">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] hover:border-violet-500/40 transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-black text-violet-400">Lv.{level}</span>
                  <div className="w-px h-3 bg-[#3a3a50]" />
                  <Star size={13} className="text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">{xp.toLocaleString('el')}</span>
                </motion.div>
              </Link>

              {/* Pro upgrade button */}
              {!isPro && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setUpgradeModal(true)}
                  icon={<Crown size={13} />}
                  className="hidden md:flex"
                >
                  Pro
                </Button>
              )}

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] hover:border-violet-500/40 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/40 to-violet-700/40 border border-violet-500/50 flex items-center justify-center text-xs text-violet-200 font-black">
                    {profile?.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  {isPro && <Crown size={11} className="text-amber-400" />}
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-[#16161f] border border-[#2a2a3a] rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                    >
                      <div className="px-3.5 py-3 border-b border-[#2a2a3a]">
                        <p className="text-sm font-bold text-white truncate">
                          {profile?.display_name || 'Μαθητής'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        {isPro && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-400">
                            <Crown size={10} />PRO
                          </span>
                        )}
                      </div>

                      <div className="p-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <User size={14} />Προφίλ
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <Settings size={14} />Ρυθμίσεις
                        </Link>
                        {!isPro && (
                          <button
                            onClick={() => { setDropdownOpen(false); setUpgradeModal(true) }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                          >
                            <Crown size={14} />Αναβάθμιση σε Pro
                          </button>
                        )}
                        <div className="h-px bg-[#2a2a3a] my-1" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut size={14} />Αποσύνδεση
                        </button>
                      </div>
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
