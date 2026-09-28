// China's line style (see ../STYLE.md): the same warm brown outline as the generated art, so puppets sit in the scenes
// instead of looking pasted on. Same technique as australia/puppets/ink.ts: draw a group twice, first inside
// <g {...inkPass()}> (a thick brown stroke on every shape), then again with fills and no strokes on top, which leaves a
// single outline around the whole group.
import { useRef } from 'react'

export const INK = '#6E3B24'
/** Eyes, noses and mouths: a deeper brown than the outline, like the reference stickers. */
export const EYE = '#4A2616'
export const BLUSH = '#F9C4C0'
export const TONGUE = '#F28C8C'
/** Outline width outside the fills (viewBox units, for a ~400-unit-tall character). */
export const LINE = 5

export const inkPass = (width = LINE, color = INK) => ({ fill: color, stroke: color, strokeWidth: width * 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })

/** A thin line for details drawn on top (pleats, creases, fur tufts). */
export const line = (width = LINE * 0.7, color = INK) => ({ fill: 'none', stroke: color, strokeWidth: width, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })

export function useInk<P extends string>() {
  const twins = useRef(new Map<P, SVGElement>())
  const refs = useRef(new Map<P, (el: SVGElement | null) => void>())
  return {
    /** `ref={ink.twin('tail')}` on the ink copy of a moving part. */
    twin(name: P) {
      let fn = refs.current.get(name)
      if (!fn) {
        fn = (el) => (el ? twins.current.set(name, el) : twins.current.delete(name))
        refs.current.set(name, fn)
      }
      return fn
    },
    /** Call at the end of the frame: copies each part's transform and visibility to its ink copy. */
    sync(parts: Partial<Record<P, Element>>) {
      for (const [name, el] of twins.current) {
        const src = parts[name]
        if (!(src instanceof SVGElement)) continue
        const t = src.getAttribute('transform')
        if (t !== null && t !== el.getAttribute('transform')) el.setAttribute('transform', t)
        if (el.style.display !== src.style.display) el.style.display = src.style.display
      }
    },
  }
}
