import { useEffect, useRef, useState, type ReactNode } from 'react'

export function AdultDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [answer, setAnswer] = useState('')
  const [incorrect, setIncorrect] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div role="presentation" style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(43,35,48,.55)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div role="dialog" aria-modal="true" aria-label={title} style={{ width: 'min(100%, 520px)', maxHeight: 'min(90vh, 700px)', overflowY: 'auto', background: 'var(--cream)', borderRadius: 'var(--radius)', boxShadow: '0 12px 40px rgba(43,35,48,.25)', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 36, flex: 1 }}>{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} style={{ width: 64, height: 64, borderRadius: 999, background: '#fff', fontSize: 34 }}>×</button>
        </div>
        {unlocked ? children : (
          <form onSubmit={(event) => {
            event.preventDefault()
            if (answer.trim() === '20') setUnlocked(true)
            else { setIncorrect(true); setAnswer(''); input.current?.focus() }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label htmlFor="adult-answer" style={{ fontSize: 30, fontWeight: 600 }}>For adults: 2 × 10 = ?</label>
            <input id="adult-answer" ref={input} type="text" inputMode="numeric" autoComplete="off" value={answer} onChange={(event) => { setAnswer(event.target.value); setIncorrect(false) }} style={{ width: '100%', height: 76, border: '4px solid var(--lavender-dark)', borderRadius: 20, padding: '8px 18px', font: 'inherit', fontSize: 36, background: '#fff' }} />
            {incorrect && <p role="alert" style={{ color: 'var(--ink-soft)', fontSize: 22 }}>Try again.</p>}
            <button type="submit" style={{ minHeight: 76, borderRadius: 999, background: 'var(--hotpink)', color: '#fff', fontSize: 30, fontWeight: 700 }}>Unlock</button>
          </form>
        )}
      </div>
    </div>
  )
}
