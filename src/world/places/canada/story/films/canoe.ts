// The canoe chapter's two films (planning/around-the-world/canada.md): `canoe-in` before Red Canoe, `canoe-out` after
// it (before the stamp). Lines: lines.ts `L.canoe.filmIn` and `L.canoe.filmOut`, in play order. The set is the game's own
// lake (story/sets/canoe.ts): the dock at the south end (+z), the glacier at the north end (-z).
//
// In: Maple in the red canoe at the dock. Every big game starts with a song... and across the lake a loon calls, the
// mountains answer (a wide shot, no words; then Lulu herself, far off by the glacier, head thrown back). "That's Lulu!"
// Off they paddle. About 15 s.
// Out: under the glacier, Lulu on the water with her chick on her back, Maple in the canoe beside her. The ask, the yes,
// the song (her head thrown back, the long call), the chick's tiny squeak, the giggle, the scarf. About 14 s.
import { Vector3 } from 'three'
import { cam, close } from '../../../../engine3d/shots'
import { snd } from '../../activities/canoe/sounds'
import { FAMILY } from '../../activities/canoe/lake'
import { L } from '../../lines'
import { LAKE } from '../sets/canoe'
import type { StoryFilm } from '../stage'

const X = L.canoe.filmIn
const Y = L.canoe.filmOut
const DEG = Math.PI / 180

export const CANOE_IN: StoryFilm = {
  id: 'canoe-in',
  set: LAKE,
  beats(s) {
    const set = s.use(LAKE)
    const { lulu } = s.cast
    const b = set.boat
    const face = () => set.mapleHead()
    const far = new Vector3(FAMILY.x, 3, FAMILY.z - 12)
    return [
      {
        // At the dock: Maple in her red canoe, the paddle across her lap.
        id: 'song',
        shot: cam([4.6, 1.7, 42.2], [2.4, 0.75, 46.2], { eye: [4.0, 1.5, 43.2], look: [2.4, 0.8, 46.4] }, { fov: 36, tall: { fov: 46 } }),
        say: X.song,
        sayAt: 0.6,
        start: () => {
          s.sfx.air('lake')
          Object.assign(b, { x: 2.4, z: 45.4, h: Math.PI, speed: 0, paddling: false, look: null })
          set.glow(0.3)
          set.canoe.wave()
        },
      },
      {
        // A loon calls, far across the water, and the mountains answer. The whole lake, the glacier at the far end.
        id: 'call',
        shot: cam([3.6, 2.6, 52.5], [1.8, 2.8, 20], { eye: [3.2, 2.9, 51.5], look: [1.8, 3.6, 0] }, { tall: { eye: [3.4, 3.2, 54] } }),
        dur: 2.9,
        start: () => {
          b.look = far
          lulu.place(FAMILY.x, 0, FAMILY.z, 0)
        },
        cues: [[0.5, () => s.sfx.loon()]],
      },
      {
        // There she is, by the glacier: Lulu, her head thrown back, singing.
        id: 'far',
        shot: { ...close(lulu, 0.35, 1.5, 0.05), tall: { fov: 44 } },
        dur: 2.3,
        tick: (_k, t) => (lulu.calling = t < 1.8 ? Math.min(1, t * 3) : Math.max(0, 1 - (t - 1.8) * 3)),
        cues: [[0.1, () => snd.laugh()]],
      },
      {
        // Maple's ears go up: she knows that voice.
        id: 'lulu',
        shot: cam(() => face().add(new Vector3(1.25, 0.25, -2.6)), () => face().add(new Vector3(0, -0.15, 0)), undefined, { fov: 36, tall: { fov: 46 } }),
        say: X.lulu,
        sayAt: 0.35,
        start: () => {
          lulu.calling = 0
          lulu.hide()
          b.look = null
          set.canoe.cheer()
        },
      },
      {
        // Off they go: Maple paddles out onto the turquoise water toward the glacier.
        id: 'across',
        shot: cam([6.4, 3.3, 50.5], () => set.canoe.root.position.clone().add(new Vector3(-0.6, 0.6, -5)), { eye: [5.6, 3.5, 48.6] }, { tall: { eye: [6.8, 3.8, 53] } }),
        say: X.across,
        sayAt: 0.3,
        hold: 0.9,
        start: () => {
          b.paddling = true
          b.speed = 1.3
          s.sfx.splash()
        },
      },
    ]
  },
}

export const CANOE_OUT: StoryFilm = {
  id: 'canoe-out',
  set: LAKE,
  beats(s) {
    const set = s.use(LAKE)
    const { lulu, chick } = s.cast
    const b = set.boat
    // Under the glacier. The canoe's bow points toward the camera (a little to the right), so Maple in the stern faces
    // us over it; Lulu floats beside the canoe on the left, turned between Maple and the camera.
    const LX = -1.3
    const LZ = -37.2
    const lookLulu = new Vector3(LX, 0.4, LZ)
    const two = cam([-0.5, 1.35, -32.2], [-0.55, 0.62, -38.3], { eye: [-0.5, 1.25, -32.8] }, { fov: 38, tall: { eye: [-0.5, 1.7, -30.4], fov: 46 } })
    let squeakT = -1
    return [
      {
        id: 'ask',
        shot: two,
        say: Y.ask,
        sayAt: 0.4,
        start: () => {
          s.sfx.air('lake')
          set.glow(1)
          Object.assign(b, { x: 0.5, z: -38, h: 25 * DEG, speed: 0, paddling: false, look: lookLulu })
          lulu.place(LX, 0, LZ, 50)
          chick.ride(lulu.body, 0, 0.36 * lulu.height, -0.2 * lulu.height, 0)
          set.canoe.wave()
        },
      },
      {
        id: 'yes',
        shot: { ...close(lulu, 0.32, 1.35, 0.06), tall: { fov: 44 } },
        say: Y.yes,
        sayAt: 0.3,
        start: () => lulu.pull('happy'),
      },
      {
        // The song: head thrown back, the long call echoing off the glacier. Her chick tries too: a tiny squeak.
        id: 'song',
        shot: cam([LX + 0.6, 0.3, LZ + 1.7], [LX, 0.5, LZ], { eye: [LX + 0.5, 0.26, LZ + 1.35] }, { fov: 38, tall: { fov: 46 } }),
        dur: 4.4,
        start: () => {
          s.sfx.loon()
          s.sparkle(LX, 0.9, LZ, 6)
        },
        tick: (_k, t) => {
          lulu.calling = t < 2.8 ? Math.min(1, t * 2.5) : Math.max(0, 1 - (t - 2.8) * 4)
          if (squeakT >= 0) {
            squeakT += 1 / 60
            chick.calling = Math.max(0, Math.sin(Math.min(1, squeakT / 0.7) * Math.PI))
          }
        },
        cues: [
          [1.4, () => s.sparkle(LX, 1.1, LZ, 6)],
          [3.2, () => ((squeakT = 0), chick.hop(), snd.chick())],
        ],
      },
      {
        id: 'chick',
        shot: two,
        say: Y.chick,
        sayAt: 0.2,
        start: () => {
          lulu.calling = 0
          chick.calling = 0
          squeakT = -1
          set.canoe.cheer()
          lulu.nod()
        },
      },
      {
        // The team's pink scarf goes round Lulu's neck.
        id: 'team',
        shot: { ...close(lulu, 0.35, 1.5, 0.08), tall: { fov: 44 } },
        say: Y.team,
        sayAt: 0.5,
        hold: 0.8,
        start: () => {
          lulu.scarf(true)
          s.sfx.chime()
          const h = lulu.head()
          s.sparkle(h.x, h.y - 0.1, h.z, 16)
          lulu.wave()
        },
        cues: [[0.9, () => (chick.hop(), snd.chick())]],
      },
    ]
  },
}
