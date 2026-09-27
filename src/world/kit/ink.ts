// One outline around a whole group of overlapping shapes, like the art: a body, haunches, feet and tail read as one
// animal instead of a pile of separately outlined circles.
//
// Draw the group twice. First inside <g {...inkPass()}>: every shape inherits a thick ink stroke. Then again normally,
// with fills and no strokes: the fills cover the inner half of the ink (and every seam where shapes overlap), leaving a
// single thin line around the outside. Shapes in the group must not set their own `stroke`.
//
//   const ink = useInk<Part>()
//   const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))   // moving parts in both copies
//   frame: (f, p) => { ...setT(p.tail, ...); ink.sync(p) }                          // copy the moves to the ink copy
import { useRef } from 'react'

export const INK = '#3F2A26'
/** Outline width outside the fills (viewBox units). */
export const LINE = 3.2

/** Props for the <g> that holds the ink copy of a group. */
export const inkPass = (width = LINE, color = INK) => ({ fill: color, stroke: color, strokeWidth: width * 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })

/** A thin ink line for details drawn on top (creases, toes, the edge of a paw over the belly). */
export const line = (width = LINE * 0.8, color = INK) => ({ fill: 'none', stroke: color, strokeWidth: width, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })

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
