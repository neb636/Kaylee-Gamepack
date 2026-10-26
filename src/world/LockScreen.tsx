// Asks a grown-up for the family code before a locked country opens (src/world/lock.ts). Shown once per device.
import { motion, useAnimationControls } from 'motion/react'
import { useState } from 'react'
import { go } from '../router'
import { BigButton, sounds } from '../sdk'
import { TopBar } from './kit/Chrome'
import { Flag } from './kit/Flag'
import { tryCode } from './lock'
import { findPlace } from './registry'

export function LockScreen({ place, onUnlock }: { place: string; onUnlock: () => void }) {
  const meta = findPlace(place)?.meta
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [wrong, setWrong] = useState(false)
  const shake = useAnimationControls()

  const submit = async () => {
    if (busy || !code.trim()) return
    setBusy(true)
    const ok = await tryCode(code).catch(() => false)
    setBusy(false)
    if (ok) {
      sounds.sparkle()
      onUnlock()
      return
    }
    sounds.oops()
    setWrong(true)
    setCode('')
    void shake.start({ x: [0, -14, 14, -10, 10, 0], transition: { duration: 0.4 } })
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#FFD6E7, #D9CCFF)', display: 'grid', placeItems: 'center', padding: 'calc(var(--top-clear, 96px) + 8px) 16px 16px', overflow: 'auto' }}>
      <TopBar icon="🌍" label="World map" onBack={() => go.world()} />
      <motion.form
        animate={shake}
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(12px, 3vh, 24px)', width: 'min(100%, 520px)', textAlign: 'center' }}
      >
        <div style={{ position: 'relative', fontSize: 'clamp(64px, 14vh, 120px)', lineHeight: 1 }}>
          {meta && <Flag id={meta.flag} width="1.6em" style={{ borderRadius: 12, boxShadow: 'var(--shadow)' }} />}
          <span style={{ position: 'absolute', right: '-0.35em', bottom: '-0.3em', fontSize: '0.6em' }}>🔒</span>
        </div>
        <div style={{ fontSize: 'clamp(24px, 4.5vh, 36px)', fontWeight: 700, color: 'var(--ink)' }}>Grown-ups: type the family code</div>
        <input
          aria-label="Family code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setWrong(false)
          }}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          style={{ width: '100%', font: 'inherit', fontSize: 'clamp(24px, 4.5vh, 34px)', textAlign: 'center', padding: '14px 20px', borderRadius: 'var(--radius)', border: `4px solid ${wrong ? 'var(--hotpink)' : '#fff'}`, background: '#fff', boxShadow: 'var(--shadow)', color: 'var(--ink)', outline: 'none' }}
        />
        <div aria-live="polite" style={{ minHeight: '1.4em', fontSize: 'clamp(18px, 3vh, 24px)', color: 'var(--hotpink)', fontWeight: 600 }}>
          {wrong ? "That's not it. Try again!" : ''}
        </div>
        <BigButton disabled={busy || !code.trim()}>
          {busy ? '…' : `Open ${meta?.emoji ?? '🔓'}`}
        </BigButton>
      </motion.form>
    </div>
  )
}
