import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      addXP: (amount) => set((state) => ({
        xp: state.xp + amount,
        totalXP: state.totalXP + amount,
      })),

      // Daily AI usage (free tier)
      aiUsageToday: { date: null, count: 0 },
      canUseAI: () => {
        const { isPro, aiUsageToday } = get()
        if (isPro) return true
        const today = new Date().toDateString()
        if (aiUsageToday.date !== today) return true
        return aiUsageToday.count < 3
      },
      useAIMessage: () => {
        const today = new Date().toDateString()
        set((state) => ({
          aiUsageToday: {
            date: today,
            count: state.aiUsageToday.date === today ? state.aiUsageToday.count + 1 : 1,
          },
        }))
      },
      remainingAIMessages: () => {
        const { isPro, aiUsageToday } = get()
        if (isPro) return Infinity
        const today = new Date().toDateString()
        if (aiUsageToday.date !== today) return 3
        return Math.max(0, 3 - aiUsageToday.count)
      },

      // Wrong answers (for adaptive quiz)
      wrongAnswers: [],
      addWrongAnswer: (entry) =>
        set((state) => ({
          wrongAnswers: [entry, ...state.wrongAnswers].slice(0, 50),
        })),

      // Modal state
      authModalOpen: false,
      authModalMode: 'login',
      upgradeModalOpen: false,
      setAuthModal: (open, mode = 'login') => set({ authModalOpen: open, authModalMode: mode }),
      setUpgradeModal: (open) => set({ upgradeModalOpen: open }),

      // Toast / notifications
      notifications: [],
      addNotification: (n) =>
        set((state) => ({
          notifications: [{ id: Date.now(), ...n }, ...state.notifications].slice(0, 10),
        })),
    }),
    {
      name: 'mathaxiom-store',
      partialize: (state) => ({
        selectedGrade: state.selectedGrade,
        progress: state.progress,
        streak: state.streak,
        xp: state.xp,
        totalXP: state.totalXP,
        aiUsageToday: state.aiUsageToday,
        wrongAnswers: state.wrongAnswers,
      }),
    }
  )
)

export default useStore
