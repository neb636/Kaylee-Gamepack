// Campfire Night's two logical stages (wide 1600 x 1000, tall 1000 x 1500) and its placeholder looks. One camera: a
// straight-on, eye-level side view of the campsite at the foot of Mont-Sainte-Anne, like a theater stage at night (the
// sky with the mountain, the dark row of spruces, the clearing with the fire in the middle, the tent, the lake). Plain
// data, no React.

export type Pt = [number, number]

/** The night animals she meets, in the order Maple's book counts them (`?found=N` = the first N are found). */
export const ROSTER = ['owl', 'raccoon', 'deer', 'frog', 'beaver', 'mosquito', 'skunk', 'kits'] as const
export type CritterId = (typeof ROSTER)[number]
/** Who hides at the start of each section. */
export const EYES: CritterId[] = ['owl', 'raccoon', 'deer', 'frog']
/** The sounds in order: who makes it (the owl and the frog have moved since she found them). */
export const SOUNDS = ['owl', 'beaver', 'frog', 'mosquito'] as const
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
  /** The hollow log where the raccoons live. */
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
  /** The bush on the trail that rustles (a skunk). */
  skunkBush: number
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
  sounds: { owl: [130, 300], beaver: [180, 880], frog: [370, 795], mosquito: [1340, 610] },
  prints: [
    [930, 940], [1050, 955], [1170, 960], [1290, 945], [1400, 900], [1410, 820], [1375, 745], [1310, 700], [1190, 690],
    [1080, 712], [960, 722], [845, 730], [730, 772], [600, 762], [470, 742], [350, 728], [230, 715],
  ],
  skunkBush: 1,
  seats: [[680, 720], [980, 730], [530, 760], [1120, 770], [420, 860], [1240, 860], [1370, 900], [290, 900]],
  stick: [470, 960],
  bag: [930, 960],
  family: [1050, 900],
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
  sounds: { owl: [60, 620], beaver: [150, 1350], frog: [250, 1120], mosquito: [700, 880] },
  prints: [
    [600, 1340], [710, 1365], [820, 1365], [930, 1330], [965, 1240], [960, 1140], [910, 1070], [780, 1045], [690, 1045],
    [580, 1062], [460, 1060], [350, 1050], [240, 1040], [150, 1020],
  ],
  skunkBush: 1,
  seats: [[400, 1100], [650, 1100], [270, 1150], [780, 1150], [150, 1250], [880, 1260], [850, 1380], [130, 1390]],
  stick: [250, 1420],
  bag: [640, 1380],
  family: [720, 1320],
}

// ---------------------------------------------------------------- the night animals (placeholder shapes)

export interface Look {
  /** Head radius (stage units). */
  r: number
  fill: string
  ears: [number, number, number][]
  earFill?: string
  /** Body ellipse under the head [x, y, rx, ry] in head units (none for the owl's round body or the mosquito). */
  body?: [number, number, number, number]
  muzzle?: [number, number, number, number]
  muzzleFill?: string
  /** Eyes: half the gap between them, and their height, in head units. */
  eyes: number
  eyeY: number
  /** The color they shine in the dark. */
  shine: string
  mask?: boolean
  antlers?: boolean
  stripe?: boolean
  beak?: boolean
  teeth?: boolean
  wings?: boolean
}

export const LOOKS: Record<CritterId | 'moose' | 'maple', Look> = {
  owl: { r: 46, fill: '#9C8A74', ears: [[-0.62, -0.86, 0.2], [0.62, -0.86, 0.2]], earFill: '#7E6C58', body: [0, 1.1, 0.8, 0.9], eyes: 0.38, eyeY: -0.08, shine: '#FFB43C', beak: true },
  raccoon: { r: 50, fill: '#8E8A96', ears: [[-0.7, -0.74, 0.26], [0.7, -0.74, 0.26]], earFill: '#6E6A78', body: [0, 1.25, 0.9, 0.75], muzzle: [0, 0.42, 0.42, 0.3], muzzleFill: '#E6E2EA', eyes: 0.38, eyeY: -0.08, shine: '#E8F06A', mask: true },
  deer: { r: 48, fill: '#B07A4E', ears: [[-0.95, -0.6, 0.3], [0.95, -0.6, 0.3]], earFill: '#C99068', body: [0, 1.5, 0.95, 0.8], muzzle: [0, 0.55, 0.36, 0.42], muzzleFill: '#E8CDAE', eyes: 0.4, eyeY: -0.12, shine: '#B8F27A' },
  frog: { r: 32, fill: '#6DB46E', ears: [[-0.5, -0.78, 0.3], [0.5, -0.78, 0.3]], earFill: '#6DB46E', body: [0, 0.9, 1.1, 0.6], eyes: 0.5, eyeY: -0.78, shine: '#9DF2C0' },
  beaver: { r: 44, fill: '#9A6236', ears: [[-0.72, -0.72, 0.24], [0.72, -0.72, 0.24]], earFill: '#7A4A28', body: [0, 1.1, 1.0, 0.65], muzzle: [0, 0.38, 0.5, 0.36], muzzleFill: '#C99A6E', eyes: 0.36, eyeY: -0.12, shine: '#FFC46A', teeth: true },
  mosquito: { r: 14, fill: '#5A5266', ears: [], eyes: 0.4, eyeY: -0.1, shine: '#FF8AA8', wings: true },
  skunk: { r: 40, fill: '#3A3446', ears: [[-0.62, -0.78, 0.24], [0.62, -0.78, 0.24]], earFill: '#2A2436', body: [0, 1.2, 0.95, 0.7], muzzle: [0, 0.42, 0.38, 0.28], muzzleFill: '#5A5266', eyes: 0.36, eyeY: -0.1, shine: '#E8F06A', stripe: true },
  kits: { r: 30, fill: '#9E9AA6', ears: [[-0.7, -0.74, 0.28], [0.7, -0.74, 0.28]], earFill: '#7E7A88', body: [0, 1.2, 0.85, 0.7], muzzle: [0, 0.42, 0.42, 0.3], muzzleFill: '#EEEAF2', eyes: 0.38, eyeY: -0.08, shine: '#E8F06A', mask: true },
  moose: { r: 70, fill: '#6E4A32', ears: [[-0.9, -0.4, 0.24], [0.9, -0.4, 0.24]], earFill: '#5A3A26', body: [0.9, 1.9, 1.7, 0.95], muzzle: [0, 0.55, 0.58, 0.44], muzzleFill: '#8A6448', eyes: 0.36, eyeY: -0.22, shine: '#FF8A5C', antlers: true },
  maple: { r: 58, fill: '#9A6236', ears: [[-0.72, -0.72, 0.26], [0.72, -0.72, 0.26]], earFill: '#7A4A28', body: [0, 1.3, 0.95, 0.75], muzzle: [0, 0.38, 0.5, 0.36], muzzleFill: '#C99A6E', eyes: 0.36, eyeY: -0.12, shine: '#FFC46A', teeth: true },
}

export const NAMES: Record<CritterId, string> = {
  owl: 'An owl',
  raccoon: 'A raccoon',
  deer: 'A deer',
  frog: 'A frog',
  beaver: 'A beaver',
  mosquito: 'A mosquito',
  skunk: 'A skunk',
  kits: 'Raccoon babies',
}
export const EMOJI: Record<CritterId, string> = { owl: '🦉', raccoon: '🦝', deer: '🦌', frog: '🐸', beaver: '🦫', mosquito: '🦟', skunk: '🦨', kits: '🍼' }

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
