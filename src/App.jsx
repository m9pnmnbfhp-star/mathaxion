import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase, getProfile } from './lib/supabase'
import useStore from './store/useStore'
import Header from './components/layout/Header'
import AuthModal from './components/auth/AuthModal'
import UpgradeModal from './components/layout/UpgradeModal'
import HomePage from './pages/HomePage'
import GradePage from './pages/GradePage'
import ChapterPage from './pages/ChapterPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PanelliniesPage from './pages/PanelliniesPage'

export default function App() {
  const { setUser, setProfile, setAuthModal } = useStore()

  useEffect(() => {
    const loadUser = (user) => {
      setUser(user)
      if (user) {
        getProfile(user.id).then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      loadUser(data?.session?.user ?? null)
    }).catch(() => setUser(null))

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
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>

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
  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.search)
      .then(() => { window.location.href = '/' })
  }, [])
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-slate-400">Σύνδεση...</div>
    </div>
  )
}
