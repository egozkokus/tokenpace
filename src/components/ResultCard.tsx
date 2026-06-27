import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { RunResult } from '../App'
import { LANG_LABEL } from '../lib/i18n'
import { countTokens } from '../lib/tokenizer'
import { pacePercentile, paceTier } from '../lib/pace'
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
  const paceShown = useCountUp(result.passed ? result.pace : 0)
  const tier = paceTier(result.pace)
  const pct = pacePercentile(result.pace)

  const [counts, setCounts] = useState<ModelCounts | null>(null)
  const [loadingB, setLoadingB] = useState(false)
  const [name, setName] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'remote' | 'local'>('idle')

  async function revealLayerB() {
    setLoadingB(true)
    const openai = countTokens(result.text) // always real, local
    // Llama 3 tokenizer — also fully client-side & free (lazy-loaded on demand)
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
      pace: result.pace,
      raw_tokens: result.tokens,
      seconds: result.seconds,
    })
    setSaveState(remote ? 'remote' : 'local')
  }

  const available = counts ? [counts.openai, counts.llama, counts.gemini].filter((n): n is number => n != null) : []
  const consensus = available.length ? Math.round(available.reduce((a, b) => a + b, 0) / available.length) : 0

  return (
    <div className="space-y-5">
      {/* hero pace */}
      <Panel className="text-center glow">
        {result.passed ? (
          <>
            <div className="text-sm text-muted">{t('your_pace')}</div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="my-1 font-display text-6xl sm:text-7xl font-bold tabnum text-accent"
            >
              {paceShown}
            </motion.div>
            <div className="text-lg font-semibold">
              {tier.emoji} {t(tier.key)}
            </div>
            <div className="mt-1 text-sm text-muted">{t('faster_than', { p: pct })}</div>
            <p className="mx-auto mt-3 max-w-md text-xs text-muted/80">
              {t('baseline_note', { lang: LANG_LABEL[result.lang] })}
            </p>
          </>
        ) : (
          <div className="py-4">
            <div className="text-5xl">😅</div>
            <p className="mt-3 text-muted">{t('comp_failed')}</p>
          </div>
        )}
      </Panel>

      {/* raw stats */}
      <div>
        <div className="mb-2 text-sm font-semibold text-muted">{t('raw_stats')}</div>
        <div className="grid grid-cols-3 gap-3">
          <Stat value={result.tokens} label={t('raw_tokens')} />
          <Stat value={result.seconds.toFixed(1)} label={t('seconds')} />
          <Stat value={(result.tokens / Math.max(0.001, result.seconds)).toFixed(1)} label={t('raw_tps')} />
        </div>
        {result.comp && (
          <div className="mt-2 text-center text-xs text-muted">
            {t('comp_score', { c: result.comp.correct })}
          </div>
        )}
      </div>

      {/* Layer B — multi-model reveal */}
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
      <div className={`tabnum ${strong ? 'text-accent font-bold' : 'text-ink'}`}>
        {v == null ? '—' : v}
      </div>
    </div>
  )
}
