import useStore from '../store/useStore'

const CORRECT = {
  funny:        (xp) => [`😂 Σωστό! Αστείο αλλά αληθινό! +${xp} XP`, `🎉 ΜΠΑΜ! Το έλυσες! +${xp} XP`, `😄 Κάποιος μαθαίνει! +${xp} XP`],
  friendly:     (xp) => [`😊 Σωστό ρε φίλε! +${xp} XP`, `🎯 Ναι! Το είχες! +${xp} XP`, `✅ Μπράβο φίλε! +${xp} XP`],
  serious:      (xp) => [`✅ Σωστό. +${xp} XP`, `✅ Σωστό +${xp} XP`, `✅ +${xp} XP`],
  professional: (xp) => [`✅ Σωστά. +${xp} XP`, `Άριστα. +${xp} XP`, `Σωστή απάντηση. +${xp} XP`],
  motivational: (xp) => [`🚀 ΤΕΛΕΙΑ! +${xp} XP!`, `💪 ΝΑΙ! Το είχες! +${xp} XP`, `🔥 ΜΠΡΑΒΟ! Συνέχισε! +${xp} XP`],
}

const WRONG = {
  funny:        ['😅 Όχι ακριβώς... αλλά γελάμε και συνεχίζουμε!', '🤦 Λάθος, αλλά μην ανησυχείς — και ο Πυθαγόρας έκανε λάθη!'],
  friendly:     ['😕 Όχι αυτή τη φορά, αλλά είσαι κοντά!', '💪 Λάθος, αλλά θα το πιάσεις!'],
  serious:      ['✗ Λάθος.', '✗ Δεν είναι σωστό.'],
  professional: ['Μη σωστή απάντηση. Δείτε παρακάτω.', 'Εσφαλμένη απάντηση. Ανατρέξτε στην εξήγηση.'],
  motivational: ['💪 Δεν πειράζει! Από τα λάθη μαθαίνουμε!', '🌟 Λάθος αυτή τη φορά — η επόμενη είναι ΔΙΚΗ ΣΟΥ!'],
}

const LEVEL_UP = {
  funny:        (lvl) => `😂 ΩΩΩ! Πήγες Level ${lvl}! Τώρα είσαι επικίνδυνος!`,
  friendly:     (lvl) => `🎉 Μπράβο! Προχωράς στο Επίπεδο ${lvl}!`,
  serious:      (lvl) => `→ Επίπεδο ${lvl}`,
  professional: (lvl) => `Προαγωγή στο Επίπεδο ${lvl}. Συγχαρητήρια.`,
  motivational: (lvl) => `🚀🔥 LEVEL ${lvl}! ΑΝΕΒΑΙΝΕΙΣ ΣΥΝΕΧΕΙΑ! ΔΕΝ ΣΤΑΜΑΤΑΣ!`,
}

const STREAK = {
  funny:        (n) => `😂 ${n} σωστά στη σειρά! Είσαι μηχανή (ή ψάχνεις στο Google... 🤔)`,
  friendly:     (n) => `🔥 ${n} στη σειρά! Πας πολύ καλά!`,
  serious:      (n) => `${n} σωστά.`,
  professional: (n) => `${n} συνεχόμενες σωστές απαντήσεις.`,
  motivational: (n) => `🔥💪 ${n} ΣΩΣΤΑ ΣΤΗ ΣΕΙΡΑ! ΑΥΤΟΣ/ΑΥΤΗ ΕΙΝΑΙ!`,
}

function getPersonality() {
  return useStore.getState().onboarding?.personality || 'friendly'
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function correctMessage(xp) {
  const p = getPersonality()
  return pick((CORRECT[p] || CORRECT.friendly)(xp))
}

export function wrongMessage() {
  const p = getPersonality()
  return pick(WRONG[p] || WRONG.friendly)
}

export function levelUpMessage(level) {
  const p = getPersonality()
  return (LEVEL_UP[p] || LEVEL_UP.friendly)(level)
}

export function streakMessage(count) {
  const p = getPersonality()
  return (STREAK[p] || STREAK.friendly)(count)
}
