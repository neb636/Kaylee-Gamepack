// The rental desk at Nan airport (plan: planning/around-the-world/thailand/nan-trip.md, "The rental desk"), in meters:
// where everything stands and the beats. Pure data (no three.js): sections.ts can read it at startup.
//
// Seen from the front (the camera looks toward -z), under the arrivals hall's canopy, with the car park behind:
//
//   the back:      the poster (a mountain)     the hall's back wall, its big windows       the car park
//   the counter:   the map rack   [ orchids    the clerk behind it     the bell ]        the silver Pajero, parked
//   the front:                    Mommy    Kaylee (the key fob in her hand)    Daddy      facing right, its back to us
//                                                                       her bags by the boot

export type V3 = [number, number, number]

/** key: the clerk slides the key fob over, she presses it and the Pajero beeps; boot: her bags into the boot; belt: into
 *  her seat behind Mommy, click the seatbelt, and off they go. */
export const ROUNDS = ['key', 'boot', 'belt'] as const
export type Round = (typeof ROUNDS)[number]

/** The counter (its top), with the clerk behind it (on a little step, so she shows over it). */
export const COUNTER = { x0: -2.5, x1: -0.7, z: -1.3, d: 0.6, h: 1.0 }
export const CLERK_AT: V3 = [-1.55, 0.22, -1.8]
export const BELL: V3 = [-0.95, COUNTER.h, -1.2]
export const ORCHIDS: V3 = [-2.25, COUNTER.h, -1.25]
export const MAPS: V3 = [-3.2, 0, -1.7]
export const POSTER = { at: [-3.4, 1.65, -2.55] as V3, w: 1.0, h: 1.2 }
/** The hall's back wall (with big windows onto the car park beyond it), and where it ends. */
export const WALL = { z: -2.6, x0: -4.2, x1: 1.4 }
/** Where the fob lands on the counter for her, and where she stands to take it. */
export const FOB_DESK: V3 = [-0.95, COUNTER.h + 0.03, -1.05]

/** The Pajero, in the car park beside the hall: facing +x, its right side (Kaylee's door) toward us, its tailgate
 *  toward the hall. */
export const CAR_AT: V3 = [4.3, 0, -1.6]
export const CAR_YAW = Math.PI / 2
/** Her bags on the ground behind the car (her pink suitcase, Mommy's bag, Daddy's backpack). */
export const BAGS: V3[] = [[0.95, 0, -0.55], [0.55, 0, -1.45], [1.05, 0, -2.25]]
/** A bag let go this near the open boot goes in. */
export const BOOT_REACH = 1.0

/** Where everyone stands for each beat. */
export const AT = {
  key: { kaylee: [-0.35, 0, -0.55] as V3, ji: [-1.65, 0, -0.35] as V3, nick: [0.75, 0, -0.75] as V3 },
  boot: { kaylee: [1.45, 0, -0.95] as V3, ji: [1.1, 0, 0.15] as V3, nick: [0.35, 0, -2.25] as V3 },
  belt: { kaylee: [3.85, 0, -0.35] as V3 },
}
/** Presses of the key fob before the tailgate pops up (and the family heads out to the car). */
export const PRESSES = 3
/** The road out of the car park (the car drives off along +x). */
export const EXIT_X = 16
