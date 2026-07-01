import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, Sparkles, BookOpen, Pencil, Layers, Bot, Zap, Camera, Swords, Search, Clock } from 'lucide-react'
import { getGrade, getChapter, SIMPLICITY_LABELS, SIMPLICITY_DESCRIPTIONS } from '../data/curriculum'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Slider from '../components/ui/Slider'
import AIResponse from '../components/ui/AIResponse'
import ExerciseSystem from '../components/exercises/ExerciseSystem'
import PythagorasTutor from '../components/tutor/PythagorasTutor'
import FlashcardDeck from '../components/flashcards/FlashcardDeck'
import PanicMode from '../components/panic/PanicMode'
import PhotoSolver from '../components/photosolver/PhotoSolver'
import StudyBattle from '../components/battles/StudyBattle'
import { explainTheory, reExplain } from '../lib/anthropic'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'theory',    label: 'Θεωρία',     icon: BookOpen, color: '#7c3aed' },
  { id: 'exercises', label: 'Ασκήσεις',   icon: Pencil,   color: '#10b981' },
  { id: 'flashcards',label: 'Flashcards', icon: Layers,   color: '#3b82f6' },
  { id: 'tutor',     label: 'Axi AI',     icon: Bot,      color: '#8b5cf6' },
  { id: 'panic',     label: 'Panic Mode', icon: Zap,      color: '#ef4444' },
  { id: 'photo',     label: 'Photo',      icon: Camera,   color: '#06b6d4' },
  { id: 'battle',    label: 'Battle',     icon: Swords,   color: '#ec4899' },
]

export default function ChapterPage() {
  const { gradeId, chapterId } = useParams()
  const grade = getGrade(gradeId)
  const chapter = getChapter(gradeId, chapterId)

  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'theory')
  const [selectedConcept, setSelectedConcept] = useState(chapter?.concepts?.[0] || '')
  const { user, isPro, setAuthModal, setUpgradeModal, addXP, updateStreak, onboarding, setLastStudied, recordStruggle } = useStore()

  useEffect(() => {
    if (grade && chapter) {
      setLastStudied({ gradeId: grade.id, chapterId: chapter.id, title: chapter.title, emoji: chapter.emoji, gradeName: grade.label })
    }
  }, [grade?.id, chapter?.id])
  const confidenceSimplicity = { love: 3, ok: 2, struggle: 1, hard: 0 }
  const [simplicity, setSimplicity] = useState(confidenceSimplicity[onboarding?.confidence] ?? 2)
  const [theoryContent, setTheoryContent] = useState(null)
  const [theoryLoading, setTheoryLoading] = useState(false)
  const [theorySimplicity, setTheorySimplicity] = useState(simplicity)

  if (!grade || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Search size={48} className="text-slate-700 mb-4" />
        <p className="text-white font-bold text-xl">Κεφάλαιο δεν βρέθηκε</p>
        <Link to="/" className="mt-4 text-violet-400 hover:text-violet-300 transition-colors">Αρχική</Link>
      </div>
    )
  }

  const activeTabData = TABS.find(t => t.id === activeTab)

  const loadTheory = async (concept = selectedConcept, atSimplicity = simplicity) => {
    if (!user) { setAuthModal(true); return }
    if (!isPro) { setUpgradeModal(true); return }
    setTheoryLoading(true)
    setTheoryContent(null)
    setTheorySimplicity(atSimplicity)
    try {
      await explainTheory(concept, grade, atSimplicity, chapter.title, (text) => {
        setTheoryContent(text)
        setTheoryLoading(false)
      })
      addXP(5)
      updateStreak()
    } catch {
      toast.error('Σφάλμα φόρτωσης θεωρίας')
      setTheoryLoading(false)
    }
  }

  const reloadTheory = async () => {
    if (!theoryContent) return
    setTheoryLoading(true)
    try {
      await reExplain(selectedConcept, chapter.title, grade, theoryContent, (text) => {
        setTheoryContent(text)
        setTheoryLoading(false)
      })
    } catch {
      toast.error('Σφάλμα')
      setTheoryLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
        <Link to="/" className="hover:text-slate-300 transition-colors">Αρχική</Link>
        <span>/</span>
        <Link to={`/grade/${grade.id}`} className="hover:text-slate-300 transition-colors">{grade.label}</Link>
        <span>/</span>
        <span className="text-slate-300 font-medium">{chapter.title}</span>
      </div>

      {/* Chapter header */}
      <div className="flex items-start justify-between mb-6 p-5 bg-[#16161f] rounded-2xl border border-[#2a2a3a]">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${grade.color}18`, border: `2px solid ${grade.color}30` }}
          >
            {chapter.emoji}
          </div>
          <div>
            <h1 className="text-xl font-black text-white mb-0.5">{chapter.title}</h1>
            <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500">
              <span style={{ color: grade.color }}>{grade.label}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={10} />{chapter.estimatedHours}h</span>
              <span>·</span>
              <span>{chapter.concepts.length} θέματα</span>
              {onboarding?.goal === 'panellinies' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                  📋 Πανελλήνιες
                </span>
              )}
              {onboarding?.goal === 'tests' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  📝 Για διαγωνίσματα
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          to={`/grade/${grade.id}`}
          aria-label="Πίσω στην τάξη"
          className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-[#16161f] rounded-2xl border border-[#2a2a3a] mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive ? 'text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
              style={isActive ? { background: `${tab.color}30`, boxShadow: `0 0 16px ${tab.color}25` } : {}}
            >
              <tab.icon size={14} style={isActive ? { color: tab.color } : {}} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active tab indicator line */}
      {activeTabData && (
        <div className="h-0.5 mb-6 rounded-full transition-all duration-300" style={{ background: `linear-gradient(90deg, ${activeTabData.color}60, transparent)` }} />
      )}

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {activeTab === 'theory' && (
            <TheoryTab
              chapter={chapter}
              selectedConcept={selectedConcept}
              setSelectedConcept={setSelectedConcept}
              simplicity={simplicity}
              setSimplicity={setSimplicity}
              content={theoryContent}
              loading={theoryLoading}
              onLoad={loadTheory}
              onReload={reloadTheory}
              theorySimplicity={theorySimplicity}
              addXP={addXP}
              recordStruggle={recordStruggle}
              gradeId={grade?.id}
              chapterId={chapter?.id}
            />
          )}
          {activeTab === 'exercises' && (
            <ExerciseSystem grade={grade} chapter={chapter} topic={selectedConcept} onXPGained={(xp) => { addXP(xp); updateStreak() }} />
          )}
          {activeTab === 'flashcards' && (
            <FlashcardDeck grade={grade} chapter={chapter} topic={selectedConcept} />
          )}
          {activeTab === 'tutor' && <PythagorasTutor grade={grade} topic={selectedConcept} />}
          {activeTab === 'panic' && <PanicMode chapter={chapter} topic={selectedConcept} grade={grade} />}
          {activeTab === 'photo' && <PhotoSolver />}
          {activeTab === 'battle' && <StudyBattle grade={grade} chapter={chapter} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ExplanationFeedback({ onLoad, onReload, simplicity, theorySimplicity, selectedConcept, addXP, recordStruggle, gradeId, chapterId }) {
  const [state, setState] = useState(null) // null | 'good' | 'partial' | 'bad'

  const handleGood = () => {
    setState('good')
    addXP(10)
  }

  const handlePartial = () => setState('partial')

  const handleBad = () => {
    setState('bad')
    recordStruggle(selectedConcept, gradeId, chapterId)
    const lower = Math.max(0, theorySimplicity - 1)
    onLoad(selectedConcept, lower)
  }

  if (state === 'good') return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 p-4 rounded-2xl"
      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
      <span className="text-xl">🎉</span>
      <div>
        <p className="text-sm font-bold text-emerald-400">Τέλεια! +10 XP</p>
        <p className="text-xs" style={{ color: 'var(--fg-3)' }}>Συνέχισε με τις ασκήσεις για να εδραιώσεις τη γνώση.</p>
      </div>
    </motion.div>
  )

  if (state === 'partial') return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-2xl space-y-3"
      style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <p className="text-sm font-bold text-amber-400">Θέλεις πιο απλή εξήγηση;</p>
      <p className="text-xs" style={{ color: 'var(--fg-3)' }}>Θα ξαναεξηγήσω με πιο καθημερινά παραδείγματα.</p>
      <div className="flex gap-2">
        <button onClick={() => { setState(null); onLoad(selectedConcept, Math.max(0, theorySimplicity - 1)) }}
          className="text-xs font-bold px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
          Ναι, πιο απλά →
        </button>
        <button onClick={onReload}
          className="text-xs px-3 py-1.5 rounded-xl"
          style={{ color: 'var(--fg-3)', border: '1px solid rgba(255,255,255,0.07)' }}>
          Εξήγησε αλλιώς
        </button>
      </div>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
      className="p-4 rounded-2xl"
      style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-sm font-semibold text-white mb-3">😊 Σε βοήθησε η εξήγηση;</p>
      <div className="flex gap-2">
        {[
          { label: '👍 Ναι!', fn: handleGood, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
          { label: '🤔 Λίγο', fn: handlePartial, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
          { label: '😕 Όχι', fn: handleBad, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
        ].map(({ label, fn, color, bg, border }) => (
          <motion.button key={label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fn}
            className="flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: bg, color, border: `1px solid ${border}` }}>
            {label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function TheoryTab({ chapter, selectedConcept, setSelectedConcept, simplicity, setSimplicity, content, loading, onLoad, onReload, theorySimplicity, addXP, recordStruggle, gradeId, chapterId }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left panel */}
      <div className="space-y-4">
        <div className="bg-[#16161f] rounded-2xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a3a] flex items-center gap-2">
            <BookOpen size={13} className="text-violet-400" />
            <p className="text-sm font-semibold text-slate-300">Θέματα</p>
          </div>
          <div className="p-2 space-y-1">
            {chapter.concepts.map((concept) => (
              <button
                key={concept}
                onClick={() => { setSelectedConcept(concept); onLoad(concept) }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                  selectedConcept === concept
                    ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {concept}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#16161f] rounded-2xl border border-[#2a2a3a] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-300">Επίπεδο εξήγησης</p>
            <Badge color="violet" size="xs">{SIMPLICITY_LABELS[simplicity]}</Badge>
          </div>
          <Slider value={simplicity} onChange={setSimplicity} min={0} max={4} labels={['10χρονο', 'Απλά', 'Κανονικά', 'Αναλυτικά', 'Ορολογία']} />
          <p className="text-[11px] text-slate-600 leading-relaxed">{SIMPLICITY_DESCRIPTIONS[simplicity]}</p>
        </div>

        <Button className="w-full" onClick={() => onLoad(selectedConcept)} loading={loading} icon={!loading && <Sparkles size={16} />} size="lg">
          {content ? 'Ανανέωση' : `Εξήγησε: ${selectedConcept}`}
        </Button>
      </div>

      {/* Right panel */}
      <div className="lg:col-span-2 space-y-4">
        {!content && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#16161f] rounded-2xl border border-dashed border-[#2a2a3a]">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-3xl mb-5">
              {chapter.emoji}
            </div>
            <p className="font-semibold text-white mb-2">Διάλεξε θέμα για να ξεκινήσεις</p>
            <p className="text-slate-500 text-sm text-center max-w-xs leading-relaxed">
              Το Axi AI εξηγεί στο επίπεδο που εσύ ορίζεις — από «απλά» μέχρι πλήρη ορολογία.
            </p>
          </div>
        )}

        {(loading || content) && (
          <div className="bg-[#16161f] rounded-2xl border border-[#2a2a3a] p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a3a]">
              <div>
                <h3 className="font-bold text-white">{selectedConcept}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{SIMPLICITY_LABELS[simplicity]}</p>
              </div>
              {content && (
                <Button variant="ghost" size="sm" onClick={onReload} loading={loading} icon={!loading && <RefreshCw size={14} />} title="Εξήγησε διαφορετικά">
                  <span className="hidden sm:inline text-xs">Δεν κατάλαβα</span>
                </Button>
              )}
            </div>
            <AIResponse text={content} loading={loading} />
          </div>
        )}

        {content && !loading && (
          <ExplanationFeedback
            key={content.slice(0, 40)}
            onLoad={onLoad}
            onReload={onReload}
            simplicity={simplicity}
            theorySimplicity={theorySimplicity}
            selectedConcept={selectedConcept}
            addXP={addXP}
            recordStruggle={recordStruggle}
            gradeId={gradeId}
            chapterId={chapterId}
          />
        )}
      </div>
    </div>
  )
}
