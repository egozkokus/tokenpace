import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LANGS, LANG_LABEL, setLang } from '../lib/i18n'
import type { Lang } from '../lib/i18n'
import { useTranslation } from 'react-i18next'

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  full,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'accent2'
  disabled?: boolean
  full?: boolean
}) {
  const base =
    'rounded-2xl px-6 py-3 font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-[#1a1206] hover:brightness-110 glow'
      : variant === 'accent2'
        ? 'bg-accent2 text-[#06121f] hover:brightness-110'
        : 'bg-panel2 text-ink border border-line hover:border-accent/60'
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${base} ${styles} ${full ? 'w-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-line bg-panel/80 backdrop-blur p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  )
}

export function Stat({ value, label, accent }: { value: ReactNode; label: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-panel2 px-4 py-3 text-center">
      <div className={`tabnum text-2xl font-bold ${accent ? 'text-accent' : 'text-ink'}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  )
}

export function LangSwitch() {
  const { i18n } = useTranslation()
  const current = i18n.language as Lang
  return (
    <div className="inline-flex rounded-full border border-line bg-panel2 p-1">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
            current === l ? 'bg-accent text-[#1a1206]' : 'text-muted hover:text-ink'
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  )
}

export function Logo() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
      <span className="text-accent">⚡</span>
      <span>{t('brand')}</span>
    </div>
  )
}
