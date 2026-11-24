// The Earth as this toy draws it: rough continent outlines in [longitude, latitude], a toy's map, not an atlas.
// One set of shapes and colors for both globes: the home screen's (globe/Globe.tsx, a 2D canvas) and the Poles' 3D
// one (places/poles/globe/earth.ts paints them into its texture), so the globe she flies from matches the one she
// lands on. Plain data and arithmetic only: the home screen loads this at startup.
import { DEG } from '../../sdk/math'

/** Each continent's color (Europe is Eurasia's west end, in lavender). */
export const LAND_COLORS = {
  north: '#8FE3C8',
  south: '#FFC2A8',
  europe: '#C9B6F5',
  asia: '#FF9EC4',
  africa: '#FBEA9A',
  australia: '#FFB98A',
  ice: '#FFF7F0',
} as const
export type LandColor = keyof typeof LAND_COLORS

export type Pt = [lon: number, lat: number]
export const NORTH_AMERICA: Pt[] = [[-168, 66], [-162, 70], [-150, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 70], [-80, 63], [-90, 58], [-82, 53], [-78, 58], [-70, 60], [-62, 57], [-56, 52], [-60, 47], [-66, 44], [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 26], [-82, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 22], [-92, 19], [-88, 21], [-87, 16], [-83, 15], [-83, 10], [-79, 9], [-77, 8], [-80, 7], [-86, 11], [-92, 15], [-105, 20], [-110, 24], [-112, 29], [-115, 30], [-117, 33], [-121, 35], [-124, 40], [-124, 46], [-126, 50], [-132, 55], [-140, 60], [-148, 61], [-155, 58], [-162, 58], [-165, 62]]
export const GREENLAND: Pt[] = [[-55, 60], [-48, 61], [-42, 60], [-38, 65], [-22, 70], [-20, 76], [-18, 80], [-30, 83], [-45, 83], [-60, 82], [-70, 78], [-62, 76], [-56, 72], [-53, 67]]
export const SOUTH_AMERICA: Pt[] = [[-77, 8], [-72, 12], [-63, 11], [-60, 8], [-52, 4], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-40, -22], [-48, -26], [-53, -34], [-58, -35], [-57, -38], [-62, -40], [-65, -45], [-67, -48], [-69, -52], [-68, -55], [-72, -54], [-75, -50], [-74, -42], [-73, -35], [-71, -28], [-70, -18], [-76, -14], [-80, -6], [-81, -2], [-80, 1]]
export const AFRICA: Pt[] = [[-17, 15], [-17, 21], [-13, 27], [-10, 30], [-6, 35], [0, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [34, 28], [37, 22], [39, 16], [43, 12], [51, 12], [51, 10], [47, 4], [42, -2], [40, -10], [40, -16], [35, -20], [35, -25], [32, -29], [27, -34], [20, -35], [18, -32], [15, -27], [12, -18], [13, -10], [9, -2], [9, 4], [5, 6], [0, 5], [-8, 4], [-13, 8], [-15, 11]]
export const ARABIA: Pt[] = [[35, 32], [35, 28], [39, 22], [43, 13], [45, 13], [52, 16], [57, 19], [60, 22], [56, 26], [51, 24], [48, 30], [44, 30]]
export const EURASIA: Pt[] = [[-10, 36], [-9, 43], [-2, 44], [-2, 48], [-5, 48], [0, 50], [8, 54], [8, 57], [5, 59], [5, 62], [12, 66], [16, 69], [25, 71], [30, 70], [40, 67], [44, 68], [60, 69], [70, 73], [80, 73], [100, 77], [115, 74], [130, 72], [142, 72], [160, 70], [170, 70], [180, 68], [180, 65], [175, 62], [163, 60], [160, 55], [156, 51], [155, 58], [143, 59], [137, 54], [141, 50], [140, 45], [132, 43], [129, 40], [127, 35], [122, 40], [118, 38], [122, 31], [120, 25], [110, 21], [108, 16], [109, 12], [105, 9], [100, 13], [100, 8], [104, 1], [98, 8], [98, 16], [94, 17], [92, 22], [87, 22], [80, 15], [78, 8], [73, 17], [72, 21], [67, 24], [62, 25], [57, 26], [52, 28], [48, 30], [44, 37], [36, 37], [27, 37], [26, 40], [23, 38], [22, 37], [20, 40], [19, 42], [13, 45], [12, 44], [16, 41], [18, 40], [15, 38], [10, 44], [3, 43], [-2, 37]]
export const AUSTRALIA: Pt[] = [[114, -22], [114, -26], [115, -34], [118, -35], [124, -34], [129, -32], [135, -35], [138, -35], [140, -38], [146, -39], [150, -37], [153, -32], [153, -25], [146, -19], [145, -15], [142, -11], [141, -17], [136, -15], [137, -12], [132, -11], [129, -15], [126, -14], [122, -17], [118, -20]]
/** Islands as ellipses: [lon, lat, half-width, half-height (degrees), color, turn (degrees)]. */
export const ISLANDS: [number, number, number, number, LandColor, number?][] = [
  [-95, 75, 22, 4, 'north'], [-72, 70, 7, 4, 'north', -30], [-19, 65, 4, 1.5, 'europe'],
  [-2, 54, 2.5, 4.5, 'europe'], [-8, 53, 1.8, 1.8, 'europe'],
  [138, 36, 2.5, 5, 'asia', 35], [142, 43, 2, 2, 'asia'], [122, 12, 2, 4, 'asia'],
  [102, 0, 6, 1.6, 'asia', -40], [114, -1, 4, 3.5, 'asia'], [121, -2, 1.8, 2.5, 'asia'], [110, -7, 5, 1, 'asia'], [138, -5, 8, 2.6, 'australia', -12],
  [47, -19, 2.5, 6, 'africa', 15], [146, -42, 1.5, 1.3, 'australia'], [173, -40, 1.8, 3, 'australia', 30], [169, -45, 2, 2.4, 'australia', 30],
]

/** Europe on the map: the part of Eurasia inside this box is painted in Europe's color. */
export const EUROPE_BOX = { west: -30, east: 42, south: 36, north: 75 }

/** Antarctica's coast at a longitude (degrees): land all the way round the bottom, with the peninsula reaching up
 *  toward South America. */
export const antarcticaCoast = (lon: number) => -70 + 2.5 * Math.sin(lon * 3 * DEG) + 1.5 * Math.cos(lon * 5 * DEG) + (Math.abs(lon + 62) < 14 ? 6 * (1 - Math.abs(lon + 62) / 14) : 0)
