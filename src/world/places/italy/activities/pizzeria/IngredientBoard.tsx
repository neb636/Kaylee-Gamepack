// A two-column ingredient tray for the six-choice pizza. Every ingredient stays visible
// in either iPad orientation; positions and drag hit testing use the same measured square.
import { useRef, type ReactNode } from 'react'
import { Piece, PlayArea, Target, sounds, say, toLocal, useElementSize, type Placed, type Sticker } from '../../../../../sdk'

let nextIngredient = 0
export function IngredientBoard({ stickers, items, onChange, surface }: { stickers: Sticker[]; items: Placed[]; onChange: (items: Placed[]) => void; surface: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const pizza = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(box)
  const side = Math.max(0, Math.min(height, width - 236))
  const landing = (x: number, y: number, size: number) => {
    if (!pizza.current) return null
    const p = toLocal(pizza.current, x, y)
    return Math.hypot(p.x - 0.5, p.y - 0.5) <= 0.5 - size / 3 ? p : null
  }
  return (
    <div ref={box} style={{ width: '100%', height: '100%', display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
      <PlayArea style={{ display: 'contents' }}>
        <Target id="surface" glow={false} style={{ width: side, height: side, position: 'relative', flex: 'none' }}>
          <div ref={pizza} style={{ position: 'absolute', inset: 0 }}>
            {surface}
            {items.map((item) => {
              const st = stickers.find((s) => s.kind === item.kind)
              if (!st) return null
              const size = (st.size ?? 0.16) * side
              return (
                <Piece key={item.id} id={item.id} label={`${item.kind} on the surface`}
                  onPlace={(d) => {
                    const p = landing(d.clientX, d.clientY, st.size ?? 0.16)
                    if (p) { onChange(items.map((it) => it.id === item.id ? { ...it, ...p } : it)); return 'stay' }
                    sounds.whoosh()
                    onChange(items.filter((it) => it.id !== item.id))
                    return 'reset'
                  }}
                  style={{ position: 'absolute', left: item.x * side - size / 2, top: item.y * side - size / 2, width: size, height: size }}>
                  <div style={{ width: '100%', height: '100%', rotate: `${item.rot}deg` }}>{st.content}</div>
                </Piece>
              )
            })}
          </div>
        </Target>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 88px)', gap: 12, padding: 12, borderRadius: 24, background: 'rgba(255,255,255,.7)', boxShadow: 'var(--shadow)', flex: 'none' }}>
          {stickers.map((st) => (
            <Piece key={st.kind} label={`${st.kind} in the tray`}
              lift={Math.max(1.1, (st.size ?? 0.16) * side / 88)}
              onPickUp={() => st.say && void say(st.say)}
              onTap={() => { sounds.pop(); if (st.say) void say(st.say) }}
              onPlace={(d) => {
                const p = landing(d.clientX, d.clientY, st.size ?? 0.16)
                if (!p) return 'home'
                onChange([...items, { id: `ingredient-${nextIngredient++}`, kind: st.kind, ...p, rot: Math.round(Math.random() * 50 - 25) }])
                return 'reset'
              }}
              style={{ width: 88, height: 88, display: 'grid', placeItems: 'center', background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow)' }}>
              {st.content}
            </Piece>
          ))}
        </div>
      </PlayArea>
    </div>
  )
}
