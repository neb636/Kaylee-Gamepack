// The campfire chapter's two films (planning/around-the-world/canada.md): `campfire-in` before Campfire Night,
// `campfire-out` after it (before the stamp). Lines: lines.ts `L.campfire.filmIn` and `L.campfire.filmOut`, in order.
//
// In (about 15 s, funny and a tiny bit mysterious, never scary): the campsite at night, Maple on her log by the fire
// with her stick and her bag of marshmallows. "Shh. Somebody quick and sneaky lives in these woods." Behind her a
// little grey paw slides out of the bush and takes a marshmallow; she doesn't see. Close on the bag: it takes another.
// "Hey! My marshmallow! Who's out there?" Two shining eyes in the bush blink... and they're gone with a rustle. Then
// the game: Sparkle's flashlight instruction, her hands busy at once.
//
// Out (about 13 s): the same fire, the bandit found. Roxy and her three kits have a marshmallow each. "Roxy! You have
// the quickest paws in Canada!" Maple holds up a puck: a blink, and it's in Roxy's paws. "Hee hee! Got your puck!"
// "Will you steal the puck from the geese?" "Only if my babies can come and cheer!" The kits squeak and wave their
// sticks; Roxy gets the team's pink scarf. "Deal! Go, team, go!"
//
// The camera stands on +z looking toward -z (story/sets/campfire.ts has the marks). Everyone faces the fire's side of
// the camera, so its warm light is on their faces.
import { Group } from 'three'
import { P, solid } from '../../../../engine3d/geo'
import { cam, close } from '../../../../engine3d/shots'
import { camp } from '../../activities/campfire/sounds'
import { L } from '../../lines'
import { makePuck } from '../props'
import { CAMP, CAMP_SET, makeMallow, makeRoastStick } from '../sets/campfire'
import type { StoryFilm, StoryStage } from '../stage'

const IN = L.campfire.filmIn
const OUT = L.campfire.filmOut

/** The fire crackling under the crickets for the whole film (stopped when the stage goes). */
function fireBed(s: StoryStage) {
  const stop = camp.fireBed(0.32)
  s.bag.add({ dispose: stop })
}

/** A puck for a rig friend `H` meters tall to hold up in their right paw (add it to `rig.armR`). */
function heldPuck(H: number, s: StoryStage) {
  const g = new Group()
  const p = makePuck(s.bag, 0.08)
  // (A pink band round it, so it shows against the dark.)
  p.add(solid(P.torus(0.08, 0.012, '#FF8FB8', { at: [0, 0.022, 0], rot: [Math.PI / 2, 0, 0] }), s.bag, 0))
  p.rotation.x = Math.PI / 2
  p.position.set(0.1 * H, -0.3 * H, 0.1 * H)
  g.add(p)
  g.visible = false
  return g
}

/** 0 → 1 → 0 over [a, b] (out quick, a breath at the bag, back quick): the paw's reach. */
function reachAt(t: number, a: number, b: number) {
  if (t <= a || t >= b) return 0
  const k = (t - a) / (b - a)
  if (k < 0.35) return easeOut(k / 0.35)
  if (k < 0.6) return 1
  return 1 - easeOut((k - 0.6) / 0.4)
}
const easeOut = (k: number) => 1 - (1 - k) * (1 - k)

export const CAMPFIRE_IN: StoryFilm = {
  id: 'campfire-in',
  set: CAMP_SET,
  // No music: the fire, the crickets and an owl carry the mystery.
  music: null,
  beats(s) {
    const set = s.use(CAMP_SET)
    const { maple } = s.cast
    maple.rig.armR.add(makeRoastStick(maple.height, s.bag, 0.6))
    const [mx, my, mz] = CAMP.maple
    // The marshmallow the paw carries off (it sits in the paw's hand while it's out).
    const taken = makeMallow(s.bag, 0.045, '#FFF7F0')
    taken.position.set(0, -0.02, 0.07)
    taken.visible = false
    set.paw.hand.add(taken)
    /** The paw's trip out to the bag and back, between `a` and `b` seconds: it takes marshmallow `i` at the top. */
    const snatch = (i: number, a: number, b: number) => (_k: number, t: number) => {
      set.paw.reach = reachAt(t, a, b)
      const got = t > a + (b - a) * 0.45
      set.mallows[i].visible = !got
      taken.visible = got && set.paw.reach > 0.05
    }
    return [
      {
        // The night sky over the trees: the moon, the stars. Down to the campsite: the fire, the tent, Maple.
        id: 'night',
        shot: cam([0.9, 1.25, 8.4], [-4.5, 9.5, -30], { eye: [0.2, 1.4, 5.4], look: [-0.45, 0.62, -0.2] }, { ease: 'inOut', tall: { eye: [0.5, 1.3, 9.4], to: { eye: [0.1, 1.6, 6.8], look: [-0.4, 0.7, -0.4] } } }),
        dur: 3.8,
        start: () => {
          fireBed(s)
          maple.place(mx, my, mz, 28)
          set.eyes.root.visible = false
          set.paw.reach = 0
        },
        cues: [[0.5, () => camp.hoot(0, 0.14)], [2.6, () => (set.flare = 0.5)]],
      },
      {
        // "Shh." She leans in to tell us. Behind her, the little grey paw takes a marshmallow.
        id: 'shh',
        shot: cam([-0.75, 0.98, 2.55], [-1.05, 0.68, -0.15], { eye: [-0.82, 0.94, 2.3] }, { tall: { eye: [-0.85, 1.05, 3.3] } }),
        say: IN.shh,
        sayAt: 0.4,
        hold: 0.3,
        start: () => {
          maple.place(mx, my, mz, 18)
          maple.lean = 0.18
          maple.headTurn = -0.15
        },
        tick: snatch(0, 1.7, 3.1),
        cues: [[1.6, () => camp.rustle(0)], [2.25, () => camp.snatch()]],
      },
      {
        // Close on the bag: out it comes again. Grab. Gone.
        id: 'snatch',
        shot: cam([-0.4, 0.98, 1.6], [-0.88, 0.58, -0.32], { eye: [-0.45, 0.94, 1.4] }, { sway: 0.01, tall: { eye: [-0.35, 1.05, 2.1] } }),
        dur: 2.4,
        start: () => {
          maple.lean = 0
          maple.headTurn = 0
        },
        tick: snatch(1, 0.35, 1.75),
        cues: [[0.3, () => camp.rustle(0)], [1.0, () => camp.snatch()], [1.5, () => camp.chitter(0)]],
      },
      {
        // She turns to her bag: two gone! "Hey!" A hop. "Who's out there?"
        id: 'hey',
        shot: cam([-0.6, 1.05, 2.5], [-1.05, 0.72, -0.35], { eye: [-0.65, 1.02, 2.25] }, { tall: { eye: [-0.65, 1.15, 3.2] } }),
        say: IN.hey,
        sayAt: 0.55,
        hold: 0.2,
        start: () => {
          set.paw.reach = 0
          taken.visible = false
          maple.place(mx, my, mz, 40)
          maple.headTurn = 0.55
          maple.pull('wow')
        },
        // (On "Who's out there?" she turns to peer at the dark bush behind her.)
        tick: (_k, t) => (maple.headTurn = t < 1.8 ? 0.55 : 0.55 + Math.min(1, (t - 1.8) / 0.4) * 0.4),
        cues: [[0.6, () => maple.hop()], [1.9, () => (maple.armsUp = 0.25)]],
      },
      {
        // Two eyes in the dark bush... a blink... a giggle... and gone, with a rustle.
        id: 'eyes',
        shot: cam([-0.52, 0.86, 1.5], CAMP.eyes, { eye: [-0.55, 0.8, 1.05] }, { tall: { eye: [-0.5, 0.92, 2.0] } }),
        dur: 2.6,
        start: () => {
          maple.armsUp = 0
          set.eyes.root.visible = true
          set.eyes.open = 1
        },
        cues: [[0.9, () => camp.chitter(0)], [1.9, () => ((set.eyes.root.visible = false), camp.rustle(0), s.puff(set.eyes.root.position.x, 0.6, set.eyes.root.position.z + 0.1, 5))]],
      },
    ]
  },
}


export const CAMPFIRE_OUT: StoryFilm = {
  id: 'campfire-out',
  set: CAMP_SET,
  music: 'happy',
  beats(s) {
    const set = s.use(CAMP_SET)
    const { maple, roxy, kits } = s.cast
    const R = CAMP.ring
    // Everybody's marshmallow stick (the kits wave theirs); Maple's puck, and the one that ends up in Roxy's paw.
    roxy.rig.armL.add(mirror(makeRoastStick(roxy.height, s.bag, 0.5)))
    for (const k of kits) k.rig.armR.add(makeRoastStick(k.height, s.bag, 0.34, 0.15, 0.5))
    const puckM = heldPuck(maple.height, s)
    maple.rig.armR.add(puckM)
    const puckR = heldPuck(roxy.height, s)
    roxy.rig.armR.add(puckR)
    set.bag.visible = false
    let squeaked = false
    const place = () => {
      maple.place(CAMP.maple[0], CAMP.maple[1], CAMP.maple[2], 30)
      roxy.place(R.roxy[0], 0, R.roxy[2], -28)
      // The kits in front, on the right, each a little turned toward the fire.
      R.kits.forEach(([x, z, f], i) => kits[i].place(x, 0, z, f))
    }
    return [
      {
        // Round the fire, the bandit found: Roxy and her kits, a marshmallow each.
        id: 'quick',
        shot: cam([0.2, 1.5, 5.3], [0.2, 0.5, -0.25], { eye: [0.15, 1.4, 4.8] }, { tall: { eye: [0.2, 1.8, 7.6], to: { eye: [0.2, 1.7, 7.0] } } }),
        say: OUT.quick,
        sayAt: 0.5,
        start: () => {
          fireBed(s)
          place()
          roxy.scarf(false)
          maple.pull('happy')
        },
        cues: [[0.3, () => maple.hop()], [1.6, () => (roxy.hop(), camp.chitter(0))], [2.2, () => kits[1].hop()]],
      },
      {
        // Maple holds up a puck. A blink: a whoosh, a puff, and the puck is in Roxy's paws. "Hee hee! Got your puck!"
        id: 'got',
        shot: cam([-0.3, 1.2, 3.55], [-0.3, 0.68, -0.25], { eye: [-0.3, 1.15, 3.3] }, { tall: { eye: [-0.3, 1.45, 5.4] } }),
        say: OUT.got,
        sayAt: 1.55,
        hold: 0.4,
        start: () => {
          maple.cheer()
          maple.armsUp = 0.45
          maple.headTurn = 0.25
          puckM.visible = true
          puckR.visible = false
        },
        cues: [
          [1.0, () => {
            puckM.visible = false
            puckR.visible = true
            s.sfx.whoosh()
            const p = maple.at(0.7)
            s.puff(p.x + 0.2, p.y, p.z + 0.1, 8)
            roxy.hop()
            roxy.armsUp = 0.45
          }],
          [1.25, () => maple.pull('wow', true)],
          [1.6, () => camp.chitter(0)],
        ],
        // (Maple looks at her empty paw, then at Roxy.)
        tick: (_k, t) => (maple.headTurn = t < 1.3 ? 0.25 : t < 2.1 ? -0.4 : 0.45),
      },
      {
        id: 'ask',
        shot: close(maple, 0.4, 2.2),
        say: OUT.ask,
        sayAt: 0.35,
        start: () => {
          maple.cheer()
          maple.armsUp = 0
          maple.headTurn = 0.2
          roxy.armsUp = 0.3
          maple.nod()
        },
      },
      {
        // "Only if my babies can come and cheer!" The kits squeak and wave their marshmallow sticks.
        id: 'babies',
        shot: cam([1.05, 0.95, 3.05], [1.3, 0.48, -0.1], { eye: [1.05, 0.92, 2.8] }, { tall: { eye: [1.1, 1.05, 4.2] } }),
        say: OUT.babies,
        sayAt: 0.3,
        hold: 1.0,
        start: () => {
          roxy.armsUp = 0
          roxy.wave()
        },
        tick: (k) => {
          // On "cheer!" (the end of her line) the kits bounce and wave, one after another.
          const on = k > 0.6
          kits.forEach((kit, i) => (kit.armsUp = on ? 0.55 + 0.45 * Math.sin(s.time * 12 + i * 1.7) : 0))
          if (on && !squeaked) {
            squeaked = true
            camp.kits(0)
            kits.forEach((kit, i) => (i === 1 ? kit.hop() : kit.wave()))
          }
        },
      },
      {
        // The team's pink scarf for Roxy; everybody cheers. "Deal! Go, team, go!"
        id: 'team',
        shot: cam([0.2, 1.4, 5.0], [0.2, 0.55, -0.25], { eye: [0.2, 1.35, 4.6] }, { tall: { eye: [0.2, 1.7, 7.2] } }),
        say: OUT.team,
        sayAt: 0.8,
        hold: 0.8,
        start: () => {
          roxy.scarf(true)
          const p = roxy.at(0.55)
          s.sparkle(p.x, p.y, p.z, 18)
          s.sfx.chime()
          roxy.pull('happy')
          for (const kit of kits) kit.armsUp = 0
        },
        cues: [
          [0.9, () => (maple.hop(), (maple.armsUp = 1))],
          [1.1, () => (roxy.hop(), (roxy.armsUp = 1), (set.flare = 1), camp.sparks())],
          [1.3, () => (kits.forEach((k, i) => (i % 2 ? k.hop() : k.wave())), camp.kits(0))],
          [2.0, () => kits.forEach((k, i) => (i % 2 ? k.wave() : k.hop()))],
        ],
      },
    ]
  },
}

/** The same stick for the left paw. */
function mirror(g: Group) {
  g.scale.x = -1
  return g
}
