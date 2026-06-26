import type { Lang } from './i18n'

export type Mode = 'reading' | 'typing'

// ── TokenPace — the fair, credibility-safe competitive metric ─────────
//
// THE FIREWALL:  we normalize the *unit of the score*, never the *token
// count*. Raw o200k_base counts stay byte-true everywhere (and are shown
// honestly in the Layer-B multi-model reveal). What we normalize is only
// HOW we grade speed: every user is compared to the AVERAGE of their OWN
// language. Because Hebrew's higher raw tokens/sec is divided by Hebrew's
// own (higher) baseline, the tokenizer's per-language inflation cancels
// out — a bilingual user sees intuitive numbers (they score higher in the
// language they're actually better at), with no rigged-feeling artifact.
//
// BASELINE_TPS = expected RAW o200k_base tokens/sec for an *average* human
// in that language + mode. These are analytic COLD-START seeds derived
// from typical reading/typing speeds; they are meant to be replaced by the
// live population median pulled from Supabase once real data exists
// (see refreshBaselines()).
//
//   reading: avg_wpm * tokens_per_word / 60
//   typing : avg_typing_wpm * tokens_per_word / 60
//   (Hebrew packs more tokens per word under o200k_base, hence higher TPS.)

export const BASELINE_TPS: Record<Lang, Record<Mode, number>> = {
  en: { reading: 5.2, typing: 0.9 },
  he: { reading: 6.6, typing: 1.1 },
}

// Allow the live population median (from Supabase) to override the seed.
const liveBaseline: Partial<Record<Lang, Partial<Record<Mode, number>>>> = {}

export function refreshBaselines(next: Partial<Record<Lang, Partial<Record<Mode, number>>>>) {
  for (const lang of Object.keys(next) as Lang[]) {
    liveBaseline[lang] = { ...liveBaseline[lang], ...next[lang] }
  }
}

function baselineFor(lang: Lang, mode: Mode): number {
  return liveBaseline[lang]?.[mode] ?? BASELINE_TPS[lang][mode]
}

export function rawTps(tokens: number, seconds: number): number {
  if (seconds <= 0) return 0
  return tokens / seconds
}

/** TokenPace: 100 = average for that language+mode. Within-language only. */
export function tokenPace(tokens: number, seconds: number, lang: Lang, mode: Mode): number {
  const tps = rawTps(tokens, seconds)
  const pace = (tps / baselineFor(lang, mode)) * 100
  return Math.max(0, Math.round(pace))
}

/** Approx "faster than X%" until we have a real population distribution. */
export function pacePercentile(pace: number): number {
  const p = 1 / (1 + Math.exp(-(pace - 100) / 32))
  return Math.min(99, Math.max(1, Math.round(p * 100)))
}

/** A playful rank label keyed off the pace score. */
export function paceTier(pace: number): { key: string; emoji: string } {
  if (pace >= 175) return { key: 'tier_legend', emoji: '👑' }
  if (pace >= 135) return { key: 'tier_blazing', emoji: '🚀' }
  if (pace >= 105) return { key: 'tier_fast', emoji: '⚡' }
  if (pace >= 75) return { key: 'tier_steady', emoji: '🎯' }
  return { key: 'tier_warmup', emoji: '🌱' }
}
