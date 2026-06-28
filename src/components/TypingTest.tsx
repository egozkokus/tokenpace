import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Lang } from '../lib/i18n'
import type { RunResult } from '../App'
import { countTokens } from '../lib/tokenizer'
import { typingWpm, tpm } from '../lib/pace'
import { dailyNumber } from '../lib/daily'
import { TOPICS, randomTopic, dailyTopic } from '../data/passages'
import { Panel, Button, Stat } from './ui'

const DURATION = 60 // seconds

export default function TypingTest({
  lang,
  daily,
  onFinish,
}: {
  lang: Lang
  daily: boolean
  onFinish: (r: RunResult) => void
}) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<'setup' | 'type'>('setup')
  const [topic, setTopic] = useState('')
  const [custom, setCustom] = useState('')
  const [text, setText] = useState('')
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const startRef = useRef<number>(0)
  const textRef = useRef('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  const tokens = useMemo(() => countTokens(text), [text])
  const elapsed = phase === 'type' ? Math.max(0.001, DURATION - timeLeft) : 0
  const liveTpm = tpm(tokens, elapsed)

  useEffect(() => {
    textRef.current = text
  }, [text])

  function begin(chosen: string) {
    setTopic(chosen)
    setPhase('type')
    setTimeLeft(DURATION)
    startRef.current = Date.now()
    setTimeout(() => taRef.current?.focus(), 50)
  }

  useEffect(() => {
    if (phase !== 'type') return
    const id = setInterval(() => {
      const left = DURATION - (Date.now() - startRef.current) / 1000
      if (left <= 0) {
        clearInterval(id)
        setTimeLeft(0)
        finish(DURATION)
      } else {
        setTimeLeft(left)
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function finish(seconds?: number) {
    const secs = seconds ?? (Date.now() - startRef.current) / 1000
    const tk = countTokens(textRef.current)
    const wpm = typingWpm(textRef.current.length, secs)
    onFinish({
      mode: 'typing',
      lang,
      tokens: tk,
      seconds: secs,
      wpm,
      isDaily: daily,
      passed: true,
      text: textRef.current,
    })
  }

  if (phase === 'setup') {
    if (daily) {
      const dt = dailyTopic(lang, dailyNumber())
      return (
        <div className="space-y-4 text-center">
          <div className="text-sm text-muted">{t('daily_n', { n: dailyNumber() })}</div>
          <h2 className="font-display text-2xl font-bold">{t('todays_topic')}</h2>
          <Panel>
            <p className="text-lg font-semibold">{dt}</p>
          </Panel>
          <Button onClick={() => begin(dt)} variant="accent2" full>
            {t('start')} →
          </Button>
        </div>
      )
    }
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">{t('pick_topic')}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {TOPICS[lang].map((tp) => (
            <button
              key={tp}
              onClick={() => begin(tp)}
              className="rounded-xl border border-line bg-panel2 px-4 py-3 text-start text-sm hover:border-accent2/60 transition"
            >
              {tp}
            </button>
          ))}
        </div>
        <Panel className="space-y-3">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={t('topic_input_ph')}
            className="w-full rounded-xl border border-line bg-bg2 px-4 py-2.5 outline-none focus:border-accent2"
          />
          <div className="flex gap-2">
            <Button onClick={() => begin(custom || randomTopic(lang))} variant="accent2">
              {t('start')} →
            </Button>
            <Button onClick={() => begin(randomTopic(lang))} variant="ghost">
              {t('random_topic')}
            </Button>
          </div>
        </Panel>
      </div>
    )
  }

  const danger = timeLeft <= 10
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 truncate text-sm text-muted">
          {t('typing_prompt')} <span className="font-semibold text-ink">{topic}</span>
        </div>
        <div
          className={`shrink-0 tabnum rounded-full border px-4 py-1.5 text-lg font-bold ${
            danger ? 'border-bad/60 bg-bad/15 text-bad' : 'border-line bg-panel2 text-accent2'
          }`}
        >
          {Math.ceil(timeLeft)}
          <span className="text-xs font-normal"> {t('seconds_short')}</span>
        </div>
      </div>

      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        dir={lang === 'he' ? 'rtl' : 'ltr'}
        className="w-full resize-none rounded-3xl border border-line bg-panel/80 p-5 text-lg leading-relaxed outline-none focus:border-accent2"
        placeholder="…"
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat value={tokens} label={t('live_tokens')} accent />
        <Stat value={liveTpm} label={t('live_tpm')} />
        <div className="flex items-stretch">
          <Button onClick={() => finish()} variant="ghost" full>
            {t('finish')}
          </Button>
        </div>
      </div>
    </div>
  )
}
