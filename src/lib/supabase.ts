import { createClient } from '@supabase/supabase-js'
import type { Lang } from './i18n'
import type { Mode } from './pace'

// Optional. If the env vars are absent, the app degrades gracefully to a
// localStorage-only leaderboard so everything still works with zero setup.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key) : null
export const hasSupabase = !!supabase

export interface ScoreRow {
  name: string
  lang: Lang
  mode: Mode
  pace: number
  raw_tokens: number
  seconds: number
  created_at?: string
}

const LS_KEY = 'tokenpace_scores'

function localScores(): ScoreRow[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

export async function submitScore(row: ScoreRow): Promise<void> {
  if (supabase) {
    await supabase.from('scores').insert({
      name: row.name,
      lang: row.lang,
      mode: row.mode,
      pace: row.pace,
      raw_tokens: row.raw_tokens,
      seconds: row.seconds,
    })
  }
  // also keep a local copy so the user always sees their own runs
  const all = localScores()
  all.push({ ...row, created_at: new Date().toISOString() })
  localStorage.setItem(LS_KEY, JSON.stringify(all.slice(-200)))
}

export async function topScores(lang: Lang, mode: Mode, limit = 12): Promise<ScoreRow[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('scores')
      .select('name,lang,mode,pace,raw_tokens,seconds,created_at')
      .eq('lang', lang)
      .eq('mode', mode)
      .order('pace', { ascending: false })
      .limit(limit)
    if (!error && data) return data as ScoreRow[]
  }
  return localScores()
    .filter((s) => s.lang === lang && s.mode === mode)
    .sort((a, b) => b.pace - a.pace)
    .slice(0, limit)
}
