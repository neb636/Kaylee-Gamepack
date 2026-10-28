// Each stop's station, so she can tell them apart from the train: Quebec City's castle hotel with its steep green copper
// roofs and turrets (in the winter snow), Mont-Sainte-Anne's log ski lodge under red and orange fall maples, Ottawa's
// station with the green-roofed clock tower and the frozen canal in front (where her hockey team skates), Banff's stone
// and log mountain station beside a little turquoise Moraine Lake and its rock pile, and Vancouver's harbour: the white
// sails on the waterfront and the glass towers. Station-local: +x is away from the track (the track runs along z at
// x = -TRACK_X), the root at the land's top. Every part is a code-built toy in the toon look.
import type { BufferGeometry } from 'three'
import type { Region } from './canada'
import { P } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'
import { leaf, RED } from './train'

/** How far the station's root stands from the middle of the track. */
export const TRACK_X = 0.58
/** Where Ottawa's frozen canal is (station-local): its middle line x, and its two ends along z. */
export const CANAL = { x: -1.14, z0: -0.75, z1: 0.75, w: 0.36 }

const COPPER = '#7FC8A9'
const SNOW = '#FFFFFF'

export interface StationParts {
  parts: BufferGeometry[]
  /** The lamp on its post (it lights up when the train stands here). */
  lamp: [number, number, number]
  /** Above the station: where the bubbles pop up from (station-local height). */
  top: number
}

/** The platform, the lamp post and the bench every station has. */
function platform(color = '#E8DCCB'): BufferGeometry[] {
  return [
    P.rbox(0.36, 0.05, 0.92, 0.02, color, { at: [-0.17, 0.025, 0] }),
    P.box(0.03, 0.012, 0.92, '#FFFFFF', { at: [-0.33, 0.051, 0] }),
    P.cyl(0.012, 0.014, 0.42, '#5A5470', { at: [-0.17, 0.23, 0.4] }, 6),
    P.cyl(0.03, 0.02, 0.025, '#5A5470', { at: [-0.17, 0.44, 0.4] }, 8),
    P.rbox(0.05, 0.03, 0.16, 0.01, '#B98A6A', { at: [-0.06, 0.09, -0.22] }),
    P.rbox(0.015, 0.06, 0.16, 0.006, '#B98A6A', { at: [-0.04, 0.12, -0.22] }),
  ]
}

const spruce = (x: number, z: number, h: number, snow: boolean): BufferGeometry[] => [
  P.cyl(0.015, 0.02, 0.06, '#9A6B4F', { at: [x, 0.03, z] }, 6),
  P.cone(0.08 * h, 0.3 * h, '#4FA474', { at: [x, 0.05 + 0.15 * h, z] }, 8),
  ...(snow ? [P.cone(0.045 * h, 0.12 * h, SNOW, { at: [x, 0.05 + 0.25 * h, z] }, 8)] : []),
]
const mapleTree = (x: number, z: number, color: string, s = 1): BufferGeometry[] => [
  P.cyl(0.018 * s, 0.024 * s, 0.14 * s, '#9A6B4F', { at: [x, 0.07 * s, z] }, 6),
  P.sphere(0.1 * s, color, { at: [x, 0.2 * s, z] }, 10),
  P.sphere(0.07 * s, color, { at: [x + 0.06 * s, 0.25 * s, z - 0.03 * s] }, 8),
]

function quebec(): StationParts {
  const wall = '#D98C6B'
  const windows: BufferGeometry[] = []
  for (const y of [0.08, 0.18]) for (const z of [-0.2, -0.08, 0.08, 0.2]) windows.push(P.rbox(0.012, 0.05, 0.04, 0.008, PAL.cream, { at: [0.033, y, z] }))
  return {
    parts: [
      // Winter: a snowy patch all round (the track's sleepers show through on top).
      P.cyl(0.9, 0.9, 0.012, SNOW, { at: [-0.25, 0.006, 0] }, 28),
      ...platform(),
      // The castle hotel: the long wing with its steep copper roof, a turret at each corner, the tall tower in the middle.
      P.rbox(0.3, 0.26, 0.56, 0.02, wall, { at: [0.19, 0.13, 0] }),
      P.prism([[-0.17, 0], [0.17, 0], [0, 0.2]], 0.56, COPPER, { at: [0.19, 0.26, 0] }),
      P.prism([[-0.06, 0], [0.06, 0], [0, 0.07]], 0.5, SNOW, { at: [0.19, 0.4, 0] }),
      ...[0.05, 0.33].flatMap((x) =>
        [-0.29, 0.29].flatMap((z) => [P.cyl(0.055, 0.055, 0.34, wall, { at: [x, 0.17, z] }, 12), P.cone(0.075, 0.2, COPPER, { at: [x, 0.44, z] }, 12), P.cone(0.03, 0.06, SNOW, { at: [x, 0.52, z] }, 10)]),
      ),
      P.rbox(0.16, 0.5, 0.16, 0.02, wall, { at: [0.2, 0.25, 0] }),
      P.cone(0.135, 0.32, COPPER, { at: [0.2, 0.66, 0], rot: [0, Math.PI / 4, 0] }, 4),
      P.cyl(0.006, 0.006, 0.1, '#5A5470', { at: [0.2, 0.86, 0] }, 5),
      P.rbox(0.012, 0.08, 0.05, 0.008, PAL.cream, { at: [0.118, 0.38, 0] }),
      ...windows,
      // A red door, and two snowy spruces.
      P.rbox(0.012, 0.09, 0.07, 0.01, RED, { at: [0.033, 0.045, 0.0] }),
      ...spruce(0.5, -0.45, 0.9, true),
      ...spruce(0.55, 0.38, 1.1, true),
      ...spruce(0.32, 0.6, 0.7, true),
    ],
    lamp: [-0.17, 0.47, 0.4],
    top: 0.9,
  }
}

function msa(): StationParts {
  const roof = '#C7523F'
  return {
    parts: [
      ...platform('#E6D2B8'),
      // The log ski lodge: log walls (dark stripes), a steep A-frame roof whose gable faces the track, a big window.
      P.rbox(0.28, 0.2, 0.42, 0.02, '#C98A55', { at: [0.18, 0.1, 0] }),
      ...[0.05, 0.1, 0.15].map((y) => P.box(0.284, 0.01, 0.424, '#A0683F', { at: [0.18, y, 0] })),
      P.prism([[-0.25, 0], [0.25, 0], [0, 0.32]], 0.36, roof, { at: [0.18, 0.2, 0], rot: [0, Math.PI / 2, 0] }),
      P.prism([[-0.2, 0], [0.2, 0], [0, 0.25]], 0.02, '#E6B07A', { at: [0.0, 0.2, 0], rot: [0, Math.PI / 2, 0] }),
      P.prism([[-0.09, 0], [0.09, 0], [0, 0.12]], 0.02, PAL.sky, { at: [-0.012, 0.23, 0], rot: [0, Math.PI / 2, 0] }),
      P.rbox(0.012, 0.11, 0.08, 0.01, '#8E4E3A', { at: [0.035, 0.055, 0.12] }),
      P.rbox(0.07, 0.2, 0.07, 0.01, '#A9A3B8', { at: [0.3, 0.38, 0.13] }),
      // Skis leaning by the door.
      P.rbox(0.012, 0.2, 0.025, 0.006, PAL.hotpink, { at: [0.02, 0.1, -0.15], rot: [0, 0, -0.18] }),
      P.rbox(0.012, 0.2, 0.025, 0.006, PAL.sky, { at: [0.02, 0.1, -0.11], rot: [0, 0, -0.18] }),
      // Fall: red, orange and gold maples round the lodge, and leaves on the ground.
      ...mapleTree(0.48, -0.32, '#F2735A', 1.1),
      ...mapleTree(0.5, 0.3, '#F9A65A', 1.2),
      ...mapleTree(0.25, 0.55, '#FFC83D', 0.9),
      ...mapleTree(0.2, -0.58, '#E8505B', 0.9),
      P.cyl(0.18, 0.18, 0.008, '#F2B36A', { at: [0.5, 0.004, -0.05], scale: [1, 1, 1.6] }, 16),
    ],
    lamp: [-0.17, 0.47, 0.4],
    top: 0.75,
  }
}

function ottawa(): StationParts {
  const stone = '#EADFC8'
  return {
    parts: [
      // Winter snow on both sides of the track, round the canal.
      P.cyl(0.34, 0.34, 0.012, SNOW, { at: [-1.08, 0.006, 0], scale: [1, 1, 2.6] }, 28),
      P.cyl(0.3, 0.3, 0.012, SNOW, { at: [-0.66, 0.006, 0], scale: [1, 1, 2.2] }, 24),
      P.cyl(0.55, 0.55, 0.012, SNOW, { at: [0.1, 0.006, 0] }, 24),
      ...platform(),
      // The station: cream stone, a green copper roof.
      P.rbox(0.28, 0.22, 0.48, 0.02, stone, { at: [0.18, 0.11, -0.06] }),
      P.prism([[-0.16, 0], [0.16, 0], [0, 0.14]], 0.5, COPPER, { at: [0.18, 0.22, -0.06] }),
      ...[-0.22, -0.1, 0.02, 0.1].map((z) => P.rbox(0.012, 0.09, 0.05, 0.01, '#B9A6F5', { at: [0.035, 0.11, z] })),
      // The clock tower beside it (like the Peace Tower), with a little Canadian flag on top.
      P.rbox(0.13, 0.64, 0.13, 0.02, stone, { at: [0.2, 0.32, 0.3] }),
      P.cone(0.1, 0.24, COPPER, { at: [0.2, 0.76, 0.3], rot: [0, Math.PI / 4, 0] }, 4),
      P.cyl(0.045, 0.045, 0.01, '#FFFFFF', { at: [0.13, 0.52, 0.3], rot: [0, 0, Math.PI / 2] }, 16),
      P.box(0.006, 0.03, 0.006, PAL.ink, { at: [0.124, 0.53, 0.3] }),
      P.box(0.006, 0.006, 0.022, PAL.ink, { at: [0.124, 0.52, 0.308] }),
      P.cyl(0.004, 0.004, 0.16, '#5A5470', { at: [0.2, 0.95, 0.3] }, 5),
      P.box(0.004, 0.06, 0.03, RED, { at: [0.2, 0.99, 0.33] }),
      P.box(0.004, 0.06, 0.06, '#FFFFFF', { at: [0.2, 0.99, 0.375] }),
      P.box(0.004, 0.06, 0.03, RED, { at: [0.2, 0.99, 0.42] }),
      leaf(0.04, RED, [0.203, 0.988, 0.375], [0, Math.PI / 2, 0], 0.004),
      // The frozen canal in front of the track: pale blue ice between stone banks.
      P.rbox(CANAL.w, 0.02, CANAL.z1 - CANAL.z0, 0.01, '#D3EEFF', { at: [CANAL.x, 0.016, 0] }),
      P.rbox(0.03, 0.04, CANAL.z1 - CANAL.z0 + 0.04, 0.01, '#C9C3D6', { at: [CANAL.x - CANAL.w / 2 - 0.015, 0.02, 0] }),
      P.rbox(0.03, 0.04, CANAL.z1 - CANAL.z0 + 0.04, 0.01, '#C9C3D6', { at: [CANAL.x + CANAL.w / 2 + 0.015, 0.02, 0] }),
      // Two little hockey nets at the ends.
      ...[CANAL.z0 + 0.08, CANAL.z1 - 0.08].flatMap((z) => [P.rbox(0.12, 0.07, 0.03, 0.01, RED, { at: [CANAL.x, 0.06, z + Math.sign(z) * 0.02] }), P.box(0.1, 0.05, 0.02, '#FFFFFF', { at: [CANAL.x, 0.055, z] })]),
      ...spruce(0.5, -0.5, 1, true),
      ...spruce(0.48, 0.62, 0.8, true),
    ],
    lamp: [-0.17, 0.47, -0.4],
    top: 0.9,
  }
}

function banff(): StationParts {
  return {
    parts: [
      ...platform('#DCD6E6'),
      // Stone below, logs above, a steep dark green roof and a stone chimney.
      P.rbox(0.3, 0.1, 0.46, 0.02, '#A9A3B8', { at: [0.18, 0.05, 0] }),
      ...[-0.15, 0, 0.15].map((z) => P.sphere(0.03, '#C9C3D6', { at: [0.033, 0.05, z], scale: [0.4, 1, 1.4] }, 8)),
      P.rbox(0.28, 0.15, 0.44, 0.02, '#B07A4F', { at: [0.18, 0.17, 0] }),
      ...[0.13, 0.18, 0.23].map((y) => P.box(0.284, 0.008, 0.444, '#8E5E3C', { at: [0.18, y, 0] })),
      P.prism([[-0.2, 0], [0.2, 0], [0, 0.26]], 0.5, '#4F8A6E', { at: [0.18, 0.245, 0] }),
      P.rbox(0.012, 0.07, 0.05, 0.01, PAL.butter, { at: [0.035, 0.17, -0.1] }),
      P.rbox(0.012, 0.07, 0.05, 0.01, PAL.butter, { at: [0.035, 0.17, 0.1] }),
      P.rbox(0.07, 0.24, 0.07, 0.01, '#A9A3B8', { at: [0.28, 0.42, -0.16] }),
      // Moraine Lake: bright turquoise, with the rock pile at its end and a little red canoe.
      P.cyl(0.3, 0.3, 0.014, '#3FD0D4', { at: [0.66, 0.008, 0.05], scale: [0.8, 1, 1.25] }, 24),
      ...[[0.42, -0.25, 0.07], [0.5, -0.3, 0.06], [0.46, -0.18, 0.05], [0.56, -0.24, 0.045], [0.47, -0.25, 0.04]].map(([x, z, r], i) =>
        P.sphere(r, i % 2 ? '#B5ACD6' : '#A9A3B8', { at: [x, r * 0.8 + (i === 4 ? 0.06 : 0), z] }, 8),
      ),
      P.rbox(0.035, 0.025, 0.14, 0.012, RED, { at: [0.7, 0.025, 0.12], rot: [0, 0.5, 0] }),
      ...spruce(0.42, 0.42, 1.1, false),
      ...spruce(0.9, 0.3, 1.2, false),
      ...spruce(0.86, -0.2, 0.9, false),
    ],
    lamp: [-0.17, 0.47, 0.4],
    top: 0.8,
  }
}

function bc(): StationParts {
  const glass = '#A8DCFF'
  const tower = (x: number, z: number, h: number): BufferGeometry[] => [
    P.rbox(0.13, h, 0.13, 0.02, glass, { at: [x, h / 2, z] }),
    ...Array.from({ length: Math.floor(h / 0.1) }, (_, i) => P.box(0.134, 0.012, 0.134, '#FFFFFF', { at: [x, 0.08 + i * 0.1, z] })),
    P.rbox(0.1, 0.03, 0.1, 0.01, '#FFFFFF', { at: [x, h + 0.01, z] }),
  ]
  return {
    parts: [
      ...platform(),
      // The waterfront station: cream with white columns and a flat roof.
      P.rbox(0.26, 0.22, 0.42, 0.02, '#F1E3CF', { at: [0.18, 0.11, -0.08] }),
      P.rbox(0.3, 0.035, 0.46, 0.015, '#C77B5A', { at: [0.18, 0.235, -0.08] }),
      ...[-0.24, -0.14, -0.02, 0.08].map((z) => P.cyl(0.014, 0.014, 0.2, '#FFFFFF', { at: [0.035, 0.1, z] }, 8)),
      // The white sails on the harbour (like Canada Place).
      P.rbox(0.2, 0.06, 0.3, 0.02, '#E8DCCB', { at: [0.2, 0.03, 0.34] }),
      ...[0.24, 0.34, 0.44].map((z, i) => P.cone(0.07, 0.2 + (i % 2) * 0.04, '#FFFFFF', { at: [0.2, 0.16 + (i % 2) * 0.02, z] }, 10)),
      // Glass towers behind.
      ...tower(0.5, -0.3, 0.62),
      ...tower(0.46, 0.05, 0.82),
      ...tower(0.66, -0.05, 0.5),
      ...tower(0.6, 0.32, 0.66),
      // Tall green rainforest trees.
      ...spruce(0.35, -0.55, 1.3, false),
      ...spruce(0.8, 0.5, 1.4, false),
    ],
    lamp: [-0.17, 0.47, -0.4],
    top: 1.0,
  }
}

export function stationParts(id: Region): StationParts {
  if (id === 'quebec') return quebec()
  if (id === 'msa') return msa()
  if (id === 'ottawa') return ottawa()
  if (id === 'banff') return banff()
  return bc()
}
