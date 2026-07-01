import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AxiLoading({ messages, interval = 2600, className = '' }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), interval)
    return () => clearInterval(t)
  }, [messages.length, interval])

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`text-sm font-medium text-violet-300 ${className}`}
      >
        {messages[idx]}
      </motion.p>
    </AnimatePresence>
  )
}

// Context-specific message sets so each feature sounds right
export const LOADING_MSGS = {
  exercise: [
    '🔍 Αναλύω τι χρειάζεσαι...',
    '✏️ Γράφω την άσκηση...',
    '📐 Επιλέγω τη σωστή δυσκολία...',
    '🧠 Σκέφτομαι ένα καλό πρόβλημα...',
  ],
  explanation: [
    '🤔 Αναλύω πού έγινε το λάθος...',
    '📐 Εντοπίζω ακριβώς το σημείο...',
    '✍️ Ετοιμάζω την εξήγηση...',
  ],
  theory: [
    '🧠 Ο Axi σκέφτεται...',
    '📚 Ετοιμάζω την καλύτερη εξήγηση...',
    '🔍 Αναλύω το θέμα...',
    '✨ Λίγο ακόμα...',
  ],
  flashcards: [
    '🃏 Δημιουργώ τα flashcards...',
    '🧠 Σκέφτομαι καλές ερωτήσεις...',
    '📖 Επιλέγω τα πιο σημαντικά σημεία...',
    '✨ Σχεδόν έτοιμα...',
  ],
  tutor: [
    '🤖 Ο Axi σκέφτεται...',
    '📚 Ψάχνει την καλύτερη εξήγηση...',
    '✍️ Γράφει την απάντηση...',
  ],
}
