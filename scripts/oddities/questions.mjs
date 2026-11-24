// Every question qa-oddities.mjs asks Jev about a screenshot, and the thresholds that turn the answers into findings.
// All the wording lives here so it can be read and tuned in one place; tune it on the eval set
// (`node scripts/qa-oddities.mjs --eval`), never on one frame. A general "does one object pass through another?" and
// "does mist end in a hard edge?" were tried and dropped (2026-11-22): about 0.6 on every frame, bug or not.
//
// Each oddity is one yes/no question (a Noul: the probability the answer is yes) plus a Box that says where. A Box
// always returns a box, even on a clean frame, so the box is drawn only when its Noul says yes.

/**
 * A Noul at or above YES is a finding (red box); a little below it, a maybe for a person to look at; below that,
 * dropped (the band is YES - MAYBE wide). Questions answer at different levels (the water-edge one says 0.9 on some clean frames), so one with a
 * `yes` of its own uses that instead, set from the eval: the lowest value with at most ~1 false alarm per 10 clean frames.
 */
export const YES = 0.7
export const MAYBE = 0.55

/** The oddity types, each one judgment a person could make at a glance. `box` says what to find when it fires. */
export const ODDITIES = {
  sunk: {
    label: 'Sunk into the ground',
    noul: { instructions: 'Is a character or vehicle sunk into the ground in `screenshot`, with its feet, legs or wheels hidden below the ground surface?' },
    box: 'the character or vehicle sunk into the ground in `screenshot`',
  },


  waterEdge: {
    label: 'Pale band at the water\'s edge',
    noul: { instructions: 'Is there a pale, milky strip along the edge where water meets land in `screenshot`?' },
    yes: 0.85,
    box: 'the pale strip where water meets land in `screenshot`',
  },
  detachedProp: {
    label: 'Detached prop',
    noul: {
      instructions: 'Is a prop in `screenshot` floating apart from the character who should be holding or wearing it?',
      criteria: {
        true: 'A stick, paddle, tool or hat hangs in the air beside a character, or lies on the ground next to them, instead of in their paw or on their head.',
        false: 'Props are held, worn, or set down where they belong, like a paddle resting in a canoe.',
      },
    },
    box: 'the prop in `screenshot` that floats apart from its character',
  },
  brokenProp: {
    label: 'Prop in pieces',
    noul: { instructions: 'Is part of a hockey stick, paddle or tool in `screenshot` separated from the rest of it, floating on its own?' },
    yes: 0.5, // answers low (0.4-0.5 on the two broken sticks) but clean frames stay under 0.35
    box: 'the loose piece of a stick, paddle or tool in `screenshot`',
  },
  duplicateUi: {
    label: 'Ghost copy',
    noul: {
      instructions: 'Does `screenshot` show a faint second copy of a ring, marker or button next to the real one?',
    },
    box: 'the faint extra ring, marker or button in `screenshot`',
  },
  dither: {
    label: 'Dither ghosting',
    noul: {
      instructions: 'Is any object in `screenshot` covered in a fine dotted or speckled pattern, as if it were half see-through?',
      criteria: {
        true: 'Part of a character, vehicle or tree looks stippled or screen-door dotted.',
        false: 'Surfaces are smooth colors. Snow, sparkles, freckles and patterned fabric are not dotting.',
      },
    },
    box: 'the dotted, half see-through object in `screenshot`',
  },
  cameraInside: {
    label: 'Camera inside scenery',
    noul: {
      instructions: 'Is the view in `screenshot` blocked by a big surface very close to the camera, as if the camera were inside or behind something?',
    },
    box: 'the surface blocking the view in `screenshot`',
  },
  floating: {
    label: 'Floating object',
    noul: {
      instructions: 'Is an object that should stand on the ground hovering above it in `screenshot`?',
      criteria: {
        true: 'A rock, tree, building, animal or prop has a gap of air under it where it should touch the ground or water.',
        false: 'Everything that should touch the ground does. Birds, balloons, clouds, bubbles, sparkles, jumping characters and buttons are meant to be in the air.',
      },
    },
    box: 'the object hovering above the ground in `screenshot`',
  },
}

/**
 * Questions built from a screen's scene facts (its `oddities` in a country's qa.mjs). A held prop gets "Is the beaver
 * holding the hockey stick?"; a low answer is a detached prop even when the general question missed it.
 */
export function heldQuestions(held = []) {
  return Object.fromEntries(held.flatMap(({ holder, prop }, i) => [
    // The companion question: "holding?" is only worth reading when the holder is in the shot at all.
    [`held${i}Seen`, { type: 'noul', instructions: `Is ${holder} in \`screenshot\`?` }],
    [`held${i}`, { type: 'noul', instructions: `Is ${holder} holding the ${prop} in \`screenshot\`?`, meta: { holder, prop } }],
  ]))
}
/** A held prop answer below this counts as detached. */
export const HELD_NO = 0.3
