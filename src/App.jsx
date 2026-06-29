import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
    }).catch(() => {
      // Network error — don't log the user out, keep cached state
    })

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
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/grade/:gradeId" element={<GradePage />} />
            <Route path="/grade/:gradeId/chapter/:chapterId" element={<ChapterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/panellinies" element={<PanelliniesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>

        {/* Onboarding overlay — shown on signup (pre-auth) or once for new logged-in users */}
        {(preAuthOnboardingOpen || (user && !onboardingCompleted)) && (
          <OnboardingFlow preAuth={preAuthOnboardingOpen && !user} />
        )}

        {/* Global modals */}
        <AuthModal />
        <UpgradeModal />

        {/* Toast notifications */}
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
            success: {
              iconTheme: { primary: '#10b981', secondary: '#16161f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#16161f' },
            },
          }}
        />
      </div>
    </BrowserRouter>
  )
}

function AuthCallback() {
  const [error, setError] = useState(null)
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      // PKCE flow: exchange the code for a session
      supabase.auth.exchangeCodeForSession(window.location.search)
        .then(({ error }) => {
          if (error) { setError(error.message); return }
          window.location.href = '/'
        })
        .catch((err) => setError(err.message))
    } else {
      // Implicit flow: Supabase JS already consumed the hash and set the session
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
