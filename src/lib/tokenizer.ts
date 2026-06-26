// ── Reference tokenizer ──────────────────────────────────────────────
// o200k_base (GPT-4o / 5 family). Runs fully client-side, synchronously,
// zero cost, zero latency. This is our single canonical tokenizer: every
// TokenPace score and leaderboard entry is computed ONLY from this, so the
// numbers are consistent and comparable across all users.
// (Claude & Gemini don't expose a tokenizer — those are counted on-demand
//  via /api/count for the "Layer B" multi-model reveal, never for scoring.)
import { encode } from 'gpt-tokenizer/encoding/o200k_base'

export function countTokens(text: string): number {
  if (!text) return 0
  try {
    return encode(text).length
  } catch {
    // extremely defensive fallback — should never run in practice
    return Math.ceil(text.length / 4)
  }
}

export function tokenize(text: string): number[] {
  if (!text) return []
  try {
    return encode(text)
  } catch {
    return []
  }
}
