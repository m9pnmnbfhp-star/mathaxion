import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

let _supabase
try {
  _supabase = createClient(supabaseUrl, supabaseAnonKey)
} catch {
  // Not configured yet — stub client that returns empty data
  _supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase δεν είναι ρυθμισμένο' } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase δεν είναι ρυθμισμένο' } }),
      signInWithOAuth: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), data: null, error: null }) }), upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }), insert: () => Promise.resolve({ error: null }), order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
    rpc: () => Promise.resolve({ error: null }),
  }
}

export const supabase = _supabase

export async function signUp(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  return { data, error }
}

export async function getProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
  return { data, error }
}

export async function updateProgress(userId, gradeId, chapterId, updates) {
  const { data, error } = await supabase
    .from('progress')
    .upsert({
      user_id: userId,
      grade_id: gradeId,
      chapter_id: chapterId,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  return { data, error }
}

export async function getStreak(userId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export async function updateStreak(userId, streakData) {
  const { data, error } = await supabase
    .from('streaks')
    .upsert({ user_id: userId, ...streakData })
    .select()
    .single()
  return { data, error }
}

export async function getLeaderboard(gradeId) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, profiles(display_name, avatar_url)')
    .eq('grade_id', gradeId)
    .order('xp', { ascending: false })
    .limit(20)
  return { data, error }
}

export async function createBattle(challengerId, opponentId, gradeId, chapterId) {
  const { data, error } = await supabase
    .from('battles')
    .insert({
      challenger_id: challengerId,
      opponent_id: opponentId,
      grade_id: gradeId,
      chapter_id: chapterId,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  return { data, error }
}

export async function saveWrongAnswer(userId, gradeId, chapterId, concept, question) {
  const { error } = await supabase
    .from('wrong_answers')
    .insert({
      user_id: userId,
      grade_id: gradeId,
      chapter_id: chapterId,
      concept,
      question,
      created_at: new Date().toISOString(),
    })
  return { error }
}

export async function getWrongAnswers(userId) {
  const { data, error } = await supabase
    .from('wrong_answers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  return { data, error }
}

export async function logXP(userId, amount, reason) {
  const { error } = await supabase.rpc('add_xp', { user_id: userId, amount, reason })
  return { error }
}
