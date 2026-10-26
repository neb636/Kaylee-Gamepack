// The photo of the mall day that goes on Agong's wall (plan: "Home"): drawn in code for the greybox, in the flat
// outlined look (no words in it), 4:3 like the boat trip's photos. `dragon`: Kaylee whooshing down the twin-dragon
// spiral in the Big Frame with her arms up, Mommy and Daddy cheering at the bottom; `cheese`: Daddy at the pizza table
// with the cheese stretched to his nose. (The art gate may take a real snapshot in the frame instead.) No three.js.

import { blob, INK, unicorn } from '../../trip/postcard'

export type PhotoId = 'dragon' | 'cheese'
export const PHOTO_IDS: PhotoId[] = ['dragon', 'cheese']

const W = 480
const H = 360

/** A JPEG data URL of the photo (the same picture every time). */
export function drawPhoto(id: PhotoId): string {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  if (!g) return ''
  g.lineJoin = g.lineCap = 'round'
  if (id === 'cheese') cheese(g)
  else dragon(g)
  return c.toDataURL('image/jpeg', 0.85)
}

function dragon(g: CanvasRenderingContext2D) {
  // The hall: a dark ceiling with rows of strip lights, the flower mats below.
  g.fillStyle = '#3F365F'
  g.fillRect(0, 0, W, H)
  g.fillStyle = '#FFF6D8'
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) g.fillRect(20 + i * 80 + row * 20, 24 + row * 30, 46, 7)
  g.fillStyle = '#FFB3D1'
  g.fillRect(0, 290, W, 70)
  for (let i = 0; i < 9; i++) blob(g, 30 + i * 56, 322 + (i % 2) * 12, 14, 8, i % 2 ? '#FFFFFF' : '#FFE27A', 0)
  // The spiral tower and the dragon wound round it: green scales, a gold belly, its head rearing up at the top.
  g.fillStyle = '#E8E2F2'
  g.fillRect(250, 70, 70, 225)
  g.lineWidth = 5
  g.strokeStyle = INK
  g.strokeRect(250, 70, 70, 225)
  for (let k = 0; k < 4; k++) {
    const y = 110 + k * 50
    g.beginPath()
    g.moveTo(150, y + 34)
    g.bezierCurveTo(200, y - 10, 380, y - 18, 420, y + 30)
    g.lineWidth = 30
    g.strokeStyle = INK
    g.stroke()
    g.lineWidth = 22
    g.strokeStyle = k % 2 ? '#5FCB8F' : '#7FDCA5'
    g.stroke()
    g.lineWidth = 6
    g.strokeStyle = '#FFC83D'
    g.stroke()
  }
  // The dragon's head at the top: a snout, an eye, gold horns.
  blob(g, 404, 88, 40, 28, '#7FDCA5')
  blob(g, 438, 96, 20, 15, '#7FDCA5')
  blob(g, 398, 78, 9, 10, '#FFFFFF')
  blob(g, 400, 79, 4, 5, INK, 0)
  for (const dx of [-14, 8]) {
    g.beginPath()
    g.moveTo(388 + dx, 62)
    g.lineTo(380 + dx, 34)
    g.lineTo(398 + dx, 58)
    g.fillStyle = '#FFC83D'
    g.fill()
    g.lineWidth = 4
    g.strokeStyle = INK
    g.stroke()
  }
  // Kaylee sliding down it, arms up, mane flying, in her grip socks.
  blob(g, 205, 186, 30, 26, '#D9CCFF')
  for (const s of [-1, 1]) {
    g.beginPath()
    g.moveTo(205 + s * 18, 170)
    g.lineTo(205 + s * 42, 128)
    g.lineWidth = 14
    g.strokeStyle = INK
    g.stroke()
    g.lineWidth = 8
    g.strokeStyle = '#D9CCFF'
    g.stroke()
  }
  blob(g, 186, 212, 13, 9, '#FF8FB8')
  blob(g, 224, 212, 13, 9, '#FF8FB8')
  unicorn(g, 205, 140, 34, '#E5DBFF', '#FF8FB8')
  // Mommy and Daddy at the bottom, cheering.
  unicorn(g, 80, 262, 30, '#FFF0F6', '#FF8FB8')
  unicorn(g, 140, 270, 34, '#F4F1FF', '#7FD1B9')
  // Sparkles.
  g.fillStyle = '#FFE27A'
  for (const [x, y] of [[150, 110], [262, 150], [120, 190], [440, 160]]) {
    g.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const r = i % 2 ? 4 : 12
      g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
    }
    g.closePath()
    g.fill()
  }
}

function cheese(g: CanvasRenderingContext2D) {
  // The green booth, the table, the pizza, Daddy with the cheese stretched to his nose and Kaylee laughing.
  g.fillStyle = '#4DB57A'
  g.fillRect(0, 0, W, H)
  g.fillStyle = '#7FD6A3'
  g.fillRect(0, 40, W, 150)
  unicorn(g, 140, 170, 46, '#E5DBFF', '#FF8FB8')
  unicorn(g, 330, 160, 52, '#F4F1FF', '#7FD1B9')
  g.fillStyle = '#FFF7F0'
  g.fillRect(0, 240, W, 120)
  g.lineWidth = 5
  g.strokeStyle = INK
  g.strokeRect(-5, 240, W + 10, 125)
  blob(g, 240, 280, 120, 34, '#E7A94B')
  blob(g, 240, 276, 104, 26, '#FFD86B', 0)
  for (const [x, y] of [[200, 272], [250, 284], [290, 270], [222, 290]]) blob(g, x, y, 10, 6, '#E8434F', 3)
  // The stretchy cheese, from the pan up to Daddy's nose.
  g.beginPath()
  g.moveTo(280, 268)
  g.bezierCurveTo(300, 230, 310, 200, 330, 178)
  g.lineWidth = 10
  g.strokeStyle = INK
  g.stroke()
  g.lineWidth = 5
  g.strokeStyle = '#FFE27A'
  g.stroke()
  blob(g, 330, 178, 9, 7, '#FFE27A', 3)
}
