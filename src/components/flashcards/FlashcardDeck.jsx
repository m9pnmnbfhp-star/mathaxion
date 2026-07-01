import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import Button from '../ui/Button'
import { generateFlashcards } from '../../lib/anthropic'
import toast from 'react-hot-toast'

export default function FlashcardDeck({ grade, chapter, topic }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(new Set())
  const [unknown, setUnknown] = useState(new Set())

  const loadCards = async () => {
    setLoading(true)
    try {
      const raw = await generateFlashcards(topic, chapter.title, grade)
      const json = extractJSONArray(raw)
      if (!json.length) {
        console.error('Flashcard parse failed. Raw response:', raw)
        throw new Error('Αδύνατη ανάλυση απάντησης AI')
      }
      setCards(json)
      setCurrentIndex(0)
      setFlipped(false)
      setKnown(new Set())
      setUnknown(new Set())
    } catch (e) {
      toast.error('Σφάλμα φόρτωσης flashcards')
      console.error('Flashcard error:', e)
    } finally {
      setLoading(false)
    }
  }

  const shuffle = () => {
    setCards(prev => [...prev].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setFlipped(false)
  }

  const current = cards[currentIndex]

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="shimmer h-3.5 rounded-full w-20" />
          <div className="shimmer h-3.5 rounded-full w-14" />
          <div className="shimmer h-3.5 rounded-full w-20" />
        </div>
        <div className="rounded-2xl p-8 space-y-4 min-h-[200px] flex flex-col items-center justify-center"
          style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>
          <div className="shimmer h-3 rounded-full w-16" />
          <div className="shimmer h-5 rounded-full w-3/4 mt-3" />
          <div className="shimmer h-5 rounded-full w-1/2" />
        </div>
        <div className="flex justify-center gap-3">
          <div className="shimmer h-11 rounded-2xl w-32" />
          <div className="shimmer h-11 rounded-2xl w-32" />
        </div>
      </div>
    )
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-5xl">🃏</div>
        <p className="text-slate-400 text-sm text-center">
          Δημιουργία AI flashcards για το θέμα<br />
          <strong className="text-white">{topic}</strong>
        </p>
        <p className="text-xs text-slate-500">Τα cards δημιουργούνται κάθε φορά — ποτέ τα ίδια!</p>
        <Button onClick={loadCards} icon={<span>🃏</span>}>
          Δημιουργία Flashcards
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="text-emerald-400 font-medium">✓ {known.size} γνωστά</span>
        <span>{currentIndex + 1} / {cards.length}</span>
        <span className="text-red-400 font-medium">✗ {unknown.size} άγνωστα</span>
      </div>

      {/* Card */}
      <div className="flex justify-center">
        <div
          className="w-full max-w-md cursor-pointer perspective-1000"
          onClick={() => setFlipped(!flipped)}
          style={{ perspective: '1000px' }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative"
          >
            {/* Front */}
            <div
              className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center space-y-3"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ερώτηση</div>
              <p className="text-white text-lg font-medium leading-relaxed">{current.front}</p>
              <div className="text-xs text-slate-600 mt-4">Πάτα για να δεις την απάντηση</div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-violet-600/10 border border-violet-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="text-xs text-violet-400 font-medium uppercase tracking-wider">Απάντηση</div>
              <p className="text-white text-base leading-relaxed">{current.back}</p>
              {current.example && (
                <div className="text-sm text-amber-300 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 mt-2">
                  📝 {current.example}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 justify-center"
        >
          <Button
            variant="danger"
            onClick={() => {
              setUnknown(prev => new Set([...prev, currentIndex]))
              setKnown(prev => { const n = new Set(prev); n.delete(currentIndex); return n })
              setFlipped(false)
              if (currentIndex < cards.length - 1) setCurrentIndex(prev => prev + 1)
            }}
          >
            ✗ Δεν το ξέρω
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setKnown(prev => new Set([...prev, currentIndex]))
              setUnknown(prev => { const n = new Set(prev); n.delete(currentIndex); return n })
              setFlipped(false)
              if (currentIndex < cards.length - 1) setCurrentIndex(prev => prev + 1)
            }}
          >
            ✓ Το ξέρω!
          </Button>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setFlipped(false) }}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2">
          <button
            onClick={shuffle}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={loadCards}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <button
          onClick={() => { setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)); setFlipped(false) }}
          disabled={currentIndex === cards.length - 1}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Session complete */}
      <AnimatePresence>
        {known.size + unknown.size === cards.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2"
          >
            <div className="text-2xl">🎯</div>
            <p className="text-emerald-300 font-semibold">Ολοκλήρωσες τη συνεδρία!</p>
            <p className="text-sm text-slate-400">
              Γνωστά: {known.size} | Για επανάληψη: {unknown.size}
            </p>
            <Button size="sm" onClick={loadCards} icon={<RefreshCw size={14} />}>
              Νέα cards
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function extractJSONArray(text) {
  try {
    // Strip markdown code fences if present
    const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()
    const match = stripped.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch { /* fall through */ }
  return []
}
