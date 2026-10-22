// The Vet Clinic in Harbor Town (plan: planning/around-the-world/thailand/mall-trip.md, "★ 1. The Vet Clinic"), in
// meters: where everything stands, what each patient needs and which tools are on the tray. Pure data (no three.js).
//
// Seen straight on (the camera looks toward -z), left to right:
//
//   back wall:   [x-ray box]                [table]      [ waiting room window: healed patients wag ]
//   floor:   parrot  Daddy   Kaylee      patient on the       cabinet (treat jar, cat carrier)
//                            (scrubs)       exam table            scale
//   front:              ═══════ the tool tray along the bottom ═══════
import type { PatientId } from '../../sections'

export type V3 = [number, number, number]

export const ROOM = { x0: -3.4, x1: 3.4, back: -1.6, front: 2.4, height: 3.0 }
export const TABLE = { x: 0, z: 0, top: 0.5, w: 1.3, d: 0.75 }
/** The patient stands on the table, facing her. */
export const PATIENT_AT: V3 = [0, TABLE.top, 0.02]
export const KAYLEE_AT = { x: -0.85, z: 0.5, face: 55 }
export const DADDY_AT = { x: -1.5, z: -1.05, face: 35 }
/** On a tall screen Daddy stands closer, behind her. */
export const DADDY_TALL = { x: -1.2, z: -0.9, face: 30 }
/** The waiting room behind the window in the back wall: healed patients sit on its bench, smaller (farther away). */
export const WINDOW = { x0: 0.5, x1: 1.85, y0: 1.12, y1: 2.0 }
export const BENCH = { z: -2.0, y: 1.12, spots: [0.8, 1.18, 1.56], scale: 0.5 }
export const XRAY = { x: -0.72, y: 1.66, w: 0.84, h: 0.6 }
/** The parrot swings on a hoop hanging from the ceiling, over Daddy's shoulder. */
export const PARROT = { x: -1.72, z: -1.15, perch: 1.98 }
export const CABINET = { x0: 0.72, x1: 1.78, z: -1.2, d: 0.5, top: 0.72 }
export const JAR: V3 = [0.95, CABINET.top, -1.12]
export const CARRIER: V3 = [1.44, CABINET.top, -1.14]
export const SCALE: V3 = [1.28, 0, 0.42]
/** Patients come in from the right, hop onto the scale, then up onto the table. */
export const DOOR: V3 = [3.6, 0, 0.7]
/** The tray: tools stand along it, in one row on a wide screen and two on a tall one. */
export const TRAY = { z: 1.2, y: 0.26, zB: 1.65, yB: 0.1 }
/** Tools are toy-sized, bigger than life so they're easy to see and grab. */
export const TOOL_SCALE = 1.5
/** Held tools move on this plane (in front of the patient), with their working tip just above her finger. */
export const HOLD_Z = 0.42

export type ToolId = 'stethoscope' | 'thermometer' | 'tweezers' | 'cream' | 'bandage' | 'brush' | 'soap' | 'shower' | 'towel' | 'bow' | 'spoon' | 'tissue'
/** A thing on the tray (its anchor is `tool:<key>`): a tool, and its color for the bandages and the bows. */
export interface TrayItem {
  key: string
  tool: ToolId
  color?: string
}

export const BANDAGE_COLORS = { pink: '#FF8FB8', mint: '#8FE3C8', sky: '#8EC9F5' }
export const BOW_COLORS = { pink: '#FF4F9A', lavender: '#B9A6F5', gold: '#FFC83D' }

const tools = (...ids: ToolId[]): TrayItem[] => ids.map((tool) => ({ key: tool, tool }))
const colored = (tool: ToolId, colors: Record<string, string>): TrayItem[] => Object.entries(colors).map(([name, color]) => ({ key: `${tool}-${name}`, tool, color }))

/** What each patient needs, in the order the 👆 suggests (any order works). `sneeze` happens by itself. */
export type Need = 'heart' | 'temp' | 'thorn' | 'cream' | 'bandage' | 'soap' | 'rinse' | 'dry' | 'brush' | 'bow' | 'medicine' | 'tissue' | 'sneeze'
export const NEEDS: Record<PatientId, Need[]> = {
  puppy: ['heart', 'temp', 'thorn', 'cream', 'bandage'],
  pony: ['soap', 'rinse', 'dry', 'brush', 'bow'],
  elephant: ['medicine', 'tissue', 'soap', 'sneeze', 'rinse'],
}
/** The tool for each need (the 👆 points at it, the thought bubble shows it). */
export const NEED_TOOL: Record<Need, ToolId | null> = {
  heart: 'stethoscope',
  temp: 'thermometer',
  thorn: 'tweezers',
  cream: 'cream',
  bandage: 'bandage',
  soap: 'soap',
  rinse: 'shower',
  dry: 'towel',
  brush: 'brush',
  bow: 'bow',
  medicine: 'spoon',
  tissue: 'tissue',
  sneeze: null,
}

export const TRAYS: Record<PatientId, TrayItem[]> = {
  puppy: [...tools('stethoscope', 'thermometer', 'tweezers', 'cream'), ...colored('bandage', BANDAGE_COLORS)],
  pony: [...tools('thermometer', 'soap', 'shower', 'towel', 'brush'), ...colored('bow', BOW_COLORS)],
  elephant: tools('stethoscope', 'spoon', 'tissue', 'soap', 'shower', 'towel'),
}
/** Every tray item there is (the screen makes a tap target for each). */
export const ALL_ITEMS: TrayItem[] = [...new Map(Object.values(TRAYS).flat().map((t) => [t.key, t])).values()]

export const TOOL_ICONS: Record<ToolId, string> = {
  stethoscope: '🩺',
  thermometer: '🌡️',
  tweezers: '🪡',
  cream: '🧴',
  bandage: '🩹',
  brush: '🪮',
  soap: '🧼',
  shower: '🚿',
  towel: '🧺',
  bow: '🎀',
  spoon: '🥄',
  tissue: '🤧',
}
export const PATIENT_ICONS: Record<PatientId, string> = { puppy: '🐶', pony: '🐴', elephant: '🐘' }

/** The patient's thought bubble shows how it feels (what's wrong), never the tool, so it never looks like the patient is the doctor. */
export const NEED_ICONS: Record<Need, string | null> = {
  heart: '💓',
  temp: '🥵',
  thorn: '🌵',
  cream: '🐾',
  bandage: '🤕',
  soap: '🪰',
  rinse: '🫧',
  dry: '💧',
  brush: '🌀',
  bow: '🎀',
  medicine: '🤒',
  tissue: '🤧',
  sneeze: null,
}
