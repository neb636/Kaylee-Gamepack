// The trips' drawn photos (the mall day's, the Nan road trip's): helpers to draw on a canvas in the flat outlined look,
// 5-unit ink lines, no words. No three.js.

export const INK = '#2B2330'

export const blob = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, line = 5) => {
  g.beginPath()
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  g.fillStyle = fill
  g.fill()
  if (line) {
    g.lineWidth = line
    g.strokeStyle = INK
    g.stroke()
  }
}

/** A chibi unicorn's head: round, two eyes with shines, a blush, the horn and a mane lock. */
export function unicorn(g: CanvasRenderingContext2D, x: number, y: number, r: number, fur: string, mane: string, horn = '#FFC83D') {
  // Horn.
  g.beginPath()
  g.moveTo(x - r * 0.18, y - r * 0.82)
  g.lineTo(x + r * 0.05, y - r * 1.55)
  g.lineTo(x + r * 0.26, y - r * 0.8)
  g.closePath()
  g.fillStyle = horn
  g.fill()
  g.lineWidth = 4
  g.strokeStyle = INK
  g.stroke()
  blob(g, x - r * 0.75, y - r * 0.3, r * 0.45, r * 0.6, mane)
  blob(g, x, y, r, r * 0.92, fur)
  for (const s of [-1, 1]) {
    blob(g, x + s * r * 0.36, y - r * 0.05, r * 0.15, r * 0.2, INK, 0)
    blob(g, x + s * r * 0.36 - r * 0.05, y - r * 0.12, r * 0.06, r * 0.07, '#FFFFFF', 0)
    blob(g, x + s * r * 0.6, y + r * 0.3, r * 0.15, r * 0.09, '#FF9DB8', 0)
  }
  // A big open smile.
  g.beginPath()
  g.arc(x, y + r * 0.28, r * 0.24, 0.1, Math.PI - 0.1)
  g.closePath()
  g.fillStyle = '#7A2745'
  g.fill()
  g.lineWidth = 3
  g.stroke()
}
