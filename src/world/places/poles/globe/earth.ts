// The Earth's map for the toy globe: rough continent shapes painted into a canvas (the world map's own colors, so the
// globe matches the map she flew from), and `ll()`, which puts a 3D thing at a latitude and longitude on the same sphere.
// Oceans are left transparent: the globe's shader paints them (and the snow on the land), see material.ts.
import { CanvasTexture, SRGBColorSpace, Vector3 } from 'three'

const DEG = Math.PI / 180

/** A point at latitude/longitude (degrees), `r` from the center, with the same mapping as three's SphereGeometry UVs, so
 *  3D things land where the painted map puts them. */
export function ll(lat: number, lon: number, r = 1, out = new Vector3()) {
  const phi = (lon + 180) * DEG
  const th = lat * DEG
  return out.set(-Math.cos(phi) * Math.cos(th), Math.sin(th), Math.sin(phi) * Math.cos(th)).multiplyScalar(r)
}

// The world map's continent colors (src/world/assets/bg-world-map.webp).
const C = {
  north: '#8FE3C8',
  south: '#FFC2A8',
  europe: '#C9B6F5',
  asia: '#FF9EC4',
  africa: '#FBEA9A',
  australia: '#FFB98A',
  ice: '#FFF7F0',
}

type Pt = [lon: number, lat: number]
// Rough outlines, [longitude, latitude]: a toy's map, not an atlas.
const NORTH_AMERICA: Pt[] = [[-168, 66], [-162, 70], [-150, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 70], [-80, 63], [-90, 58], [-82, 53], [-78, 58], [-70, 60], [-62, 57], [-56, 52], [-60, 47], [-66, 44], [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 26], [-82, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 22], [-92, 19], [-88, 21], [-87, 16], [-83, 15], [-83, 10], [-79, 9], [-77, 8], [-80, 7], [-86, 11], [-92, 15], [-105, 20], [-110, 24], [-112, 29], [-115, 30], [-117, 33], [-121, 35], [-124, 40], [-124, 46], [-126, 50], [-132, 55], [-140, 60], [-148, 61], [-155, 58], [-162, 58], [-165, 62]]
const GREENLAND: Pt[] = [[-55, 60], [-48, 61], [-42, 60], [-38, 65], [-22, 70], [-20, 76], [-18, 80], [-30, 83], [-45, 83], [-60, 82], [-70, 78], [-62, 76], [-56, 72], [-53, 67]]
const SOUTH_AMERICA: Pt[] = [[-77, 8], [-72, 12], [-63, 11], [-60, 8], [-52, 4], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-40, -22], [-48, -26], [-53, -34], [-58, -35], [-57, -38], [-62, -40], [-65, -45], [-67, -48], [-69, -52], [-68, -55], [-72, -54], [-75, -50], [-74, -42], [-73, -35], [-71, -28], [-70, -18], [-76, -14], [-80, -6], [-81, -2], [-80, 1]]
const AFRICA: Pt[] = [[-17, 15], [-17, 21], [-13, 27], [-10, 30], [-6, 35], [0, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [34, 28], [37, 22], [39, 16], [43, 12], [51, 12], [51, 10], [47, 4], [42, -2], [40, -10], [40, -16], [35, -20], [35, -25], [32, -29], [27, -34], [20, -35], [18, -32], [15, -27], [12, -18], [13, -10], [9, -2], [9, 4], [5, 6], [0, 5], [-8, 4], [-13, 8], [-15, 11]]
const ARABIA: Pt[] = [[35, 32], [35, 28], [39, 22], [43, 13], [45, 13], [52, 16], [57, 19], [60, 22], [56, 26], [51, 24], [48, 30], [44, 30]]
const EURASIA: Pt[] = [[-10, 36], [-9, 43], [-2, 44], [-2, 48], [-5, 48], [0, 50], [8, 54], [8, 57], [5, 59], [5, 62], [12, 66], [16, 69], [25, 71], [30, 70], [40, 67], [44, 68], [60, 69], [70, 73], [80, 73], [100, 77], [115, 74], [130, 72], [142, 72], [160, 70], [170, 70], [180, 68], [180, 65], [175, 62], [163, 60], [160, 55], [156, 51], [155, 58], [143, 59], [137, 54], [141, 50], [140, 45], [132, 43], [129, 40], [127, 35], [122, 40], [118, 38], [122, 31], [120, 25], [110, 21], [108, 16], [109, 12], [105, 9], [100, 13], [100, 8], [104, 1], [98, 8], [98, 16], [94, 17], [92, 22], [87, 22], [80, 15], [78, 8], [73, 17], [72, 21], [67, 24], [62, 25], [57, 26], [52, 28], [48, 30], [44, 37], [36, 37], [27, 37], [26, 40], [23, 38], [22, 37], [20, 40], [19, 42], [13, 45], [12, 44], [16, 41], [18, 40], [15, 38], [10, 44], [3, 43], [-2, 37]]
const AUSTRALIA: Pt[] = [[114, -22], [114, -26], [115, -34], [118, -35], [124, -34], [129, -32], [135, -35], [138, -35], [140, -38], [146, -39], [150, -37], [153, -32], [153, -25], [146, -19], [145, -15], [142, -11], [141, -17], [136, -15], [137, -12], [132, -11], [129, -15], [126, -14], [122, -17], [118, -20]]
/** Islands as ellipses: [lon, lat, half-width, half-height (degrees), color, turn (degrees)]. */
const ISLANDS: [number, number, number, number, string, number?][] = [
  [-95, 75, 22, 4, C.north], [-72, 70, 7, 4, C.north, -30], [-19, 65, 4, 1.5, C.europe],
  [-2, 54, 2.5, 4.5, C.europe], [-8, 53, 1.8, 1.8, C.europe],
  [138, 36, 2.5, 5, C.asia, 35], [142, 43, 2, 2, C.asia], [122, 12, 2, 4, C.asia],
  [102, 0, 6, 1.6, C.asia, -40], [114, -1, 4, 3.5, C.asia], [121, -2, 1.8, 2.5, C.asia], [110, -7, 5, 1, C.asia], [138, -5, 8, 2.6, C.australia, -12],
  [47, -19, 2.5, 6, C.africa, 15], [146, -42, 1.5, 1.3, C.australia], [173, -40, 1.8, 3, C.australia, 30], [169, -45, 2, 2.4, C.australia, 30],
]

/** The painted map (the globe's material reads it; dispose it with the globe). */
export function earthTexture(width = 2048) {
  const W = width
  const H = width / 2
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!
  const px = ([lon, lat]: Pt): [number, number] => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H]
  // Rounded coasts: curves through the midpoints of the outline.
  const shape = (pts: Pt[]) => {
    const p = pts.map(px)
    const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const
    g.beginPath()
    g.moveTo(...mid(p[p.length - 1], p[0]))
    for (let i = 0; i < p.length; i++) g.quadraticCurveTo(p[i][0], p[i][1], ...mid(p[i], p[(i + 1) % p.length]))
    g.closePath()
  }
  const fill = (pts: Pt[], color: string) => {
    shape(pts)
    g.fillStyle = color
    g.fill()
  }

  fill(NORTH_AMERICA, C.north)
  fill(SOUTH_AMERICA, C.south)
  fill(AFRICA, C.africa)
  fill(ARABIA, C.asia)
  fill(EURASIA, C.asia)
  // Europe is Eurasia's west end, in lavender like the map.
  g.save()
  const [ex, ey] = px([-30, 75])
  const [ex2, ey2] = px([42, 36])
  g.beginPath()
  g.rect(ex, ey, ex2 - ex, ey2 - ey)
  g.clip()
  fill(EURASIA, C.europe)
  g.restore()
  fill(AUSTRALIA, C.australia)
  // Greenland is nearly all ice.
  fill(GREENLAND, C.ice)
  for (const [lon, lat, rx, ry, color, turn = 0] of ISLANDS) {
    const [x, y] = px([lon, lat])
    g.beginPath()
    g.ellipse(x, y, (rx / 360) * W, (ry / 180) * H, turn * DEG, 0, Math.PI * 2)
    g.fillStyle = color
    g.fill()
  }
  // Antarctica: land all the way round the bottom (its raised ice is 3D on top, globe.ts), with the peninsula reaching
  // up toward South America.
  const ant: Pt[] = [[180, -90], [-180, -90]]
  for (let lon = -180; lon <= 180; lon += 10) ant.push([lon, -70 + 2.5 * Math.sin(lon * 3 * DEG) + 1.5 * Math.cos(lon * 5 * DEG) + (Math.abs(lon + 62) < 14 ? 6 * (1 - Math.abs(lon + 62) / 14) : 0)])
  g.beginPath()
  g.moveTo(0, H)
  for (const p of ant.slice(2)) g.lineTo(...px(p))
  g.lineTo(W, H)
  g.closePath()
  g.fillStyle = C.ice
  g.fill()

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
