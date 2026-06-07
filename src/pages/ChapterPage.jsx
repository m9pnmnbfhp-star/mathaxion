import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
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
  { id: 'theory', label: 'Θεωρία', icon: '📖' },
  { id: 'exercises', label: 'Ασκήσεις', icon: '✏️' },
  { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
  { id: 'tutor', label: 'Axi AI', icon: '🤖' },
  { id: 'panic', label: 'Panic Mode', icon: '⚡' },
  { id: 'photo', label: 'Photo', icon: '📷' },
  { id: 'battle', label: 'Battle', icon: '⚔️' },
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
        <p className="text-6xl mb-4">🔍</p>
        <p className="text-white font-bold text-xl">Κεφάλαιο δεν βρέθηκε</p>
        <Link to="/" className="mt-4 text-violet-400">Αρχική</Link>
      </div>
    )
  }

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
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">Αρχική</Link>
        <span>/</span>
        <Link to={`/grade/${grade.id}`} className="hover:text-white transition-colors">{grade.label}</Link>
        <span>/</span>
        <span className="text-white">{chapter.title}</span>
      </div>

      {/* Chapter header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1c1c28] border border-[#2a2a3a] flex items-center justify-center text-2xl">
            {chapter.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{chapter.title}</h1>
            <p className="text-slate-400 text-sm">{grade.label} · {chapter.estimatedHours}h εκτιμώμενος χρόνος</p>
          </div>
        </div>
        <Link
          to={`/grade/${grade.id}`}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-[#16161f] rounded-2xl border border-[#2a2a3a] mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
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
            <ExerciseSystem
              grade={grade}
              chapter={chapter}
              topic={selectedConcept}
              onXPGained={(xp) => { addXP(xp); updateStreak() }}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardDeck grade={grade} chapter={chapter} topic={selectedConcept} />
          )}

          {activeTab === 'tutor' && (
            <PythagorasTutor grade={grade} topic={selectedConcept} />
          )}

          {activeTab === 'panic' && (
            <PanicMode chapter={chapter} topic={selectedConcept} />
          )}

          {activeTab === 'photo' && <PhotoSolver />}

          {activeTab === 'battle' && (
            <StudyBattle grade={grade} chapter={chapter} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TheoryTab({ chapter, selectedConcept, setSelectedConcept, simplicity, setSimplicity, content, loading, onLoad, onReload }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Concept selector + controls */}
      <div className="space-y-4">
        {/* Concept list */}
        <div className="bg-[#16161f] rounded-2xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a3a]">
            <p className="text-sm font-medium text-slate-300">Θέματα κεφαλαίου</p>
          </div>
          <div className="p-2 space-y-1">
            {chapter.concepts.map((concept) => (
              <button
                key={concept}
                onClick={() => {
                  setSelectedConcept(concept)
                  onLoad(concept)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                  selectedConcept === concept
                    ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {concept}
              </button>
            ))}
          </div>
        </div>

        {/* Simplicity slider */}
        <div className="bg-[#16161f] rounded-2xl border border-[#2a2a3a] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">Επίπεδο εξήγησης</p>
            <Badge color="violet" size="xs">{SIMPLICITY_LABELS[simplicity]}</Badge>
          </div>
          <Slider
            value={simplicity}
            onChange={setSimplicity}
            min={0}
            max={4}
            labels={['10χρονο', 'Απλά', 'Κανονικά', 'Αναλυτικά', 'Ορολογία']}
          />
          <p className="text-[11px] text-slate-600">{SIMPLICITY_DESCRIPTIONS[simplicity]}</p>
        </div>

        {/* Load button */}
        <Button
          className="w-full"
          onClick={() => onLoad(selectedConcept)}
          loading={loading}
          icon={!loading && <Sparkles size={16} />}
          size="lg"
        >
          {content ? 'Ανανέωση' : `Εξήγησε: ${selectedConcept}`}
        </Button>
      </div>

      {/* Right: Theory content */}
      <div className="lg:col-span-2 space-y-4">
        {!content && !loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-[#16161f] rounded-2xl border border-[#2a2a3a]">
            <div className="text-5xl">{chapter.emoji}</div>
            <p className="text-slate-400 text-center text-sm max-w-xs">
              Επέλεξε ένα θέμα και το Axi AI θα σου εξηγήσει στο επίπεδο που θέλεις
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReload}
                    loading={loading}
                    icon={!loading && <RefreshCw size={14} />}
                    title="Δεν κατάλαβα — εξήγησε διαφορετικά"
                  >
                    <span className="hidden sm:inline text-xs">Δεν κατάλαβα</span>
                  </Button>
                </div>
              )}
            </div>

            <AIResponse text={content} loading={loading} />
          </div>
        )}

        {content && !loading && (
          <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl">
            <p className="text-sm text-violet-300 font-medium mb-2">💡 Δεν κατάλαβες;</p>
            <p className="text-xs text-slate-400 mb-3">
              Κάνε κλικ στο «Δεν κατάλαβα» και το Axi AI θα εξηγήσει με εντελώς νέα παραδείγματα.
            </p>
            <Button variant="outline" size="sm" onClick={onReload} loading={loading} icon={<RefreshCw size={14} />}>
              Δεν κατάλαβα — εξήγησε αλλιώς
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
