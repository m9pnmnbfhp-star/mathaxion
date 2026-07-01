export function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const EGG = {
  perfectScore: [
    'Νομίζω πρέπει να προσέχω… σύντομα θα με αντικαταστήσεις. 😄',
    '8 στα 8 χωρίς λάθος. Αυτό δεν το βλέπω συχνά. 🏆',
    'Τέλεια σκόρ! Ή πολύ προσεκτικός ή πολύ έξυπνος — και τα δύο ωραία. 🎯',
    'Μηδέν λάθη. Μήπως είσαι ο επόμενος μεγάλος μαθηματικός; 📐',
  ],
  streak7: [
    '7 μέρες streak. Αυτό δεν είναι τύχη — είναι συνήθεια. 💪',
    'Μια ολόκληρη εβδομάδα χωρίς χαμένη μέρα. Εντυπωσιακό! 🔥',
    'Εβδομάδα χωρίς διακοπή. Συνέχισε έτσι και δεν θα σε σταματά τίποτα. 🚀',
  ],
  streak30: [
    'Ένας μήνας streak. Σε αυτό το σημείο εγώ μαθαίνω από σένα. 🏅',
    '30 μέρες αδιάκοπα! Αυτό έχει γίνει συνήθεια ζωής. 🔥',
  ],
  streak100: [
    '100 μέρες. Τρεις μήνες χωρίς χαμένη μέρα. Αυτό λέγεται θρύλος. 🔥🔥🔥',
  ],
  lateNight: [
    'Μεσάνυχτα και μαθηματικά; Ο Axi είναι πάντα εδώ. 🌙',
    'Αργά, αλλά αφοσιωμένος. Respect. 🌙',
    'Ο ύπνος μπορεί να περιμένει — αλλά μην το κάνεις συνήθεια. 🌙',
  ],
  earlyBird: [
    'Πριν τις 7 το πρωί; Αυτό λέγεται discipline. ☀️',
    'Πρωινή μελέτη — ο εγκέφαλος είναι φρέσκος! Τέλεια επιλογή. ☀️',
  ],
  konami: {
    title: '🤫 Βρήκες το secret!',
    body: 'Ο Axi σε χαιρετά, curious student.\n\nFun fact: ο Αρχιμήδης ανακάλυψε τον νόμο της άνωσης μπαίνοντας στη μπανιέρα και φώναξε "Εύρηκα!"\n\nΊσως και εσύ να κάνεις τις καλύτερες σκέψεις στο μπάνιο. 🛁📐',
  },
}

export const KONAMI_SEQ = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a',
]

export function getTimeEgg() {
  const h = new Date().getHours()
  if (h >= 23 || h < 4) return { type: 'lateNight', msg: getRandom(EGG.lateNight) }
  if (h >= 4 && h < 7)  return { type: 'earlyBird', msg: getRandom(EGG.earlyBird) }
  return null
}
