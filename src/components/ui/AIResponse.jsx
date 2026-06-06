import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function AIResponse({ text, loading = false, compact = false }) {
  if (loading) {
    return (
      <div className={`flex items-start gap-3 ${compact ? '' : 'p-4 bg-[#1c1c28] rounded-xl border border-violet-500/20'}`}>
        <div className="shrink-0 w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Sparkles size={14} className="text-violet-400" />
        </div>
        <div className="flex-1 space-y-2 pt-1">
          <div className="shimmer h-4 rounded w-3/4" />
          <div className="shimmer h-4 rounded w-full" />
          <div className="shimmer h-4 rounded w-5/6" />
          <div className="shimmer h-4 rounded w-2/3" />
        </div>
      </div>
    )
  }

  const parts = parseMarkdown(text || '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${compact ? '' : 'p-4 bg-[#1c1c28] rounded-xl border border-violet-500/20'}`}
    >
      <div className="shrink-0 w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
        <Sparkles size={14} className="text-violet-400" />
      </div>
      <div className="flex-1 ai-prose text-slate-200 text-sm leading-relaxed space-y-2">
        {parts}
      </div>
    </motion.div>
  )
}

function parseMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-semibold text-violet-300 mt-3 mb-1">{line.slice(4)}</h3>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-bold text-violet-200 mt-4 mb-2">{line.slice(3)}</h2>)
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(<p key={key++} className="font-semibold text-violet-300">{line.slice(2, -2)}</p>)
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const items = [line.slice(2)]
      while (i + 1 < lines.length && (lines[i + 1].startsWith('- ') || lines[i + 1].startsWith('• '))) {
        i++
        items.push(lines[i].slice(2))
      }
      elements.push(
        <ul key={key++} className="space-y-1 pl-3">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      )
    } else if (/^\d+\. /.test(line)) {
      const items = [line.replace(/^\d+\. /, '')]
      while (i + 1 < lines.length && /^\d+\. /.test(lines[i + 1])) {
        i++
        items.push(lines[i].replace(/^\d+\. /, ''))
      }
      elements.push(
        <ol key={key++} className="space-y-1 pl-4 list-decimal list-outside">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ol>
      )
    } else if (line.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={key++} className="math-block text-sm overflow-x-auto">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
    } else if (line.trim() === '' || line.trim() === '---') {
      if (elements.length > 0) elements.push(<div key={key++} className="h-1" />)
    } else if (line.trim()) {
      elements.push(
        <p key={key++} dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
      )
    }
    i++
  }

  return elements
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-violet-300 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-amber-300">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 text-xs">$1</code>')
    .replace(/✅/g, '<span class="text-emerald-400">✅</span>')
    .replace(/⚠️/g, '<span class="text-amber-400">⚠️</span>')
    .replace(/❌/g, '<span class="text-red-400">❌</span>')
    .replace(/💡/g, '<span class="text-amber-300">💡</span>')
}
