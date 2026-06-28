import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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

  const [activeTab, setActiveTab] = useState('theory')
  const [selectedConcept, setSelectedConcept] = useState(chapter?.concepts?.[0] || '')
  const [simplicity, setSimplicity] = useState(2)
  const [theoryContent, setTheoryContent] = useState(null)
  const [theoryLoading, setTheoryLoading] = useState(false)
  const { user, isPro, setAuthModal, setUpgradeModal, addXP, updateStreak } = useStore()

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

  const loadTheory = async (concept = selectedConcept) => {
    if (!user) { setAuthModal(true); return }
    if (!isPro) { setUpgradeModal(true); return }
    setTheoryLoading(true)
    setTheoryContent(null)
    try {
      const result = await explainTheory(concept, grade, simplicity, chapter.title)
      setTheoryContent(result)
      addXP(5)
      updateStreak()
    } catch {
      toast.error('Σφάλμα φόρτωσης θεωρίας')
    } finally {
      setTheoryLoading(false)
    }
  }

  const reloadTheory = async () => {
    if (!theoryContent) return
    setTheoryLoading(true)
    try {
      const result = await reExplain(selectedConcept, chapter.title, grade, theoryContent)
      setTheoryContent(result)
    } catch {
      toast.error('Σφάλμα')
    } finally {
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
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span style={{ color: grade.color }}>{grade.label}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={10} />{chapter.estimatedHours}h</span>
              <span>·</span>
              <span>{chapter.concepts.length} θέματα</span>
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
            />
          )}
          {activeTab === 'exercises' && (
            <ExerciseSystem grade={grade} chapter={chapter} topic={selectedConcept} onXPGained={(xp) => { addXP(xp); updateStreak() }} />
          )}
          {activeTab === 'flashcards' && (
            <FlashcardDeck grade={grade} chapter={chapter} topic={selectedConcept} />
          )}
          {activeTab === 'tutor' && <PythagorasTutor grade={grade} topic={selectedConcept} />}
          {activeTab === 'panic' && <PanicMode chapter={chapter} topic={selectedConcept} />}
          {activeTab === 'photo' && <PhotoSolver />}
          {activeTab === 'battle' && <StudyBattle grade={grade} chapter={chapter} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TheoryTab({ chapter, selectedConcept, setSelectedConcept, simplicity, setSimplicity, content, loading, onLoad, onReload }) {
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
          <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl flex items-start gap-3">
            <Sparkles size={16} className="text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-violet-300 font-semibold mb-1">Δεν κατάλαβες;</p>
              <p className="text-xs text-slate-400 mb-3">Το Axi AI θα εξηγήσει με εντελώς νέα παραδείγματα.</p>
              <Button variant="outline" size="sm" onClick={onReload} loading={loading} icon={<RefreshCw size={14} />}>
                Εξήγησε αλλιώς
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
