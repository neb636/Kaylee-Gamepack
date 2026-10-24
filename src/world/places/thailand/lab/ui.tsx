// The character lab's small controls (lab.css): line icons, a segmented control, a dark toggle, a slider row, a
// dropdown menu. Plain React, no packages.
import { useEffect, useRef, useState, type ReactNode } from 'react'

const PATHS = {
  pointer: 'M4 4l7.07 17 2.51-7.39L21 11.07z',
  hand: 'M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
  face: 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
  crop: 'M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
  chevron: 'm6 9 6 6 6-6',
  left: 'M19 12H5M12 19l-7-7 7-7',
  right: 'M5 12h14M12 5l7 7-7 7',
  up: 'M12 19V5M5 12l7-7 7 7',
  back: 'm15 18-6-6 6-6',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
  bulb: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4',
  box: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7 12 12l8.7-5M12 22V12',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff: 'M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61M2 2l20 20',
  sparkles: 'M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2zM19 3v4M17 5h4',
  x: 'M18 6 6 18M6 6l12 12',
  search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.3-4.3',
  panel: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 3v18',
  panelR: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM15 3v18',
  camera: 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  pen: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
  shadow: 'M4 17c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3zM12 4v7',
  floor: 'M2 16l10 5 10-5-10-5z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  repeat: 'm17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3',
  volume: 'M11 5 6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',
  copy: 'M8 8h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2zM4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  film: 'M3 3h18v18H3zM7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  lens: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94',
  rotate: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  zoomOut: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.3-4.3M8 11h6',
  slow: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 12l-4-3',
} as const
export type IconName = keyof typeof PATHS

export function Icon({ name, size = 16, fill }: { name: IconName; size?: number; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export function IconButton({ icon, label, onClick, pressed, small, disabled, tip, fill }: { icon: IconName; label: string; onClick: () => void; pressed?: boolean; small?: boolean; disabled?: boolean; tip?: string; fill?: boolean }) {
  return (
    <button className={`cl-icon${small ? ' sm' : ''}${tip ? ' cl-tip' : ''}`} aria-label={label} title={tip ? undefined : label} data-tip={tip} aria-pressed={pressed} disabled={disabled} onClick={onClick}>
      <Icon name={icon} size={small ? 15 : 17} fill={fill} />
    </button>
  )
}

export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { id: T; label: ReactNode; disabled?: boolean }[]; onChange: (v: T) => void }) {
  return (
    <div className="cl-seg" role="group">
      {options.map((o) => (
        <button key={String(o.id)} aria-pressed={o.id === value} disabled={o.disabled} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return <button className="cl-toggle" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />
}

export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="cl-field">
      <span>{label}</span>
      {children}
    </div>
  )
}

export function Slider({ label, value, min, max, step, onChange, digits = 2 }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; digits?: number }) {
  return (
    <label className="cl-slider">
      <span className="cl-sub">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
      <output>{value.toFixed(digits)}</output>
    </label>
  )
}

/** A button that opens a small menu of choices (above or below it). */
export function Select<T extends string | number>({ value, options, onChange, label, icon, up, align = 'left' }: { value: T; options: { id: T; label: ReactNode }[]; onChange: (v: T) => void; label: ReactNode; icon?: ReactNode; up?: boolean; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const [at, setAt] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    setAt(ref.current?.getBoundingClientRect() ?? null)
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])
  return (
    <div className="cl-select" ref={ref}>
      <button aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {icon}
        {label}
        <Icon name="chevron" size={14} />
      </button>
      {open && at && (
        // Fixed, so a scrolling toolbar doesn't clip it.
        <div
          className="cl-menu"
          role="menu"
          style={{
            position: 'fixed',
            ...(up ? { bottom: window.innerHeight - at.top + 6 } : { top: at.bottom + 6 }),
            ...(align === 'left' ? { left: Math.max(8, Math.min(at.left, window.innerWidth - 300)) } : { right: window.innerWidth - at.right }),
            maxWidth: 'min(420px, calc(100vw - 16px))',
          }}
        >
          {options.map((o) => (
            <button
              key={String(o.id)}
              role="menuitemradio"
              aria-checked={o.id === value}
              aria-pressed={o.id === value}
              onClick={() => {
                onChange(o.id)
                setOpen(false)
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Section({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children?: ReactNode }) {
  return (
    <div className="cl-section">
      <div className="cl-section-head">
        <span>{title}</span>
        {aside}
      </div>
      {children}
    </div>
  )
}
