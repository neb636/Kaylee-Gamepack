// The Nan road trip's photos, one for each place she went (plan: "Home"): drawn in code for the greybox, in the flat
// outlined look (no words in them), 4:3 like the other trips' photos. Coming home, they fan out and she picks the one
// for Agong's wall. `deck`: Mommy's photo on Stop Time Cafe's deck over the rice steps, a cloud on the ridge; `three`:
// the family at the viewpoint with the giant 3 of the road behind them; `pizza`: the mushroom pizza with her pink
// mushrooms; `salt`: the big pan in Bo Kluea, steaming, with her heap of white salt. (The look step may take real
// snapshots instead.) No three.js.
import { photoColors } from '../../characters/style'
import { blob, INK, unicorn } from '../../trip/postcard'
import type { Stop } from './map/layout'

export type PhotoId = 'deck' | 'three' | 'pizza' | 'salt'
export const PHOTO_IDS: PhotoId[] = ['deck', 'three', 'pizza', 'salt']
/** Each stop's photo (the 3's comes from the viewpoint). */
export const PHOTO_OF: Record<Stop, PhotoId> = { rice: 'deck', mushrooms: 'pizza', salt: 'salt' }

const W = 480
const H = 360
/** Kaylee's fur and mane: her look's when the photo is drawn (so a photo on Agong's wall keeps that day's). */
let KAYLEE: [string, string] = ['#E5DBFF', '#FF8FB8']
const MOMMY = ['#FFF0F6', '#FF8FB8'] as const
const DADDY = ['#F4F1FF', '#7FD1B9'] as const

/** A JPEG data URL of the photo (the same picture every time). */
export function drawPhoto(id: PhotoId): string {
  const me = photoColors()
  KAYLEE = [me.fur, me.mane]
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  if (!g) return ''
  g.lineJoin = g.lineCap = 'round'
  ;({ deck, three, pizza, salt })[id](g)
  return c.toDataURL('image/jpeg', 0.85)
}

/** The `photos` param as a list of known photos, no repeats. */
export const parsePhotos = (s: string) => [...new Set(s.split(',').filter((p): p is PhotoId => (PHOTO_IDS as string[]).includes(p)))]

const stroke = (g: CanvasRenderingContext2D, w: number, color: string) => {
  g.lineWidth = w
  g.strokeStyle = color
  g.stroke()
}

/** A soft grey-lavender sky and a ridge of round green mountains with a cloud sitting on top. */
function mountains(g: CanvasRenderingContext2D, ground: number) {
  g.fillStyle = '#DCE3F2'
  g.fillRect(0, 0, W, H)
  g.beginPath()
  g.moveTo(0, ground)
  for (let x = 0; x <= W; x += 40) g.lineTo(x, ground - 70 - Math.sin(x / 70) * 40 - Math.cos(x / 31) * 12)
  g.lineTo(W, ground)
  g.closePath()
  g.fillStyle = '#7FCB8F'
  g.fill()
  stroke(g, 5, INK)
  for (const [x, y] of [[90, ground - 112], [300, ground - 96]]) {
    blob(g, x, y, 60, 18, '#FFFFFF', 4)
    blob(g, x + 30, y - 10, 34, 16, '#FFFFFF', 0)
  }
}

function deck(g: CanvasRenderingContext2D) {
  mountains(g, 200)
  // The rice steps down the valley: curved shiny terraces, green and wet.
  for (let i = 0; i < 6; i++) {
    const y = 196 + i * 26
    g.beginPath()
    g.moveTo(-10, y)
    g.bezierCurveTo(140, y - 22, 320, y + 26, W + 10, y - 6)
    g.lineTo(W + 10, y + 26)
    g.bezierCurveTo(320, y + 50, 140, y + 2, -10, y + 26)
    g.closePath()
    g.fillStyle = i % 2 ? '#8FD6B0' : '#A8DCEB'
    g.fill()
    stroke(g, 4, INK)
  }
  // The deck's railing of crossed branches across the bottom, and the family leaning on it.
  unicorn(g, 120, 250, 40, ...MOMMY)
  unicorn(g, 240, 262, 34, ...KAYLEE)
  unicorn(g, 360, 248, 44, ...DADDY)
  g.fillStyle = '#9A6B4A'
  g.fillRect(0, 300, W, 20)
  g.strokeStyle = INK
  g.lineWidth = 5
  g.strokeRect(-5, 300, W + 10, 20)
  for (let x = 0; x < W; x += 60) {
    g.beginPath()
    g.moveTo(x, 320)
    g.lineTo(x + 60, H)
    g.moveTo(x + 60, 320)
    g.lineTo(x, H)
    stroke(g, 12, INK)
    stroke(g, 7, '#9A6B4A')
  }
}

function three(g: CanvasRenderingContext2D) {
  mountains(g, 170)
  g.fillStyle = '#9ED9A6'
  g.fillRect(0, 170, W, H)
  // The road down the hill, a giant 3: two round bumps, grey tarmac with its dashed middle line, like the real road.
  const road = () => {
    g.beginPath()
    g.moveTo(170, 60 + 130)
    g.bezierCurveTo(250, 140, 380, 170, 320, 222)
    g.bezierCurveTo(280, 248, 250, 246, 262, 250)
    g.bezierCurveTo(400, 262, 390, 352, 250, 340)
    g.bezierCurveTo(210, 336, 190, 326, 176, 314)
  }
  road()
  stroke(g, 34, INK)
  road()
  stroke(g, 26, '#8E8AA0')
  road()
  g.setLineDash([10, 10])
  stroke(g, 3, '#FFF4DC')
  g.setLineDash([])
  // The family in front, cheering.
  unicorn(g, 80, 290, 38, ...MOMMY)
  unicorn(g, 420, 286, 42, ...DADDY)
  unicorn(g, 112, 330, 30, ...KAYLEE)
}

function pizza(g: CanvasRenderingContext2D) {
  // The farm's table in the trees: a green wall of leaves, the wooden table, the round pizza with her mushrooms.
  g.fillStyle = '#5FB97E'
  g.fillRect(0, 0, W, H)
  for (let i = 0; i < 14; i++) blob(g, 20 + i * 36, 40 + (i % 3) * 30, 34, 26, i % 2 ? '#7FCB8F' : '#6FBF7F', 0)
  unicorn(g, 110, 150, 44, ...MOMMY)
  unicorn(g, 380, 146, 48, ...DADDY)
  unicorn(g, 245, 140, 36, ...KAYLEE)
  g.fillStyle = '#B98559'
  g.fillRect(0, 220, W, H)
  g.strokeStyle = INK
  g.lineWidth = 5
  g.strokeRect(-5, 220, W + 10, H)
  blob(g, 240, 285, 150, 54, '#E7A94B')
  blob(g, 240, 281, 132, 44, '#FFD86B', 0)
  // Grey, pink and golden oyster mushrooms: little fans.
  const shroom = (x: number, y: number, c: string) => {
    g.beginPath()
    g.moveTo(x, y + 8)
    g.arc(x, y + 8, 16, Math.PI * 1.1, Math.PI * 1.9)
    g.closePath()
    g.fillStyle = c
    g.fill()
    stroke(g, 3, INK)
  }
  for (const [x, y, c] of [[180, 262, '#FF8FB8'], [230, 290, '#C9C1D9'], [285, 262, '#FF8FB8'], [320, 290, '#FFC83D'], [150, 292, '#C9C1D9'], [255, 252, '#FFC83D'], [210, 306, '#FF8FB8']] as const) shroom(x, y, c)
}

function salt(g: CanvasRenderingContext2D) {
  // The salt hut: dark wood walls, the big round pan over the fire, steam curling up, her basket heaped with salt.
  g.fillStyle = '#6E5644'
  g.fillRect(0, 0, W, H)
  g.fillStyle = '#86694F'
  for (let x = 0; x < W; x += 48) g.fillRect(x + 4, 0, 40, 210)
  unicorn(g, 90, 150, 40, ...DADDY)
  unicorn(g, 400, 160, 36, ...MOMMY)
  // The fire's mouth and the pan.
  g.fillStyle = '#B9B4CC'
  g.fillRect(110, 240, 260, H)
  g.strokeStyle = INK
  g.lineWidth = 5
  g.strokeRect(110, 240, 260, H)
  blob(g, 240, 300, 40, 26, '#FF8A4D')
  blob(g, 240, 306, 22, 14, '#FFC83D', 0)
  blob(g, 240, 236, 150, 26, '#8A8FA8')
  blob(g, 240, 232, 130, 18, '#FFFFFF', 0)
  for (const [x, y] of [[180, 180], [240, 160], [300, 184]]) blob(g, x, y, 26, 18, 'rgba(255,255,255,.85)', 0)
  // Kaylee with her basket of sparkly white salt.
  unicorn(g, 408, 270, 34, ...KAYLEE)
  blob(g, 330, 318, 46, 26, '#E3B877')
  blob(g, 330, 300, 36, 18, '#FFFFFF', 3)
  g.fillStyle = '#FFE27A'
  for (const [x, y] of [[300, 286], [352, 290], [328, 278]]) {
    g.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const r = i % 2 ? 3 : 9
      g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
    }
    g.closePath()
    g.fill()
  }
}
