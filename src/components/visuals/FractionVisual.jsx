import { motion } from 'framer-motion'
import { useState } from 'react'

export default function FractionVisual() {
  const [numerator, setNumerator] = useState(3)
  const [denominator, setDenominator] = useState(4)

  const safe = Math.max(1, Math.min(12, denominator))
  const safeNum = Math.max(0, Math.min(safe, numerator))
  const pct = (safeNum / safe) * 100

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0f0f1a', border: '1px solid rgba(16,185,129,0.2)' }}>
      <p className="text-xs font-black tracking-widest uppercase mb-3 text-center" style={{ color: 'var(--fg-3)' }}>
        Κλάσματα — Οπτική Αναπαράσταση
      </p>

      {/* Fraction display */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="text-center">
          <div className="flex flex-col items-center">
            <button onClick={() => setNumerator(n => Math.min(safe, n + 1))}
              className="text-emerald-400 font-black text-lg w-8 h-8 rounded-lg hover:bg-white/5 transition-colors">+</button>
            <span className="font-display font-black text-3xl text-white leading-none">{safeNum}</span>
            <button onClick={() => setNumerator(n => Math.max(0, n - 1))}
              className="text-emerald-400 font-black text-lg w-8 h-8 rounded-lg hover:bg-white/5 transition-colors">−</button>
          </div>
          <div className="h-0.5 w-10 my-1 mx-auto rounded-full" style={{ background: '#10b981' }} />
          <div className="flex flex-col items-center">
            <button onClick={() => setDenominator(n => Math.min(12, n + 1))}
              className="text-violet-400 font-black text-lg w-8 h-8 rounded-lg hover:bg-white/5 transition-colors">+</button>
            <span className="font-display font-black text-3xl text-white leading-none">{safe}</span>
            <button onClick={() => setDenominator(n => Math.max(1, n - 1))}
              className="text-violet-400 font-black text-lg w-8 h-8 rounded-lg hover:bg-white/5 transition-colors">−</button>
          </div>
        </div>

        {/* Bar */}
        <div className="flex-1 max-w-[160px]">
          <div className="flex rounded-lg overflow-hidden h-10 gap-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {Array.from({ length: safe }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm"
                style={{ background: i < safeNum ? '#10b981' : 'rgba(255,255,255,0.06)' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
              />
            ))}
          </div>
          <p className="text-center text-xs mt-2 font-bold" style={{ color: '#10b981' }}>
            {pct.toFixed(0)}% του συνόλου
          </p>
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--fg-3)' }}>
        Πάτα + / − για να αλλάξεις τον αριθμητή ή παρονομαστή
      </p>
    </div>
  )
}
