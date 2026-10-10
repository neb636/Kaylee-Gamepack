// Pepa's Penguin Cliff lays out on a logical stage that scales to fit (AGENTS.md "Screens"): one for wide screens and
// one for tall ones (tall shows more of the sea under the surface, so the deep fish are deeper). Everything is in stage
// units. The cliff picture's features (its flat top, the burrow, the burrow's front lip) are measured shares of the
// trimmed cliff-hd.webp, so the penguins stand exactly on the painted rock.

/** Shares of the trimmed cliff picture (688 x 1024). */
const CLIFF = { aspect: 688 / 1024, ledge: 0.012, caveL: 0.24, caveR: 0.74, caveTop: 0.16, floor: 0.395, lipX: 0.8, topRight: 0.93 }
/** Where the sea starts in each background painting (share of its height), and its size. */
const BG = { wide: { horizon: 587, w: 1536, h: 1024 }, tall: { horizon: 675, w: 1024, h: 1536 } }

export interface Box {
  x: number
  y: number
  w: number
}

export interface PenguinStage {
  tall: boolean
  w: number
  h: number
  /** The sea surface. */
  sea: number
  bg: { x: number; y: number; w: number; h: number }
  cliff: { x: number; y: number; w: number; h: number }
  /** The top of the cliff, where the penguins queue. */
  ledge: number
  /** The launch rock (feet of the penguin in front). */
  anchor: { x: number; y: number }
  /** Queue spots along the ledge (x), front first. */
  slots: number[]
  /** Burrow: its floor, its inside span, the lip where divers hop out of the sea, the fish spots. */
  burrow: { floor: number; left: number; right: number; top: number; lip: { x: number; y: number }; fish: { x: number; y: number }[] }
  pepa: { x: number; h: number }
  chicks: { x: number; h: number }[]
  egg: { x: number; w: number }
  /** Where swimmers climb out of the sea at the foot of the cliff. */
  shore: number
  rock: Box & { top: number }
  lobo: { x: number; h: number }
  sparkle: { x: number; h: number }
  tern: { x: number; h: number }
  diverH: number
  /** Fish school bands: near and shallow, far and deep. */
  near: { x: [number, number]; y: [number, number] }
  far: { x: [number, number]; y: [number, number] }
  /** Launch speed range, gravity. */
  vmax: number
  gravity: number
  pullR: number
  kelp: Box[]
  crab: { x: number; w: number }
  jelly: { x: number; y: number; w: number }
  boat: { x: [number, number]; w: number }
  candelabra: { x: number; y: number; r: number }
  sun: { x: number; y: number; r: number }
}

function make(tall: boolean, w: number, h: number, sea: number, cliffTop: number, cliffH: number, cliffX: number, rest: Omit<PenguinStage, 'tall' | 'w' | 'h' | 'sea' | 'bg' | 'cliff' | 'ledge' | 'burrow' | 'pepa' | 'chicks' | 'egg' | 'shore'>): PenguinStage {
  const b = tall ? BG.tall : BG.wide
  const k = Math.max(w / b.w, sea / b.horizon)
  const bgW = b.w * k
  const cw = cliffH * CLIFF.aspect
  const at = (fx: number) => cliffX + fx * cw
  const floor = cliffTop + CLIFF.floor * cliffH
  const left = at(CLIFF.caveL)
  const right = at(CLIFF.caveR)
  const span = right - left
  const chickH = tall ? 88 : 94
  return {
    tall,
    w,
    h,
    sea,
    bg: { x: (w - bgW) / 2, y: sea - b.horizon * k, w: bgW, h: b.h * k },
    cliff: { x: cliffX, y: cliffTop, w: cw, h: cliffH },
    ledge: cliffTop + CLIFF.ledge * cliffH + 4,
    burrow: {
      floor,
      left,
      right,
      top: cliffTop + CLIFF.caveTop * cliffH,
      lip: { x: at(CLIFF.lipX), y: floor + 6 },
      // Pepa's order: one fish-shaped spot per fish, on the rock face above the burrow.
      fish: [0, 1, 2].map((i) => ({ x: left + span * (0.14 + i * 0.36), y: cliffTop + CLIFF.caveTop * cliffH - (tall ? 46 : 50) })),
    },
    pepa: { x: left + span * 0.2, h: tall ? 128 : 136 },
    chicks: [0.5, 0.72, 0.94].map((f) => ({ x: left + span * f, h: chickH })),
    egg: { x: left + span * 0.94, w: 52 },
    shore: at(0.9) + 40,
    ...rest,
  }
}

const WIDE = make(false, 1600, 1000, 650, 280, 820, -62, {
  anchor: { x: 418, y: 0 },
  slots: [418, 300, 182],
  rock: { x: 1110, y: 0, w: 400, top: 0 },
  lobo: { x: 1250, h: 150 },
  sparkle: { x: 1435, h: 210 },
  tern: { x: 52, h: 70 },
  diverH: 150,
  near: { x: [620, 860], y: [740, 820] },
  far: { x: [980, 1320], y: [850, 930] },
  vmax: 1250,
  gravity: 2000,
  pullR: 200,
  kelp: [
    { x: 740, y: 1010, w: 120 },
    { x: 1540, y: 1010, w: 110 },
  ],
  crab: { x: 1150, w: 100 },
  jelly: { x: 1460, y: 820, w: 90 },
  boat: { x: [620, 1000], w: 150 },
  candelabra: { x: 1295, y: 520, r: 90 },
  sun: { x: 1361, y: 172, r: 70 },
})

const TALL = make(true, 1000, 1400, 665, 325, 740, -52, {
  anchor: { x: 385, y: 0 },
  slots: [385, 278, 171],
  rock: { x: 655, y: 0, w: 310, top: 0 },
  lobo: { x: 758, h: 118 },
  sparkle: { x: 893, h: 170 },
  tern: { x: 46, h: 64 },
  diverH: 140,
  near: { x: [520, 640], y: [790, 920] },
  far: { x: [500, 660], y: [1080, 1250] },
  vmax: 860,
  gravity: 2000,
  pullR: 190,
  kelp: [
    { x: 560, y: 1410, w: 120 },
    { x: 950, y: 1410, w: 110 },
  ],
  crab: { x: 760, w: 96 },
  jelly: { x: 880, y: 940, w: 84 },
  boat: { x: [470, 650], w: 130 },
  candelabra: { x: 760, y: 517, r: 70 },
  sun: { x: 870, y: 141, r: 64 },
})

// The rock in the bay sits low in the water; the anchor sits on the ledge.
for (const S of [WIDE, TALL]) {
  S.anchor.y = S.ledge
  const rh = S.rock.w * (164 / 512)
  S.rock.y = S.sea + rh * 0.42 - rh
  S.rock.top = S.rock.y + rh * 0.2
}

export const pickLayout = (W: number, H: number) => (W >= H ? WIDE : TALL)
