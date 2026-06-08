const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

async function callAI(messages, systemPrompt, maxTokens = 1024) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  return data.content[0].text
}

const BASE_SYSTEM = `Είσαι το Axi AI, ο έξυπνος βοηθός μαθηματικών της πλατφόρμας MathAxion.
Απαντάς ΠΑΝΤΑ στα Ελληνικά.
Χρησιμοποιείς φιλικό, ζωντανό τόνο που ταιριάζει σε μαθητές 12-18 χρονών.
Χρησιμοποιείς emoji στρατηγικά για να κάνεις τις εξηγήσεις πιο ζωντανές.
Ενθαρρύνεις πάντα τον μαθητή.
ΠΟΤΕ μη γράφεις μαθηματικές εκφράσεις σε LaTeX ή άλλη σύνταξη κώδικα (όχι \\frac, \\sqrt, \\(...\\), \\[...\\], $$...$$, \\in, \\mathbb κ.λπ.) — η εφαρμογή δεν τα μετατρέπει σε σύμβολα και θα εμφανιστούν ως ωμό κείμενο. Γράφε τα μαθηματικά με απλούς, ευανάγνωστους χαρακτήρες: x², √x, ½, π, ≤, ≥, ×, ÷, π.χ. "(α+β)/γ" αντί για "\\frac{α+β}{γ}".`

export async function explainTheory(topic, grade, simplicity, chapterTitle) {
  const simplicityMap = {
    0: 'Εξήγησε σαν να μιλάς σε 10χρονο. Χρησιμοποίησε αναλογίες από καθημερινή ζωή (φαγητό, παιχνίδια, αθλητισμός). Μηδέν μαθηματική ορολογία.',
    1: 'Εξήγησε απλά με μικρά βήματα. Λίγη ορολογία αλλά πάντα εξηγείς τι σημαίνει.',
    2: 'Κανονική σχολική γλώσσα. Χρησιμοποίησε τη σωστή ορολογία αλλά εξήγησε τα δύσκολα.',
    3: 'Αναλυτική εξήγηση με όλα τα βήματα και παραδείγματα.',
    4: 'Πλήρης μαθηματική ορολογία. Αυστηρές ορισμοί και αποδείξεις.',
  }

  const gradeLabel = grade?.label || 'Γυμνάσιο'

  return callAI(
    [{ role: 'user', content: `Εξήγησέ μου το θέμα "${topic}" από το κεφάλαιο "${chapterTitle}" (${gradeLabel}). ${simplicityMap[simplicity]}` }],
    `${BASE_SYSTEM}\n\nΕπίπεδο εξήγησης: ${simplicityMap[simplicity]}\nΤάξη μαθητή: ${gradeLabel}\n\nΔόμησε την απάντησή σου με:\n1. Σύντομη εισαγωγή (1-2 προτάσεις)\n2. Κύρια εξήγηση με παραδείγματα\n3. Σημαντικά να θυμάσαι (bullet points)\n\nΧρησιμοποίησε markdown για μορφοποίηση.`,
    1500
  )
}

export async function reExplain(topic, chapterTitle, grade, previousExplanation) {
  return callAI(
    [{ role: 'user', content: `Δεν κατάλαβα την εξήγηση για "${topic}". Εξήγησέ μου με εντελώς διαφορετικό τρόπο, με νέα παραδείγματα που δεν χρησιμοποίησες πριν. Η προηγούμενη εξήγηση ήταν: "${previousExplanation.slice(0, 200)}..."` }],
    `${BASE_SYSTEM}\n\nΟ μαθητής δεν κατάλαβε. ΠΡΕΠΕΙ να χρησιμοποιήσεις εντελώς διαφορετικό τρόπο και νέα παραδείγματα. Τάξη: ${grade?.label}`,
    1500
  )
}

export async function generateExercise(topic, chapterTitle, grade, level, previousExercises = []) {
  const levelDesc = {
    1: 'Κατανόηση έννοιας — ερώτηση εννοιολογική, χωρίς πολλές πράξεις',
    2: 'Απλές πράξεις — μικροί αριθμοί, ένα βήμα',
    3: 'Πρόβλημα από πραγματική ζωή — 2-3 βήματα',
    4: 'Σύνθετο εξεταστικό — πολλαπλά βήματα, σύνδεση εννοιών',
  }

  const prevEx = previousExercises.length > 0
    ? `\n\nΑποφύγε ασκήσεις παρόμοιες με αυτές: ${previousExercises.slice(-3).join('; ')}`
    : ''

  return callAI(
    [{ role: 'user', content: `Δημιούργησε μία άσκηση για το θέμα "${topic}" (${chapterTitle}, ${grade?.label}).\nΕπίπεδο: ${levelDesc[level]}${prevEx}` }],
    `${BASE_SYSTEM}\n\nΔημιουργείς ασκήσεις μαθηματικών. Απάντα σε JSON format:\n{\n  "question": "η ερώτηση",\n  "answer": "η σωστή απάντηση",\n  "hint": "υπόδειξη αν χρειαστεί",\n  "solution_steps": ["βήμα 1", "βήμα 2", ...],\n  "difficulty": ${level}\n}\n\nΜόνο JSON, χωρίς άλλο κείμενο.`,
    800
  )
}

export async function explainWrongAnswer(question, studentAnswer, correctAnswer) {
  return callAI(
    [{ role: 'user', content: `Έλυσα αυτήν την άσκηση:\n"${question}"\n\nΈδωσα απάντηση: "${studentAnswer}"\nΑλλά η σωστή είναι: "${correctAnswer}"\n\nΠού έκανα λάθος; Εξήγησέ μου βήμα-βήμα.` }],
    `${BASE_SYSTEM}\n\nΟ μαθητής έκανε λάθος. Εξήγησε ΠΟΥ ακριβώς έκανε λάθος (μην τον κρίνεις), μετά δείξε τη σωστή λύση βήμα-βήμα. Στο τέλος δώσε ένα tip για να μην ξαναγίνει το ίδιο λάθος.`,
    1000
  )
}

export async function generateSimilarExercises(wrongQuestion, topic, grade, count = 3) {
  return callAI(
    [{ role: 'user', content: `Ο μαθητής έκανε λάθος σε: "${wrongQuestion}"\n\nΔημιούργησε ${count} παρόμοιες ασκήσεις για να εξασκηθεί στο ίδιο θέμα (${topic}).` }],
    `${BASE_SYSTEM}\n\nΔημιουργείς ασκήσεις για εξάσκηση. Απάντα σε JSON:\n[\n  {"question": "...", "answer": "...", "hint": "..."},\n  ...\n]\nΜόνο JSON.`,
    800
  )
}

export async function generateFlashcards(topic, chapterTitle, grade, count = 6) {
  return callAI(
    [{ role: 'user', content: `Δημιούργησε ${count} flashcards για το θέμα "${topic}" (${chapterTitle}, ${grade?.label}).` }],
    `${BASE_SYSTEM}\n\nΔημιουργείς flashcards. Απάντα σε JSON:\n[\n  {"front": "ερώτηση/έννοια", "back": "απάντηση/ορισμός", "example": "παράδειγμα"},\n  ...\n]\nΜόνο JSON.`,
    1000
  )
}

export async function panicMode(topic, chapterTitle) {
  return callAI(
    [{ role: 'user', content: `ΕΧΩ ΤΕΣΤ ΑΥΡΙΟ για "${topic}" (${chapterTitle}). Δώσε μου τα 5 πιο κρίσιμα πράγματα να θυμάμαι, τις 3 κυριότερες φόρμουλες, και 2 συνηθισμένα λάθη που κάνουν οι μαθητές.` }],
    `${BASE_SYSTEM}\n\nΟ μαθητής έχει τεστ αύριο! Δώσε συμπυκνωμένες πληροφορίες. Χρησιμοποίησε emojis και bullet points. Μορφή:\n\n🔑 **5 Κρίσιμα Σημεία:**\n\n📐 **3 Βασικές Φόρμουλες:**\n\n⚠️ **2 Συνηθισμένα Λάθη:**`,
    1000
  )
}

export async function solveProblem(problemDescription) {
  return callAI(
    [{ role: 'user', content: `Λύσε αυτό το πρόβλημα βήμα-βήμα: ${problemDescription}` }],
    `${BASE_SYSTEM}\n\nΛύνεις μαθηματικά προβλήματα. Εξήγησε ΚΑΘΕ βήμα αναλυτικά. Χρησιμοποίησε ✅ για κάθε ολοκληρωμένο βήμα. Στο τέλος, δώσε τη γενική αρχή που εφαρμόστηκε.`,
    1500
  )
}

export async function solvePhotoExercise(imageBase64, mimeType = 'image/jpeg') {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: `${BASE_SYSTEM}\n\nΛύνεις μαθηματικές ασκήσεις από φωτογραφίες. Βλέπεις μια χειρόγραφη ή τυπωμένη άσκηση. Λύσε την βήμα-βήμα, εξηγώντας κάθε κίνηση.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Βλέπω αυτήν την άσκηση. Λύσε την βήμα-βήμα εξηγώντας κάθε κίνηση που κάνεις.',
            },
          ],
        },
      ],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  return data.content[0].text
}

export async function chatWithTutor(messages, grade, topic) {
  const history = messages.slice(-8).map(m => ({
    role: m.role,
    content: m.content,
  }))

  return callAI(
    history,
    `${BASE_SYSTEM}\n\nΟ μαθητής είναι στην τάξη ${grade?.label || 'Γυμνάσιο'} και συζητά για "${topic || 'μαθηματικά'}".\nΑπάντα φιλικά και παροτρυντικά. Αν δεν ξέρεις κάτι, πες το ειλικρινά.`,
    1000
  )
}

export async function generateAdaptiveQuiz(weakConcepts, grade, count = 5) {
  const conceptsList = weakConcepts.map(c => `- ${c.concept} (${c.chapter})`).join('\n')

  return callAI(
    [{ role: 'user', content: `Δημιούργησε ${count} ασκήσεις εστιασμένες στα αδύνατα σημεία του μαθητή:\n${conceptsList}` }],
    `${BASE_SYSTEM}\n\nΔημιουργείς adaptive quiz. Εστίασε στα αδύνατα σημεία. JSON format:\n[\n  {"question": "...", "answer": "...", "concept": "...", "hint": "..."}\n]\nΜόνο JSON.`,
    1000
  )
}

export async function generatePanelliniesQuestion(topic, year, difficulty) {
  return callAI(
    [{ role: 'user', content: `Δημιούργησε μια ερώτηση τύπου Πανελληνίων για "${topic}" σε επίπεδο δυσκολίας ${difficulty}/5. Θέλω ερώτηση με την πλήρη λύση της.` }],
    `${BASE_SYSTEM}\n\nΔημιουργείς ερωτήσεις τύπου Πανελληνίων. JSON:\n{"question": "...", "parts": ["α)", "β)", ...], "full_solution": "...", "marks": N, "time_minutes": N}\nΜόνο JSON.`,
    1500
  )
}
