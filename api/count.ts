// Vercel Serverless Function — "Layer B": counts the same text with Gemini
// (its tokenizer is API-only). OpenAI/o200k and Meta/Llama-3 are counted on
// the client. These RAW counts are the honest multi-model reveal; they are
// never used for scoring.
//
// Guarded: method + origin allowlist + input-size cap to protect our key/quota.
// Requires env: GEMINI_KEY (absent → gemini returns null, client shows "—").

export default async function handler(req: any, res: any) {
  const text = getText(req, res)
  if (text === null) return

  const gemini = await countGemini(text)
  return res.status(200).json({ gemini })
}

function getText(req: any, res: any, max = 8000): string | null {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return null
  }
  const o: string = req.headers?.origin || req.headers?.referer || ''
  if (o) {
    try {
      const host = new URL(o).host
      const ok = host.endsWith('.vercel.app') || host.startsWith('localhost') || host.startsWith('127.0.0.1')
      if (!ok) {
        res.status(403).json({ error: 'forbidden_origin' })
        return null
      }
    } catch {
      res.status(403).json({ error: 'forbidden_origin' })
      return null
    }
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

async function countGemini(text: string): Promise<number | null> {
  const key = process.env.GEMINI_KEY
  if (!key) return null
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:countTokens?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] }),
      },
    )
    const d = await r.json()
    return typeof d.totalTokens === 'number' ? d.totalTokens : null
  } catch {
    return null
  }
}
