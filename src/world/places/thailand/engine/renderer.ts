// One WebGL renderer for the whole page. The house remounts on every section link and on the way back from the party
// screen (and twice in React's StrictMode); reusing one context keeps compiled shaders warm and stays far below the
// handful of contexts iOS allows. Released a minute after the last user leaves.
//
// We create the WebGL2 context ourselves: if three.js creates it and that fails, it logs console.error first (the
// smoke tests fail on any console error) and WebGL1 isn't supported any more. No context = the flat fallback.
import { NoToneMapping, SRGBColorSpace, WebGLRenderer } from 'three'
import { automated, flag } from './flags'

let shared: { renderer: WebGLRenderer; users: number; timer?: ReturnType<typeof setTimeout> } | null = null

export function acquireRenderer(): WebGLRenderer | null {
  // Checked first: a hash-only navigation to ?gl=off keeps the page (and the shared renderer).
  if (flag('gl') === 'off') return null
  if (shared) {
    clearTimeout(shared.timer)
    shared.users++
    return shared.renderer
  }
  const canvas = document.createElement('canvas')
  let context: WebGL2RenderingContext | null = null
  try {
    // preserveDrawingBuffer only for automated screenshots (it costs a copy every frame on a real device).
    context = canvas.getContext('webgl2', { antialias: true, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance', preserveDrawingBuffer: automated })
  } catch {
    context = null
  }
  if (!context) return null
  try {
    const renderer = new WebGLRenderer({ canvas, context })
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = NoToneMapping
    renderer.debug.checkShaderErrors = import.meta.env.DEV
    canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;-webkit-tap-highlight-color:transparent;outline:none'
    shared = { renderer, users: 1 }
    return renderer
  } catch {
    return null
  }
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
