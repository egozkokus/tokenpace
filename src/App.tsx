import { useState, lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Lang } from './lib/i18n'
import type { Mode } from './lib/pace'
import { Logo, LangSwitch } from './components/ui'
import Home from './components/Home'

// Heavy screens (they pull in the o200k tokenizer) are code-split so the
// landing page stays tiny. We prefetch them on idle so starting a test is
// still instant.
const ReadingTest = lazy(() => import('./components/ReadingTest'))
const TypingTest = lazy(() => import('./components/TypingTest'))
const ResultCard = lazy(() => import('./components/ResultCard'))
const Leaderboard = lazy(() => import('./components/Leaderboard'))

export type Screen = 'home' | 'reading' | 'typing' | 'result' | 'leaderboard'

export interface RunResult {
  mode: Mode
  lang: Lang
  tokens: number
  seconds: number
  wpm: number
  passed: boolean
  comp?: { correct: number; total: number }
  text: string
}

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
}

function Loader() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  )
}

export default function App() {
  const { i18n } = useTranslation()
  const lang = i18n.language as Lang
  const [screen, setScreen] = useState<Screen>('home')
  const [result, setResult] = useState<RunResult | null>(null)

  // Warm the test chunks (incl. the tokenizer) after first paint — non-blocking.
  useEffect(() => {
    const prefetch = () => {
      import('./components/ReadingTest')
      import('./components/TypingTest')
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => void }
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return // respect data-saver / slow links
    if (w.requestIdleCallback) w.requestIdleCallback(prefetch)
    else setTimeout(prefetch, 1500)
  }, [])

  function finish(r: RunResult) {
    setResult(r)
    setScreen('result')
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-[100dvh] flex-col">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
          <button onClick={() => setScreen('home')} className="cursor-pointer" aria-label="home">
            <Logo />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen('leaderboard')}
              className="text-xl transition hover:scale-110"
              aria-label="leaderboard"
            >
              🏆
            </button>
            <LangSwitch />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-5 sm:pb-24">
          <AnimatePresence mode="wait">
            <motion.div key={screen + lang} {...fade}>
              <Suspense fallback={<Loader />}>
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
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
