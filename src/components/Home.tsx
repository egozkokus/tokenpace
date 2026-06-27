import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Panel, Button } from './ui'

export default function Home({
  name,
  onReading,
  onTyping,
  onLeaderboard,
  onChangeName,
}: {
  name: string
  onReading: () => void
  onTyping: () => void
  onLeaderboard: () => void
  onChangeName: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="text-center pt-4 pb-2">
        <button
          onClick={onChangeName}
          className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-panel2 px-3 py-1 text-sm text-muted transition hover:text-ink"
        >
          {t('greeting', { name })} ✏️
        </button>
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-3xl sm:text-5xl font-bold tracking-tight"
        >
          ⚡ {t('tagline')}
        </motion.h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t('sub')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel className="flex flex-col">
          <div className="text-3xl mb-2">📖</div>
          <h2 className="font-display text-xl font-bold">{t('reading_title')}</h2>
          <p className="mt-2 mb-5 flex-1 text-sm text-muted">{t('reading_desc')}</p>
          <Button onClick={onReading} full>
            {t('start')} →
          </Button>
        </Panel>

        <Panel className="flex flex-col">
          <div className="text-3xl mb-2">⌨️</div>
          <h2 className="font-display text-xl font-bold">{t('typing_title')}</h2>
          <p className="mt-2 mb-5 flex-1 text-sm text-muted">{t('typing_desc')}</p>
          <Button onClick={onTyping} variant="accent2" full>
            {t('start')} →
          </Button>
        </Panel>
      </div>

      <div className="text-center">
        <button onClick={onLeaderboard} className="text-sm text-muted hover:text-ink transition">
          🏆 {t('leaderboard')}
        </button>
      </div>

      <p className="text-center text-xs text-muted/80">{t('public_notice')}</p>
    </div>
  )
}
