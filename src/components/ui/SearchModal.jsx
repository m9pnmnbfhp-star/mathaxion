import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, Pencil, Layers, Bot, Zap, X, ArrowRight } from 'lucide-react'
import { ALL_GRADES } from '../../data/curriculum'

const TABS = [
  { id: 'theory',     label: 'Θεωρία',     icon: BookOpen, color: '#7c3aed' },
  { id: 'exercises',  label: 'Ασκήσεις',   icon: Pencil,   color: '#10b981' },
  { id: 'flashcards', label: 'Flashcards',  icon: Layers,   color: '#3b82f6' },
  { id: 'tutor',      label: 'Axi AI',      icon: Bot,      color: '#8b5cf6' },
  { id: 'panic',      label: 'Panic Mode',  icon: Zap,      color: '#ef4444' },
]

function buildIndex() {
  const items = []
  for (const grade of ALL_GRADES()) {
    if (grade.comingSoon) continue
    for (const chapter of (grade.chapters || [])) {
      // Chapter-level entry
      items.push({
        type: 'chapter',
        label: chapter.title,
        sub: grade.label,
        emoji: chapter.emoji,
        color: grade.color,
        gradeId: grade.id,
        chapterId: chapter.id,
        searchText: `${chapter.title} ${grade.label}`.toLowerCase(),
      })
      // Concept-level entries
      for (const concept of (chapter.concepts || [])) {
        items.push({
          type: 'concept',
          label: concept,
          sub: `${chapter.title} — ${grade.label}`,
          emoji: chapter.emoji,
          color: grade.color,
          gradeId: grade.id,
          chapterId: chapter.id,
          concept,
          searchText: `${concept} ${chapter.title} ${grade.label}`.toLowerCase(),
        })
      }
    }
  }
  return items
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const index = useMemo(() => buildIndex(), [])

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open ? onClose() : null }
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, flatResults.length - 1))
      if (e.key === 'ArrowUp')   setSelected(s => Math.max(s - 1, 0))
      if (e.key === 'Enter' && flatResults[selected]) go(flatResults[selected], 'theory')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, selected])

  const q = query.trim().toLowerCase()
  const filtered = q.length < 1
    ? []
    : index.filter(item => item.searchText.includes(q)).slice(0, 8)

  // Group: chapters first, then concepts
  const chapters  = filtered.filter(r => r.type === 'chapter')
  const concepts  = filtered.filter(r => r.type === 'concept')
  const flatResults = [...chapters, ...concepts]

  const go = (result, tab = 'theory') => {
    onClose()
    const base = `/grade/${result.gradeId}/chapter/${result.chapterId}`
    navigate(tab === 'theory' ? base : `${base}?tab=${tab}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-xl rounded-3xl overflow-hidden"
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
              <Search size={18} className="text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0) }}
                placeholder="Ψάξε θέμα, κεφάλαιο..."
                className="flex-1 bg-transparent text-white placeholder-slate-600 text-base outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-600 hover:text-slate-400 transition-colors">
                  <X size={15} />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-slate-600"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {q.length < 1 && (
                <div className="px-5 py-8 text-center">
                  <p className="text-slate-600 text-sm">Άρχισε να γράφεις για αναζήτηση...</p>
                  <p className="text-slate-700 text-xs mt-1">Βρες θεωρία, ασκήσεις, flashcards και περισσότερα</p>
                </div>
              )}

              {q.length >= 1 && flatResults.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <p className="text-slate-500 text-sm">Δεν βρέθηκε κάτι για "{query}"</p>
                  <p className="text-slate-700 text-xs mt-1">Δοκίμασε άλλη λέξη</p>
                </div>
              )}

              {flatResults.length > 0 && (
                <div className="p-2">
                  {flatResults.map((result, idx) => (
                    <div key={`${result.gradeId}-${result.chapterId}-${result.label}`}
                      className={`rounded-2xl mb-1 transition-all ${selected === idx ? 'bg-white/5' : ''}`}
                      onMouseEnter={() => setSelected(idx)}>

                      {/* Result header */}
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <span className="text-xl shrink-0">{result.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{result.label}</p>
                          <p className="text-[11px] truncate" style={{ color: 'var(--fg-3)' }}>{result.sub}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: `${result.color}18`, color: result.color, border: `1px solid ${result.color}25` }}>
                          {result.type === 'chapter' ? 'Κεφάλαιο' : 'Έννοια'}
                        </span>
                      </div>

                      {/* Quick-nav tabs */}
                      <div className="flex gap-1 px-3 pb-2.5 flex-wrap">
                        {TABS.map(tab => (
                          <button key={tab.id}
                            onClick={() => go(result, tab.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                            style={{ background: `${tab.color}12`, color: tab.color, border: `1px solid ${tab.color}20` }}>
                            <tab.icon size={10} />
                            {tab.label}
                          </button>
                        ))}
                        <button
                          onClick={() => go(result, 'theory')}
                          className="flex items-center gap-1 ml-auto px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-500 hover:text-white transition-colors">
                          Άνοιγμα <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-3 border-t border-white/5">
              <span className="text-[10px] text-slate-700">↑↓ πλοήγηση</span>
              <span className="text-[10px] text-slate-700">↵ άνοιγμα</span>
              <span className="text-[10px] text-slate-700 ml-auto">ESC κλείσιμο</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
