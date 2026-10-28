// Campfire Night's two logical stages (wide 1600 x 1000, tall 1000 x 1500) and the night animals' pictures. One camera: a
// straight-on, eye-level side view of the campsite at the foot of Mont-Sainte-Anne, like a theater stage at night (the
// sky with the mountain, the dark row of spruces, the clearing with the fire in the middle, the tent, the lake). Plain
// data, no React.

export type Pt = [number, number]

/** The night animals she meets, in the order Maple's book counts them (`?found=N` = the first N are found). */
export const ROSTER = ['owl', 'raccoon', 'deer', 'frog', 'beaver', 'hare', 'porcupine', 'kits'] as const
export type CritterId = (typeof ROSTER)[number]
/** Who hides at the start of each section. */
export const EYES: CritterId[] = ['owl', 'raccoon', 'deer', 'frog']
/** The sounds in order: who makes it (the owl and the frog have moved since she found them). */
export const SOUNDS = ['owl', 'beaver', 'frog', 'hare'] as const
export type SoundId = (typeof SOUNDS)[number]

export interface StageDef {
  w: number
  h: number
  /** Above this line the light points at the sky (the stars come out). */
  sky: number
  /** Where the trees stand and where the clearing's ground starts. */
  treeline: number
  ground: number
  moon: Pt
  /** Mont-Sainte-Anne's peak, behind the trees. */
  peak: Pt
  fire: Pt
  /** Maple sits on the log left of the fire, holding the flashlight. */
  maple: Pt
  tent: Pt
  /** The tent's half width and height (from the ground up). */
  tentSize: [number, number]
  moose: Pt
  /** The lake: its near shore's corner (it fills to the stage's edge, left and down). */
  lake: { x: number; y: number }
  /** The hollow log where the raccoons live (its middle; the hole is at its left end). */
  den: Pt
  bushes: [number, number, number][]
  /** Tall trees in front of the spruce row: [x, base y, height]. The owl perches in them. */
  trees: [number, number, number][]
  /** Where each animal can hide in the eyes section (one is picked per run). */
  spots: Record<'owl' | 'raccoon' | 'deer' | 'frog', Pt[]>
  /** Where each sound comes from. */
  sounds: Record<SoundId, Pt>
  /** The bandit's paw prints, from the empty marshmallow bag by the fire round the camp to the den. */
  prints: Pt[]
  /** The bush on the trail that rustles (a porcupine). */
  quillBush: number
  /** Seats round the fire for the payoff (behind it and to the sides, the fire in front), in the order of Maple's book. */
  seats: Pt[]
  /** The marshmallow stick's resting spot, and where the bag sits. */
  stick: Pt
  bag: Pt
  /** The raccoon family by the fire (marshmallow and stars). */
  family: Pt
}

export const WIDE: StageDef = {
  w: 1600,
  h: 1000,
  sky: 430,
  treeline: 640,
  ground: 700,
  moon: [230, 170],
  peak: [1020, 330],
  fire: [820, 850],
  maple: [610, 850],
  tent: [1260, 860],
  tentSize: [160, 200],
  moose: [1500, 560],
  lake: { x: 420, y: 760 },
  den: [130, 700],
  bushes: [
    [520, 680, 60],
    [960, 660, 54],
    [700, 690, 66],
    [1440, 960, 50],
    [250, 650, 44],
  ],
  trees: [
    [340, 690, 520],
    [640, 680, 560],
    [1140, 680, 560],
    [130, 690, 480],
  ],
  spots: {
    owl: [[340, 330], [1140, 290], [640, 270]],
    raccoon: [[520, 625], [960, 612], [1440, 915]],
    deer: [[900, 600], [440, 600], [1330, 600]],
    frog: [[300, 800], [130, 900], [380, 775]],
  },
  sounds: { owl: [130, 300], beaver: [190, 880], frog: [370, 795], hare: [1530, 915] },
  prints: [
    [930, 940], [1050, 955], [1170, 960], [1290, 945], [1400, 900], [1410, 820], [1375, 745], [1310, 700], [1190, 690],
    [1080, 712], [960, 722], [845, 730], [730, 772], [600, 762], [470, 742], [350, 728], [230, 715],
  ],
  quillBush: 1,
  seats: [[680, 720], [980, 730], [530, 760], [1120, 770], [420, 860], [1240, 860], [1370, 900], [290, 900]],
  stick: [470, 960],
  bag: [930, 960],
  family: [1060, 850],
}

export const TALL: StageDef = {
  w: 1000,
  h: 1500,
  sky: 640,
  treeline: 940,
  ground: 1000,
  moon: [170, 280],
  peak: [640, 560],
  fire: [520, 1250],
  maple: [330, 1250],
  tent: [820, 1210],
  tentSize: [130, 180],
  moose: [880, 800],
  lake: { x: 300, y: 1080 },
  den: [90, 1000],
  bushes: [
    [360, 980, 56],
    [640, 960, 46],
    [520, 1000, 58],
    [200, 960, 40],
  ],
  trees: [
    [230, 990, 520],
    [520, 980, 560],
    [800, 980, 520],
    [60, 990, 460],
  ],
  spots: {
    owl: [[230, 600], [800, 600], [520, 560]],
    raccoon: [[360, 928], [640, 920], [200, 925]],
    deer: [[640, 900], [300, 900], [440, 880]],
    frog: [[200, 1150], [90, 1290], [260, 1110]],
  },
  sounds: { owl: [60, 620], beaver: [150, 1350], frog: [250, 1120], hare: [930, 1420] },
  prints: [
    [600, 1340], [710, 1365], [820, 1365], [930, 1330], [965, 1240], [960, 1140], [910, 1070], [780, 1045], [690, 1045],
    [580, 1062], [460, 1060], [350, 1050], [240, 1040], [150, 1020],
  ],
  quillBush: 1,
  seats: [[400, 1100], [650, 1100], [270, 1150], [780, 1150], [150, 1250], [880, 1260], [850, 1380], [130, 1390]],
  stick: [250, 1420],
  bag: [640, 1345],
  family: [720, 1320],
}

// ---------------------------------------------------------------- the night animals

/** How each night animal is drawn: a picture (assets/campfire-<pic>.webp) or a puppet (the raccoons), in a box `w` x `h`
 *  stage units. An animal's (x, y) is the middle of its eyes: `eye` is where that is in the box (0..1 across, 0..1
 *  down), `foot` how far down the box its feet (or the water line) are. `gap` is half the distance between its eyes and
 *  `shine` their color in the dark. */
export interface CritterLook {
  pic?: string
  w: number
  h: number
  eye: Pt
  foot: number
  gap: number
  /** The eyes' size in the dark. */
  eyeR: number
  shine: string
}

export const LOOKS: Record<CritterId, CritterLook> = {
  owl: { pic: 'owl', w: 115, h: 150, eye: [0.5, 0.3], foot: 0.98, gap: 16, eyeR: 9, shine: '#FFB43C' },
  raccoon: { w: 170, h: 170, eye: [0.5, 0.372], foot: 0.95, gap: 18, eyeR: 8, shine: '#E8F06A' },
  deer: { pic: 'deer', w: 174, h: 190, eye: [0.73, 0.2], foot: 0.97, gap: 11, eyeR: 8, shine: '#B8F27A' },
  frog: { pic: 'peeper', w: 84, h: 80, eye: [0.5, 0.2], foot: 0.95, gap: 14, eyeR: 7, shine: '#9DF2C0' },
  beaver: { pic: 'beaver', w: 166, h: 100, eye: [0.79, 0.42], foot: 0.97, gap: 6, eyeR: 7, shine: '#FFC46A' },
  hare: { pic: 'hare', w: 100, h: 130, eye: [0.35, 0.3], foot: 0.97, gap: 8, eyeR: 7, shine: '#FFD6F0' },
  porcupine: { pic: 'porcupine', w: 127, h: 115, eye: [0.2, 0.5], foot: 0.97, gap: 6, eyeR: 7, shine: '#E8F06A' },
  kits: { w: 110, h: 110, eye: [0.5, 0.49], foot: 0.95, gap: 13, eyeR: 6, shine: '#E8F06A' },
}
/** The two babies stand side by side, this far either side of (x). */
export const KIT_GAP = 46
/** The moose's eyes (stage units from the middle of his head) and their shine. */
export const MOOSE_EYES = { gap: 25, y: -15, r: 10, shine: '#FF8A5C' }

/** Maple's book (book/animals.ts) for each night animal (the babies are raccoons too). */
export const BOOK = {
  owl: 'barred-owl',
  raccoon: 'raccoon',
  deer: 'deer',
  frog: 'peeper',
  beaver: 'beaver',
  hare: 'hare',
  porcupine: 'porcupine',
  kits: 'raccoon',
} as const satisfies Record<CritterId, string>

export const NAMES: Record<CritterId, string> = {
  owl: 'A barred owl',
  raccoon: 'A raccoon',
  deer: 'A deer',
  frog: 'A spring peeper',
  beaver: 'A beaver',
  hare: 'A snowshoe hare',
  porcupine: 'A porcupine',
  kits: 'Raccoon babies',
}
export const EMOJI: Record<CritterId, string> = { owl: '🦉', raccoon: '🦝', deer: '🦌', frog: '🐸', beaver: '🦫', hare: '🐇', porcupine: '🦔', kits: '🍼' }

/** A tiny seeded random, so a run's hiding places can be picked again (and differ between runs). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}
