// Daily challenge — everyone gets the same content on the same (UTC) day,
// the Wordle ritual: shared experience, comparable scores, can't binge.

const EPOCH = Date.UTC(2026, 0, 1) // day #1 = 2026-01-01 (UTC)

/** Integer day index (UTC) — used for streak math. */
export function dayStamp(now = new Date()): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000)
}

/** Human-facing daily number (#1, #2, …). */
export function dailyNumber(now = new Date()): number {
  return Math.floor((dayStamp(now) * 86400000 - EPOCH) / 86400000) + 1
}
