import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Panel, Button } from './ui'

export default function Welcome({
  initial,
  canCancel,
  onSave,
  onCancel,
}: {
  initial: string
  canCancel: boolean
  onSave: (name: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [v, setV] = useState(initial)
  const ok = v.trim().length >= 1

  return (
    <div className="mx-auto max-w-md space-y-6 pt-6 text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 15 }}
      >
        <div className="text-5xl">⚡</div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{t('brand')}</h1>
        <p className="mt-2 text-sm text-muted">{t('tagline')}</p>
      </motion.div>

      <Panel className="space-y-4 text-start">
        <label className="block text-sm font-semibold">{t('welcome_q')}</label>
        <input
          autoFocus
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && ok) onSave(v)
          }}
          placeholder={t('welcome_ph')}
          maxLength={24}
          className="w-full rounded-xl border border-line bg-bg2 px-4 py-3 text-lg outline-none focus:border-accent"
        />
        <Button onClick={() => onSave(v)} disabled={!ok} full>
          {t('lets_go')}
        </Button>
        {canCancel && (
          <button onClick={onCancel} className="w-full text-center text-sm text-muted hover:text-ink transition">
            {t('back')}
          </button>
        )}
      </Panel>

      <p className="text-xs text-muted/80">{t('public_notice')}</p>
    </div>
  )
}
