// Decorate a Snowman, as data in meters (no three.js): where the snowman stands in the park, Maple, the drum, the
// parade line, the toboggan of tools each round, and the friends' picture cards. The park itself (park.ts, props.ts,
// castle.ts) is the same one the old snowball game used: the camera looks from the park's front (+z) toward the castle.
//
// Seen straight on:
//
//   far back:              Old Quebec on the cliff, the castle hotel on top
//   middle:    [drum]   Maple        THE SNOWMAN        the parade line (finished snowmen) ->
//   front:              ═════════ Maple's red toboggan, the tools on it ═════════

/** The snowman she's decorating. */
export const SPOT = { x: 0, z: 2 }
/** His three balls (radius, m), bottom to top, and how far each sinks into the one below. */
export const BALL_RS = [0.62, 0.46, 0.34] as const
export const SINK = 0.16
/** Maple, beside him, facing him. */
export const MAPLE_AT = { x: -1.6, z: 2.5, yaw: 0.35 }
/** The parade drum: it pops up when he's decorated enough (tap it and he wakes up). */
export const DRUM_AT = { x: -3.1, z: -0.8 }
/** On a tall screen there's no room out to the left: the drum stands just behind him on the right. */
export const DRUM_TALL = { x: 1.5, z: 0.05 }
/** The parade line: finished snowmen wait to the right, a little further back. */
export const LINE = { x0: 2.4, gap: 1.35, z: 0.4 }
export const lineSpot = (slot: number) => ({ x: LINE.x0 + slot * LINE.gap, z: LINE.z - slot * 0.35 })

/** Held tools move on a plane just in front of him, their working end this far above her finger (px). */
export const LIFT_PX = 30

export type ToolId = 'coal' | 'carrot' | 'stick' | 'snow' | 'paint' | 'tuque' | 'sash' | 'scarf'
export type Round = 'face' | 'dress' | 'friends'
const FACE: ToolId[] = ['coal', 'carrot', 'stick', 'snow']
const DRESS: ToolId[] = [...FACE, 'paint', 'tuque', 'sash', 'scarf']
export const TRAYS: Record<Round, ToolId[]> = { face: FACE, dress: DRESS, friends: DRESS }
export const ALL_TOOLS = DRESS
export const TOOL_LABELS: Record<ToolId, string> = { coal: 'Coal', carrot: 'Carrot', stick: 'Stick arm', snow: 'More snow', paint: 'Rainbow snow paint', tuque: 'Red tuque', sash: 'Carnival sash', scarf: 'Pink scarf' }

/** Touches of decorating (a stroke on him, something put on him, a tap's go) before the drum pops up. */
export const ENOUGH = 8
export const ENOUGH_FRIEND = 5

/** How much of each thing a snowman can hold (the oldest comes off for a new one past this). */
export const MAX = { coal: 70, carrot: 4, stick: 6, snow: 40, tuque: 3 }

/** Round 3: Maple's friends ask, with a picture card, for the snowman they'd like. Whatever she makes: "Ta-da!". */
export type Card = 'tuque' | 'rainbow' | 'silly'
export const CARDS: Card[] = ['tuque', 'rainbow', 'silly']
