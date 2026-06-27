// Vercel Serverless Function — generates 3 comprehension questions for a
// passage using Gemini Flash (free tier). Multilingual (he/en).
// Falls back gracefully on the client if this returns non-200.
//
// Requires env: GEMINI_KEY
// (excluded from the frontend tsconfig — built by Vercel with its own runtime)

import { getText } from './_guard'

export default async function handler(req: any, res: any) {
  const key = process.env.GEMINI_KEY
  if (!key) return res.status(500).json({ error: 'no_key' })

  const text = getText(req, res)
  if (text === null) return
  const lang = req.body?.lang

  const langName = lang === 'he' ? 'Hebrew' : 'English'
  const prompt =
    `You are writing a reading-comprehension quiz. Based ONLY on the passage below, ` +
    `write exactly 3 multiple-choice questions in ${langName}. Each question has 4 options ` +
    `and exactly one correct answer. Do not ask anything not answerable from the passage.\n\n` +
    `PASSAGE:\n${text}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          questions: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                q: { type: 'STRING' },
                options: { type: 'ARRAY', items: { type: 'STRING' } },
                correct: { type: 'INTEGER' },
              },
              required: ['q', 'options', 'correct'],
            },
          },
        },
        required: ['questions'],
      },
    },
  }

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    )
    const data = await r.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = JSON.parse(raw)
    const questions = (parsed.questions || []).slice(0, 3)
    return res.status(200).json({ questions })
  } catch (e) {
    return res.status(500).json({ error: 'gen_failed' })
  }
}
