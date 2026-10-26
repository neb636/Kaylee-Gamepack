// The camera lab's settings and the address bar: ?cam=1 opens the lab with the game's own camera, and cam.* params hold
// what Dad changed (only what differs from the defaults), next to the section's own state:
//   #/world/thailand/mall-trip/barber?round=3&cam=1&cam.pitch=18&cam.zoom=0.85&cam.frame=ipad-wide
// kit/sections.ts keeps these params in the address bar as she plays, so the link always reproduces the moment.
import type { CamOverride } from '../../engine/camera'

export type FrameId = 'fill' | 'ipad-tall' | 'ipad-wide' | 'ipadpro-wide' | 'iphone-wide'
export type Guide = 'box' | 'bar' | 'thirds' | 'targets'

/** A screen to preview on: its real size in CSS pixels (scaled down to fit the window), as in scripts/qa-lib.mjs. */
export interface Frame {
  id: FrameId
  label: string
  short: string
  w?: number
  h?: number
}
export const FRAMES: Frame[] = [
  { id: 'fill', label: 'Fill the window', short: 'Fill' },
  { id: 'ipad-tall', label: 'iPad portrait · 820 × 1180', short: 'iPad ▯', w: 820, h: 1180 },
  { id: 'ipad-wide', label: 'iPad landscape · 1180 × 820', short: 'iPad ▭', w: 1180, h: 820 },
  { id: 'ipadpro-wide', label: 'iPad Pro landscape · 1366 × 1024', short: 'Pro ▭', w: 1366, h: 1024 },
  { id: 'iphone-wide', label: 'iPhone landscape · 844 × 390', short: 'iPhone ▭', w: 844, h: 390 },
]
export const frameById = (id: FrameId) => FRAMES.find((f) => f.id === id) ?? FRAMES[0]

export const GUIDES: { id: Guide; label: string }[] = [
  { id: 'box', label: 'Box' },
  { id: 'bar', label: 'Top bar' },
  { id: 'thirds', label: 'Thirds' },
  { id: 'targets', label: 'Targets' },
]

export interface CamView {
  /** nudge: yaw and pitch are added to the game's; lock: they replace them. */
  mode: 'nudge' | 'lock'
  yaw: number
  pitch: number
  zoom: number
  /** Degrees of view (0: the game's lens). */
  fov: number
  px: number
  py: number
  frame: FrameId
  guides: Guide[]
}

export const DEFAULTS: CamView = { mode: 'nudge', yaw: 0, pitch: 0, zoom: 1, fov: 0, px: 0, py: 0, frame: 'fill', guides: ['bar', 'targets'] }

const num = (v: string | undefined, d: number) => (v !== undefined && v !== '' && !isNaN(+v) ? +v : d)

/** The view a link describes (anything missing: the defaults). */
export function fromParams(p: Record<string, string>): CamView {
  const guides = p['cam.guides']
  return {
    mode: p['cam.mode'] === 'lock' ? 'lock' : 'nudge',
    yaw: num(p['cam.yaw'], DEFAULTS.yaw),
    pitch: num(p['cam.pitch'], DEFAULTS.pitch),
    zoom: num(p['cam.zoom'], DEFAULTS.zoom),
    fov: num(p['cam.fov'], DEFAULTS.fov),
    px: num(p['cam.px'], DEFAULTS.px),
    py: num(p['cam.py'], DEFAULTS.py),
    frame: FRAMES.some((f) => f.id === p['cam.frame']) ? (p['cam.frame'] as FrameId) : DEFAULTS.frame,
    guides: guides === undefined ? DEFAULTS.guides : (guides.split(',').filter((g) => GUIDES.some((x) => x.id === g)) as Guide[]),
  }
}

/** True when the view is the game's own camera (nothing to change). */
export const untouched = (v: CamView) => v.mode === 'nudge' && !v.yaw && !v.pitch && v.zoom === 1 && !v.fov && !v.px && !v.py

/** What the rig should do with the game's shots (null: leave them alone). */
export function toOverride(v: CamView): CamOverride | null {
  if (untouched(v)) return null
  return { mode: v.mode, yaw: v.yaw, pitch: v.pitch, zoom: v.zoom, fov: v.fov || null, px: v.px, py: v.py }
}

const round = (n: number, d = 2) => String(+n.toFixed(d))

/** The cam.* params for a view: only what differs from the defaults. */
export function camParams(v: CamView): Record<string, string> {
  const p: Record<string, string> = { cam: '1' }
  if (v.mode !== DEFAULTS.mode) p['cam.mode'] = v.mode
  if (v.yaw !== DEFAULTS.yaw || v.mode === 'lock') p['cam.yaw'] = round(v.yaw, 1)
  if (v.pitch !== DEFAULTS.pitch || v.mode === 'lock') p['cam.pitch'] = round(v.pitch, 1)
  if (v.zoom !== DEFAULTS.zoom) p['cam.zoom'] = round(v.zoom)
  if (v.fov !== DEFAULTS.fov) p['cam.fov'] = round(v.fov, 1)
  if (v.px !== DEFAULTS.px) p['cam.px'] = round(v.px)
  if (v.py !== DEFAULTS.py) p['cam.py'] = round(v.py)
  if (v.frame !== DEFAULTS.frame) p['cam.frame'] = v.frame
  if (v.guides.join(',') !== DEFAULTS.guides.join(',')) p['cam.guides'] = v.guides.join(',')
  return p
}

const isCam = (k: string) => k === 'cam' || k.startsWith('cam.')

/** A hash's query with its cam params swapped for `cam` (commas stay readable, as in router.worldLink). */
export function withCam(hash: string, cam: Record<string, string>) {
  const [path, query = ''] = hash.split('?')
  const rest = [...new URLSearchParams(query)].filter(([k]) => !isCam(k))
  const q = [...rest, ...Object.entries(cam)].map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%2C/g, ',')}`).join('&')
  return q ? `${path}?${q}` : path
}

/** The address bar follows the lab (replaceState: no hashchange, so the game doesn't restart). */
export function writeHash(v: CamView) {
  const hash = withCam(location.hash, camParams(v))
  if (location.hash !== hash) history.replaceState(history.state, '', hash)
}

/** The section link without the lab (what the game itself would show). */
export const withoutCam = (hash: string) => withCam(hash, {})
