// Dress-up / avatar maker: a big character on one side, category tabs (hair, color, outfit, hat...) and big
// option buttons on the other. You draw the character from the chosen values, usually as layered SVG
// (back hair, body, outfit, face, front hair, hat) where colors are just fills, so one drawing covers every color.
//
//   const [look, setLook] = useSaved('avatar', { hair: 'bob', hairColor: '#8b5a3c', outfit: 'dress' })
//   <DressUpStudio slots={SLOTS} values={look} onChange={setLook} character={<Avatar {...look} />} />
//
// Pair it with useSaved so her creation is still there next time (and can show up in other games).
import { motion, useAnimate } from 'motion/react'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useElementSize } from '../hooks'
import { say, type Line } from '../speech'
import { sounds } from '../sounds'

export interface DressOption {
  id: string
  /** What the button shows: a small drawing, an emoji, or <Swatch color=... />. */
  thumb: ReactNode
  /** Said when she picks it ("Curly hair!"). Add it to voice-lines.json. */
  say?: Line
  /** Accessible name (and handy in tests). */
  label?: string
}

export interface DressSlot {
  id: string
  /** Tab picture (emoji or a small drawing); she can't read the name. */
  icon: ReactNode
  /** Said when she opens the tab ("Pick a hair color!"). */
  say?: Line
  label?: string
  options: DressOption[]
}

/** A round color button for color options. */
export function Swatch({ color, size = '70%' }: { color: string; size?: number | string }) {
  return <span style={{ display: 'block', width: size, height: size, borderRadius: '50%', background: color, border: '5px solid var(--ink)', boxShadow: 'inset -6px -6px 0 rgba(0,0,0,.12)' }} />
}

export interface OptionPickerProps {
  options: DressOption[]
  value: string | undefined
  onChange: (id: string, option: DressOption) => void
  /** Button size in px (at least 88). Default 104. */
  size?: number
  style?: CSSProperties
}

/** A wrap of big option buttons; the chosen one gets a pink ring. */
export function OptionPicker({ options, value, onChange, size = 104, style }: OptionPickerProps) {
  const s = Math.max(88, size)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', alignContent: 'flex-start', ...style }}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <motion.button
            key={o.id}
            aria-label={o.label ?? o.id}
            aria-pressed={on}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: on ? 1.08 : 1 }}
            onClick={() => {
              sounds.pop()
              if (o.say) void say(o.say)
              onChange(o.id, o)
            }}
            style={{
              width: s,
              height: s,
              borderRadius: 26,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: s * 0.55,
              lineHeight: 1,
              boxShadow: on ? '0 0 0 6px var(--hotpink), var(--shadow)' : 'var(--shadow)',
              overflow: 'hidden',
            }}
          >
            {o.thumb}
          </motion.button>
        )
      })}
    </div>
  )
}

export interface DressUpStudioProps {
  slots: DressSlot[]
  /** Slot id → chosen option id. */
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
  /** The character, drawn from `values`. Fills its box; SVG with a viewBox works best. */
  character: ReactNode
  /** After each pick, e.g. make a puppet cheer or advance your story. */
  onPick?: (slot: DressSlot, option: DressOption) => void
  style?: CSSProperties
}

/** The whole dress-up screen: character + tabs + options, laid out for portrait or landscape. */
export function DressUpStudio({ slots, values, onChange, character, onPick, style }: DressUpStudioProps) {
  const box = useRef<HTMLDivElement>(null)
  const { width: w, height: h } = useElementSize(box)
  const landscape = w > h * 1.05
  const [tab, setTab] = useState(slots[0]?.id)
  const slot = slots.find((s) => s.id === tab) ?? slots[0]
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const optionSize = Math.max(88, Math.min(128, (landscape ? w * 0.5 : w) / 4.6))

  return (
    <div ref={box} style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: landscape ? 'row' : 'column', gap: 20, alignItems: 'stretch', ...style }}>
      <div ref={scope} style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'grid', placeItems: 'center' }}>
        {character}
      </div>
      <div style={{ flex: landscape ? '0 0 50%' : '0 0 auto', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        <div role="tablist" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {slots.map((s) => (
            <motion.button
              key={s.id}
              role="tab"
              aria-selected={s.id === slot?.id}
              aria-label={s.label ?? s.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sounds.pop()
                setTab(s.id)
                if (s.say) void say(s.say)
              }}
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                fontSize: 46,
                lineHeight: 1,
                display: 'grid',
                placeItems: 'center',
                background: s.id === slot?.id ? 'var(--hotpink)' : 'rgba(255,255,255,.85)',
                boxShadow: 'var(--shadow)',
              }}
            >
              {s.icon}
            </motion.button>
          ))}
        </div>
        {slot && (
          <OptionPicker
            key={slot.id}
            options={slot.options}
            value={values[slot.id]}
            size={optionSize}
            style={{ overflowY: 'auto', padding: 10, minHeight: 0 }}
            onChange={(id, option) => {
              onChange({ ...values, [slot.id]: id })
              sounds.sparkle()
              if (scope.current) void animate(scope.current, { scale: [1, 1.06, 0.98, 1], rotate: [0, -2, 2, 0] }, { duration: 0.45 })
              onPick?.(slot, option)
            }}
          />
        )}
      </div>
    </div>
  )
}
