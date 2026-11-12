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

/** A country's line style: its ink color, outline width and how thin detail lines are (a fraction of the outline).
 *  `const { inkPass, line } = inkStyle('#6E3B24', 5, 0.7)` in a country's own puppets/ink.ts. */
export function inkStyle(ink: string, width: number, detail = 0.8) {
  return {
    /** Props for the <g> that holds the ink copy of a group. */
    inkPass: (w = width, color = ink) => ({ fill: color, stroke: color, strokeWidth: w * 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }),
    /** A thin ink line for details drawn on top (creases, toes, the edge of a paw over the belly). */
    line: (w = width * detail, color = ink) => ({ fill: 'none', stroke: color, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }),
  }
}

export const { inkPass, line } = inkStyle(INK, LINE, 0.8)

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
