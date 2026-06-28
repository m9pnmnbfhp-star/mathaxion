import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import useStore from '../../store/useStore'
import { chatWithTutor } from '../../lib/anthropic'
import toast from 'react-hot-toast'

const QUICK_QUESTIONS = [
  'Δεν καταλαβαίνω την έννοια',
  'Δώσε μου ένα παράδειγμα',
  'Πώς λύνω αυτό;',
  'Τι φόρμουλα χρειάζομαι;',
  'Γιατί αυτό είναι έτσι;',
]

export default function PythagorasTutor({ grade, topic, compact = false }) {
  const { user, isPro, setAuthModal, setUpgradeModal } = useStore()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Γεια! Είμαι το **Axi AI** 🤖, ο AI βοηθός σου για τα μαθηματικά!\n\nΜπορείς να με ρωτήσεις οτιδήποτε για ${topic ? `το θέμα **${topic}**` : 'τα μαθηματικά'}. Δεν κρίνω — μόνο εξηγώ! 💪`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content) => {
    if (!content.trim()) return

    if (!user) {
      setAuthModal(true, 'signup')
      return
    }

    if (!isPro) {
      setUpgradeModal(true)
      return
    }

    const userMsg = { role: 'user', content }
    const allMsgs = [...messages, userMsg]
    setMessages([...allMsgs, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    try {
      await chatWithTutor(allMsgs, grade, topic, (text) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: text }
          return updated
        })
        setLoading(false)
      })
    } catch {
      toast.error('Σφάλμα επικοινωνίας με το Axi AI')
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Συγγνώμη, αντιμετώπισα τεχνικό πρόβλημα. Δοκίμασε ξανά! 🔧' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-3 p-3 min-h-0">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Sparkles size={12} className="text-violet-400" />
              </div>
              <div className="space-y-1 mt-1">
                <div className="shimmer h-3 rounded w-32" />
                <div className="shimmer h-3 rounded w-24" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK_QUESTIONS.slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] text-slate-300 hover:border-violet-500/40 hover:text-violet-300 transition-all whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-[#2a2a3a]">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage(input)}
            loading={loading}
            inputRef={inputRef}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-[#16161f] rounded-2xl border border-[#2a2a3a] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a2a3a] flex items-center justify-between bg-[#1c1c28]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm">🧮</div>
          <div>
            <div className="text-sm font-semibold text-white">Axi AI</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-violet-400 animate-spin" />
            </div>
            <div className="space-y-2 mt-1">
              <div className="shimmer h-4 rounded w-40" />
              <div className="shimmer h-4 rounded w-56" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#1c1c28] border border-[#2a2a3a] text-slate-400 hover:border-violet-500/40 hover:text-violet-300 transition-all whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => sendMessage(input)}
          loading={loading}
          inputRef={inputRef}
        />
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-violet-400" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-violet-600 text-white rounded-tr-sm'
            : 'bg-[#1c1c28] border border-[#2a2a3a] text-slate-200 rounded-tl-sm ai-prose'
        }`}
      >
        {isUser ? msg.content : <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(msg.content) }} />}
      </div>
    </motion.div>
  )
}

function ChatInput({ value, onChange, onSend, loading, inputRef }) {
  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
        placeholder="Ρώτα το Axi AI..."
        disabled={loading}
        className="flex-1 bg-[#1c1c28] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
      />
      <Button
        onClick={onSend}
        disabled={!value.trim() || loading}
        loading={loading}
        icon={!loading && <Send size={16} />}
        className="shrink-0"
      >
        {!loading && ''}
      </Button>
    </div>
  )
}

function simpleMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-300">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-amber-300">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 rounded text-emerald-300 text-xs">$1</code>')
    .replace(/\n/g, '<br/>')
}
