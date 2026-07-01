import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'
import AIResponse from '../ui/AIResponse'
import { panicMode } from '../../lib/anthropic'
import toast from 'react-hot-toast'

const SHIMMER_WIDTHS = [88, 76, 94, 70, 85, 79]

export default function PanicMode({ chapter, topic, grade }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return
    const interval = setInterval(() => setElapsed(Math.round((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const activate = async () => {
    setLoading(true)
    setStartTime(Date.now())
    try {
      const result = await panicMode(topic, chapter.title, grade)
      setContent(result)
    } catch {
      toast.error('Σφάλμα')
    } finally {
      setLoading(false)
    }
  }

  if (!content && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-10 space-y-5"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center"
        >
          <Zap size={36} className="text-red-400" />
        </motion.div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Λεπτό πριν το τεστ! ⚡</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Το Axi AI θα σου δώσει τα <strong className="text-white">5 πιο κρίσιμα πράγματα</strong>,
            τις <strong className="text-white">3 κυριότερες φόρμουλες</strong>, και τα
            <strong className="text-white"> 2 συνηθισμένα λάθη</strong> για {topic}.
          </p>
        </div>

        <Button
          variant="danger"
          size="xl"
          onClick={activate}
          icon={<Zap size={20} />}
          className="animate-pulse-glow"
        >
          Panic Mode!
        </Button>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle size={20} className="text-red-400 animate-bounce shrink-0" />
          <div>
            <p className="text-red-300 font-semibold">Panic Mode Ενεργοποιήθηκε!</p>
            <p className="text-xs text-slate-400">Το Axi AI ετοιμάζει τα πιο κρίσιμα...</p>
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              className="shimmer h-5 rounded"
              style={{ width: `${SHIMMER_WIDTHS[i]}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Zap size={16} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Panic Mode</p>
              <p className="text-xs text-slate-500">{topic}</p>
            </div>
          </div>
          {startTime && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} />
              <span>Πριν {elapsed}δ</span>
            </div>
          )}
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
          <AIResponse text={content} />
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={activate}
            icon={<RefreshCw size={14} />}
            className="text-slate-400"
          >
            Ανανέωση
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print?.()}
          >
            🖨️ Εκτύπωση
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
