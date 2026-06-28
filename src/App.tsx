import { useState, lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Lang } from './lib/i18n'
import type { Mode } from './lib/pace'
import { Logo, LangSwitch } from './components/ui'
import Home from './components/Home'
import Welcome from './components/Welcome'

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
  isDaily: boolean
  passed: boolean
  comp?: { correct: number; total: number }
  text: string
}

const NAME_KEY = 'tokenpace_name'

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
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '')
  const [editingName, setEditingName] = useState(false)
  const [appMode, setAppMode] = useState<'daily' | 'practice'>('daily')

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

  function saveName(n: string) {
    const v = n.trim().slice(0, 24)
    localStorage.setItem(NAME_KEY, v)
    setName(v)
    setEditingName(false)
  }

  function finish(r: RunResult) {
    setResult(r)
    setScreen('result')
  }

  const showWelcome = !name || editingName

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-[100dvh] flex-col">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
          <button onClick={() => setScreen('home')} className="cursor-pointer" aria-label="home">
            <Logo />
          </button>
          <div className="flex items-center gap-3">
            {!showWelcome && (
              <button
                onClick={() => setScreen('leaderboard')}
                className="text-xl transition hover:scale-110"
                aria-label="leaderboard"
              >
                🏆
              </button>
            )}
            <LangSwitch />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-5 sm:pb-24">
          {showWelcome ? (
            <Welcome initial={name} canCancel={!!name} onSave={saveName} onCancel={() => setEditingName(false)} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={screen + lang} {...fade}>
                <Suspense fallback={<Loader />}>
                  {screen === 'home' && (
                    <Home
                      name={name}
                      mode={appMode}
                      onModeChange={setAppMode}
                      onReading={() => setScreen('reading')}
                      onTyping={() => setScreen('typing')}
                      onLeaderboard={() => setScreen('leaderboard')}
                      onChangeName={() => setEditingName(true)}
                    />
                  )}
                  {screen === 'reading' && <ReadingTest lang={lang} daily={appMode === 'daily'} onFinish={finish} />}
                  {screen === 'typing' && <TypingTest lang={lang} daily={appMode === 'daily'} onFinish={finish} />}
                  {screen === 'result' && result && (
                    <ResultCard
                      result={result}
                      playerName={name}
                      onPlayAgain={() => setScreen(result.mode)}
                      onHome={() => setScreen('home')}
                    />
                  )}
                  {screen === 'leaderboard' && <Leaderboard lang={lang} onHome={() => setScreen('home')} />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </MotionConfig>
  )
}
