// Tika's Mountain Terraces lays out on a logical stage that scales to fit (AGENTS.md "Screens"): one for wide screens
// and one for tall ones. Stage units throughout.
//
// The mountainside is a tall *world* (straight-on side view, terraces stacked like a staircase seen from the front)
// that the camera climbs, one wall at a time. In front of it, a grassy *foreground* ledge at the bottom of the stage
// holds the stone pile, Sparkle and the llama friends waiting their turn. Far behind, the Machu Picchu painting is only
// seen above the mountainside (and hidden in clouds until the end).

export interface StageLayout {
  tall: boolean
  w: number
  h: number
  /** Wall widths, bottom to top. */
  wallW: number[]
  wallH: number
  ledgeH: number
  /** Room below the lowest wall (the valley floor) and above the summit (sky). */
  ground: number
  sky: number
  /** Where the current wall's bottom sits on screen while she builds it. */
  wallAt: number
  /** Where the summit's top sits on screen at the end. */
  summitAt: number
  /** The foreground ledge: its top edge on screen and the pile area inside it. */
  front: number
  pile: { x0: number; x1: number; y0: number; y1: number; rows: number }
  sparkle: { cx: number; bottom: number; h: number }
  /** Llama friends waiting on the foreground: centre x of the group and their feet. */
  friends: { x: number; feet: number; gap: number }
  /** Tika's height, and the friends' (stage units). */
  tikaH: number
  llamaH: number
  /** The painting: where the city's middle sits on screen in the summit view. */
  cityAt: number
  /** The painting's height on the stage (it is cover-fitted to the stage width). */
  paintH: number
}

const WIDE: StageLayout = {
  tall: false,
  w: 1500,
  h: 1000,
  wallW: [1260, 1060, 880, 700],
  wallH: 250,
  ledgeH: 110,
  ground: 340,
  sky: 1000,
  wallAt: 690,
  summitAt: 760,
  front: 800,
  pile: { x0: 250, x1: 1150, y0: 760, y1: 990, rows: 1 },
  sparkle: { cx: 125, bottom: 995, h: 215 },
  friends: { x: 1320, feet: 992, gap: 110 },
  tikaH: 250,
  llamaH: 205,
  cityAt: 470,
  paintH: 1000,
}

const TALL: StageLayout = {
  tall: true,
  w: 1000,
  h: 1400,
  wallW: [960, 860, 760, 660],
  wallH: 230,
  ledgeH: 100,
  ground: 340,
  sky: 1300,
  wallAt: 960,
  summitAt: 1030,
  front: 1070,
  pile: { x0: 30, x1: 970, y0: 1060, y1: 1232, rows: 1 },
  sparkle: { cx: 100, bottom: 1396, h: 145 },
  friends: { x: 800, feet: 1396, gap: 90 },
  tikaH: 230,
  llamaH: 132,
  cityAt: 760,
  paintH: 1500,
}

export const pickLayout = (W: number, H: number) => (W >= H ? WIDE : TALL)

/** Geometry of the mountainside world (stage units, y down, 0 at the top of the sky). */
export function world(S: StageLayout) {
  const tier = S.wallH + S.ledgeH
  const height = S.sky + S.wallW.length * tier + S.ground
  /** Bottom of the lowest wall (the valley floor). */
  const G = height - S.ground
  const cx = S.w / 2
  const wallBottom = (k: number) => G - k * tier
  const wallTop = (k: number) => wallBottom(k) - S.wallH
  const wallLeft = (k: number) => cx - S.wallW[k] / 2
  /** Ledge k: the grass terrace on top of wall k. Its ground line (where feet stand) is near its front edge. */
  const ledgeFeet = (k: number) => (k < 0 ? G + 70 : wallTop(k) - S.ledgeH * 0.22)
  const summit = wallTop(S.wallW.length - 1) - S.ledgeH
  /** Camera (the world's y at the top of the stage) while building wall k, and in the summit view. */
  const camFor = (k: number) => wallBottom(k) - S.wallAt
  const camSummit = summit - S.summitAt + S.ledgeH
  return { tier, height, G, cx, wallBottom, wallTop, wallLeft, ledgeFeet, summit, camFor, camSummit }
}
export type World = ReturnType<typeof world>
