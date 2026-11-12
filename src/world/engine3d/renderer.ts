// One WebGL renderer for the whole page. The house remounts on every section link and on the way back from the party
// screen (and twice in React's StrictMode); reusing one context keeps compiled shaders warm and stays far below the
// handful of contexts iOS allows. Released a minute after the last user leaves.
//
// We create the WebGL2 context ourselves: if three.js creates it and that fails, it logs console.error first (the
// smoke tests fail on any console error) and WebGL1 isn't supported any more. Every iPad has WebGL2.
import { NoToneMapping, SRGBColorSpace, WebGLRenderer, type Camera, type Object3D, type Scene } from 'three'
import { automated } from './flags'

let shared: { renderer: WebGLRenderer; users: number; timer?: ReturnType<typeof setTimeout> } | null = null

export function acquireRenderer(): WebGLRenderer {
  if (shared) {
    clearTimeout(shared.timer)
    shared.users++
    return shared.renderer
  }
  const canvas = document.createElement('canvas')
  // preserveDrawingBuffer only for automated screenshots (it costs a copy every frame on a real device).
  const context = canvas.getContext('webgl2', { antialias: true, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance', preserveDrawingBuffer: automated })
  if (!context) throw new Error('WebGL2 is not available')
  const renderer = new WebGLRenderer({ canvas, context })
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NoToneMapping
  renderer.debug.checkShaderErrors = import.meta.env.DEV
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;-webkit-tap-highlight-color:transparent;outline:none'
  shared = { renderer, users: 1 }
  return renderer
}

export function releaseRenderer(renderer: WebGLRenderer) {
  if (!shared || shared.renderer !== renderer) return
  shared.users--
  if (shared.users > 0) return
  const s = shared
  s.timer = setTimeout(() => {
    if (shared !== s || s.users > 0) return
    shared = null
    s.renderer.dispose()
    s.renderer.forceContextLoss()
  }, 60_000)
}

/** After a lost context the renderer can't be reused: the next mount makes a new one. */
export function dropRenderer(renderer: WebGLRenderer) {
  if (shared?.renderer === renderer) shared = null
}

/**
 * Shows every hidden thing under `root` (for a shader compile), and returns how to put it back. A light that is hidden
 * (itself or by a hidden parent) stays out: the number of lights is part of every shader, so counting one more would
 * compile shaders the scene never uses.
 */
function revealForCompile(root: Object3D): () => void {
  const shown: Object3D[] = []
  const dark: Object3D[] = []
  const walk = (o: Object3D, hidden: boolean) => {
    const h = hidden || !o.visible
    if ((o as Object3D & { isLight?: boolean }).isLight) {
      if (h && o.visible) {
        o.visible = false
        dark.push(o)
      }
    } else if (!o.visible) {
      o.visible = true
      shown.push(o)
    }
    for (const c of o.children) walk(c, h)
  }
  walk(root, false)
  return () => {
    for (const o of shown) o.visible = false
    for (const o of dark) o.visible = true
  }
}

/** Compiles the shaders of something added after the world's warm-up (a picture frame, the flight home) before it
 *  shows, so it doesn't stutter the frame it first appears in. */
export function warmLate(renderer: WebGLRenderer, root: Object3D, camera: Camera, scene: Scene): Promise<void> {
  return warmUp(renderer, root, camera, scene)
}

/**
 * `renderer.compileAsync`, minus its crash. three.js polls every material of the scene until its shader program is
 * ready, and throws inside that poll ("reading 'isReady'", uncaught: the promise never settles and the world is never
 * drawn) when a material is disposed meanwhile. That happens when two worlds share a material and the first one is
 * freed while the second warms up: a section left during its own warm-up is freed when its shaders are done (View3D),
 * which can land in the middle of the next section's. A disposed material has nothing left to wait for, so it's dropped.
 */
export function warmUp(renderer: WebGLRenderer, scene: Object3D, camera: Camera, lightsFrom: Scene | null = null): Promise<void> {
  // three.js only compiles what's visible, so a thing hidden at the start (a steer marker, an aim ring, the next room)
  // would compile the first time it shows, mid-play: a stutter. Everything shows for the compile (nothing is drawn).
  const restore = revealForCompile(scene)
  let pending: ReturnType<WebGLRenderer['compile']>
  try {
    pending = renderer.compile(scene, camera, lightsFrom)
  } finally {
    restore()
  }
  const props = renderer.properties
  return new Promise((resolve) => {
    const check = () => {
      for (const m of pending) {
        const program = (props.get(m) as { currentProgram?: { isReady(): boolean } }).currentProgram
        if (!program || program.isReady()) pending.delete(m)
      }
      if (pending.size === 0) resolve()
      else setTimeout(check, 10)
    }
    // (Without parallel compiling, give the driver a moment first, as three.js does.)
    if (renderer.extensions.has('KHR_parallel_shader_compile')) check()
    else setTimeout(check, 10)
  })
}
