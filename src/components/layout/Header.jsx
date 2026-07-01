import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Star, User, Settings, LogOut, Crown, ChevronDown, Menu, X, Search } from 'lucide-react'
import useStore from '../../store/useStore'
import { signOut } from '../../lib/supabase'
import toast from 'react-hot-toast'

function getLevel(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 8)) + 1
}

export default function Header({ onSearchOpen }) {
  const { user, profile, streak, xp, isPro, setAuthModal, setUser, setUpgradeModal } = useStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const level = getLevel(xp)

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    setUser(null)
    toast('Αποσυνδέθηκες')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <header className="sticky top-0 z-40" style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <motion.img
            whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}
            src="/logo.png" alt="MathAxion" className="h-20 w-auto"
          />
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/', label: 'Αρχική' },
            { href: '/grade/a-gymnasiou', label: 'Γυμνάσιο' },
            { href: '/grade/a-lykeiou', label: 'Λύκειο' },
            { href: '/panellinies', label: 'Πανελλήνιες' },
            { href: '/leaderboard', label: 'Leaderboard' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              to={href}
              className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                color: isActive(href) && href !== '/' ? 'white' : isActive('/') && href === '/' && location.pathname === '/' ? 'white' : 'var(--fg-2)',
                background: (isActive(href) && href !== '/') || (location.pathname === '/' && href === '/') ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onSearchOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--fg-3)' }}
          >
            <Search size={14} />
            <span className="hidden sm:inline text-xs">Αναζήτηση</span>
            <kbd className="hidden md:flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--fg-3)' }}>
              ⌘K
            </kbd>
          </motion.button>
          {user ? (
            <>
              {/* Streak */}
              <Link to="/profile" className="hidden sm:flex">
                <motion.div
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                  style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Flame size={14} className={streak.current > 0 ? 'text-orange-400' : 'text-slate-600'} />
                  <span className="text-sm font-bold text-white tabular-nums">{streak.current}</span>
                </motion.div>
              </Link>

              {/* XP + Level */}
              <Link to="/profile" className="hidden sm:flex">
                <motion.div
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
                  style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-[11px] font-black text-violet-400">Lv.{level}</span>
                  <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <Star size={12} className="text-amber-400" />
                  <span className="text-sm font-bold text-amber-300 tabular-nums">{xp.toLocaleString('el')}</span>
                </motion.div>
              </Link>

              {/* Pro badge */}
              {!isPro && (
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setUpgradeModal(true)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}
                >
                  <Crown size={12} />Pro
                </motion.button>
              )}

              {/* User avatar dropdown */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full cursor-pointer transition-colors"
                  style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(109,40,217,0.5))', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' }}>
                    {profile?.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  {isPro && <Crown size={10} className="text-amber-400" />}
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={12} className="text-slate-500" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
                      >
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-sm font-bold text-white truncate">
                            {profile?.display_name || 'Μαθητής'}
                          </p>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--fg-3)' }}>{user.email}</p>
                          {isPro && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-black text-amber-400">
                              <Crown size={9} />PRO
                            </span>
                          )}
                        </div>

                        <div className="p-1.5 space-y-0.5">
                          <Link to="/profile" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors"
                            style={{ color: 'var(--fg-2)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <User size={14} />Προφίλ
                          </Link>
                          <Link to="/settings" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-colors"
                            style={{ color: 'var(--fg-2)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Settings size={14} />Ρυθμίσεις
                          </Link>
                          {!isPro && (
                            <button
                              onClick={() => { setDropdownOpen(false); setUpgradeModal(true) }}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl transition-colors text-amber-400 cursor-pointer"
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <Crown size={14} />Αναβάθμιση σε Pro
                            </button>
                          )}
                          <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl transition-colors cursor-pointer"
                            style={{ color: 'var(--fg-2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)' }}
                          >
                            <LogOut size={14} />Αποσύνδεση
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setAuthModal(true, 'login')}
                className="px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                style={{ color: 'var(--fg-2)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-2)'}
              >
                Σύνδεση
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setAuthModal(true, 'signup')}
                className="px-4 py-2 text-sm font-bold rounded-xl text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
              >
                Εγγραφή
              </motion.button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors cursor-pointer"
            style={{ color: 'var(--fg-2)' }}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <nav className="px-4 py-3 space-y-1">
              {[
                { href: '/', label: 'Αρχική' },
                { href: '/grade/a-gymnasiou', label: 'Γυμνάσιο' },
                { href: '/grade/a-lykeiou', label: 'Λύκειο' },
                { href: '/panellinies', label: 'Πανελλήνιες' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/profile', label: 'Προφίλ' },
              ].map(({ href, label }) => (
                <Link key={href} to={href} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: 'var(--fg-2)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)' }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
