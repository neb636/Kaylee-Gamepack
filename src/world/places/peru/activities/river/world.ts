// Swim with Rosa: where everything is in the flooded forest. World units; the waterline is y = 0 (up is negative), the
// riverbed is y = BED, and the forest runs left to right for WORLD_W units. Wide screens show 1000 units of height and
// tall ones 1400 (more canopy and sky above, more sand below); the width is whatever fits and the camera follows Rosa.
import { knobs } from '../../../../kit/knobs'

export const BED = 440
export const WORLD_W = 10400
export const START_X = 520
/** Rosa's length, nose to tail. */
export const ROSA_LEN = 250

export interface View {
  tall: boolean
  /** Screen pixels per world unit. */
  scale: number
  /** World y at the top of the screen, and how many units fit across and down. */
  top: number
  w: number
  h: number
}
export function viewFor(W: number, H: number): View {
  const tall = H > W * 1.05
  const h = tall ? 1400 : 1000
  const scale = H / h
  return { tall, scale, top: tall ? -800 : -520, w: W / scale, h }
}

/** How swimming and leaping feel (the feel lab, ?feel=1). */
export const SWIM = knobs('riverSwim', 'Swimming', 'src/world/places/peru/activities/river/world.ts', {
  speed: { value: 600, min: 300, max: 1400, step: 10, label: 'Top speed', unit: 'u/s', note: 'how fast she chases a far finger', main: true },
  turn: { value: 5.5, min: 1.5, max: 14, step: 0.1, label: 'Quickness', unit: '1/s', note: 'how soon she is up to speed and round a turn', main: true },
  arrive: { value: 150, min: 40, max: 400, step: 5, label: 'Slow-down distance', unit: 'u', note: 'she eases off this close to the finger' },
  gravity: { value: 1100, min: 500, max: 3200, step: 20, label: 'Gravity in the air', unit: 'u/s²', note: 'lower: longer, floatier leaps', main: true },
  boost: { value: 1.15, min: 0.8, max: 1.6, step: 0.01, label: 'Leap boost', note: 'her speed is multiplied by this as she leaves the water', main: true },
  brake: { value: 0.5, min: 0.2, max: 1, step: 0.01, label: 'Splash brake', note: 'how much of her fall she keeps as she lands' },
})

/** The otters' race (how hard it is to win). */
export const RACE = knobs('riverRace', 'The otters', 'src/world/places/peru/activities/river/world.ts', {
  pace: { value: 440, min: 250, max: 800, step: 10, label: 'Their speed', unit: 'u/s', note: "Rosa's top speed is the Swimming knob", main: true },
  ease: { value: 60, min: 0, max: 200, step: 5, label: 'Slower after a loss', unit: 'u/s', main: true },
  ahead: { value: 0.7, min: 0.3, max: 1, step: 0.02, label: 'When they lead', note: 'their speed is multiplied by this while they are well ahead' },
  behind: { value: 1.3, min: 1, max: 1.6, step: 0.02, label: 'When she leads', note: 'and by this while she is well ahead' },
}, { sections: ['race', 'rainbow'] })

export interface TreeSpec {
  x: number
  /** Trunk width. */
  w: number
  /** A branch at this height reaching `len` to one side (negative: to the left). */
  branch?: { y: number; len: number }
}
/** The big trunks standing in the water (their crowns are out of sight above). */
export const TREES: TreeSpec[] = [
  { x: 180, w: 120, branch: { y: -236, len: 300 } },
  { x: 860, w: 96 },
  { x: 1560, w: 110, branch: { y: -290, len: 420 } },
  { x: 2320, w: 92 },
  { x: 2740, w: 126, branch: { y: -275, len: 800 } },
  { x: 3760, w: 100, branch: { y: -230, len: 240 } },
  { x: 4480, w: 116 },
  { x: 5240, w: 96, branch: { y: -250, len: 300 } },
  { x: 5900, w: 120 },
  { x: 6620, w: 100, branch: { y: -260, len: -280 } },
  { x: 7300, w: 110 },
  { x: 7940, w: 124, branch: { y: -240, len: 280 } },
  { x: 8620, w: 98 },
  { x: 9280, w: 116, branch: { y: -250, len: -260 } },
  { x: 10240, w: 126, branch: { y: -240, len: -300 } },
]

/** The capybaras float at the surface; the baby rides Rosa. */
export const CAPY = { x: 1120, baby: 1250 }
/** The sloth hangs from a liana loop under the branch of the third tree, her toes just over the water. */
export const SLOTH = { x: 1860, top: -214, branch: -290 }
/** The monkeys sit on the long branch; the fruit hangs under it on vines, each one higher than the last. */
export const MONKEYS = [{ x: 2880 }, { x: 3300 }]
export const BRANCH_Y = -275
export const FRUITS = [
  { x: 3000, y: -112, color: 'orange' },
  { x: 3190, y: -164, color: 'grape' },
  { x: 3420, y: -214, color: 'pink' },
] as const
export const FRUIT_COLORS = { orange: ['#ff9c57', '#e57a35', '#ffc595'], grape: ['#b9a6f5', '#937ee0', '#ddd2ff'], pink: ['#ff8fb8', '#e7699c', '#ffc4da'] } as const
/** How far a missed fruit comes down each time the monkey helps (twice at most). */
export const FRUIT_HELP = 36

/** The race: the otters wait by the start, the rainbow stands at the finish, and logs float on the way. */
export const RACE_START = 4300
export const FINISH = 9800
export const LOGS = [5020, 6020, 7000, 8040, 9000]
export const LOG_W = 250

/** Small life: who lives where (the things she can poke). */
export const TOUCAN = { x: 400, y: -236 }
export const MACAWS = [{ x: 3900, y: -230 }, { x: 5440, y: -250 }, { x: 8120, y: -240 }]
export const FROGS = [{ x: 700 }, { x: 2200 }, { x: 4720 }, { x: 6400 }, { x: 8400 }]
export const SCHOOLS = [{ x: 760, y: 290 }, { x: 2300, y: 240 }, { x: 3180, y: 310 }, { x: 4700, y: 270 }, { x: 6300, y: 300 }, { x: 7700, y: 260 }, { x: 9300, y: 300 }]
export const BUTTERFLIES = [{ x: 980, y: -150 }, { x: 2520, y: -190 }, { x: 4100, y: -160 }, { x: 6100, y: -180 }, { x: 7600, y: -170 }, { x: 9500, y: -160 }]
export const WEEDS = [340, 610, 1010, 1380, 1730, 2110, 2480, 2960, 3330, 3820, 4180, 4620, 5080, 5420, 5860, 6200, 6640, 7100, 7480, 7860, 8260, 8700, 9100, 9480, 9900, 10180]
/** Lily pads on the surface (scenery; the ones by the finish all flower). */
export const LILIES = [640, 1420, 2560, 3920, 5560, 6700, 7560, 8640, 9700, 9860, 9960]
