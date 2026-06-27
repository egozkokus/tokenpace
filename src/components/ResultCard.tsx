import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { RunResult } from '../App'
import { countTokens } from '../lib/tokenizer'
import { tierFor, vsAverage, scalePos, avgPos, tpm } from '../lib/pace'
import { submitScore, hasSupabase } from '../lib/supabase'
import { Panel, Button, Stat } from './ui'

interface ModelCounts {
  openai: number
  llama: number
  gemini: number | null
}

function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

export default function ResultCard({
  result,
  onPlayAgain,
  onHome,
}: {
  result: RunResult
  onPlayAgain: () => void
  onHome: () => void
}) {
  const { t } = useTranslation()
  const tier = tierFor(result.wpm, result.mode)
  const vs = vsAverage(result.wpm, result.mode)
  const tpmVal = tpm(result.tokens, result.seconds)
  const tpmShown = useCountUp(result.passed ? tpmVal : 0)
  const pos = scalePos(result.wpm, result.mode)
  const avg = avgPos(result.mode)
  const who = result.mode === 'reading' ? t('who_reader') : t('who_typist')
  const scaleHigh = result.mode === 'reading' ? t('scale_high_read') : t('scale_high_type')

  const [counts, setCounts] = useState<ModelCounts | null>(null)
  const [loadingB, setLoadingB] = useState(false)
  const [name, setName] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'remote' | 'local'>('idle')

  async function revealLayerB() {
    setLoadingB(true)
    const openai = countTokens(result.text) // always real, local
    let llama = 0
    try {
      const mod = await import('llama3-tokenizer-js')
      llama = mod.default.encode(result.text).length
    } catch {
      llama = 0
    }
    let gemini: number | null = null
    try {
      const res = await fetch('/api/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.text }),
      })
      if (res.ok) {
        const d = await res.json()
        gemini = typeof d.gemini === 'number' ? d.gemini : null
      }
    } catch {
      /* offline / not deployed — Gemini shows "—" */
    }
    setCounts({ openai, llama, gemini })
    setLoadingB(false)
  }

  async function save() {
    if (!name.trim() || !result.passed) return
    const { remote } = await submitScore({
      name: name.trim().slice(0, 24),
      lang: result.lang,
      mode: result.mode,
      tpm: tpmVal,
      wpm: result.wpm,
      raw_tokens: result.tokens,
      seconds: result.seconds,
    })
    setSaveState(remote ? 'remote' : 'local')
  }

  const available = counts ? [counts.openai, counts.llama, counts.gemini].filter((n): n is number => n != null) : []
  const consensus = available.length ? Math.round(available.reduce((a, b) => a + b, 0) / available.length) : 0

  return (
    <div className="space-y-5">
      {/* hero: tier + benchmark + scale + numbers */}
      <Panel className="text-center glow">
        {result.passed ? (
          <>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="text-5xl"
            >
              {tier.emoji}
            </motion.div>
            <div className="mt-1 font-display text-2xl sm:text-3xl font-bold">{t(tier.key)}</div>
            <div className="mt-1 text-sm text-muted">
              {vs > 0
                ? t('vs_faster', { p: vs, who })
                : vs < 0
                  ? t('vs_slower', { p: -vs, who })
                  : t('vs_same', { who })}
            </div>

            {/* visual scale (always LTR: slow → fast) */}
            <div className="mx-auto mt-5 max-w-sm" dir="ltr">
              <div className="relative h-2.5 rounded-full border border-line bg-gradient-to-r from-good/25 via-[#e3b341]/25 to-bad/25">
                <div
                  className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-muted"
                  style={{ left: `${avg * 100}%` }}
                />
                <motion.div
                  className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-bg"
                  initial={{ left: '0%' }}
                  animate={{ left: `${pos * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="relative mt-1.5 h-3 text-[10px] text-muted">
                <span className="absolute left-0">{t('scale_low')}</span>
                <span className="absolute -translate-x-1/2" style={{ left: `${avg * 100}%` }}>
                  {t('avg_marker')}
                </span>
                <span className="absolute right-0">{scaleHigh}</span>
              </div>
            </div>

            {/* concrete numbers: tokens/min (theme) + words/min (anchor) */}
            <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3">
              <Stat value={tpmShown} label={t('unit_tpm')} accent />
              <Stat value={result.wpm} label={t('unit_wpm')} />
            </div>
            <div className="mt-2 text-xs text-muted/80">
              {result.tokens} {t('raw_tokens')} · {result.seconds.toFixed(1)}
              {t('seconds_short')}
              {result.comp ? ` · ${t('comp_score', { c: result.comp.correct })}` : ''}
            </div>
          </>
        ) : (
          <div className="py-4">
            <div className="text-5xl">😅</div>
            <p className="mt-3 text-muted">{t('comp_failed')}</p>
          </div>
        )}
      </Panel>

      {/* Layer B — multi-model reveal (the token gimmick) */}
      {!counts ? (
        <Button onClick={revealLayerB} variant="ghost" full disabled={loadingB}>
          {loadingB ? t('layerb_loading') : t('layerb_btn')}
        </Button>
      ) : (
        <Panel className="space-y-3">
          <div className="font-display text-lg font-bold">{t('layerb_title')}</div>
          <ModelRow name="OpenAI · o200k" v={counts.openai} badge="🎯" />
          <ModelRow name="Meta · Llama 3" v={counts.llama} badge="🦙" />
          <ModelRow name="Google · Gemini" v={counts.gemini} badge="✂️" />
          <div className="border-t border-line pt-3">
            <ModelRow name={t('consensus')} v={consensus} badge="📊" strong />
          </div>
          <p className="text-xs text-muted/80">{t('layerb_note')}</p>
        </Panel>
      )}

      {/* save */}
      {result.passed && (
        <Panel className="space-y-3">
          <p className="text-xs text-muted">{t('public_notice')}</p>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('your_name')}
              maxLength={24}
              className="flex-1 rounded-xl border border-line bg-bg2 px-4 py-2.5 outline-none focus:border-accent"
            />
            <Button onClick={save} disabled={!name.trim() || saveState !== 'idle'}>
              {saveState === 'remote' ? t('saved') : saveState === 'local' ? t('saved_local') : t('save_score')}
            </Button>
          </div>
          {saveState === 'local' && <p className="text-xs text-[#e3b341]">{t('saved_local_note')}</p>}
          {!hasSupabase && <p className="text-xs text-muted/70">{t('lb_local')}</p>}
        </Panel>
      )}

      <div className="flex gap-3">
        <Button onClick={onPlayAgain} full>
          {t('play_again')} ↻
        </Button>
        <Button onClick={onHome} variant="ghost">
          {t('home')}
        </Button>
      </div>
    </div>
  )
}

function ModelRow({ name, v, badge, strong }: { name: string; v: number | null; badge: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 ${strong ? 'font-bold' : ''}`}>
        <span>{badge}</span>
        <span>{name}</span>
      </div>
      <div className={`tabnum ${strong ? 'text-accent font-bold' : 'text-ink'}`}>{v == null ? '—' : v}</div>
    </div>
  )
}
