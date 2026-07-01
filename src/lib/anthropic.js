import { searchBookChunks, supabase } from './supabase'
import useStore from '../store/useStore'

async function callAI(messages, systemPrompt, maxTokens = 1024, onChunk = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ messages, system: systemPrompt, max_tokens: maxTokens, stream: !!onChunk }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error ${res.status}`)
  }
  if (onChunk) {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const chunk = JSON.parse(data)
            fullText += chunk
            onChunk(fullText)
          } catch {}
        }
      }
    }
    return fullText
  }
  const data = await res.json()
  return data.text
}

const BASE_SYSTEM = `Είσαι το Axi AI, ο έξυπνος βοηθός μαθηματικών της πλατφόρμας MathAxion.
Απαντάς ΠΑΝΤΑ στα Ελληνικά.
Χρησιμοποιείς φιλικό, ζωντανό τόνο που ταιριάζει σε μαθητές 12-18 χρονών.
Χρησιμοποιείς emoji στρατηγικά για να κάνεις τις εξηγήσεις πιο ζωντανές.
Ενθαρρύνεις πάντα τον μαθητή — μικρές φράσεις ενθάρρυνσης (π.χ. "🎉 Ωραία ερώτηση!", "🔥 Πας πολύ καλά!", "👏 Σχεδόν τέλεια!") κάνουν μεγάλη διαφορά.
Όταν ο μαθητής καταλαβαίνει κάτι σωστά, μη διστάσεις να το αναγνωρίσεις με ζεστασιά.
ΠΟΤΕ μη γράφεις μαθηματικές εκφράσεις σε LaTeX ή άλλη σύνταξη κώδικα (όχι \\frac, \\sqrt, \\(...\\), \\[...\\], $$...$$, \\in, \\mathbb κ.λπ.) — η εφαρμογή δεν τα μετατρέπει σε σύμβολα και θα εμφανιστούν ως ωμό κείμενο. Γράφε τα μαθηματικά με απλούς, ευανάγνωστους χαρακτήρες: x², √x, ½, π, ≤, ≥, ×, ÷, π.χ. "(α+β)/γ" αντί για "\\frac{α+β}{γ}".`

const PERSONALITY_PROMPTS = {
  funny:        'ΥΦΟΣ: Χρησιμοποίησε χιούμορ, αστεία παραδείγματα και jokes για να κάνεις τα μαθηματικά διασκεδαστικά. Μπορείς να κάνεις αστεία references από την καθημερινή ζωή. Ο στόχος είναι ο μαθητής να γελά ενώ μαθαίνει.',
  friendly:     'ΥΦΟΣ: Μίλα ακριβώς σαν φίλος που εξηγεί. Casual γλώσσα ("ρε φίλε", "άκουσε"), πάρα πολλή ζεστασιά και ενθάρρυνση. Κάνε τον μαθητή να νιώθει ότι μαθαίνει με παρέα.',
  serious:      'ΥΦΟΣ: Straight to the point. Μόνο τα απαραίτητα, χωρίς fillers και χωρίς πλατειασμούς. Σύντομο, πυκνό, αποτελεσματικό. Λιγότερα emoji.',
  professional: 'ΥΦΟΣ: Επαγγελματικό ύφος σαν έμπειρος καθηγητής. Σωστή ορολογία, δομημένες εξηγήσεις με αρίθμηση, ακριβείς ορισμοί. Διατήρησε απόσταση αλλά παρέμεινε προσβάσιμος.',
  motivational: 'ΥΦΟΣ: Είσαι personal coach! Χρησιμοποίησε εκφράσεις όπως "Μπράβο!", "Εξαιρετικά!", "Τα πας ΤΕΛΕΙΑ!", "Πιστεύω σε σένα!". Κάθε σωστή απάντηση είναι νίκη. Κάθε λάθος είναι ευκαιρία. Ενέργεια και δύναμη σε κάθε μήνυμα!',
}

const FRUSTRATION_PROMPTS = {
  theory:   'ΠΡΟΣΑΡΜΟΓΗ: Ο μαθητής δυσκολεύεται στη θεωρία — πάντα εξήγησε την έννοια με παράδειγμα από την αρχή, πριν λύσεις οτιδήποτε.',
  mistakes:  'ΠΡΟΣΑΡΜΟΓΗ: Ο μαθητής κάνει λάθη από αφηρημάδα — εστίασε στα συνηθισμένα παγίδες και πώς να τις αποφεύγει. Υπογράμμισε τα σημεία που "ξεγελάνε".',
  forget:   'ΠΡΟΣΑΡΜΟΓΗ: Ο μαθητής ξεχνά — ξεκίνα ΠΑΝΤΑ με 1-2 γραμμές recap αυτού που πρέπει να θυμάται πριν πας στο καινούριο.',
  time:     'ΠΡΟΣΑΡΜΟΓΗ: Ο μαθητής δεν έχει χρόνο — δώσε τις πιο σύντομες και αποτελεσματικές εξηγήσεις. Χωρίς πλατειασμούς. Βήματα, όχι paragraphs.',
  start:    'ΠΡΟΣΑΡΜΟΓΗ: Ο μαθητής δεν ξέρει από πού να αρχίσει — πάντα δώσε ένα ξεκάθαρο "Βήμα 1:" στην αρχή της απάντησης.',
}

const CONFIDENCE_PROMPTS = {
  love:     'ΕΠΙΠΕΔΟ: Ο μαθητής αγαπά τα μαθηματικά — μπορείς να δώσεις πιο προκλητικά/ενδιαφέροντα παραδείγματα και να αναφέρεις "αστεία" σύνδεση με άλλες έννοιες.',
  ok:       '',
  struggle: 'ΕΠΙΠΕΔΟ: Ο μαθητής δυσκολεύεται — εξήγησε με πολύ μικρά βήματα. Κάθε βήμα ξεχωριστά. Πολλή ενθάρρυνση.',
  hard:     'ΕΠΙΠΕΔΟ: Ο μαθητής βρίσκει τα μαθηματικά πολύ δύσκολα — τεράστια ανάλυση σε βήματα, τεράστια ενθάρρυνση. Μην κάνεις τίποτα να φαίνεται δύσκολο. Κάθε μικρή πρόοδος είναι μεγάλη νίκη.',
}

const GOAL_PROMPTS = {
  lesson:      'ΣΤΟΧΟΣ: Κατανόηση μαθήματος — εστίασε σε εξηγήσεις που χτίζουν πραγματική κατανόηση, με παραδείγματα από την καθημερινή ζωή.',
  tests:       'ΣΤΟΧΟΣ: Προετοιμασία διαγωνισμάτων — έμφαση στα συνηθισμένα θέματα εξετάσεων, τεχνικές επίλυσης, και τα πιο κοινά λάθη που "κόβουν" βαθμό.',
  panellinies: 'ΣΤΟΧΟΣ: Πανελλαδικές — χρησιμοποίησε αυστηρή ορολογία, τυπικό ύφος Πανελληνίων, και αναφέρσου σε αντίστοιχα θέματα προηγούμενων χρόνων όταν βοηθά.',
  grades:      'ΣΤΟΧΟΣ: Βελτίωση βαθμού — εστίασε στα θέματα που εξετάζονται πιο συχνά, και δώσε πρακτικές τεχνικές για να μαζεύει πόντους στο τεστ.',
  love:        'ΣΤΟΧΟΣ: Αγαπά τα μαθηματικά — μπορείς να εξερευνήσεις πιο ενδιαφέρουσες πτυχές, να δείξεις γιατί η ύλη είναι συναρπαστική, να φέρεις connections.',
}

const TIME_PROMPTS = {
  '5':  'ΧΡΟΝΟΣ ΜΕΛΕΤΗΣ: 5 λεπτά/μέρα — δώσε εξαιρετικά σύντομες, συμπυκνωμένες απαντήσεις. Μόνο τα ουσιαστικά, χωρίς fillers.',
  '10': 'ΧΡΟΝΟΣ ΜΕΛΕΤΗΣ: 10 λεπτά/μέρα — σύντομες απαντήσεις, επικεντρωμένες στο βασικό.',
  '45': 'ΧΡΟΝΟΣ ΜΕΛΕΤΗΣ: 45 λεπτά/μέρα — μπορείς να δίνεις πιο αναλυτικές εξηγήσεις με πρόσθετα παραδείγματα.',
  '60': 'ΧΡΟΝΟΣ ΜΕΛΕΤΗΣ: 60 λεπτά/μέρα — ο μαθητής έχει χρόνο για βαθιά κατανόηση. Αναλυτικές εξηγήσεις, πολλά παραδείγματα, επεκτάσεις.',
}

function daysAgo(ts) {
  if (!ts) return ''
  const d = Math.round((Date.now() - ts) / 86400000)
  if (d === 0) return 'σήμερα'
  if (d === 1) return 'χθες'
  return `πριν ${d} μέρες`
}

function buildPersonalizedSystem() {
  const { onboarding, getTopStruggles } = useStore.getState()
  if (!onboarding) return BASE_SYSTEM

  const parts = [BASE_SYSTEM]
  if (onboarding.personality && PERSONALITY_PROMPTS[onboarding.personality]) {
    parts.push(PERSONALITY_PROMPTS[onboarding.personality])
  }
  if (onboarding.frustration && FRUSTRATION_PROMPTS[onboarding.frustration]) {
    parts.push(FRUSTRATION_PROMPTS[onboarding.frustration])
  }
  if (onboarding.confidence && CONFIDENCE_PROMPTS[onboarding.confidence]) {
    parts.push(CONFIDENCE_PROMPTS[onboarding.confidence])
  }
  if (onboarding.goal && GOAL_PROMPTS[onboarding.goal]) {
    parts.push(GOAL_PROMPTS[onboarding.goal])
  }
  if (onboarding.time && TIME_PROMPTS[String(onboarding.time)]) {
    parts.push(TIME_PROMPTS[String(onboarding.time)])
  }

  const topStruggles = getTopStruggles(3).filter(s => s.count >= 2)
  if (topStruggles.length > 0) {
    const lines = topStruggles.map(s => `- "${s.concept}" (${s.count} λάθη, τελευταίο ${daysAgo(s.lastSeen)})`)
    parts.push(`🧠 ΜΝΗΜΗ ΜΑΘΗΤΗ — θέματα που δυσκολεύεται:\n${lines.join('\n')}\nΑν εμφανιστεί σχετικό θέμα, αναφέρσου με ευαισθησία και προσφέρσου να εξηγήσεις ξανά.`)
  }

  return parts.join('\n\n')
}

const NOT_IN_BOOK = '📚 Αυτό το θέμα δεν το βρήκα στο σχολικό σου βιβλίο. Έλεγξε αν ανήκει σε διαφορετικό κεφάλαιο ή ρώτα τον καθηγητή σου.'

const BOOK_ONLY = `\n\n⚠️ ΚΑΝΟΝΑΣ: Απάντα ΑΠΟΚΛΕΙΣΤΙΚΑ βασιζόμενος στα αποσπάσματα του σχολικού βιβλίου που σου δίνονται παρακάτω. Αν κάτι ΔΕΝ αναφέρεται εκεί, ΜΗΝ το συμπεριλάβεις — έστω κι αν το γνωρίζεις από αλλού.`

async function getBookContext(query, gradeId, limit = 5) {
  if (!gradeId) return null
  const { data } = await searchBookChunks(query, gradeId, limit)
  if (!data?.length) return null
  return data.map((c, i) => `[${i + 1}] ${c.content.slice(0, 700)}`).join('\n\n')
}

function bookSection(ctx, gradeLabel) {
  return `\n\n---\nΑΠΟΣΠΑΣΜΑΤΑ ΑΠΟ ΤΟ ΣΧΟΛΙΚΟ ΒΙΒΛΙΟ (${gradeLabel}):\n${ctx}\n---${BOOK_ONLY}`
}

export async function explainTheory(topic, grade, simplicity, chapterTitle, onChunk) {
  const simplicityMap = {
    0: 'Εξήγησε σαν να μιλάς σε 10χρονο. Χρησιμοποίησε αναλογίες από καθημερινή ζωή (φαγητό, παιχνίδια, αθλητισμός). Μηδέν μαθηματική ορολογία.',
    1: 'Εξήγησε απλά με μικρά βήματα. Λίγη ορολογία αλλά πάντα εξηγείς τι σημαίνει.',
    2: 'Κανονική σχολική γλώσσα. Χρησιμοποίησε τη σωστή ορολογία αλλά εξήγησε τα δύσκολα.',
    3: 'Αναλυτική εξήγηση με όλα τα βήματα και παραδείγματα.',
    4: 'Πλήρης μαθηματική ορολογία. Αυστηρές ορισμοί και αποδείξεις.',
  }

  const gradeLabel = grade?.label || 'Γυμνάσιο'

  const bookCtx = await getBookContext(`${topic} ${chapterTitle}`, grade?.id)
  if (!bookCtx) {
    if (onChunk) onChunk(NOT_IN_BOOK)
    return NOT_IN_BOOK
  }

  return callAI(
    [{ role: 'user', content: `Εξήγησέ μου το θέμα "${topic}" από το κεφάλαιο "${chapterTitle}" (${gradeLabel}). ${simplicityMap[simplicity]}` }],
    `${buildPersonalizedSystem()}${bookSection(bookCtx, gradeLabel)}\n\nΕπίπεδο εξήγησης: ${simplicityMap[simplicity]}\nΤάξη μαθητή: ${gradeLabel}\n\nΔόμησε την απάντησή σου με:\n1. Σύντομη εισαγωγή (1-2 προτάσεις)\n2. Κύρια εξήγηση με παραδείγματα\n3. Σημαντικά να θυμάσαι (bullet points)\n\nΧρησιμοποίησε markdown για μορφοποίηση.`,
    1500,
    onChunk
  )
}

export async function reExplain(topic, chapterTitle, grade, previousExplanation, onChunk) {
  const gradeLabel = grade?.label || 'Γυμνάσιο'
  const bookCtx = await getBookContext(`${topic} ${chapterTitle}`, grade?.id)
  if (!bookCtx) {
    if (onChunk) onChunk(NOT_IN_BOOK)
    return NOT_IN_BOOK
  }
  return callAI(
    [{ role: 'user', content: `Δεν κατάλαβα την εξήγηση για "${topic}". Εξήγησέ μου με εντελώς διαφορετικό τρόπο, με νέα παραδείγματα που δεν χρησιμοποίησες πριν. Η προηγούμενη εξήγηση ήταν: "${previousExplanation.slice(0, 200)}..."` }],
    `${buildPersonalizedSystem()}${bookSection(bookCtx, gradeLabel)}\n\nΟ μαθητής δεν κατάλαβε. ΠΡΕΠΕΙ να χρησιμοποιήσεις εντελώς διαφορετικό τρόπο και νέα παραδείγματα. Τάξη: ${gradeLabel}`,
    1500,
    onChunk
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
    `${buildPersonalizedSystem()}\n\nΔημιουργείς ασκήσεις μαθηματικών. Απάντα ΜΟΝΟ με raw JSON, χωρίς markdown, χωρίς backticks:\n{\n  "question": "η ερώτηση",\n  "answer": "η σωστή απάντηση",\n  "hint": "υπόδειξη αν χρειαστεί",\n  "solution_steps": ["βήμα 1", "βήμα 2"],\n  "difficulty": ${level}\n}`,
    1200
  )
}

export async function explainWrongAnswer(question, studentAnswer, correctAnswer) {
  return callAI(
    [{ role: 'user', content: `Έλυσα αυτήν την άσκηση:\n"${question}"\n\nΈδωσα απάντηση: "${studentAnswer}"\nΑλλά η σωστή είναι: "${correctAnswer}"\n\nΠού έκανα λάθος; Εξήγησέ μου βήμα-βήμα.` }],
    `${buildPersonalizedSystem()}\n\nΟ μαθητής έκανε λάθος. Εξήγησε ΠΟΥ ακριβώς έκανε λάθος (μην τον κρίνεις), μετά δείξε τη σωστή λύση βήμα-βήμα. Στο τέλος δώσε ένα tip για να μην ξαναγίνει το ίδιο λάθος.`,
    1000
  )
}

export async function generateSimilarExercises(wrongQuestion, topic, grade, count = 3) {
  return callAI(
    [{ role: 'user', content: `Ο μαθητής έκανε λάθος σε: "${wrongQuestion}"\n\nΔημιούργησε ${count} παρόμοιες ασκήσεις για να εξασκηθεί στο ίδιο θέμα (${topic}).` }],
    `${buildPersonalizedSystem()}\n\nΔημιουργείς ασκήσεις για εξάσκηση. Απάντα σε JSON:\n[\n  {"question": "...", "answer": "...", "hint": "..."},\n  ...\n]\nΜόνο JSON.`,
    800
  )
}

export async function generateFlashcards(topic, chapterTitle, grade, count = 5) {
  return callAI(
    [{ role: 'user', content: `Δημιούργησε ${count} flashcards για το θέμα "${topic}" (${chapterTitle}, ${grade?.label}).` }],
    `${buildPersonalizedSystem()}\n\nΔημιουργείς flashcards. Απάντα ΜΟΝΟ με raw JSON array, χωρίς markdown, χωρίς backticks, χωρίς εξήγηση:\n[\n  {"front": "ερώτηση/έννοια", "back": "απάντηση/ορισμός", "example": "παράδειγμα"},\n  ...\n]`,
    2000
  )
}

export async function panicMode(topic, chapterTitle, grade) {
  const bookCtx = await getBookContext(`${topic} ${chapterTitle}`, grade?.id)
  if (!bookCtx) return NOT_IN_BOOK

  return callAI(
    [{ role: 'user', content: `ΕΧΩ ΤΕΣΤ ΑΥΡΙΟ για "${topic}" (${chapterTitle}). Δώσε μου τα 5 πιο κρίσιμα πράγματα να θυμάμαι, τις 3 κυριότερες φόρμουλες, και 2 συνηθισμένα λάθη που κάνουν οι μαθητές.` }],
    `${buildPersonalizedSystem()}${bookSection(bookCtx, grade?.label || 'Γυμνάσιο')}\n\nΟ μαθητής έχει τεστ αύριο! Δώσε συμπυκνωμένες πληροφορίες ΜΟΝΟ από το βιβλίο. Χρησιμοποίησε emojis και bullet points. Μορφή:\n\n🔑 **5 Κρίσιμα Σημεία:**\n\n📐 **3 Βασικές Φόρμουλες:**\n\n⚠️ **2 Συνηθισμένα Λάθη:**`,
    1000
  )
}

export async function solveProblem(problemDescription) {
  return callAI(
    [{ role: 'user', content: `Λύσε αυτό το πρόβλημα βήμα-βήμα: ${problemDescription}` }],
    `${buildPersonalizedSystem()}\n\nΛύνεις μαθηματικά προβλήματα. Εξήγησε ΚΑΘΕ βήμα αναλυτικά. Χρησιμοποίησε ✅ για κάθε ολοκληρωμένο βήμα. Στο τέλος, δώσε τη γενική αρχή που εφαρμόστηκε.`,
    1500
  )
}

export async function solvePhotoExercise(imageBase64, mimeType = 'image/jpeg') {
  return callAI(
    [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: 'Βλέπω αυτήν την άσκηση. Λύσε την βήμα-βήμα εξηγώντας κάθε κίνηση που κάνεις.' },
        ],
      },
    ],
    `${buildPersonalizedSystem()}\n\nΛύνεις μαθηματικές ασκήσεις από φωτογραφίες. Βλέπεις μια χειρόγραφη ή τυπωμένη άσκηση. Λύσε την βήμα-βήμα, εξηγώντας κάθε κίνηση.`,
    2000
  )
}

export async function chatWithTutor(messages, grade, topic, onChunk) {
  const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  const query = lastUserMsg?.content || topic || ''

  const bookCtx = await getBookContext(query, grade?.id, 5)
  if (!bookCtx) {
    if (onChunk) onChunk(NOT_IN_BOOK)
    return NOT_IN_BOOK
  }

  return callAI(
    history,
    `${buildPersonalizedSystem()}${bookSection(bookCtx, grade?.label || 'Γυμνάσιο')}\n\nΟ μαθητής είναι στην τάξη ${grade?.label || 'Γυμνάσιο'} και συζητά για "${topic || 'μαθηματικά'}".\nΑπάντα φιλικά και παροτρυντικά.`,
    1200,
    onChunk
  )
}

export async function generateAdaptiveQuiz(weakConcepts, grade, count = 5) {
  const conceptsList = weakConcepts.map(c => `- ${c.concept} (${c.chapter})`).join('\n')

  return callAI(
    [{ role: 'user', content: `Δημιούργησε ${count} ασκήσεις εστιασμένες στα αδύνατα σημεία του μαθητή:\n${conceptsList}` }],
    `${buildPersonalizedSystem()}\n\nΔημιουργείς adaptive quiz. Εστίασε στα αδύνατα σημεία. JSON format:\n[\n  {"question": "...", "answer": "...", "concept": "...", "hint": "..."}\n]\nΜόνο JSON.`,
    1000
  )
}

export async function generatePanelliniesQuestion(topic, year, difficulty) {
  return callAI(
    [{ role: 'user', content: `Δημιούργησε μια ερώτηση τύπου Πανελληνίων για "${topic}" σε επίπεδο δυσκολίας ${difficulty}/5. Θέλω ερώτηση με την πλήρη λύση της.` }],
    `${buildPersonalizedSystem()}\n\nΔημιουργείς ερωτήσεις τύπου Πανελληνίων. JSON:\n{"question": "...", "parts": ["α)", "β)", ...], "full_solution": "...", "marks": N, "time_minutes": N}\nΜόνο JSON.`,
    1500
  )
}
