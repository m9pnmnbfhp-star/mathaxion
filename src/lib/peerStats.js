import { getLeaderboard } from './supabase'

// Abramowitz & Stegun normal CDF approximation
function normalCDF(z) {
  if (z < -6) return 0; if (z > 6) return 1
  const p = 0.2316419
  const b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429]
  const t = 1 / (1 + p * Math.abs(z))
  let poly = 0; let tp = t
  for (const bi of b) { poly += bi * tp; tp *= t }
  const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly
  return z >= 0 ? 1 - phi : phi
}

function logNormalPct(x, median, p90) {
  if (x <= 0) return 2
  const mu = Math.log(median)
  const sigma = (Math.log(p90) - mu) / 1.2816
  return Math.round(normalCDF((Math.log(x) - mu) / sigma) * 100)
}

// Realistic distributions for Greek secondary school students
// (calibrated: median student does very little, top 10% are consistent)
const DIST = {
  weeklyXP:  { median: 35,  p90: 280  },
  totalXP:   { median: 200, p90: 1800 },
  streak:    { median: 3,   p90: 18   },
  chapters:  { median: 2,   p90: 9    },
}

function clamp(v) { return Math.min(99, Math.max(1, v)) }

// Calculate percentile from an array of peer values
function realPercentile(myValue, peerValues) {
  if (peerValues.length < 4) return null
  const below = peerValues.filter(v => v < myValue).length
  return Math.round((below / peerValues.length) * 100)
}

// Returns modeled percentiles immediately; real ones async via callback
export async function getPeerStats({ gradeId, weeklyXP, totalXP, streak, masteredChapters, onRealData }) {
  const modeled = {
    weeklyXP:  clamp(logNormalPct(weeklyXP,  DIST.weeklyXP.median,  DIST.weeklyXP.p90)),
    totalXP:   clamp(logNormalPct(totalXP,   DIST.totalXP.median,   DIST.totalXP.p90)),
    streak:    clamp(logNormalPct(streak,     DIST.streak.median,    DIST.streak.p90)),
    chapters:  clamp(logNormalPct(masteredChapters, DIST.chapters.median, DIST.chapters.p90)),
    source: 'modeled',
  }

  // Try to get real leaderboard data
  if (gradeId) {
    try {
      const { data } = await getLeaderboard(gradeId)
      if (data && data.length >= 4) {
        const peerXP = data.map(e => e.xp || 0)
        const realXPPct = realPercentile(totalXP, peerXP)
        if (realXPPct !== null) {
          onRealData?.({ ...modeled, totalXP: realXPPct, source: 'real', peers: data.length })
        }
      }
    } catch { /* fallback to modeled */ }
  }

  return modeled
}

// Format comparison sentence
export function compareLabel(pct, stat) {
  if (pct >= 95) return `Στο TOP ${100 - pct}% — εξαιρετικό!`
  if (pct >= 80) return `Καλύτερα από ${pct}% των μαθητών στην τάξη σου`
  if (pct >= 60) return `Καλύτερα από ${pct}% των μαθητών`
  if (pct >= 40) return `Στο μέσο επίπεδο (${pct}%)`
  if (pct >= 20) return `${100 - pct}% των μαθητών έχουν περισσότερα — πάμε!`
  return `Μόλις ξεκινάς — υπάρχει χώρος για ανέλιξη 🚀`
}
