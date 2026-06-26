import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Lang } from './lib/i18n'
import type { Mode } from './lib/pace'
import { Logo, LangSwitch } from './components/ui'
import Home from './components/Home'
import ReadingTest from './components/ReadingTest'
import TypingTest from './components/TypingTest'
import ResultCard from './components/ResultCard'
import Leaderboard from './components/Leaderboard'

export type Screen = 'home' | 'reading' | 'typing' | 'result' | 'leaderboard'

export interface RunResult {
  mode: Mode
  lang: Lang
  tokens: number
  seconds: number
  pace: number
  passed: boolean
  comp?: { correct: number; total: number }
  text: string
}

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.28 },
}

export default function App() {
  const { i18n } = useTranslation()
  const lang = i18n.language as Lang
  const [screen, setScreen] = useState<Screen>('home')
  const [result, setResult] = useState<RunResult | null>(null)

  function finish(r: RunResult) {
    setResult(r)
    setScreen('result')
  }

  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <button onClick={() => setScreen('home')} className="cursor-pointer">
          <Logo />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('leaderboard')}
            className="text-sm text-muted hover:text-ink transition"
          >
            🏆
          </button>
          <LangSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24">
        <AnimatePresence mode="wait">
          <motion.div key={screen + lang} {...fade}>
            {screen === 'home' && (
              <Home
                onReading={() => setScreen('reading')}
                onTyping={() => setScreen('typing')}
                onLeaderboard={() => setScreen('leaderboard')}
              />
            )}
            {screen === 'reading' && <ReadingTest lang={lang} onFinish={finish} />}
            {screen === 'typing' && <TypingTest lang={lang} onFinish={finish} />}
            {screen === 'result' && result && (
              <ResultCard
                result={result}
                onPlayAgain={() => setScreen(result.mode)}
                onHome={() => setScreen('home')}
              />
            )}
            {screen === 'leaderboard' && <Leaderboard lang={lang} onHome={() => setScreen('home')} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
