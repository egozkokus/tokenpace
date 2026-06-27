export type Mode = 'reading' | 'typing'

// ── Scoring model — clear, credible, language-fair ───────────────────
//
// The score people SEE is anchored to things they already understand:
//  • WPM (words/min) — the universal speed metric, and naturally fair across
//    languages (words are comparable units; tokens are not), so it doubles as
//    the cross-language fairness fix.
//  • A named TIER and a comparison to a REAL human average (no user population
//    needed — credible from day one).
// Tokens stay the THEME: tokens/min is the signature headline number and the
// Layer-B multi-model reveal is the gimmick. We grade on WPM, theme on tokens.

// Real-world human averages (the credible anchor) and the scale-bar ceiling.
export const AVG_WPM: Record<Mode, number> = { reading: 238, typing: 40 }
const SCALE_MAX: Record<Mode, number> = { reading: 600, typing: 100 }

export function wordCount(text: string): number {
  const m = text.trim().match(/\S+/g)
  return m ? m.length : 0
}

/** Reading speed: actual words / minutes. */
export function readingWpm(words: number, seconds: number): number {
  if (seconds <= 0) return 0
  return Math.round(words / (seconds / 60))
}

/** Typing speed: the standard WPM definition (chars ÷ 5) / minutes. */
export function typingWpm(chars: number, seconds: number): number {
  if (seconds <= 0) return 0
  return Math.round(chars / 5 / (seconds / 60))
}

/** Tokens per minute — the themed headline number (o200k). */
export function tpm(tokens: number, seconds: number): number {
  if (seconds <= 0) return 0
  return Math.round(tokens / (seconds / 60))
}

export interface Tier {
  key: string
  emoji: string
  min: number
}

const TIERS: Record<Mode, Tier[]> = {
  reading: [
    { key: 'tier_r_slow', emoji: '🐢', min: 0 },
    { key: 'tier_r_avg', emoji: '📖', min: 150 },
    { key: 'tier_r_fast', emoji: '⚡', min: 250 },
    { key: 'tier_r_speed', emoji: '🚀', min: 350 },
    { key: 'tier_r_super', emoji: '👽', min: 500 },
  ],
  typing: [
    { key: 'tier_t_slow', emoji: '🐢', min: 0 },
    { key: 'tier_t_avg', emoji: '⌨️', min: 25 },
    { key: 'tier_t_fast', emoji: '⚡', min: 40 },
    { key: 'tier_t_pro', emoji: '🚀', min: 60 },
    { key: 'tier_t_super', emoji: '👽', min: 80 },
  ],
}

export function tierFor(wpm: number, mode: Mode): Tier {
  const list = TIERS[mode]
  let chosen = list[0]
  for (const t of list) if (wpm >= t.min) chosen = t
  return chosen
}

/** % vs the average human; positive = faster. */
export function vsAverage(wpm: number, mode: Mode): number {
  return Math.round(((wpm - AVG_WPM[mode]) / AVG_WPM[mode]) * 100)
}

/** Position 0..1 on the slow→fast scale bar (clamped). */
export function scalePos(wpm: number, mode: Mode): number {
  return Math.max(0, Math.min(1, wpm / SCALE_MAX[mode]))
}

/** The average marker's position on the same bar. */
export function avgPos(mode: Mode): number {
  return AVG_WPM[mode] / SCALE_MAX[mode]
}
