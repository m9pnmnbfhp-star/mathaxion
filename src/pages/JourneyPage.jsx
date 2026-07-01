import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPin, Flame, BookOpen, Star, Trophy, Zap, TrendingUp } from 'lucide-react'
import { GRADES, DIMOTIKO_GRADES, getGrade } from '../data/curriculum'
import useStore from '../store/useStore'

const MONTH_GR = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος',
                  'Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος']

const TYPE_META = {
  started:          { color: '#7c3aed', Icon: MapPin   },
  chapter_complete: { color: '#10b981', Icon: BookOpen  },
  level_up:         { color: '#f59e0b', Icon: Star      },
  streak:           { color: '#ef4444', Icon: Flame     },
  grade_complete:   { color: '#a78bfa', Icon: Trophy    },
  weekly_record:    { color: '#3b82f6', Icon: TrendingUp },
  xp_milestone:     { color: '#06b6d4', Icon: Zap       },
}

function monthKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function monthLabel(key) {
  const [y, m] = key.split('-')
  return `${MONTH_GR[parseInt(m) - 1]} ${y}`
}

// Derive historical milestones from persisted progress
function deriveFromProgress(progress, milestones) {
  const existing = new Set(milestones.map(m => m.key))
  const derived = []
  const allGrades = [...DIMOTIKO_GRADES, ...GRADES]

  for (const [key, p] of Object.entries(progress)) {
    if ((p.completedExercises || 0) < 8) continue
    const mKey = `chapter-${key}`
    if (existing.has(mKey)) continue
    const [gradeId, chapterId] = key.split('/')
    const grade = allGrades.find(g => g.id === gradeId)
    const chapter = grade?.chapters?.find(c => c.id === chapterId)
    if (!chapter) continue
    derived.push({
      type: 'chapter_complete',
      key: mKey,
      ts: p.updatedAt || Date.now(),
      title: `Ολοκλήρωσες "${chapter.title}"`,
      emoji: chapter.emoji || '📚',
      desc: grade?.label || '',
    })
  }
  return derived
}

function groupByMonth(events) {
  const map = new Map()
  for (const e of events) {
    const k = monthKey(e.ts)
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(e)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, label: monthLabel(key), items: items.sort((a, b) => a.ts - b.ts) }))
}

function TimelineCard({ event, delay }) {
  const meta = TYPE_META[event.type] || TYPE_META.chapter_complete
  const date = new Date(event.ts)
  const dateStr = `${date.getDate()} ${MONTH_GR[date.getMonth()].slice(0, 3)}.`

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45, delay }}
      className="flex gap-4 group"
    >
      {/* Dot + line */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 z-10"
          style={{ background: `${meta.color}18`, border: `1.5px solid ${meta.color}35`, boxShadow: `0 0 12px ${meta.color}20` }}>
          {event.emoji}
        </div>
        <div className="w-px flex-1 mt-2" style={{ background: `linear-gradient(to bottom, ${meta.color}30, transparent)` }} />
      </div>

      {/* Card */}
      <div className="pb-6 flex-1">
        <div className="rounded-2xl p-4 transition-all group-hover:border-opacity-50"
          style={{ background: '#14141e', border: `1px solid ${meta.color}18` }}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-black text-white leading-tight">{event.title}</p>
            <span className="text-[10px] font-bold shrink-0 mt-0.5" style={{ color: 'var(--fg-3)' }}>{dateStr}</span>
          </div>
          {event.desc && (
            <p className="text-xs" style={{ color: 'var(--fg-3)' }}>{event.desc}</p>
          )}
          {event.type === 'level_up' && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold"
              style={{ background: `${meta.color}15`, color: meta.color }}>
              <Star size={10} /> Level {event.level}
            </div>
          )}
          {event.type === 'streak' && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold"
              style={{ background: `${meta.color}15`, color: meta.color }}>
              <Flame size={10} /> {event.days} μέρες streak
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function EmptyJourney({ navigate }) {
  return (
    <div className="text-center py-20 px-6">
      <div className="text-6xl mb-5">🗺️</div>
      <h2 className="font-display font-black text-2xl text-white mb-3">Το ταξίδι σου ξεκινά εδώ</h2>
      <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--fg-3)' }}>
        Λύσε ασκήσεις, ολοκλήρωσε κεφάλαια και ανέβα επίπεδα — κάθε βήμα θα εμφανίζεται εδώ.
      </p>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-2xl font-bold text-sm text-white"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
        Ξεκίνα τώρα →
      </motion.button>
    </div>
  )
}

export default function JourneyPage() {
  const { user, milestones, progress, streak, xp, onboarding, profile } = useStore()
  const navigate = useNavigate()

  const allEvents = useMemo(() => {
    const derived = deriveFromProgress(progress, milestones)
    const all = [...milestones, ...derived]

    // Seed "started" event from profile or onboarding
    const hasStarted = all.some(m => m.type === 'started')
    if (!hasStarted) {
      const ts = profile?.created_at ? new Date(profile.created_at).getTime() : Date.now()
      all.push({ type: 'started', key: 'started', ts, title: 'Ξεκίνησες το ταξίδι σου!', emoji: '🚀', desc: 'Πρώτη σύνδεση στο MathAxion' })
    }

    return all.sort((a, b) => a.ts - b.ts)
  }, [milestones, progress, profile])

  const grouped = useMemo(() => groupByMonth(allEvents), [allEvents])

  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 8)) + 1
  const completedChapters = allEvents.filter(e => e.type === 'chapter_complete').length
  const name = profile?.display_name || user?.email?.split('@')[0] || 'Μαθητή'

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">Συνδέσου για να δεις το ταξίδι σου.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
        className="mb-8">
        <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: '#7c3aed' }}>Το Ταξίδι Μου</p>
        <h1 className="font-display font-black text-3xl text-white mb-3">{name}</h1>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '⭐', val: `Lv.${level}`, label: 'Επίπεδο' },
            { emoji: '📚', val: completedChapters, label: 'Κεφάλαια' },
            { emoji: '🔥', val: `${streak.current} μ.`, label: 'Streak' },
          ].map(({ emoji, val, label }) => (
            <div key={label} className="text-center p-3 rounded-2xl"
              style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-lg mb-0.5">{emoji}</div>
              <div className="font-black text-white text-base">{val}</div>
              <div className="text-[10px]" style={{ color: 'var(--fg-3)' }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <EmptyJourney navigate={navigate} />
      ) : (
        <div>
          {grouped.map(({ key, label, items }) => (
            <div key={key} className="mb-2">
              {/* Month header */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-4">
                <div className="text-xs font-black tracking-widest uppercase" style={{ color: '#7c3aed' }}>{label}</div>
                <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,0.15)' }} />
              </motion.div>

              {/* Events */}
              <div>
                {items.map((event, i) => (
                  <TimelineCard key={event.key || event.ts} event={event} delay={i * 0.06} />
                ))}
              </div>
            </div>
          ))}

          {/* End cap */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 pt-2 pb-12">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1.5px dashed rgba(124,58,237,0.3)' }}>
              ✨
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--fg-3)' }}>
              Η ιστορία σου συνεχίζεται...
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
