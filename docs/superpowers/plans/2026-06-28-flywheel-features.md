# Full Flywheel Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the three flywheel features — Mastery System (heatmap + radar), Shareable Progress Card, and Leaderboard — to close the trust/results/social gaps before launch.

**Architecture:** All mastery data is derived from existing Zustand `progress` state (no new DB tables). XP is synced to Supabase fire-and-forget on each `addXP()` call, enabling the leaderboard. The share card is a hidden DOM div captured with html2canvas — no backend.

**Tech Stack:** React 19, Vite 8, Tailwind v4, Framer Motion 12, Zustand 5, Supabase JS v2, html2canvas

## Global Constraints

- Dark background: `#0a0a0f`, card background: `#16161f`, elevated: `#1c1c28`
- Violet accent: `#7c3aed`, emerald: `#10b981`, amber: `#f59e0b`, red: `#ef4444`
- Spring easing: `[0.16, 1, 0.3, 1]` on all Framer Motion transitions
- Fonts: `Space Grotesk` for display/headings (`font-display`), `DM Sans` for body
- All borders: `rgba(255,255,255,0.06)` default, `rgba(255,255,255,0.12)` on hover
- Mastery %: `Math.min(100, (completedExercises || 0) * 10)` — consistent everywhere
- Grade mastery: average mastery % across all chapters in that grade
- No new Supabase tables for mastery — Zustand only
- `logXP` calls are fire-and-forget (never block the UI on Supabase errors)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/pages/GradePage.jsx` | Modify | Add `<ChapterHeatmap>` above chapter list |
| `src/components/profile/ChapterHeatmap.jsx` | Create | Heatmap grid component |
| `src/components/profile/RadarChart.jsx` | Create | Pure SVG radar chart |
| `src/pages/ProfilePage.jsx` | Modify | Add `<RadarChart>` + "share" button |
| `src/lib/supabase.js` | Modify | Add `getGlobalLeaderboard()` |
| `src/store/useStore.js` | Modify | Sync XP to Supabase in `addXP()` |
| `src/pages/LeaderboardPage.jsx` | Create | Leaderboard page with global/per-grade tabs |
| `src/App.jsx` | Modify | Add `/leaderboard` route |
| `src/components/layout/Header.jsx` | Modify | Add "Leaderboard" nav link |
| `src/components/profile/ShareCard.jsx` | Create | Hidden card div + share modal |
| `package.json` | Modify | Add `html2canvas` |

---

## Task 1: Chapter Heatmap on GradePage

**Files:**
- Create: `src/components/profile/ChapterHeatmap.jsx`
- Modify: `src/pages/GradePage.jsx`

**Interfaces:**
- Produces: `<ChapterHeatmap grade={grade} getChapterProgress={fn} navigate={fn} />` — renders a grid, no return value

- [ ] **Step 1: Create the ChapterHeatmap component**

Create `src/components/profile/ChapterHeatmap.jsx`:

```jsx
import { useState } from 'react'
import { motion } from 'framer-motion'

function masteryPct(completedExercises) {
  return Math.min(100, (completedExercises || 0) * 10)
}

function masteryColor(pct) {
  if (pct === 0) return { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' }
  if (pct <= 40) return { bg: `rgba(239,68,68,${0.1 + (pct / 40) * 0.25})`, border: 'rgba(239,68,68,0.3)' }
  if (pct <= 70) return { bg: `rgba(245,158,11,${0.15 + ((pct - 40) / 30) * 0.3})`, border: 'rgba(245,158,11,0.35)' }
  return { bg: `rgba(16,185,129,${0.2 + ((pct - 70) / 30) * 0.35})`, border: 'rgba(16,185,129,0.4)' }
}

export default function ChapterHeatmap({ grade, getChapterProgress, navigate }) {
  const [tooltip, setTooltip] = useState(null)

  const cells = grade.chapters.map((chapter) => {
    const progress = getChapterProgress(grade.id, chapter.id)
    const pct = masteryPct(progress.completedExercises)
    return { chapter, pct, ...masteryColor(pct) }
  })

  const masteredCount = cells.filter(c => c.pct >= 80).length

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--fg-3)' }}>
          Mastery Overview
        </p>
        <p className="text-xs" style={{ color: 'var(--fg-3)' }}>
          <span className="text-emerald-400 font-bold">{masteredCount}</span>/{grade.chapters.length} κατακτημένα
        </p>
      </div>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}>
        {cells.map(({ chapter, pct, bg, border }, i) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02, ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            className="relative aspect-square rounded-xl cursor-pointer flex flex-col items-center justify-center"
            style={{ background: bg, border: `1px solid ${border}` }}
            onClick={() => navigate(`/grade/${grade.id}/chapter/${chapter.id}`)}
            onMouseEnter={() => setTooltip({ chapter, pct })}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="text-base leading-none select-none">{chapter.emoji}</span>
            {pct > 0 && (
              <span className="text-[8px] font-black mt-0.5 tabular-nums" style={{
                color: pct >= 71 ? '#6ee7b7' : pct >= 41 ? '#fcd34d' : '#fca5a5'
              }}>
                {pct}%
              </span>
            )}

            {/* Tooltip */}
            {tooltip?.chapter.id === chapter.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white whitespace-nowrap"
                  style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  {chapter.title}
                  <span className="ml-2 font-black" style={{ color: pct >= 71 ? '#10b981' : pct >= 41 ? '#f59e0b' : pct > 0 ? '#ef4444' : 'var(--fg-3)' }}>
                    {pct > 0 ? `${pct}%` : 'Δεν έχει ξεκινήσει'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Import and place ChapterHeatmap in GradePage**

In `src/pages/GradePage.jsx`, add import at top:
```jsx
import ChapterHeatmap from '../components/profile/ChapterHeatmap'
```

Find the comment `{/* Chapter list */}` and add the heatmap directly above it:
```jsx
{/* Chapter heatmap */}
<ChapterHeatmap grade={grade} getChapterProgress={getChapterProgress} navigate={navigate} />

{/* Chapter list */}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Navigate to any grade page (e.g. `/grade/a-gymnasiou`). Confirm:
- Grid of emoji cells appears above the chapter list
- Cells are dark (#16161f-ish) for unstarted chapters
- Hovering a cell shows tooltip with chapter name + "Δεν έχει ξεκινήσει"
- Clicking a cell navigates to that chapter
- "0/N κατακτημένα" stat appears top right

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/ChapterHeatmap.jsx src/pages/GradePage.jsx
git commit -m "feat: add chapter mastery heatmap to GradePage"
```

---

## Task 2: Radar Chart on ProfilePage

**Files:**
- Create: `src/components/profile/RadarChart.jsx`
- Modify: `src/pages/ProfilePage.jsx`

**Interfaces:**
- Consumes: `grades` array from `../data/curriculum`, `progress` object from Zustand
- Produces: `<RadarChart progress={progress} />` — self-contained SVG component

- [ ] **Step 1: Create the RadarChart component**

Create `src/components/profile/RadarChart.jsx`:

```jsx
import { motion } from 'framer-motion'
import { GRADES } from '../../data/curriculum'

function masteryPct(completedExercises) {
  return Math.min(100, (completedExercises || 0) * 10)
}

function getGradeMastery(gradeId, progress) {
  const grade = GRADES.find(g => g.id === gradeId)
  if (!grade || grade.chapters.length === 0) return 0
  const total = grade.chapters.reduce((sum, ch) => {
    const p = progress[`${gradeId}/${ch.id}`]
    return sum + masteryPct(p?.completedExercises)
  }, 0)
  return Math.round(total / grade.chapters.length)
}

const AXES = [
  { id: 'a-gymnasiou',  label: "Α'Γυμ" },
  { id: 'b-gymnasiou',  label: "Β'Γυμ" },
  { id: 'g-gymnasiou',  label: "Γ'Γυμ" },
  { id: 'a-lykeiou',   label: "Α'Λυκ" },
  { id: 'b-lykeiou',   label: "Β'Λυκ" },
  { id: 'g-lykeiou',   label: "Γ'Λυκ" },
]

const SIZE = 200
const CX = SIZE / 2
const CY = SIZE / 2
const R = 80

function polarToXY(angle, radius) {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

export default function RadarChart({ progress }) {
  const n = AXES.length
  const values = AXES.map(a => getGradeMastery(a.id, progress))
  const hasAnyProgress = values.some(v => v > 0)

  const points = values.map((v, i) => {
    const angle = (i / n) * 360
    const r = (v / 100) * R
    return polarToXY(angle, r)
  })

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ')

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1].map(scale => {
    const ringPts = AXES.map((_, i) => {
      const angle = (i / n) * 360
      return polarToXY(angle, R * scale)
    })
    return ringPts.map(p => `${p.x},${p.y}`).join(' ')
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--fg-3)' }}>
          Skill Radar
        </p>
        {!hasAnyProgress && (
          <p className="text-xs" style={{ color: 'var(--fg-3)' }}>Ξεκίνα μαθήματα για να δεις τo radar</p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center"
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Grid rings */}
          {rings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          ))}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = (i / n) * 360
            const end = polarToXY(angle, R)
            return (
              <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            )
          })}

          {/* Data polygon */}
          <polygon points={polyPoints}
            fill="rgba(124,58,237,0.2)"
            stroke="#7c3aed"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Data dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3"
              fill="#7c3aed" stroke="#a78bfa" strokeWidth="1" />
          ))}

          {/* Labels */}
          {AXES.map((axis, i) => {
            const angle = (i / n) * 360
            const pos = polarToXY(angle, R + 16)
            return (
              <text key={i} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.5)"
                fontFamily="DM Sans, sans-serif">
                {axis.label}
              </text>
            )
          })}
        </svg>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Add RadarChart to ProfilePage**

In `src/pages/ProfilePage.jsx`, add import:
```jsx
import RadarChart from '../components/profile/RadarChart'
```

Find the closing `</div>` of the stats grid section and add after it:
```jsx
{/* Skill radar */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
  className="rounded-2xl p-6"
  style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}
>
  <RadarChart progress={progress} />
</motion.div>
```

- [ ] **Step 3: Verify in browser**

Navigate to `/profile`. Confirm:
- SVG radar chart appears with 6 labeled axes (Α'Γυμ … Γ'Λυκ)
- All values start at 0 (center point visible)
- Hint text "Ξεκίνα μαθήματα για να δεις τo radar" appears
- After simulating progress in a chapter, the polygon extends outward on the correct axis

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/RadarChart.jsx src/pages/ProfilePage.jsx
git commit -m "feat: add skill radar chart to ProfilePage"
```

---

## Task 3: XP Sync to Supabase + Global Leaderboard Query

**Files:**
- Modify: `src/store/useStore.js`
- Modify: `src/lib/supabase.js`

**Interfaces:**
- Produces: `getGlobalLeaderboard()` in supabase.js — returns `{ data, error }` where data is array of `{ user_id, xp, profiles: { display_name } }`
- Produces: `addXP(amount)` in useStore.js — syncs to Supabase as side effect (fire-and-forget)

- [ ] **Step 1: Add getGlobalLeaderboard to supabase.js**

In `src/lib/supabase.js`, after the existing `getLeaderboard` function, add:

```js
export async function getGlobalLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, profiles(display_name)')
    .order('xp', { ascending: false })
    .limit(50)
  return { data, error }
}
```

- [ ] **Step 2: Sync XP in useStore.js**

In `src/store/useStore.js`, add the import at the top of the file:
```js
import { logXP } from '../lib/supabase'
```

Replace the existing `addXP` action:
```js
// Before:
addXP: (amount) => set((state) => ({
  xp: state.xp + amount,
  totalXP: state.totalXP + amount,
})),

// After:
addXP: (amount) => {
  set((state) => ({
    xp: state.xp + amount,
    totalXP: state.totalXP + amount,
  }))
  // Fire-and-forget sync to Supabase for leaderboard
  const userId = get().user?.id
  if (userId) {
    logXP(userId, amount, 'addXP').catch(() => {})
  }
},
```

- [ ] **Step 3: Verify**

Run `npm run build` — confirm no TypeScript/import errors. Then in the browser, open DevTools Network tab, earn XP in a chapter, and confirm a Supabase RPC call to `add_xp` fires (it may return an error if the DB RPC doesn't exist yet — that's fine, the UI still works).

- [ ] **Step 4: Commit**

```bash
git add src/store/useStore.js src/lib/supabase.js
git commit -m "feat: sync XP to Supabase on addXP, add getGlobalLeaderboard"
```

---

## Task 4: Leaderboard Page

**Files:**
- Create: `src/pages/LeaderboardPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/layout/Header.jsx`

**Interfaces:**
- Consumes: `getLeaderboard(gradeId)` and `getGlobalLeaderboard()` from `../../lib/supabase`
- Consumes: `useStore` for `user`, `xp`
- Consumes: `GRADES` from `../../data/curriculum`

- [ ] **Step 1: Create LeaderboardPage.jsx**

Create `src/pages/LeaderboardPage.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Crown } from 'lucide-react'
import { GRADES } from '../data/curriculum'
import { getLeaderboard, getGlobalLeaderboard } from '../lib/supabase'
import useStore from '../store/useStore'

function getLevel(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 8)) + 1
}

const SPRING = { ease: [0.16, 1, 0.3, 1], duration: 0.45 }

const TABS = [
  { id: 'global', label: 'Global' },
  ...GRADES.map(g => ({ id: g.id, label: g.shortLabel, color: g.color })),
]

export default function LeaderboardPage() {
  const { user, xp } = useStore()
  const [activeTab, setActiveTab] = useState('global')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState(null)

  useEffect(() => {
    setLoading(true)
    const fetch = activeTab === 'global'
      ? getGlobalLeaderboard()
      : getLeaderboard(activeTab)

    fetch.then(({ data }) => {
      const rows = data || []
      setEntries(rows)
      if (user) {
        const idx = rows.findIndex(r => r.user_id === user.id)
        setMyRank(idx === -1 ? null : idx + 1)
      }
    }).finally(() => setLoading(false))
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
          <span className="text-violet-400 font-bold cursor-pointer hover:text-violet-300">Συνδέσου</span> για να εμφανιστείς στο leaderboard
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add route in App.jsx**

In `src/App.jsx`, add import:
```jsx
import LeaderboardPage from './pages/LeaderboardPage'
```

Inside `<Routes>`, after the `/panellinies` route, add:
```jsx
<Route path="/leaderboard" element={<LeaderboardPage />} />
```

- [ ] **Step 3: Add nav link in Header.jsx**

In `src/components/layout/Header.jsx`, in the desktop nav links array, add:
```jsx
{ href: '/leaderboard', label: 'Leaderboard' },
```

And in the mobile nav drawer array, add:
```jsx
{ href: '/leaderboard', label: 'Leaderboard' },
```

- [ ] **Step 4: Verify in browser**

Navigate to `/leaderboard`. Confirm:
- Trophy header appears
- 7 tabs (Global + 6 grades) visible, horizontally scrollable on mobile
- Empty state shows "Γίνε ο πρώτος!" when no data
- Tab switching works (loading shimmer → content)
- When logged in and not in top 20, sticky "you" row appears at bottom

- [ ] **Step 5: Commit**

```bash
git add src/pages/LeaderboardPage.jsx src/App.jsx src/components/layout/Header.jsx
git commit -m "feat: add leaderboard page with global and per-grade tabs"
```

---

## Task 5: Shareable Progress Card

**Files:**
- Modify: `package.json` (add html2canvas)
- Create: `src/components/profile/ShareCard.jsx`
- Modify: `src/pages/ProfilePage.jsx`

**Interfaces:**
- Consumes: from useStore: `user`, `profile`, `xp`, `streak`, `progress`
- Consumes: `GRADES` from `../../data/curriculum`
- Produces: `<ShareCardModal open={bool} onClose={fn} stats={obj} />` — modal with card preview + share/download

- [ ] **Step 1: Install html2canvas**

```bash
npm install html2canvas
```

Verify it appears in `package.json` under `dependencies`.

- [ ] **Step 2: Create ShareCard.jsx**

Create `src/components/profile/ShareCard.jsx`:

```jsx
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

const MATH_SYMBOLS = ['π', 'Σ', 'Δ', '∫', 'θ', 'φ', '∞', '√']

function CardStories({ stats }) {
  return (
    <div style={{
      width: 360, height: 640,
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      boxSizing: 'border-box',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating math symbols */}
      {MATH_SYMBOLS.map((sym, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: `${2 + (i % 3)}rem`,
          opacity: 0.035,
          color: '#c4b5fd',
          left: `${8 + (i * 12) % 80}%`,
          top: `${5 + (i * 14) % 85}%`,
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900,
          userSelect: 'none',
        }}>{sym}</div>
      ))}

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a78bfa', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
          MathAxion
        </div>
      </div>

      {/* Avatar + Level */}
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(109,40,217,0.4))',
        border: '2px solid rgba(124,58,237,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', fontWeight: 900, color: '#c4b5fd',
        marginBottom: 12,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {stats.initial}
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#a78bfa', letterSpacing: '0.12em', marginBottom: 4 }}>
        LEVEL {stats.level}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: 32 }}>
        {stats.name}
      </div>

      {/* Stats */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { emoji: '★', label: 'XP', value: stats.xp.toLocaleString('el'), color: '#fbbf24' },
          { emoji: '🔥', label: 'Streak', value: `${stats.streak} μέρες`, color: '#fb923c' },
          { emoji: '📚', label: 'Κεφάλαια', value: `${stats.masteredChapters} κατακτημένα`, color: '#34d399' },
        ].map(({ emoji, label, value, color }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{emoji} {label}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Mastery bar */}
      <div style={{ width: '100%', marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>OVERALL MASTERY</span>
          <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 900 }}>{stats.overallMastery}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stats.overallMastery}%`, borderRadius: 99, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
        </div>
      </div>

      {/* Watermark */}
      <div style={{ marginTop: 32, fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
        mathaxion.com
      </div>
    </div>
  )
}

function CardSquare({ stats }) {
  return (
    <div style={{
      width: 360, height: 360,
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
      padding: '28px',
      boxSizing: 'border-box',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Math symbols */}
      {MATH_SYMBOLS.slice(0, 4).map((sym, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: `${3 + (i % 2)}rem`,
          opacity: 0.03,
          color: '#c4b5fd',
          right: `${10 + i * 20}%`,
          top: `${10 + i * 15}%`,
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900,
          userSelect: 'none',
        }}>{sym}</div>
      ))}

      {/* Top row: logo + name + level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(109,40,217,0.4))',
          border: '2px solid rgba(124,58,237,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 900, color: '#c4b5fd',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>{stats.initial}</div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{stats.name}</div>
          <div style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 900, letterSpacing: '0.08em' }}>
            LV.{stats.level} · MATHAXION
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { label: '★ XP', value: stats.xp.toLocaleString('el'), color: '#fbbf24' },
          { label: '🔥 Streak', value: `${stats.streak}d`, color: '#fb923c' },
          { label: '📚', value: `${stats.masteredChapters} ch`, color: '#34d399' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Mastery bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>MASTERY</span>
          <span style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 900 }}>{stats.overallMastery}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stats.overallMastery}%`, borderRadius: 99, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
        </div>
      </div>

      {/* Watermark */}
      <div style={{ position: 'absolute', bottom: 16, right: 20, fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.06em' }}>
        mathaxion.com
      </div>
    </div>
  )
}

export default function ShareCardModal({ open, onClose, stats }) {
  const [format, setFormat] = useState('stories')
  const [capturing, setCapturing] = useState(false)
  const storiesRef = useRef(null)
  const squareRef = useRef(null)

  const capture = async () => {
    const ref = format === 'stories' ? storiesRef : squareRef
    if (!ref.current) return
    setCapturing(true)
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], `mathaxion-progress-${format}.png`, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Η πρόοδός μου στο MathAxion!' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = file.name; a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    } finally {
      setCapturing(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-bold text-white text-sm">Μοιράσου την πρόοδό σου</p>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Format tabs */}
            <div className="flex gap-2 px-5 pt-4">
              {[
                { id: 'stories', label: 'Stories (9:16)' },
                { id: 'square', label: 'Square (1:1)' },
              ].map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: format === f.id ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.05)',
                    color: format === f.id ? 'white' : 'var(--fg-2)',
                    border: 'none',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Card preview */}
            <div className="px-5 py-4 flex justify-center overflow-hidden">
              <div style={{ transform: format === 'stories' ? 'scale(0.58)' : 'scale(0.72)', transformOrigin: 'top center' }}>
                {format === 'stories'
                  ? <div ref={storiesRef}><CardStories stats={stats} /></div>
                  : <div ref={squareRef}><CardSquare stats={stats} /></div>
                }
              </div>
            </div>

            {/* Action */}
            <div className="px-5 pb-5">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={capture} disabled={capturing}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                {capturing
                  ? 'Δημιουργία...'
                  : navigator.canShare ? <><Share2 size={15} />Κοινοποίηση</> : <><Download size={15} />Λήψη PNG</>
                }
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Add share button + modal to ProfilePage**

In `src/pages/ProfilePage.jsx`, add imports:
```jsx
import ShareCardModal from '../components/profile/ShareCard'
import { GRADES } from '../data/curriculum'
```

Add state near the top of the ProfilePage component (alongside existing state):
```jsx
const [shareOpen, setShareOpen] = useState(false)
```

Compute stats before the return:
```jsx
const overallMastery = (() => {
  const allChapters = GRADES.flatMap(g => g.chapters.map(ch => {
    const p = progress[`${g.id}/${ch.id}`]
    return Math.min(100, (p?.completedExercises || 0) * 10)
  }))
  if (allChapters.length === 0) return 0
  return Math.round(allChapters.reduce((a, b) => a + b, 0) / allChapters.length)
})()

const shareStats = {
  name: displayName,
  initial: displayName[0].toUpperCase(),
  level,
  xp,
  streak: streak.current,
  masteredChapters,
  overallMastery,
}
```

After the stats grid section, add the share button:
```jsx
{/* Share button */}
<motion.button
  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
  onClick={() => setShareOpen(true)}
  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--fg-2)' }}
  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.color = 'white' }}
  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--fg-2)' }}
>
  <Share2 size={15} />Μοιράσου την πρόοδό σου
</motion.button>

<ShareCardModal open={shareOpen} onClose={() => setShareOpen(false)} stats={shareStats} />
```

Also add `Share2` to the lucide-react import at the top of ProfilePage.

- [ ] **Step 4: Verify in browser**

Navigate to `/profile`. Confirm:
- "Μοιράσου την πρόοδό σου" button appears below stats
- Clicking opens modal with card preview
- Format toggle between Stories and Square works
- "Λήψη PNG" downloads a file (or native share sheet opens on mobile)
- The card contains correct name, level, XP, streak, mastery %

- [ ] **Step 5: Build check**

```bash
npm run build
```
Expected: `✓ built` with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/ShareCard.jsx src/pages/ProfilePage.jsx package.json package-lock.json
git commit -m "feat: shareable progress card (Stories + Square) with html2canvas"
```

---

## Final Step: Push

```bash
git push origin master
```

Vercel auto-deploys on push. Confirm deploy succeeds in Vercel dashboard.
