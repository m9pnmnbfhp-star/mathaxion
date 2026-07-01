import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

function getMondayStr() {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toDateString()
}

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      profile: null,
      isPro: false,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile, isPro: profile?.subscription === 'pro' }),

      // Navigation state
      selectedGrade: null,
      selectedChapter: null,
      setSelectedGrade: (grade) => set({ selectedGrade: grade, selectedChapter: null }),
      setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),

      // Progress (client-side cache)
      progress: {},
      updateChapterProgress: (gradeId, chapterId, data) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [`${gradeId}/${chapterId}`]: {
              ...state.progress[`${gradeId}/${chapterId}`],
              ...data,
              updatedAt: Date.now(),
            },
          },
        })),

      getChapterProgress: (gradeId, chapterId) => {
        return get().progress[`${gradeId}/${chapterId}`] || { level: 1, completedExercises: 0, masteredConcepts: [] }
      },

      // Streak
      streak: { current: 0, longest: 0, lastStudyDate: null },
      updateStreak: () => {
        const today = new Date().toDateString()
        const { streak } = get()
        if (streak.lastStudyDate === today) return
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const newCurrent = streak.lastStudyDate === yesterday ? streak.current + 1 : 1
        set({
          streak: {
            current: newCurrent,
            longest: Math.max(newCurrent, streak.longest),
            lastStudyDate: today,
          },
        })
      },

      // XP
      xp: 0,
      totalXP: 0,
      addXP: (amount) => {
        set((state) => ({
          xp: state.xp + amount,
          totalXP: state.totalXP + amount,
        }))
        get().addWeeklyXP(amount)
        const userId = get().user?.id
        if (userId) {
          supabase.rpc('increment_xp', { uid: userId, delta: amount }).catch(() => {})
        }
      },

      canUseAI: () => get().isPro,
      useAIMessage: () => {},
      remainingAIMessages: () => get().isPro ? Infinity : 0,

      // Last studied chapter (for "continue here" card)
      lastStudied: null,
      setLastStudied: ({ gradeId, chapterId, title, emoji, gradeName }) =>
        set({ lastStudied: { gradeId, chapterId, title, emoji, gradeName, ts: Date.now() } }),

      // Weekly XP tracking
      weeklyXP: { thisWeek: 0, lastWeek: 0, weekStart: null },
      addWeeklyXP: (amount) =>
        set((state) => {
          const monday = getMondayStr()
          const w = state.weeklyXP
          if (w.weekStart !== monday) {
            return { weeklyXP: { thisWeek: amount, lastWeek: w.thisWeek, weekStart: monday } }
          }
          return { weeklyXP: { ...w, thisWeek: w.thisWeek + amount } }
        }),

      // AI Memory — struggle tracking
      struggles: {},
      recordStruggle: (concept, gradeId, chapterId) =>
        set((state) => {
          const prev = state.struggles[concept] || { count: 0, gradeId, chapterId, firstSeen: Date.now() }
          return {
            struggles: {
              ...state.struggles,
              [concept]: { ...prev, count: prev.count + 1, gradeId, chapterId, lastSeen: Date.now() },
            },
          }
        }),
      dismissStruggle: (concept) =>
        set((state) => {
          const next = { ...state.struggles }
          delete next[concept]
          return { struggles: next }
        }),
      getTopStruggles: (n = 3) => {
        const s = get().struggles
        return Object.entries(s)
          .map(([concept, data]) => ({ concept, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, n)
      },

      // Wrong answers (for adaptive quiz)
      wrongAnswers: [],
      addWrongAnswer: (entry) => {
        get().recordStruggle(entry.concept, entry.gradeId, entry.chapterId)
        set((state) => ({
          wrongAnswers: [entry, ...state.wrongAnswers].slice(0, 50),
        }))
      },

      // Onboarding
      onboarding: null,
      onboardingCompleted: false,
      setOnboarding: (data) => set({ onboarding: data }),
      setOnboardingCompleted: (val) => set({ onboardingCompleted: val }),
      completeOnboarding: (data) => set({ onboarding: data, onboardingCompleted: true }),

      // Modal state
      authModalOpen: false,
      authModalMode: 'login',
      preAuthOnboardingOpen: false,
      upgradeModalOpen: false,
      setAuthModal: (open, mode = 'login') => {
        if (open && mode === 'signup') {
          set({ preAuthOnboardingOpen: true, authModalOpen: false })
        } else {
          set({ authModalOpen: open, authModalMode: mode, preAuthOnboardingOpen: false })
        }
      },
      setPreAuthOnboarding: (open) => set({ preAuthOnboardingOpen: open }),
      setUpgradeModal: (open) => set({ upgradeModalOpen: open }),

      // Toast / notifications
      notifications: [],
      addNotification: (n) =>
        set((state) => ({
          notifications: [{ id: Date.now(), ...n }, ...state.notifications].slice(0, 10),
        })),
    }),
    {
      name: 'mathaxion-store',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isPro: state.isPro,
        selectedGrade: state.selectedGrade,
        progress: state.progress,
        streak: state.streak,
        xp: state.xp,
        totalXP: state.totalXP,
        weeklyXP: state.weeklyXP,
        lastStudied: state.lastStudied,
        wrongAnswers: state.wrongAnswers,
        struggles: state.struggles,
        onboarding: state.onboarding,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
)

export default useStore
