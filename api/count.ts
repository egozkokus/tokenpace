// Vercel Serverless Function — "Layer B": counts the same text with Claude
// and Gemini (their tokenizers are API-only). OpenAI/o200k is counted on the
// client. These RAW counts are the honest multi-model reveal; they are never
// used for scoring (scoring is always the single client-side o200k tokenizer).
//
// Requires env: ANTHROPIC_KEY, GEMINI_KEY  (either may be absent → that one
// returns null and the client just shows "—").

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })

  const { text } = req.body || {}
  if (!text) return res.status(400).json({ error: 'no_text' })

  const [claude, gemini] = await Promise.all([countClaude(text), countGemini(text)])
  return res.status(200).json({ claude, gemini })
}

async function countClaude(text: string): Promise<number | null> {
  const key = process.env.ANTHROPIC_KEY
  if (!key) return null
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'claude-opus-4-8', messages: [{ role: 'user', content: text }] }),
    })
    const d = await r.json()
    return typeof d.input_tokens === 'number' ? d.input_tokens : null
  } catch {
    return null
  }
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
