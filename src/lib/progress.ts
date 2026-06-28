import type { Mode } from './pace'
import { dayStamp } from './daily'

// Local-only progression: streak (daily ritual) + personal bests (visible
// improvement = the Monkeytype retention hook).

const KEY = 'tokenpace_progress'

interface Progress {
  streak: number
  lastDay: number // dayStamp of the last completed daily
  best: { reading: number; typing: number }
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && typeof p.streak === 'number' && p.best) return p
    }
  } catch {
    /* fall through */
  }
  return { streak: 0, lastDay: -1, best: { reading: 0, typing: 0 } }
}

function save(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export interface RunOutcome {
  isPB: boolean
  streak: number
  best: number
}

/** Record a completed run; updates PB and (for daily runs) the streak. */
export function recordRun(mode: Mode, wpm: number, isDaily: boolean): RunOutcome {
  const p = load()
  const isPB = wpm > p.best[mode]
  if (isPB) p.best[mode] = wpm

  if (isDaily) {
    const today = dayStamp()
    if (p.lastDay === today) {
      /* already counted a daily today — streak unchanged */
    } else if (p.lastDay === today - 1) {
      p.streak += 1
      p.lastDay = today
    } else {
      p.streak = 1
      p.lastDay = today
    }
  }
  save(p)
  return { isPB, streak: p.streak, best: p.best[mode] }
}

/** Streak to display now (broken to 0 if a day was missed). */
export function currentStreak(): number {
  const p = load()
  if (p.lastDay < 0) return 0
  const today = dayStamp()
  return p.lastDay === today || p.lastDay === today - 1 ? p.streak : 0
}

export function personalBest(mode: Mode): number {
  return load().best[mode]
}
