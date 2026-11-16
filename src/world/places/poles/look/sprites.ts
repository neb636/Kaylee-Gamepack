// Little pictures that float in the Poles' 3D scenes as sprites: a pink heart (a friend made happy), a song's colored
// beads, a soft glow, and a snowflake (someone cold). Drawn once on a canvas with flat fills and an ink stroke (no
// canvas gradients except the glow, which is soft anyway). Papa's song (activities/party/song.ts) and Emperor Huddle
// (activities/huddle/world.ts) share them.
import { CanvasTexture } from 'three'

/** The song beads' colors, low notes to high. */
export const NOTE_COLORS = ['#FF6FA8', '#FFB24D', '#FFD84D', '#7ED6A5', '#7EC8F2', '#B79CFF']
const INK = '#3A2A3F'

export function canvas(size: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!)
  return new CanvasTexture(c)
}

export function heartTexture() {
  return canvas(96, (g) => {
    g.translate(48, 50)
    g.beginPath()
    g.moveTo(0, 30)
    g.bezierCurveTo(-46, -4, -24, -42, 0, -18)
    g.bezierCurveTo(24, -42, 46, -4, 0, 30)
    g.fillStyle = '#FF6FA8'
    g.fill()
    g.lineWidth = 6
    g.lineJoin = 'round'
    g.strokeStyle = INK
    g.stroke()
  })
}

/** A song's dot: a round colored bead with a shine. */
export function noteTexture(color: string) {
  return canvas(64, (g) => {
    g.beginPath()
    g.arc(32, 32, 24, 0, Math.PI * 2)
    g.fillStyle = color
    g.fill()
    g.lineWidth = 6
    g.strokeStyle = INK
    g.stroke()
    g.beginPath()
    g.arc(24, 24, 6, 0, Math.PI * 2)
    g.fillStyle = 'rgba(255,255,255,.85)'
    g.fill()
  })
}

export function glowTexture() {
  return canvas(128, (g) => {
    const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,234,154,0.95)')
    grad.addColorStop(0.5, 'rgba(255,170,200,0.45)')
    grad.addColorStop(1, 'rgba(255,170,200,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
  })
}

/** A chunky six-armed snowflake, pale ice blue with an ink edge: "this one is cold". */
export function flakeTexture() {
  return canvas(96, (g) => {
    g.translate(48, 48)
    g.lineCap = 'round'
    const arms = (w: number, color: string) => {
      g.strokeStyle = color
      g.lineWidth = w
      for (let i = 0; i < 6; i++) {
        g.save()
        g.rotate((i * Math.PI) / 3)
        g.beginPath()
        g.moveTo(0, 0)
        g.lineTo(0, -34)
        g.moveTo(0, -20)
        g.lineTo(-11, -29)
        g.moveTo(0, -20)
        g.lineTo(11, -29)
        g.stroke()
        g.restore()
      }
    }
    arms(15, INK)
    arms(7, '#BFE6FF')
    g.beginPath()
    g.arc(0, 0, 9, 0, Math.PI * 2)
    g.fillStyle = '#FFFFFF'
    g.fill()
    g.lineWidth = 4
    g.strokeStyle = INK
    g.stroke()
  })
}
