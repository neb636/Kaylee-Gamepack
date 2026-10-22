// Giant beach balls bobbing round the Heart Gate (race.ts): any boat that bumps one knocks it flying, boing, bouncing
// up and off to the side, bouncing over the water and rolling; they bounce off the ropes and each other, and drift
// slowly back to their places for the next lap (one knocked far away drops back in from the sky). Just for fun: they
// never slow her down.
import { BackSide, CanvasTexture, Group, Mesh, MeshBasicMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'
import type { Bag } from '../../../engine/dispose'
import { PAL } from '../../../engine/toon'
import { swell } from '../../../engine/water'
import { BALLS, halfAt, locate, spotAt } from './track'

const R = 1.4
const G = 14
const axis = new Vector3()
const spin = new Quaternion()

/** Six stripes round the ball, rainbow and white by turns, white caps top and bottom. */
function ballTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')!
  const stripes = [PAL.hotpink, '#FFFFFF', PAL.butter, '#FFFFFF', PAL.sky, '#FFFFFF', PAL.mint, '#FFFFFF']
  stripes.forEach((col, i) => {
    g.fillStyle = col
    g.fillRect((i * 256) / stripes.length, 0, 256 / stripes.length + 1, 128)
  })
  g.fillStyle = '#FFFFFF'
  g.fillRect(0, 0, 256, 14)
  g.fillRect(0, 114, 256, 14)
  return bag.add(new CanvasTexture(c))
}

interface Ball {
  mesh: Group
  x: number
  z: number
  y: number
  vx: number
  vz: number
  vy: number
  home: { x: number; z: number }
  i: number
  cool: number
}

export class BeachBalls {
  readonly root = new Group()
  readonly list: Ball[] = []

  constructor(bag: Bag) {
    const geo = bag.add(new SphereGeometry(R, 20, 14))
    const mat = bag.add(new MeshBasicMaterial({ map: ballTexture(bag) }))
    const ink = bag.add(new MeshBasicMaterial({ color: PAL.ink, side: BackSide }))
    for (const b of BALLS) {
      const p = spotAt(b.s, b.lat)
      const g = new Group()
      g.add(new Mesh(geo, mat))
      const line = new Mesh(geo, ink)
      line.scale.setScalar(1.07)
      g.add(line)
      g.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3)
      this.root.add(g)
      this.list.push({ mesh: g, x: p.x, z: p.z, y: 0, vx: 0, vz: 0, vy: 0, home: { x: p.x, z: p.z }, i: locate(p.x, p.z).i, cool: 0 })
    }
  }

  /** A boat's hull circle at (x, z), radius r, moving (vx, vz): any ball it touches flies off. How many it knocked. */
  kick(x: number, z: number, r: number, vx: number, vz: number) {
    let n = 0
    for (const b of this.list) {
      const dx = b.x - x
      const dz = b.z - z
      const d = Math.hypot(dx, dz)
      if (d > R + r || d < 1e-4 || b.y > R + 1) continue
      const nx = dx / d
      const nz = dz / d
      // Out of the boat, then thrown: up high (the boat goes on under it) and off to the side it was hit on, with some
      // of the boat's speed (so a boat never pushes a ball along in front of it).
      b.x += nx * (R + r - d)
      b.z += nz * (R + r - d)
      const sp = Math.hypot(vx, vz)
      const fx = sp > 0.1 ? vx / sp : nx
      const fz = sp > 0.1 ? vz / sp : nz
      const side = Math.sign(fx * nz - fz * nx) || 1
      b.vx = vx * 0.55 + nx * 3 + fz * side * (4 + sp * 0.25)
      b.vz = vz * 0.55 + nz * 3 - fx * side * (4 + sp * 0.25)
      b.vy = Math.max(b.vy, 5 + sp * 0.3)
      if (b.cool <= 0) n++
      b.cool = 0.35
    }
    return n
  }

  update(dt: number, t: number) {
    const list = this.list
    for (const b of list) {
      b.cool -= dt
      // Up in the air and down with a bounce; on the water it slows (drag) and drifts back home when it's still.
      if (b.y > 0 || b.vy > 0) {
        b.vy -= G * dt
        b.y += b.vy * dt
        if (b.y <= 0) {
          b.y = 0
          b.vy = Math.abs(b.vy) > 2.5 ? -b.vy * 0.45 : 0
        }
      }
      const drag = Math.exp(-dt * (b.y > 0 ? 0.25 : 0.9))
      b.vx *= drag
      b.vz *= drag
      const hx = b.home.x - b.x
      const hz = b.home.z - b.z
      if (Math.hypot(hx, hz) > 40) {
        // Too far from home: it drops back in from the sky.
        b.x = b.home.x
        b.z = b.home.z
        b.i = locate(b.x, b.z).i
        b.y = 9
        b.vx = b.vz = b.vy = 0
      } else if (Math.hypot(b.vx, b.vz) < 2 && Math.hypot(hx, hz) > 2) {
        b.vx += hx * 0.25 * dt
        b.vz += hz * 0.25 * dt
      }
      const mx = b.vx * dt
      const mz = b.vz * dt
      b.x += mx
      b.z += mz
      // The ropes: back in, bouncing off.
      const loc = locate(b.x, b.z, b.i, 20)
      b.i = loc.i
      const lim = halfAt(loc.s) - R
      if (Math.abs(loc.lat) > lim) {
        const p = spotAt(loc.s)
        const side = Math.sign(loc.lat)
        const lx = Math.cos(p.heading)
        const lz = -Math.sin(p.heading)
        const depth = Math.abs(loc.lat) - lim
        b.x -= lx * side * depth
        b.z -= lz * side * depth
        const vn = (b.vx * lx + b.vz * lz) * side
        if (vn > 0) {
          b.vx -= 1.7 * vn * lx * side
          b.vz -= 1.7 * vn * lz * side
        }
      }
      // Rolling the way it goes.
      const dist = Math.hypot(mx, mz)
      if (dist > 1e-4) {
        axis.set(mz, 0, -mx).normalize()
        spin.setFromAxisAngle(axis, dist / R)
        b.mesh.quaternion.premultiply(spin)
      }
    }
    // The balls bump each other.
    for (let a = 0; a < list.length; a++)
      for (let c = a + 1; c < list.length; c++) {
        const A = list[a]
        const B = list[c]
        const dx = B.x - A.x
        const dz = B.z - A.z
        const d = Math.hypot(dx, dz)
        if (d >= R * 2 || d < 1e-4) continue
        const nx = dx / d
        const nz = dz / d
        const push = (R * 2 - d) / 2
        A.x -= nx * push
        A.z -= nz * push
        B.x += nx * push
        B.z += nz * push
        const vn = (B.vx - A.vx) * nx + (B.vz - A.vz) * nz
        if (vn < 0) {
          A.vx += vn * nx
          A.vz += vn * nz
          B.vx -= vn * nx
          B.vz -= vn * nz
        }
      }
    for (const b of list) b.mesh.position.set(b.x, swell(b.x, b.z, t) + R * 0.8 + b.y, b.z)
  }
}
