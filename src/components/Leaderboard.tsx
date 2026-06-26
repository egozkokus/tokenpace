import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Lang } from '../lib/i18n'
import type { Mode } from '../lib/pace'
import { topScores, hasSupabase } from '../lib/supabase'
import type { ScoreRow } from '../lib/supabase'
import { Panel, Button } from './ui'

export default function Leaderboard({ lang, onHome }: { lang: Lang; onHome: () => void }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('reading')
  const [rows, setRows] = useState<ScoreRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    topScores(lang, mode).then((r) => {
      if (alive) {
        setRows(r)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [lang, mode])

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">🏆 {t('leaderboard')}</h2>

      <div className="inline-flex rounded-full border border-line bg-panel2 p-1">
        {(['reading', 'typing'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              mode === m ? 'bg-accent text-[#1a1206]' : 'text-muted hover:text-ink'
            }`}
          >
            {m === 'reading' ? t('lb_reading') : t('lb_typing')}
          </button>
        ))}
      </div>

      <Panel>
        {loading ? (
          <div className="py-6 text-center text-muted animate-pulse">…</div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-center text-muted">{t('lb_empty')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted">
                <th className="py-2 text-start font-medium w-10">{t('rank')}</th>
                <th className="py-2 text-start font-medium">{t('name')}</th>
                <th className="py-2 text-end font-medium">{t('pace')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-2.5 tabnum text-muted">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-2.5 font-medium">{r.name}</td>
                  <td className="py-2.5 text-end tabnum font-bold text-accent">{r.pace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {!hasSupabase && <p className="text-center text-xs text-muted/70">{t('lb_local')}</p>}

      <Button onClick={onHome} variant="ghost">
        ← {t('back')}
      </Button>
    </div>
  )
}
