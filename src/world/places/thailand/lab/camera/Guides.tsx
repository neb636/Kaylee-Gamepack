// Lines drawn over the game in the camera lab, redrawn every frame: the box the game asked the camera to fit, the top
// bar's edge (the rig frames the part of the screen below it), a rule-of-thirds grid below the bar, and every tap
// target with its size in pixels (red when it's under 64 px or its middle is under the top bar).
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { camLab } from '../../engine/camLab'
import type { Guide } from './link'

/** Smallest tap target in a 3D scene (AGENTS.md design rule 3). */
const MIN_TARGET = 64
const deg = Math.PI / 180

export function Guides({ guides }: { guides: Guide[] }) {
  const svg = useRef<SVGSVGElement>(null)
  const probe = useRef<HTMLDivElement>(null)
  const on = useRef(guides)
  on.current = guides

  useEffect(() => {
    const v = new Vector3()
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const el = svg.current
      const frame = el?.parentElement
      if (!el || !frame) return
      const g = on.current
      const out: string[] = []
      const W = frame.offsetWidth
      const H = frame.offsetHeight
      const fr = frame.getBoundingClientRect()
      const k = W ? fr.width / W : 1
      const bar = probe.current?.offsetHeight ?? 0
      const world = camLab.world

      if (g.includes('thirds')) {
        const h = H - bar
        for (const f of [1 / 3, 2 / 3]) {
          out.push(line(W * f, bar, W * f, H, 'rgba(255,255,255,.75)', 1, '6 6'))
          out.push(line(0, bar + h * f, W, bar + h * f, 'rgba(255,255,255,.75)', 1, '6 6'))
        }
      }
      if (g.includes('bar')) {
        out.push(`<rect x="0" y="0" width="${W}" height="${bar}" fill="rgba(43,35,48,.12)"/>`)
        out.push(line(0, bar, W, bar, '#2b2330', 1.5, '8 5'))
      }

      if (world && g.includes('box')) {
        const shot = world.rig.shot
        const framed = world.rig.framed()
        const host = world.host
        const hr = host.getBoundingClientRect()
        const hx = (hr.left - fr.left) / k
        const hy = (hr.top - fr.top) / k
        const hw = host.offsetWidth
        const hh = host.offsetHeight
        if (shot && framed) {
          // A chase camera's box turns with the camera: its x runs across the screen and its z away from it.
          const yaw = shot.follow ? framed.yaw * deg : 0
          const cos = Math.cos(yaw)
          const sin = Math.sin(yaw)
          const pts: ([number, number] | null)[] = []
          for (const sx of [-1, 1])
            for (const sy of [-1, 1])
              for (const sz of [-1, 1]) {
                const x = sx * shot.half.x
                const z = sz * shot.half.z
                v.set(x * cos + z * sin, sy * shot.half.y, -x * sin + z * cos).add(shot.center).project(world.rig.camera)
                pts.push(v.z > 1 ? null : [hx + ((v.x + 1) / 2) * hw, hy + ((1 - v.y) / 2) * hh])
              }
          // Corner i is (x, y, z) bits 4, 2, 1: an edge joins corners one bit apart.
          for (let a = 0; a < 8; a++)
            for (const bit of [1, 2, 4]) {
              const b = a | bit
              if (b === a) continue
              const p = pts[a]
              const q = pts[b]
              if (p && q) out.push(line(p[0], p[1], q[0], q[1], '#ff5fa2', 2))
            }
          const c = v.copy(shot.center).project(world.rig.camera)
          if (c.z <= 1) {
            const x = hx + ((c.x + 1) / 2) * hw
            const y = hy + ((1 - c.y) / 2) * hh
            out.push(line(x - 8, y, x + 8, y, '#ff5fa2', 2), line(x, y - 8, x, y + 8, '#ff5fa2', 2))
          }
        }
      }

      if (world && g.includes('targets')) {
        for (const a of world.host.querySelectorAll<HTMLElement>('[data-anchor]')) {
          if (a.style.display === 'none') continue
          const r = a.getBoundingClientRect()
          const size = a.offsetWidth
          const x = (r.left - fr.left) / k + size / 2
          const y = (r.top - fr.top) / k + size / 2
          const bad = size < MIN_TARGET || y < bar
          const color = bad ? '#ff3b30' : '#16a34a'
          out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size / 2).toFixed(1)}" fill="${bad ? 'rgba(255,59,48,.12)' : 'none'}" stroke="${color}" stroke-width="1.5"><title>${esc(a.dataset.anchor ?? '')}</title></circle>`)
          out.push(text(x, y + 4, `${size}`, color))
        }
      }
      el.innerHTML = out.join('')
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <div ref={probe} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 'var(--top-clear)', pointerEvents: 'none' }} />
      <svg ref={svg} className="cm-guides" />
    </>
  )
}

const line = (x1: number, y1: number, x2: number, y2: number, color: string, width: number, dash?: string) =>
  `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`

const text = (x: number, y: number, s: string, color: string) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${color}" stroke="#fff" stroke-width="3" paint-order="stroke" font-size="12" font-weight="700" text-anchor="middle" font-family="ui-monospace, monospace">${esc(s)}</text>`

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
