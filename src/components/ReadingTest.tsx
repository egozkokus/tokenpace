import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Lang } from '../lib/i18n'
import type { RunResult } from '../App'
import { countTokens } from '../lib/tokenizer'
import { readingWpm, wordCount } from '../lib/pace'
import { randomPassage, PASSAGES } from '../data/passages'
import type { Question } from '../data/passages'
import { Panel, Button } from './ui'

type Phase = 'read' | 'loading' | 'quiz'

export default function ReadingTest({
  lang,
  onFinish,
}: {
  lang: Lang
  onFinish: (r: RunResult) => void
}) {
  const { t } = useTranslation()
  const passage = useMemo(() => randomPassage(lang), [lang])
  const [phase, setPhase] = useState<Phase>('read')
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(Date.now())
  const secondsRef = useRef<number>(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<number[]>([])

  // live timer while reading
  useEffect(() => {
    if (phase !== 'read') return
    startRef.current = Date.now()
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100)
    return () => clearInterval(id)
  }, [phase])

  async function doneReading() {
    secondsRef.current = (Date.now() - startRef.current) / 1000
    setPhase('loading')
    const qs = await fetchQuestions(passage.text, lang)
    setQuestions(qs)
    setAnswers(new Array(qs.length).fill(-1))
    setPhase('quiz')
  }

  function submit() {
    const correct = questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0)
    const passed = correct >= Math.ceil(questions.length * 0.66)
    const tokens = countTokens(passage.text)
    const seconds = secondsRef.current
    const wpm = readingWpm(wordCount(passage.text), seconds)
    onFinish({
      mode: 'reading',
      lang,
      tokens,
      seconds,
      wpm,
      passed,
      comp: { correct, total: questions.length },
      text: passage.text,
    })
  }

  if (phase === 'loading') {
    return (
      <Panel className="text-center">
        <div className="animate-pulse text-2xl">🧠</div>
        <p className="mt-3 text-muted">{t('generating')}</p>
      </Panel>
    )
  }

  if (phase === 'quiz') {
    const allAnswered = answers.every((a) => a >= 0)
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">{t('comprehension')}</h2>
        <p className="text-sm text-muted">{t('comp_intro')}</p>
        {questions.map((q, qi) => (
          <Panel key={qi} className="space-y-3">
            <div className="font-semibold">
              {qi + 1}. {q.q}
            </div>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                  className={`rounded-xl border px-4 py-2.5 text-start text-sm transition ${
                    answers[qi] === oi
                      ? 'border-accent bg-accent/15 text-ink'
                      : 'border-line bg-panel2 text-muted hover:text-ink'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Panel>
        ))}
        <Button onClick={submit} disabled={!allAnswered} full>
          {t('submit_answers')}
        </Button>
      </div>
    )
  }

  // phase === 'read'
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{passage.title}</h2>
        <div className="tabnum rounded-full border border-line bg-panel2 px-3 py-1 text-sm text-accent">
          {elapsed.toFixed(1)} {t('seconds_short')}
        </div>
      </div>
      <p className="text-sm text-muted">{t('read_instruction')}</p>
      <Panel>
        <p className="text-lg leading-relaxed">{passage.text}</p>
      </Panel>
      <Button onClick={doneReading} full>
        {t('done_reading')}
      </Button>
    </div>
  )
}

async function fetchQuestions(text: string, lang: Lang): Promise<Question[]> {
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.questions) && data.questions.length) {
        return data.questions.slice(0, 3)
      }
    }
  } catch {
    /* fall through to static */
  }
  // graceful fallback: static questions bundled with the passage
  const match = PASSAGES[lang].find((p) => p.text === text)
  return match ? match.questions : []
}
