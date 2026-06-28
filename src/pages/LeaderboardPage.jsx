import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'
import { GRADES } from '../data/curriculum'
import { getLeaderboard, getGlobalLeaderboard } from '../lib/supabase'
import useStore from '../store/useStore'

function getLevel(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 8)) + 1
}

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.45 }

const TABS = [
  { id: 'global', label: 'Global' },
  ...GRADES.filter(g => !g.comingSoon).map(g => ({ id: g.id, label: g.shortLabel, color: g.color })),
]

export default function LeaderboardPage() {
  const { user, xp, setAuthModal } = useStore()
  const [activeTab, setActiveTab] = useState('global')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const fetchPromise = activeTab === 'global'
      ? getGlobalLeaderboard()
      : getLeaderboard(activeTab)

    fetchPromise.then(({ data }) => {
      if (cancelled) return
      const rows = data || []
      setEntries(rows)
      if (user) {
        const idx = rows.findIndex(r => r.user_id === user.id)
        setMyRank(idx === -1 ? null : idx + 1)
      }
    }).catch(() => {
      if (!cancelled) setEntries([])
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [activeTab, user])

  const top20 = entries.slice(0, 20)
  const myEntry = user ? entries.find(r => r.user_id === user.id) : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: SPRING }}
        className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Trophy size={22} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display">Leaderboard</h1>
          <p className="text-sm" style={{ color: 'var(--fg-2)' }}>Οι κορυφαίοι μαθητές της πλατφόρμας</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0"
            style={{
              background: activeTab === tab.id
                ? (tab.color ? `${tab.color}25` : 'rgba(124,58,237,0.2)')
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === tab.id ? (tab.color || '#7c3aed') + '40' : 'rgba(255,255,255,0.07)'}`,
              color: activeTab === tab.id ? (tab.color || '#a78bfa') : 'var(--fg-2)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={SPRING}>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl shimmer" />
              ))}
            </div>
          )}

          {!loading && top20.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 select-none">🏆</div>
              <p className="text-white font-bold mb-1">Γίνε ο πρώτος!</p>
              <p className="text-sm" style={{ color: 'var(--fg-2)' }}>Κανείς δεν έχει βαθμολογηθεί εδώ ακόμα.</p>
            </div>
          )}

          {!loading && top20.length > 0 && (
            <div className="space-y-2">
              {top20.map((entry, i) => {
                const rank = i + 1
                const name = entry.profiles?.display_name || 'Μαθητής'
                const entryXP = entry.xp || 0
                const level = getLevel(entryXP)
                const isMe = user && entry.user_id === user.id

                const rankStyle = rank === 1
                  ? { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' }
                  : rank === 2
                  ? { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' }
                  : rank === 3
                  ? { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' }
                  : { color: 'var(--fg-3)', bg: 'transparent', border: 'rgba(255,255,255,0.06)' }

                return (
                  <motion.div key={entry.user_id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, ...SPRING }}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{
                      background: isMe ? 'rgba(124,58,237,0.1)' : rankStyle.bg,
                      border: `1px solid ${isMe ? 'rgba(124,58,237,0.3)' : rankStyle.border}`,
                    }}>

                    {/* Rank */}
                    <div className="w-8 text-center font-black tabular-nums text-sm shrink-0"
                      style={{ color: rankStyle.color }}>
                      {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                      style={{ background: isMe ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)', color: isMe ? '#c4b5fd' : 'var(--fg-2)' }}>
                      {name[0].toUpperCase()}
                    </div>

                    {/* Name + level */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {name}{isMe && <span className="ml-2 text-[10px] text-violet-400 font-black">ΕΣΥ</span>}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--fg-3)' }}>Lv.{level}</p>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={12} className="text-amber-400" />
                      <span className="text-sm font-black text-amber-300 tabular-nums">
                        {entryXP.toLocaleString('el')}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sticky "you" row if outside top 20 */}
      {!loading && user && myEntry && !top20.find(e => e.user_id === user.id) && (
        <div className="sticky bottom-4 mt-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: '#1c1c28', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(12px)' }}>
            <div className="w-8 text-center font-black text-sm shrink-0" style={{ color: 'var(--fg-3)' }}>
              #{myRank || '?'}
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: 'rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
              {(user.email?.[0] || 'Ε').toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Εσύ <span className="text-[10px] text-violet-400 font-black ml-1">ΕΣΥ</span></p>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" />
              <span className="text-sm font-black text-amber-300 tabular-nums">{xp.toLocaleString('el')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Not logged in prompt */}
      {!user && !loading && (
        <p className="text-center text-sm mt-6" style={{ color: 'var(--fg-2)' }}>
          <span className="text-violet-400 font-bold cursor-pointer hover:text-violet-300" onClick={() => setAuthModal(true, 'signup')}>Συνδέσου</span> για να εμφανιστείς στο leaderboard
        </p>
      )}
    </div>
  )
}
