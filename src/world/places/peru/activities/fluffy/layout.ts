// Luna's Fluffy Day lays out on a logical stage that scales to fit (AGENTS.md "Screens"): one for wide screens and one
// for tall ones, both drawn on the same meadow painting. Everything below is in stage units. The extra edge around the
// stage is filled with the painting's own flat sky and meadow colors.
import { VIEW } from '../../puppets/fleece'

export type Who = 'luna' | 'paco' | 'abuela'
export const FAMILY: Who[] = ['luna', 'paco', 'abuela']

/** Where an alpaca stands: its box's left edge, the ground under its feet, and its scale (viewBox units to stage). */
export interface Spot {
  left: number
  feet: number
  k: number
}

export interface StageLayout {
  tall: boolean
  w: number
  h: number
  /** Where the meadow starts in the painting (the alpacas stand in front of it). */
  ground: number
  solo: Spot
  family: Record<Who, Spot>
  offstage: Record<Who, Spot>
  tray: { x: number; y: number; w: number; h: number }
  basket: { cx: number; bottom: number; w: number }
  sparkle: { cx: number; bottom: number; h: number }
  pond: { cx: number; y: number; w: number }
  cactus: { cx: number; bottom: number; h: number }
  wall: { cx: number; bottom: number; w: number }
  post: { cx: number; bottom: number; h: number }
  clouds: { x: number; y: number; w: number }[]
  peak: { x: number; y: number }
  humming: { x: number; y: number }
  tool: number
}

const WIDE: StageLayout = {
  tall: false,
  w: 1500,
  h: 1000,
  ground: 657,
  solo: { left: 430, feet: 900, k: 1 },
  family: { luna: { left: 10, feet: 720, k: 0.55 }, paco: { left: 295, feet: 905, k: 0.78 }, abuela: { left: 660, feet: 925, k: 0.92 } },
  offstage: { luna: { left: -900, feet: 720, k: 0.55 }, paco: { left: 2500, feet: 905, k: 0.78 }, abuela: { left: 2850, feet: 925, k: 0.92 } },
  tray: { x: 1275, y: 290, w: 200, h: 470 },
  basket: { cx: 300, bottom: 975, w: 210 },
  sparkle: { cx: 110, bottom: 985, h: 250 },
  pond: { cx: 700, y: 950, w: 460 },
  cactus: { cx: 1380, bottom: 990, h: 210 },
  wall: { cx: 1110, bottom: 705, w: 230 },
  post: { cx: 1245, bottom: 690, h: 200 },
  clouds: [
    { x: 230, y: 235, w: 150 },
    { x: 1170, y: 215, w: 180 },
  ],
  peak: { x: 257, y: 302 },
  humming: { x: 1010, y: 320 },
  tool: 210,
}

const TALL: StageLayout = {
  tall: true,
  w: 1000,
  h: 1500,
  ground: 1062,
  solo: { left: 22, feet: 1262, k: 1.5 },
  family: { luna: { left: 330, feet: 1010, k: 0.7 }, paco: { left: -45, feet: 1190, k: 0.95 }, abuela: { left: 430, feet: 1215, k: 1.05 } },
  offstage: { luna: { left: -900, feet: 1085, k: 0.6 }, paco: { left: 1800, feet: 1250, k: 0.75 }, abuela: { left: 2150, feet: 1270, k: 0.85 } },
  tray: { x: 560, y: 1300, w: 420, h: 175 },
  basket: { cx: 410, bottom: 1480, w: 220 },
  sparkle: { cx: 125, bottom: 1490, h: 235 },
  pond: { cx: 400, y: 1285, w: 460 },
  cactus: { cx: 905, bottom: 1292, h: 190 },
  wall: { cx: 760, bottom: 1080, w: 230 },
  post: { cx: 70, bottom: 1062, h: 200 },
  clouds: [
    { x: 200, y: 330, w: 160 },
    { x: 800, y: 300, w: 190 },
  ],
  peak: { x: 157, y: 690 },
  humming: { x: 150, y: 560 },
  tool: 230,
}

export const pickLayout = (W: number, H: number) => (W >= H ? WIDE : TALL)

/** A point on an alpaca (viewBox units) in stage units. */
export const onStage = (spot: Spot, x: number, y: number) => ({ x: spot.left + x * spot.k, y: spot.feet - (VIEW.feetY - y) * spot.k })
/** The alpaca's box height in stage units. */
export const boxHeight = (spot: Spot) => VIEW.h * spot.k
/** The box's top edge. */
export const boxTop = (spot: Spot) => spot.feet - VIEW.feetY * spot.k
