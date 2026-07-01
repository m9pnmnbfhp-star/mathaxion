import useStore from '../store/useStore'

const CORRECT = {
  funny: (xp) => [
    `😂 Σωστό! Αστείο αλλά αληθινό! +${xp} XP`,
    `🎉 ΜΠΑΜ! Το έλυσες! +${xp} XP`,
    `😄 Κάποιος μαθαίνει! +${xp} XP`,
    `🧠 Σωστό, και το εννοείς! +${xp} XP`,
    `😂 Ακόμα κι εγώ εντυπωσιάστηκα! +${xp} XP`,
  ],
  friendly: (xp) => [
    `😊 Σωστό ρε φίλε! +${xp} XP`,
    `🎯 Ναι! Το είχες! +${xp} XP`,
    `✅ Μπράβο φίλε! +${xp} XP`,
    `🎉 Ωραία δουλειά! +${xp} XP`,
    `👌 Ακριβώς έτσι! +${xp} XP`,
    `⭐ Σωστό, συνέχισε! +${xp} XP`,
  ],
  serious: (xp) => [
    `✅ Σωστό. +${xp} XP`,
    `✅ +${xp} XP`,
    `✔ Σωστά. +${xp} XP`,
  ],
  professional: (xp) => [
    `✅ Σωστά. +${xp} XP`,
    `Άριστα. +${xp} XP`,
    `Σωστή απάντηση. +${xp} XP`,
  ],
  motivational: (xp) => [
    `🚀 ΤΕΛΕΙΑ! +${xp} XP!`,
    `💪 ΝΑΙ! Το είχες! +${xp} XP`,
    `🔥 ΜΠΡΑΒΟ! Συνέχισε! +${xp} XP`,
    `⚡ ΑΥΤΟ ΗΤΑΝ! +${xp} XP`,
    `🏆 Ακριβώς! ΑΓΓΙΖΕΙΣ ΤΟ ΕΠΙΠΕΔΟ ΣΟΥ! +${xp} XP`,
  ],
}

const WRONG = {
  funny: [
    '😅 Όχι ακριβώς... αλλά γελάμε και συνεχίζουμε!',
    '🤦 Λάθος, αλλά μην ανησυχείς — και ο Πυθαγόρας έκανε λάθη!',
    '😬 Δεν ήταν αυτό, αλλά τώρα ξέρεις ένα λάθος λιγότερο!',
  ],
  friendly: [
    '😕 Όχι αυτή τη φορά, αλλά είσαι κοντά!',
    '💪 Λάθος, αλλά θα το πιάσεις!',
    '🙂 Δεν πειράζει — δες την εξήγηση!',
    '📖 Σχεδόν! Ας δούμε μαζί πού πήγε λάθος.',
  ],
  serious: ['✗ Λάθος.', '✗ Δεν είναι σωστό.'],
  professional: [
    'Μη σωστή απάντηση. Δείτε παρακάτω.',
    'Εσφαλμένη απάντηση. Ανατρέξτε στην εξήγηση.',
  ],
  motivational: [
    '💪 Δεν πειράζει! Από τα λάθη μαθαίνουμε!',
    '🌟 Λάθος αυτή τη φορά — η επόμενη είναι ΔΙΚΗ ΣΟΥ!',
    '🔥 Αδύνατο να σε σταματήσει αυτό! Ξανά!',
  ],
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

// "Only X left!" — shown when 1-2 exercises remain
const PROXIMITY = {
  funny:        (n) => n === 1 ? '😱 ΜΟΝΟ 1 ΑΚΟΜΑ! Μην τα χαλάσεις!' : `😤 Άλλα ${n} και τελειώσαμε!`,
  friendly:     (n) => n === 1 ? '👏 Μόνο 1 μάθημα ακόμα!' : `💪 Άλλα ${n} και τελειώνεις!`,
  serious:      (n) => n === 1 ? '1 ακόμα.' : `${n} ακόμα.`,
  professional: (n) => n === 1 ? 'Τελευταία άσκηση.' : `Απομένουν ${n} ασκήσεις.`,
  motivational: (n) => n === 1 ? '⚡ ΤΕΛΕΥΤΑΙΟ! ΔΩΣΕ ΤΑ ΟΛΑ!' : `🔥 ΜΟΝΟ ${n} ΑΚΟΜΑ! ΜΗΝ ΣΤΑΜΑΤΑΣ!`,
}

// "You're improving fast!" — when this week's XP > last week's
const IMPROVEMENT = {
  funny:        (pct) => `😂 +${pct}% XP vs προηγούμενη εβδ. Ποιος είσαι εσύ;`,
  friendly:     (pct) => `🔥 Βελτιώνεσαι γρήγορα! +${pct}% αυτή την εβδομάδα`,
  serious:      (pct) => `+${pct}% vs προηγ. εβδ.`,
  professional: (pct) => `Απόδοση αυξημένη κατά ${pct}%.`,
  motivational: (pct) => `🚀 +${pct}% XP! ΑΝΕΒΑΙΝΕΙΣ ΓΡΗΓΟΡΑ!`,
}

// First-time return after N days
const COMEBACK = {
  funny:        (d) => d >= 7 ? '😅 Τελικά ήρθες! Τα μαθηματικά σε περίμεναν...' : '😊 Καλώς ήρθες πίσω!',
  friendly:     (d) => d >= 7 ? `🙌 Καλώς ήρθες! ${d} μέρες έλειπες — ξεκινάμε;` : '😊 Καλώς ήρθες πίσω!',
  serious:      () => 'Καλωσόρισες.',
  professional: () => 'Καλώς επανήλθατε.',
  motivational: (d) => d >= 7 ? `🔥 ΕΠΙΣΤΡΕΨΕΣ! Τα μαθηματικά δεν σε ξεχάσανε!` : '⚡ Πάλι εδώ! Ξεκινάμε!',
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

export function proximityMessage(remaining) {
  const p = getPersonality()
  return (PROXIMITY[p] || PROXIMITY.friendly)(remaining)
}

export function improvementMessage(pct) {
  const p = getPersonality()
  return (IMPROVEMENT[p] || IMPROVEMENT.friendly)(pct)
}

export function comebackMessage(daysSince) {
  const p = getPersonality()
  return (COMEBACK[p] || COMEBACK.friendly)(daysSince)
}
