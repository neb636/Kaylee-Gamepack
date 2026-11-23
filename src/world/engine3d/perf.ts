// `?perf=1`: a frame-time overlay for chasing stutters on a real device (the Mountain Bike's deep turns on the phone,
// 2026-11-22). A strip chart of the last 120 frames, and a log of every slow frame with what was going on: how long the
// world's update and the render's draw calls took on the CPU, the draw calls and triangles, the pixel ratio, how many
// finger events arrived, whether a shader compiled, and the world's own note (perfNote(): the bike's speed and steer).
// "Copy" puts the log on the clipboard to paste to an agent.
//
// Reading it: a slow frame whose update + render is small was waiting on the GPU (too much to draw) or on Safari (a
// garbage collection, the compositor); one whose update or render is big was our JavaScript. `programs +1` is a shader
// compiling mid-play; `dpr 2→1.75` is the engine's slow-device drop (it resizes the canvas). `?dpr=N` fixes the pixel
// ratio so that drop never fires.
//
// Plain DOM, no React; costs nothing unless the flag is on.
import { flag } from './flags'

const SLOW_MS = 25
const KEEP = 300
const N = 120

export interface PerfFrame {
  dt: number
  update: number
  render: number
  calls: number
  tris: number
  dpr: number
  programs: number
  finger: boolean
  note: string
}

export class PerfHud {
  static readonly on = flag('perf') === '1'

  private el: HTMLDivElement
  private chart: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null
  private text: HTMLDivElement
  private copyBtn: HTMLButtonElement
  private times = new Float32Array(N)
  private n = 0
  private log: string[] = []
  private events: string[] = []
  private moves = 0
  private start = performance.now()
  private lastPrograms = -1
  private worst = 0
  private slow = 0
  private copiedUntil = 0
  private onMove = () => this.moves++

  constructor(host: HTMLElement) {
    const el = (this.el = document.createElement('div'))
    el.style.cssText =
      'position:absolute;right:8px;top:calc(var(--top-clear, 104px) + 8px);z-index:60;width:220px;padding:6px;border-radius:10px;' +
      'background:rgba(20,16,30,.72);color:#fff;font:11px/1.35 ui-monospace,Menlo,monospace;pointer-events:auto;touch-action:none'
    // A finger on the overlay mustn't steer the bike or turn the camera.
    for (const t of ['pointerdown', 'pointerup', 'click']) el.addEventListener(t, (e) => e.stopPropagation())
    const chart = (this.chart = document.createElement('canvas'))
    chart.width = 208 * 2
    chart.height = 56 * 2
    chart.style.cssText = 'display:block;width:208px;height:56px'
    this.ctx = chart.getContext('2d')
    this.text = document.createElement('div')
    this.text.style.cssText = 'margin:4px 0;white-space:pre-wrap'
    const row = document.createElement('div')
    row.style.cssText = 'display:flex;gap:6px'
    const button = (label: string, fn: () => void) => {
      const b = document.createElement('button')
      b.textContent = label
      b.style.cssText = 'flex:1;height:40px;border:none;border-radius:8px;background:#F7B6D2;color:#3A1E3A;font:600 13px system-ui'
      b.addEventListener('click', fn)
      row.appendChild(b)
      return b
    }
    this.copyBtn = button('Copy', () => this.copy())
    button('Clear', () => this.clear())
    el.append(chart, this.text, row)
    host.appendChild(el)
    addEventListener('pointermove', this.onMove, { capture: true, passive: true })
  }

  /** Something happened between frames worth seeing next to the slow ones (a pixel-ratio drop, a resize). */
  event(what: string) {
    this.events.push(what)
  }

  frame(f: PerfFrame) {
    const ms = f.dt * 1000
    this.times[this.n++ % N] = ms
    const t = ((performance.now() - this.start) / 1000).toFixed(1)
    const extra = [...this.events]
    if (this.lastPrograms >= 0 && f.programs > this.lastPrograms) extra.push(`programs +${f.programs - this.lastPrograms}`)
    this.lastPrograms = f.programs
    this.events.length = 0
    if (ms > SLOW_MS) {
      this.slow++
      this.worst = Math.max(this.worst, ms)
      const prev = this.times[(this.n - 2 + N) % N]
      this.log.push(
        `${t}s ${ms.toFixed(0)}ms (prev ${prev.toFixed(0)}) upd ${f.update.toFixed(1)} rnd ${f.render.toFixed(1)} ` +
          `calls ${f.calls} tris ${(f.tris / 1000).toFixed(0)}k dpr ${f.dpr} moves ${this.moves} ${f.finger ? 'finger' : 'no-finger'}` +
          (f.note ? ` | ${f.note}` : '') +
          (extra.length ? ` | ${extra.join(', ')}` : ''),
      )
      if (this.log.length > KEEP) this.log.shift()
    } else if (extra.length) this.log.push(`${t}s event: ${extra.join(', ')}`)
    this.moves = 0
    if (this.n % 6 === 0) this.draw(f)
    if (this.copiedUntil && performance.now() > this.copiedUntil) {
      this.copiedUntil = 0
      this.copyBtn.textContent = 'Copy'
    }
  }

  private draw(f: PerfFrame) {
    const c = this.ctx
    if (c) {
      const W = this.chart.width
      const H = this.chart.height
      const y = (ms: number) => H - Math.min(1, ms / 66) * H
      c.clearRect(0, 0, W, H)
      const bw = W / N
      const count = Math.min(this.n, N)
      for (let i = 0; i < count; i++) {
        const ms = this.times[(this.n - count + i + N * 2) % N]
        c.fillStyle = ms > 33 ? '#FF5A6E' : ms > SLOW_MS ? '#FFC24B' : '#7EE2A8'
        c.fillRect(i * bw, y(ms), Math.max(1, bw - 1), H - y(ms))
      }
      c.fillStyle = 'rgba(255,255,255,.5)'
      c.fillRect(0, y(16.7), W, 2)
      c.fillRect(0, y(33.3), W, 2)
    }
    let sum = 0
    const count = Math.min(this.n, N)
    for (let i = 0; i < count; i++) sum += this.times[i]
    this.text.textContent =
      `fps ${Math.round(1000 / (sum / Math.max(1, count)))}  slow ${this.slow}  worst ${this.worst.toFixed(0)}ms\n` +
      `calls ${f.calls}  tris ${(f.tris / 1000).toFixed(0)}k  dpr ${f.dpr}\n` +
      `upd ${f.update.toFixed(1)}  rnd ${f.render.toFixed(1)} ms` +
      (f.note ? `\n${f.note}` : '')
  }

  private report() {
    const head = [
      `perf log ${new Date().toISOString()}`,
      `${navigator.userAgent}`,
      `screen ${screen.width}x${screen.height} devicePixelRatio ${devicePixelRatio} page ${location.hash}`,
      `slow frames (> ${SLOW_MS}ms): ${this.slow}, worst ${this.worst.toFixed(0)}ms, frames ${this.n}`,
      '',
    ]
    return head.concat(this.log).join('\n')
  }

  private copy() {
    const text = this.report()
    const done = () => {
      this.copyBtn.textContent = 'Copied!'
      this.copiedUntil = performance.now() + 1500
    }
    const fallback = () => {
      // Older Safari without the async clipboard: select it in a text box and copy that.
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;left:0;top:0;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        done()
      } finally {
        ta.remove()
      }
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, fallback)
    else fallback()
  }

  private clear() {
    this.log.length = 0
    this.slow = 0
    this.worst = 0
    this.start = performance.now()
  }

  dispose() {
    removeEventListener('pointermove', this.onMove, { capture: true })
    this.el.remove()
  }
}
