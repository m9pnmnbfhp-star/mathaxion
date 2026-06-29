import { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { supabase, getProfile, updateProfile } from './lib/supabase'
import useStore from './store/useStore'
import Header from './components/layout/Header'
import AuthModal from './components/auth/AuthModal'
import UpgradeModal from './components/layout/UpgradeModal'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import HomePage from './pages/HomePage'
import GradePage from './pages/GradePage'
import ChapterPage from './pages/ChapterPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PanelliniesPage from './pages/PanelliniesPage'
import LeaderboardPage from './pages/LeaderboardPage'

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
}

function PageFade({ children }) {
  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}

export default function App() {
  const { setUser, setProfile, setAuthModal, setOnboardingCompleted, setOnboarding, setPreAuthOnboarding, user, onboardingCompleted, preAuthOnboardingOpen } = useStore()

  useEffect(() => {
    const loadUser = (user) => {
      setUser(user)
      if (user) {
        getProfile(user.id).then(({ data }) => {
          setProfile(data)
          if (data?.onboarding_completed) {
            setOnboardingCompleted(true)
            if (data?.onboarding) setOnboarding(data.onboarding)
          }
          // Restore pre-auth onboarding answers saved before Google redirect
          const pending = localStorage.getItem('pendingOnboarding')
          if (pending && !data?.onboarding_completed) {
            try {
              const answers = JSON.parse(pending)
              updateProfile(user.id, { onboarding: answers, onboarding_completed: true, grade: answers.grade }).catch(() => {})
              setOnboarding(answers)
              setOnboardingCompleted(true)
              setPreAuthOnboarding(false)
            } catch (_) {}
            localStorage.removeItem('pendingOnboarding')
          }
        })
      } else {
        setProfile(null)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      loadUser(data?.session?.user ?? null)
    }).catch(() => {})

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      loadUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setAuthModal(true, 'reset')
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setAuthModal])

  return (
    <BrowserRouter>
      <AppContent
        user={user}
        onboardingCompleted={onboardingCompleted}
        preAuthOnboardingOpen={preAuthOnboardingOpen}
      />
    </BrowserRouter>
  )
}

function AppContent({ user, onboardingCompleted, preAuthOnboardingOpen }) {
  const location = useLocation()
  const { scrollYProgress } = useScroll()
  const spotlightRef = useRef(null)

  useEffect(() => {
    let raf
    const handle = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = spotlightRef.current
        if (!el) return
        el.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(124,58,237,0.065), transparent 55%)`
        el.classList.add('active')
      })
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => { window.removeEventListener('mousemove', handle); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Cursor spotlight */}
      <div ref={spotlightRef} className="cursor-spotlight" />
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[200] h-[2px] origin-left"
        style={{ scaleX: scrollYProgress, background: 'linear-gradient(90deg,#7c3aed,#a78bfa,#10b981)' }}
      />
      <Header />

      <main>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"         element={<PageFade><HomePage /></PageFade>} />
            <Route path="/grade/:gradeId" element={<PageFade><GradePage /></PageFade>} />
            <Route path="/grade/:gradeId/chapter/:chapterId" element={<PageFade><ChapterPage /></PageFade>} />
            <Route path="/profile"  element={<PageFade><ProfilePage /></PageFade>} />
            <Route path="/settings" element={<PageFade><SettingsPage /></PageFade>} />
            <Route path="/panellinies" element={<PageFade><PanelliniesPage /></PageFade>} />
            <Route path="/leaderboard" element={<PageFade><LeaderboardPage /></PageFade>} />
            <Route path="/auth/callback" element={<PageFade><AuthCallback /></PageFade>} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Onboarding overlay — shown on signup (pre-auth) or once for new logged-in users */}
      {(preAuthOnboardingOpen || (user && !onboardingCompleted)) && (
        <OnboardingFlow preAuth={preAuthOnboardingOpen && !user} />
      )}

      {/* Global modals */}
      <AuthModal />
      <UpgradeModal />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#16161f',
            color: '#e2e2f0',
            border: '1px solid #2a2a3a',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#16161f' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#16161f' } },
        }}
      />
    </div>
  )
}

function AuthCallback() {
  const [error, setError] = useState(null)
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.search)
        .then(({ error }) => {
          if (error) { setError(error.message); return }
          window.location.href = '/'
        })
        .catch((err) => setError(err.message))
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          window.location.href = '/'
        } else {
          setError('Αποτυχία σύνδεσης — δοκίμασε ξανά')
        }
      })
    }
  }, [])
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-red-400 font-medium">{error}</p>
      <a href="/" className="text-violet-400 hover:text-violet-300 text-sm">← Αρχική</a>
    </div>
  )
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-slate-400">Σύνδεση με Google...</div>
    </div>
  )
}
