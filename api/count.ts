// Vercel Serverless Function — "Layer B": counts the same text with Gemini
// (its tokenizer is API-only). OpenAI/o200k and Meta/Llama-3 are counted on
// the client (both have free, runnable tokenizers). These RAW counts are the
// honest multi-model reveal; they are never used for scoring (scoring is
// always the single client-side o200k tokenizer).
//
// Requires env: GEMINI_KEY  (absent → gemini returns null, client shows "—").

import { getText } from './_guard'

export default async function handler(req: any, res: any) {
  const text = getText(req, res)
  if (text === null) return

  const gemini = await countGemini(text)
  return res.status(200).json({ gemini })
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
