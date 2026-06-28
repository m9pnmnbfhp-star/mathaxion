import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

const MATH_SYMBOLS = ['π', 'Σ', 'Δ', '∫', 'θ', 'φ', '∞', '√']

function CardStories({ stats }) {
  return (
    <div style={{
      width: 360, height: 640,
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      boxSizing: 'border-box',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Floating math symbols */}
      {MATH_SYMBOLS.map((sym, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: `${2 + (i % 3)}rem`,
          opacity: 0.035,
          color: '#c4b5fd',
          left: `${8 + (i * 12) % 80}%`,
          top: `${5 + (i * 14) % 85}%`,
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900,
          userSelect: 'none',
        }}>{sym}</div>
      ))}

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a78bfa', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
          MathAxion
        </div>
      </div>

      {/* Avatar + Level */}
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(109,40,217,0.4))',
        border: '2px solid rgba(124,58,237,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', fontWeight: 900, color: '#c4b5fd',
        marginBottom: 12,
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {stats.initial}
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#a78bfa', letterSpacing: '0.12em', marginBottom: 4 }}>
        LEVEL {stats.level}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: 32 }}>
        {stats.name}
      </div>

      {/* Stats */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { emoji: '★', label: 'XP', value: stats.xp.toLocaleString('el'), color: '#fbbf24' },
          { emoji: '🔥', label: 'Streak', value: `${stats.streak} μέρες`, color: '#fb923c' },
          { emoji: '📚', label: 'Κεφάλαια', value: `${stats.masteredChapters} κατακτημένα`, color: '#34d399' },
        ].map(({ emoji, label, value, color }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{emoji} {label}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Mastery bar */}
      <div style={{ width: '100%', marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>OVERALL MASTERY</span>
          <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 900 }}>{stats.overallMastery}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stats.overallMastery}%`, borderRadius: 99, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
        </div>
      </div>

      {/* Watermark */}
      <div style={{ marginTop: 32, fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
        mathaxion.com
      </div>
    </div>
  )
}

function CardSquare({ stats }) {
  return (
    <div style={{
      width: 360, height: 360,
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
      padding: '28px',
      boxSizing: 'border-box',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Math symbols */}
      {MATH_SYMBOLS.slice(0, 4).map((sym, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: `${3 + (i % 2)}rem`,
          opacity: 0.03,
          color: '#c4b5fd',
          right: `${10 + i * 20}%`,
          top: `${10 + i * 15}%`,
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900,
          userSelect: 'none',
        }}>{sym}</div>
      ))}

      {/* Top row: logo + name + level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(109,40,217,0.4))',
          border: '2px solid rgba(124,58,237,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 900, color: '#c4b5fd',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>{stats.initial}</div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{stats.name}</div>
          <div style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 900, letterSpacing: '0.08em' }}>
            LV.{stats.level} · MATHAXION
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { label: '★ XP', value: stats.xp.toLocaleString('el'), color: '#fbbf24' },
          { label: '🔥 Streak', value: `${stats.streak}d`, color: '#fb923c' },
          { label: '📚', value: `${stats.masteredChapters} ch`, color: '#34d399' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Mastery bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>MASTERY</span>
          <span style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 900 }}>{stats.overallMastery}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stats.overallMastery}%`, borderRadius: 99, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
        </div>
      </div>

      {/* Watermark */}
      <div style={{ position: 'absolute', bottom: 16, right: 20, fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.06em' }}>
        mathaxion.com
      </div>
    </div>
  )
}

export default function ShareCardModal({ open, onClose, stats }) {
  const [format, setFormat] = useState('stories')
  const [capturing, setCapturing] = useState(false)
  const storiesRef = useRef(null)
  const squareRef = useRef(null)

  const capture = async () => {
    const ref = format === 'stories' ? storiesRef : squareRef
    if (!ref.current) return
    setCapturing(true)
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], `mathaxion-progress-${format}.png`, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Η πρόοδός μου στο MathAxion!' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = file.name; a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    } finally {
      setCapturing(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-bold text-white text-sm">Μοιράσου την πρόοδό σου</p>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Format tabs */}
            <div className="flex gap-2 px-5 pt-4">
              {[
                { id: 'stories', label: 'Stories (9:16)' },
                { id: 'square', label: 'Square (1:1)' },
              ].map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: format === f.id ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.05)',
                    color: format === f.id ? 'white' : 'var(--fg-2)',
                    border: 'none',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Card preview */}
            <div className="px-5 py-4 flex justify-center overflow-hidden"
              style={{ height: format === 'stories' ? 372 : 260, alignItems: 'flex-start' }}>
              <div style={{ transform: format === 'stories' ? 'scale(0.58)' : 'scale(0.72)', transformOrigin: 'top center' }}>
                {format === 'stories'
                  ? <div ref={storiesRef}><CardStories stats={stats} /></div>
                  : <div ref={squareRef}><CardSquare stats={stats} /></div>
                }
              </div>
            </div>

            {/* Action */}
            <div className="px-5 pb-5">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={capture} disabled={capturing}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                {capturing
                  ? 'Δημιουργία...'
                  : navigator.canShare ? <><Share2 size={15} />Κοινοποίηση</> : <><Download size={15} />Λήψη PNG</>
                }
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
