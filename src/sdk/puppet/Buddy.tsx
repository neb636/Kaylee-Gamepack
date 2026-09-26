import { forwardRef, useState, type CSSProperties } from 'react'
import { bell, span, usePuppet, wobble, type PuppetHandle } from './core'

export type BuddyAction = 'jump' | 'dance' | 'wiggle' | 'cheer' | 'nod'

/**
 * Brings a flat sprite (a generated picture) to life without rigging it: it breathes, squashes and stretches from its
 * feet, bounces along with its own voice, and can `play('jump' | 'dance' | 'wiggle' | 'cheer' | 'nod')`.
 * Use a real puppet for main characters; Buddy is for guests and critters.
 */
export const Buddy = forwardRef<PuppetHandle, { img: string; voice?: string; height: string; alt?: string; flip?: boolean; style?: CSSProperties; calm?: boolean }>(function Buddy(
  { img, voice, height, alt = '', flip, style, calm },
  ref,
) {
  const [phase] = useState(() => Math.random() * 6)
  const { part } = usePuppet<'body'>(ref, {
    voice,
    actions: { jump: 0.75, dance: 1.4, wiggle: 0.6, cheer: 1, nod: 0.6 },
    frame: (f, p) => {
      const t = f.t + phase
      let y = 0
      let sx = 1 + Math.sin(t * 2.2) * (calm ? 0.008 : 0.015)
      let sy = 1 - Math.sin(t * 2.2) * (calm ? 0.012 : 0.022)
      let rot = 0
      // Talking: bob and stretch with each syllable.
      sy += f.mouth * 0.07
      sx -= f.mouth * 0.035
      rot += Math.sin(t * 9) * f.mouth * 3
      const q = f.p
      if (f.action === 'jump' || f.action === 'cheer') {
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.7))
        const land = wobble(span(q, 0.7, 1), 2)
        sx += crouch * 0.14 - air * 0.08 + land * 0.12
        sy += -crouch * 0.18 + air * 0.12 - land * 0.15
        y -= air * (f.action === 'cheer' ? 45 : 30)
        if (f.action === 'cheer') rot += Math.sin(q * Math.PI * 6) * 10 * bell(q)
      } else if (f.action === 'dance') {
        rot += Math.sin(q * Math.PI * 6) * 14 * bell(q)
        y -= Math.abs(Math.sin(q * Math.PI * 6)) * 18
        sy += Math.abs(Math.cos(q * Math.PI * 6)) * 0.06 * bell(q)
      } else if (f.action === 'wiggle') {
        rot += wobble(q, 3) * 12
        sx += wobble(q, 3) * 0.05
      } else if (f.action === 'nod') {
        sy -= bell(q) * 0.08
        sx += bell(q) * 0.04
      }
      const el = p.body as HTMLElement | undefined
      if (el) el.style.transform = `translateY(${y}%) rotate(${rot}deg) scale(${flip ? -sx : sx}, ${sy})`
    },
  })
  return (
    <div style={{ height, display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'center', pointerEvents: 'none', ...style }}>
      <img ref={part('body')} src={img} alt={alt} draggable={false} style={{ height: '100%', objectFit: 'contain', transformOrigin: '50% 100%', willChange: 'transform' }} />
    </div>
  )
})
