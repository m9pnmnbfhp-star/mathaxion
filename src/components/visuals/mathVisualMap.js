import { lazy } from 'react'

const PythagoreanVisual  = lazy(() => import('./PythagoreanVisual'))
const FractionVisual     = lazy(() => import('./FractionVisual'))
const CircleVisual       = lazy(() => import('./CircleVisual'))
const LinearFunctionVisual = lazy(() => import('./LinearFunctionVisual'))
const TriangleAnglesVisual = lazy(() => import('./TriangleAnglesVisual'))

const RULES = [
  { keywords: ['πυθαγόρ', 'pythagor', 'υποτείνουσ'], component: PythagoreanVisual },
  { keywords: ['κλάσμα', 'κλασμα', 'παρονομαστ', 'αριθμητ'], component: FractionVisual },
  { keywords: ['κύκλ', 'κυκλ', 'ακτίνα', 'ακτινα', 'διάμετρ', 'διαμετρ', 'περίμετρ', 'περιμετρ', 'εμβαδό κύκλ'], component: CircleVisual },
  { keywords: ['γραμμική συνάρτ', 'γραμμικη συναρτ', 'y=αx', 'y = αx', 'y=ax', 'κλίση ευθείας', 'κλιση ευθειας', 'τεταγμένη αρχή', 'τεταγμενη αρχη'], component: LinearFunctionVisual },
  { keywords: ['γωνί', 'γωνι', 'τρίγων', 'τριγων', 'ισόπλευρ', 'ισοσκελ', 'σκαληνό', 'άθροισμα γωνιών'], component: TriangleAnglesVisual },
]

export function getVisualForConcept(concept = '') {
  const lower = concept.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.component
    }
  }
  return null
}
