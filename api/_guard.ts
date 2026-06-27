// Shared guard for the public /api functions. Files prefixed with "_" are not
// treated as routes by Vercel — this is import-only.
//
// Purpose: our /api endpoints forward text to Gemini using OUR key, so an open,
// unbounded endpoint is a quota-abuse / free-LLM-proxy vector. We bound the
// input size and reject obviously cross-site callers.

export function checkOrigin(req: any): boolean {
  const o: string = req.headers?.origin || req.headers?.referer || ''
  if (!o) return true // same-origin requests may legitimately omit Origin
  try {
    const host = new URL(o).host
    return host.endsWith('.vercel.app') || host.startsWith('localhost') || host.startsWith('127.0.0.1')
  } catch {
    return false
  }
}

// Validate a POST { text } body. Returns the text, or null after writing an
// error response (caller must `return` on null).
export function getText(req: any, res: any, max = 8000): string | null {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return null
  }
  if (!checkOrigin(req)) {
    res.status(403).json({ error: 'forbidden_origin' })
    return null
  }
  const text = req.body?.text
  if (typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'no_text' })
    return null
  }
  if (text.length > max) {
    res.status(413).json({ error: 'text_too_large' })
    return null
  }
  return text
}
