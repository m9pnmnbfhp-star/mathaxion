# MathAxion — Full Flywheel Features Design
**Date:** 2026-06-28  
**Status:** Approved

## Problem

Three gaps prevent Greek students from choosing MathAxion over alternatives:
- **Trust (B):** Students don't know if the AI explains correctly
- **Social (C):** No friends use it, no community
- **Results (D):** Students can't see if they're actually improving

## Solution: Full Flywheel

Build in priority order: Results → Social Sharing → Leaderboard.  
Results make the product sticky → shareable card spreads it → leaderboard brings competition.

---

## Feature 1: Mastery System

### Data Model
No new Supabase tables needed. Uses existing Zustand `progress` state:
- `progress[gradeId/chapterId].completedExercises`
- Mastery % = `Math.min(100, completedExercises * 10)`
- Grade mastery = average mastery % across all chapters in that grade

### 1a: ProfilePage — Radar Chart
- Pure SVG radar chart (~80 lines, no extra library)
- 6 axes — one per grade: Α'Γυμ, Β'Γυμ, Γ'Γυμ, Α'Λυκ, Β'Λυκ, Γ'Λυκ
- Each axis = average mastery % for that grade (0–100%)
- Violet fill at 25% opacity, violet border, white axis labels
- Placed below avatar card in ProfilePage
- Framer Motion entrance animation (scale from 0.8 → 1)

### 1b: GradePage — Chapter Heatmap
- Compact grid (3–4 columns) above the chapter list, one cell per chapter
- Cell color by mastery %:
  - 0% → `#16161f` (not started)
  - 1–40% → `rgba(239,68,68,0.15–0.4)` (red)
  - 41–70% → `rgba(245,158,11,0.2–0.5)` (amber)
  - 71–100% → `rgba(16,185,129,0.2–0.6)` (emerald)
- Hover tooltip: chapter name + mastery %
- Click → navigate to that chapter
- Header stat: "X/Y Κεφάλαια κατακτημένα"

---

## Feature 2: Shareable Progress Card

### Technical Approach
- Hidden fixed-size `<div>` rendered in the DOM, styled with inline CSS
- `html2canvas` captures it as PNG (add to dependencies)
- Web Share API on mobile (native share sheet), fallback to download on desktop
- No backend required

### Two Formats (user picks before sharing)

**Stories (9:16)**
- Dimensions: 360×640px (scales to 1080×1920 on download)
- Background: dark `#0a0a0f` + violet radial glow + floating math symbols (π Σ Δ θ) at 3% opacity
- Content: MathAxion logo → avatar initial + level badge → XP + streak + mastered chapters → overall mastery progress bar → `mathaxion.com` watermark

**Square (1:1)**
- Dimensions: 360×360px
- Compact layout: logo + username + level in one row → stats row (XP, streak, chapters) → mastery bar
- Same dark background with math symbols

### UI Flow
1. Button "Μοιράσου την πρόοδό σου" on ProfilePage (below stats grid)
2. Modal with side-by-side preview of both formats
3. User picks format → "Κοινοποίηση" (Web Share API) or "Λήψη" (download PNG)

### Card Content
- Display name (or email prefix)
- Level (Lv.X)
- Total XP
- Current streak (days)
- Mastered chapters count
- Overall mastery % bar
- MathAxion branding + URL

---

## Feature 3: Leaderboard

### Technical Approach
**Problem:** XP currently lives only in Zustand localStorage — not synced to Supabase.  
**Fix:** In `useStore.js`, `addXP(amount)` must also call `logXP(userId, amount)` to Supabase.

Existing `getLeaderboard(gradeId)` in `supabase.js` already queries a `leaderboard` table. We assume this table has: `user_id`, `grade_id`, `xp`, and joins `profiles(display_name)`.

### New Page: `/leaderboard`
- Added to `App.jsx` routes and Header nav

### Layout
- Page header: trophy icon + "Leaderboard" title
- Tab bar: "Global" + one tab per grade (6 grades)
- List of top 20 users per tab:
  - Rank number (gold/silver/bronze styling for top 3)
  - Avatar initial circle (colored by user's selected grade color)
  - Display name
  - Level badge (Lv.X)
  - XP with star icon
- **Sticky "you" row** at the bottom: always shows the current user's rank even if outside top 20
- Animated rank numbers (count-up on mount with `useCounter`)
- Empty state when no users in that grade yet: "Γίνε ο πρώτος σε αυτή την τάξη! 🏆"

### Data Flow
1. On page mount: fetch leaderboard from Supabase for active tab
2. Tab switch: refetch for new grade
3. If user is logged in: highlight their row, show sticky rank at bottom
4. If not logged in: prompt to sign up to appear on leaderboard

---

## Implementation Order

1. **Mastery Heatmap (GradePage)** — no new dependencies, fast to build
2. **Radar Chart (ProfilePage)** — pure SVG, no dependencies
3. **XP sync to Supabase** — prerequisite for leaderboard
4. **Leaderboard page** — new route + Supabase reads
5. **Shareable Progress Card** — add `html2canvas`, build card + share modal

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/GradePage.jsx` | Add chapter heatmap grid above chapter list |
| `src/pages/ProfilePage.jsx` | Add radar chart section + share card button |
| `src/pages/LeaderboardPage.jsx` | New page |
| `src/components/profile/RadarChart.jsx` | New SVG component |
| `src/components/profile/ShareCard.jsx` | New share card + modal |
| `src/store/useStore.js` | Sync XP to Supabase in `addXP()` |
| `src/App.jsx` | Add `/leaderboard` route |
| `src/components/layout/Header.jsx` | Add Leaderboard nav link |
| `package.json` | Add `html2canvas` |
