// Kaylee's family (from Dad, 2026-10-17). Pure data (no three.js), shared by the 3D house and the flat fallback.
// Their animals are in looks.ts (Dad's picks from the lineup).
// Spots are in meters (+x right as seen from the street, +z toward the street), facing in degrees (0 = toward the
// street, 90 = toward +x).
export type FamilyPose = 'stand' | 'sit' | 'lie'

export interface FamilyMember {
  id: string
  name: string
  /** Thai spelling, when we know it. */
  thai?: string
  /** Who they are, for Dad. */
  who: string
  /** Their button color in the flat house (no WebGL). */
  color: string
  /** Meters (Kaylee is 1.0). */
  height: number
  /** Where they are today (null: not at Agong's house in gate 1). */
  spot: { floor: 0 | 1; x: number; z: number; face: number; pose: FamilyPose; seat?: number } | null
  /** Base pitch (Hz) of their greeting babble until they have voices. */
  pitch: number
}

export const FAMILY: FamilyMember[] = [
  { id: 'agong', name: 'Agong', thai: 'อากง', who: 'Grandpa', color: '#B9A6F5', height: 1.45, pitch: 150, spot: { floor: 0, x: 2.025, z: -4.2, face: 65, pose: 'sit', seat: 0.45 } },
  { id: 'jum', name: 'Jum', who: 'Aunt', color: '#FFB3CF', height: 1.5, pitch: 260, spot: { floor: 0, x: 1.0, z: -18.698, face: -30, pose: 'stand' } },
  { id: 'joy', name: 'Joy', who: 'Aunt, mom of Gan and Ken', color: '#FBEA9A', height: 1.5, pitch: 280, spot: { floor: 0, x: 0.2, z: -7.0, face: -20, pose: 'stand' } },
  { id: 'bird', name: 'Bird', who: 'Uncle, dad of BB', color: '#A8DCFF', height: 1.65, pitch: 130, spot: { floor: 0, x: -3.3, z: 1.0, face: 25, pose: 'stand' } },
  { id: 'nick', name: 'Daddy', who: "Kaylee's dad (Nick)", color: '#7FD1B9', height: 1.7, pitch: 120, spot: { floor: 0, x: 2.9, z: 1.15, face: -30, pose: 'stand' } },
  { id: 'ji', name: 'Mommy', who: "Kaylee's mom (Ji)", color: '#FF8FB8', height: 1.55, pitch: 300, spot: { floor: 1, x: 0.55, z: -18.898, face: -15, pose: 'stand' } },
  { id: 'bb', name: 'BB', who: "Cousin, Bird's daughter", color: '#FFB3D6', height: 1.2, pitch: 380, spot: { floor: 1, x: 2.745, z: -13.4, face: -90, pose: 'sit', seat: 0.42 } },
  { id: 'gan', name: 'Gan', who: "Cousin, Joy's son", color: '#7CC4F2', height: 1.3, pitch: 330, spot: { floor: 1, x: -1.725, z: -19.95, face: 90, pose: 'lie' } },
  { id: 'ken', name: 'Ken', who: "Cousin, Joy's son", color: '#8FE3C8', height: 1.25, pitch: 350, spot: { floor: 1, x: 1.1, z: -6.3, face: -20, pose: 'stand' } },
  { id: 'ja', name: 'Ja', who: 'Aunt, mom of Putto and Putter', color: '#D9CCFF', height: 1.5, pitch: 270, spot: null },
  { id: 'sri', name: 'Sri', who: 'Aunt', color: '#FFC83D', height: 1.5, pitch: 290, spot: null },
  { id: 'putto', name: 'Putto', who: "Cousin, Ja's son (Kaylee's age)", color: '#A8DCFF', height: 1.0, pitch: 420, spot: null },
  { id: 'putter', name: 'Putter', who: "Cousin, Ja's son (a little penguin)", color: '#B9A6F5', height: 0.8, pitch: 480, spot: null },
]
