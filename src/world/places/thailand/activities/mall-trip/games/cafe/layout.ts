// Cafe & Cake in Harbor Town (plan: planning/around-the-world/thailand/mall-trip.md, "4. Cafe & Cake"), in meters:
// where everything stands, the fruit and what color each one blends to, and the orders in each round. Pure data (no
// three.js).
//
// Seen straight on (the camera looks toward -z), left to right:
//
//   ceiling beam:  ═══════════════ (forget the lid and the blender splats it) ═══════════════
//   back wall:  [fridge]   white tiles, the shelf where finished drinks line up    [coffee] [cake stand]
//   counter:     bread  tea set   Kaylee  lid [BLENDER] cup cup                        Mommy  Daddy
//                                 (apron, chef's hat)   (the big pink button)       (the customers)
//   front:            ═══════ the tray of fruit along the bottom (two rows on a tall screen) ═══════

export type V3 = [number, number, number]
export type Round = 1 | 2 | 3
export type Customer = 'nick' | 'ji'

export const ROOM = { x0: -3.0, x1: 3.0, back: -1.5, height: 2.3 }
/** The front counter Kaylee works at (its top is at Kaylee's tummy). */
export const COUNTER = { x0: -1.55, x1: 0.95, z: 0, d: 0.56, top: 0.55 }
/** The back counter under the shelf, with the coffee machine and the cake stand on it. */
export const BACK = { x0: -1.6, x1: 2.6, z: -1.27, d: 0.46, top: 0.72 }
/** The shelf on the tiles where the finished drinks line up, one more each time. */
export const SHELF = { y: 1.34, z: -1.38, x0: -0.42, step: 0.22, max: 7 }
/** The ceiling beam across the top: the blender splats it. */
export const BEAM = { y0: 1.9, y1: 2.12, z: -0.3, d: 0.3 }
export const FRIDGE = { x: -1.98, z: -1.12, w: 0.7, h: 1.72, d: 0.62 }
export const COFFEE: V3 = [0.62, BACK.top, -1.25]
export const CAKE: V3 = [1.12, BACK.top, -1.22]
export const BREAD: V3 = [-1.33, COUNTER.top, 0.02]
export const TEA: V3 = [-0.95, COUNTER.top, 0.04]
/** Kaylee behind the counter, by the blender. */
export const KAYLEE_AT = { x: -0.62, z: -0.62, face: 28 }
/** The blender's base on the counter; its jar sits on top. */
export const BLENDER: V3 = [-0.16, COUNTER.top, 0.02]
export const BASE_H = 0.2
export const JAR = { h: 0.42, r0: 0.1, r1: 0.14 }
/** Where the lid waits when it isn't on the jar. */
export const LID_REST: V3 = [-0.52, COUNTER.top, 0.1]
/** The cups wait on the counter, right of the blender. */
export const CUP_SPOTS: V3[] = [[0.36, COUNTER.top, 0.05], [0.7, COUNTER.top, 0.05]]
export const CUP = { h: 0.27, r0: 0.072, r1: 0.092 }
/** The customers at the end of the counter, turned mostly to her (their heads turn to watch the blender). */
export const CUSTOMERS: Record<Customer, { x: number; z: number; face: number }> = { ji: { x: 1.3, z: -0.25, face: -14 }, nick: { x: 1.8, z: -0.62, face: -18 } }
/** On a tall screen they stand closer in, by the counter's end. */
export const CUSTOMERS_TALL: Record<Customer, { x: number; z: number; face: number }> = { ji: { x: 1.12, z: -0.5, face: -12 }, nick: { x: 1.5, z: -0.86, face: -16 } }
/** The tray along the bottom: things stand on it in one row on a wide screen and two on a tall one. */
export const TRAY = { z: 0.95, y: 0.3, zB: 1.62, yB: 0.02 }

export type Fruit = 'mango' | 'strawberry' | 'watermelon' | 'banana' | 'coconut' | 'tea' | 'ice'
export type ItemId = Fruit | 'milk' | 'cream' | 'straw'
/** What each one blends to (the drink's color), and how much of the jar it fills. */
export const JUICE: Record<Fruit | 'milk' | 'cream', { color: string; vol: number }> = {
  mango: { color: '#FFAA2B', vol: 0.2 },
  strawberry: { color: '#FF5FA0', vol: 0.2 },
  watermelon: { color: '#FF4B4B', vol: 0.22 },
  banana: { color: '#FFF0B0', vol: 0.2 },
  coconut: { color: '#FFFDF5', vol: 0.22 },
  tea: { color: '#F07F22', vol: 0.34 },
  ice: { color: '#E3F5FF', vol: 0.12 },
  milk: { color: '#FFFFFF', vol: 0 },
  cream: { color: '#FFF8F0', vol: 0.06 },
}
export const isFruit = (id: string): id is Fruit => id in JUICE && id !== 'milk' && id !== 'cream'

/** One drink someone is waiting for: in round 1 anything; then a picture order (the fruit it needs). */
export interface Order {
  who: Customer
  /** What has to go in it (the bubble shows these and the color they make). Empty: anything. */
  want: Fruit[]
  /** Starts with ice in the cup (cha yen is poured over ice). */
  ice?: boolean
  /** The bubble's own picture for a Thai drink. */
  name?: 'cha-yen' | 'coconut'
}

/** Each round's orders, served one after another; in round 3 both cups wait at once. */
export const ROUNDS: Record<Round, { orders: Order[]; together: boolean; tray: ItemId[] }> = {
  1: { orders: [{ who: 'nick', want: [] }, { who: 'ji', want: [] }], together: false, tray: ['strawberry', 'mango', 'watermelon', 'banana', 'coconut', 'cream', 'straw'] },
  2: { orders: [{ who: 'nick', want: ['strawberry', 'banana'] }, { who: 'ji', want: ['mango', 'banana'] }], together: false, tray: ['strawberry', 'mango', 'watermelon', 'banana', 'coconut', 'cream', 'straw'] },
  3: {
    orders: [{ who: 'nick', want: ['tea'], ice: true, name: 'cha-yen' }, { who: 'ji', want: ['coconut'], name: 'coconut' }],
    together: true,
    tray: ['tea', 'milk', 'coconut', 'ice', 'mango', 'strawberry', 'cream', 'straw'],
  },
}
/** The drinks from earlier rounds already on the shelf when a link starts later (what they'd likely have made). */
export const EARLIER: Fruit[][] = [['strawberry', 'banana'], ['mango'], ['strawberry', 'banana'], ['mango', 'banana']]

/** UI pictures (the order bubbles, the flat version). */
export const ICONS: Record<ItemId, string> = { mango: '🥭', strawberry: '🍓', watermelon: '🍉', banana: '🍌', coconut: '🥥', tea: '🍵', ice: '🧊', milk: '🥛', cream: '🍦', straw: '🥤' }
