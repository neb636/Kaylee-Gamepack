// The Poles' story films: "Pebble's Long Way Home" (planning/around-the-world/poles.md; docs/films.md, how films
// work). Pebble the emperor chick fell asleep in a fish crate on the scientists' red ship and woke up at the top of the
// world, where Pola the polar bear cub has never seen a penguin. Getting him home is the whole place: every game is a
// leg of the trip (or what Papa is doing meanwhile, at the bottom of the world), and a film here opens and closes it.
//
// Each film is beats on the film stage (story/stage.ts): a set, the actors on their marks, one line a beat. The usual
// camera stands on +z and looks toward -z, so an actor facing 0 degrees faces it; two talking are cheated about 30
// degrees toward the camera (chibi profiles read as the backs of heads). Lines are in lines.ts `L.story.<film>`, in
// this order. A film leaves nothing behind (the stage is thrown away), so skipping needs no clean-up.
import { Vector3 } from 'three'
import type { Beat, FilmPoint, FilmShot, V3 } from '../../../engine3d/film'
import type { FilmId } from '../activities/story/sections'
import { L } from '../lines'
import { GLOBE_AT, ICE_Y as Y, SNOW_Y, type StoryFilm, type StoryStage } from './stage'

const S = L.story
const ease = (k: number) => k * k * (3 - 2 * k)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

/** A shot: where the camera is and what it looks at, maybe moving to `to` over the beat. */
const cam = (eye: FilmPoint, look: FilmPoint, to?: { eye?: FilmPoint; look?: FilmPoint; fov?: number }, more: Partial<FilmShot> = {}): FilmShot => ({ eye, look, to, ...more })
/** A close-up of someone's face from a little to one side (`side` meters to the camera's right), `back` meters away. */
const close = (who: { head(out?: Vector3): Vector3 }, side = 0.5, back = 2.6, up = 0.12): FilmShot => ({
  eye: () => who.head(tmpA).add(tmpB.set(side, up, back)),
  look: () => who.head(tmpC),
  fov: 34,
})
const tmpA = new Vector3()
const tmpB = new Vector3()
const tmpC = new Vector3()

// ---------------------------------------------------------------- the way in

/** Pola finds a penguin at the top of the world; how he got there (the red ship, in the storybook look); Terry knows
 *  where penguins live; Sparkle's balloon can take him home. About 55 seconds. */
const intro: StoryFilm = {
  id: 'intro',
  set: 'arctic',
  beats(s) {
    const { pola, pebble, terry, crate, ship, ramp, balloon } = s
    const X = S.intro
    const now = () => {
      // The floe as it is now: the crate, Pola beside it, Pebble out of it.
      s.put(crate, 0.6, Y, 0.5, 12)
      pola.place(-0.9, Y, 1.3, 38)
      pebble.place(2.3, Y, 1.9, -28)
      pebble.cheer()
    }
    return [
      {
        id: 'top',
        shot: cam([0.5, 3.4, 14], [0, 1, 0], { eye: [0.3, 2.1, 8.6], look: [-0.2, 0.9, 0.6] }),
        say: X.top,
        sayAt: 1,
        dur: 5,
        start: () => {
          s.sfx.wind()
          s.sfx.music()
          s.put(crate, 0.6, Y, 0.5, 12)
          pola.place(-5.2, Y, -0.6, 90)
          pola.walkTo(-1.5, 0.9, 3.6, 62)
        },
      },
      {
        // The crate knocks from inside.
        id: 'knock',
        shot: cam([2.3, 1.2, 4.6], [0.2, 0.62, 0.6], { eye: [2, 1.15, 4] }),
        dur: 1.9,
        start: () => (pola.lean = 0.3),
        tick: (_k, t) => (crate.rotation.z = t > 0.4 && t < 1.7 ? Math.sin(t * 30) * 0.06 : 0),
        cues: [[0.45, () => s.sfx.crate()], [1.1, () => s.sfx.crate()], [1.2, () => pola.pull('wow')]],
      },
      {
        id: 'what',
        shot: cam([0.6, 1.35, 5.6], [0.1, 0.8, 0.8]),
        say: X.what,
        sayAt: 0.7,
        start: () => {
          crate.rotation.z = 0
          pola.lean = 0
          pebble.place(0.6, Y + 0.08, 0.5, -15)
          pebble.hop()
          s.sfx.pop()
          s.puff(0.6, Y + 0.8, 0.5, 10)
          pola.hopTo(-1.9, Y, 1.4, 0.5, 60, 0.5)
        },
      },
      {
        id: 'penguin',
        shot: close(pebble, 0.9, 2.7),
        say: X.penguin,
        start: () => pebble.hopTo(2.3, Y, 1.9, 0.7, -28, 0.7),
        cues: [[1.2, () => pebble.wave()]],
      },
      {
        id: 'never',
        shot: cam([0.5, 1.25, 6], [0.5, 0.72, 1.3]),
        say: X.never,
        start: () => pola.walkTo(-0.9, 1.3, 0.9, 38),
        cues: [[1, () => (pola.lean = 0.28)], [2.6, () => ((pola.lean = 0), pola.hop())]],
      },
      {
        id: 'papa',
        shot: close(pebble, 0.3, 2.3),
        say: X.papa,
        hold: 0.9,
        start: () => pebble.pull('sad', true),
      },
      {
        // The memory: Antarctica, the red ship at the ice edge, a ramp down, a crate that smells of fish.
        id: 'ship',
        turn: true,
        memory: true,
        shot: cam([6.5, 2.4, 6.5], [14.8, 1, -3], { eye: [8.5, 2.2, 5.4] }),
        say: X.ship,
        sayAt: 1.1,
        dur: 5.4,
        start: () => {
          s.use('antarctic')
          s.put(ship, 18.1, -0.5, -1.2, 90)
          s.put(ramp, 15.75, 0.44, -3.1)
          ramp.rotation.order = 'YXZ'
          ramp.rotation.set(-0.29, Math.PI / 2, 0)
          s.put(crate, 18, 0.96, -3.1, 90)
          pebble.place(9.5, SNOW_Y, -1.4, 90)
          pebble.cheer()
          pebble.walkTo(13.4, -3.1, 3.4, 90)
          s.colony[0].place(4.5, SNOW_Y, -3, 60)
          s.colony[1].place(3, SNOW_Y, -5.2, 30)
        },
        cues: [[3.6, () => pebble.hop()]],
      },
      {
        id: 'nap',
        memory: true,
        shot: cam([12.6, 2.3, 2.6], [17.6, 1.4, -3.1], { eye: [13.8, 2.2, 1.4] }),
        dur: 3.6,
        start: () => pebble.hopTo(15.9, 0.56, -3.1, 0.7, 90, 0.5),
        cues: [
          [0.8, () => pebble.hopTo(18, 1.02, -3.1, 0.8, 20, 0.7)],
          [1.6, () => s.sfx.crate()],
          [2, () => (pebble.pull('sad', true), s.sfx.snore())],
          [3, () => s.sfx.horn()],
        ],
      },
      {
        // The little globe: the toy ship sails from the bottom of the world to the top.
        id: 'sailed',
        turn: true,
        memory: true,
        shot: { eye: [GLOBE_AT.x, GLOBE_AT.y + 0.2, GLOBE_AT.z + 4.3], look: [GLOBE_AT.x, GLOBE_AT.y, GLOBE_AT.z], fov: 36, sway: 0.008 },
        say: X.sailed,
        sayAt: 0.7,
        dur: 5.6,
        start: () => {
          s.use('globe')
          s.sail(0)
        },
        tick: (k) => s.sail(ease(Math.min(1, k * 1.08))),
      },
      {
        // Now again (the page turns back): Terry the tern swoops in and lands on the crate.
        id: 'terry',
        turn: true,
        shot: cam([0.7, 1.5, 6.6], [0.5, 0.95, 0.9]),
        say: X.terry,
        sayAt: 2.1,
        start: () => {
          s.use('arctic')
          now()
          terry.place(8, 5.5, -5, -60)
          terry.flyTo(0.6, Y + 0.76, 0.5, 1.5, 8, 0.6, true)
          s.sfx.swoop()
        },
        cues: [[1.5, () => (pola.pull('wow'), pebble.hop())]],
      },
      {
        id: 'bottom',
        shot: close(terry, 0.45, 2.2, 0.1),
        say: X.bottom,
        cues: [[0.4, () => terry.wave()], [2.4, () => terry.hop()]],
      },
      {
        id: 'show',
        shot: cam([0.7, 1.5, 6.6], [0.5, 0.95, 0.9]),
        say: X.show,
        start: () => pola.hop(),
      },
      {
        // Sparkle's balloon comes down behind them.
        id: 'ask',
        shot: cam([3.6, 1.6, 8.4], [-1, 2.2, -1.5], { look: [-1.2, 1.6, -1.2] }),
        say: X.ask,
        sayAt: 1.4,
        hold: 1.2,
        dur: 5,
        start: () => {
          s.put(balloon.root, -3.2, 9, -2.6)
          s.sfx.burner()
          for (const a of [pola, pebble]) a.turnTo(-3.2, -6)
          terry.turnTo(-3.2, -4)
        },
        tick: (k) => (balloon.root.position.y = lerp(9, Y + 0.25, ease(Math.min(1, k * 1.5)))),
        cues: [[2.6, () => (pebble.cheer(), pebble.pull('happy'), pebble.hop(), pola.hop())], [3.2, () => s.sfx.chime()]],
      },
    ]
  },
}

// ---------------------------------------------------------------- Ice Floe Hop

/** Mama will know what to do, across the ice. Pebble can't swim yet (a chick's fluff isn't waterproof): on Pola's back. */
const floeIn: StoryFilm = {
  id: 'floe-in',
  set: 'arctic',
  beats(s) {
    const { pola, pebble, mama } = s
    const X = S.floeIn
    return [
      {
        id: 'mama',
        shot: cam([1.2, 1.5, 6.4], [0.3, 0.85, 1], { eye: [1.6, 1.9, 7.6], look: [1, 1, -3] }),
        say: X.mama,
        dur: 3.6,
        start: () => {
          s.sfx.wind()
          pola.place(-0.7, Y, 1.4, 30)
          pebble.place(1, Y, 1.5, -28)
          mama.place(4, Y, -22, 0)
        },
        cues: [[1.3, () => (pola.turnTo(4, -22), pola.wave())], [2, () => mama.wave()]],
      },
      {
        id: 'swim',
        shot: close(pebble, 0.4, 2.5),
        say: X.swim,
        start: () => {
          pola.turnTo(6, 8)
          pebble.walkTo(1.3, 2.6, 0.8, -10)
        },
        cues: [[1, () => pebble.pull('sad')]],
      },
      {
        id: 'hop',
        shot: cam([0.6, 1.3, 5.8], [0.1, 0.85, 1.3]),
        say: X.hop,
        hold: 1.3,
        start: () => {
          pola.place(-0.7, Y, 1.4, 20)
          pola.lean = 0.5
        },
        cues: [
          [1.5, () => (pebble.hopTo(-0.7, Y + 0.7, 1.2, 0.55, 20, 0.5), s.sfx.pop())],
          [2.1, () => (pebble.ride(pola.root, 0, 0.74, -0.3, 0), (pola.lean = 0), pola.hop(), pebble.pull('happy'))],
        ],
      },
    ]
  },
}

/** Mama Bear meets a penguin, warms him up, and sends Pola along to see him home. */
const floeOut: StoryFilm = {
  id: 'floe-out',
  set: 'arctic',
  beats(s) {
    const { pola, pebble, mama } = s
    const X = S.floeOut
    // Mama's wide ice, across the water.
    const bx = 4
    const bz = -22
    return [
      {
        id: 'far',
        shot: cam([bx + 0.4, 1.9, bz + 8], [bx, 1.15, bz + 0.6]),
        say: X.far,
        sayAt: 0.8,
        start: () => {
          s.sfx.wind()
          s.sfx.music('happy')
          mama.place(bx - 1.3, Y, bz, 28)
          pola.place(bx + 1.2, Y, bz + 0.5, -30)
          pebble.place(bx + 0.2, Y, bz + 1.2, -12)
          mama.pull('wow')
        },
        cues: [[1.6, () => (mama.lean = 0.25)]],
      },
      {
        id: 'hug',
        shot: cam([bx + 1.2, 1.3, bz + 5], [bx - 0.5, 0.9, bz + 0.6]),
        say: X.hug,
        sayAt: 1.2,
        start: () => {
          pebble.walkTo(bx - 0.75, bz + 0.7, 0.8, 10)
          mama.armsUp = 0.35
        },
        cues: [[0.9, () => (pebble.pull('happy', true), s.sfx.chime())]],
      },
      {
        id: 'go',
        shot: close(mama, 0.8, 5.4, 0.1),
        say: X.go,
        start: () => {
          mama.lean = 0
          mama.armsUp = 0
          mama.turnTo(bx + 1.2, bz + 3)
        },
      },
      {
        id: 'yes',
        shot: cam([bx + 0.4, 1.7, bz + 7.4], [bx, 1.1, bz + 0.6], { eye: [bx + 0.4, 2.1, bz + 9] }),
        say: X.yes,
        hold: 1,
        start: () => (pola.hop(), (pola.armsUp = 1)),
        cues: [[1.2, () => (pebble.cheer(), pebble.hop(), mama.wave())]],
      },
    ]
  },
}

// ---------------------------------------------------------------- the narwhal ride

/** The balloon is out past the icebergs, too far to hop. Up comes Nari the narwhal, the unicorn of the sea. */
const narwhalIn: StoryFilm = {
  id: 'narwhal-in',
  set: 'arctic',
  beats(s) {
    const { pola, pebble, terry, nari } = s
    const X = S.narwhalIn
    return [
      {
        id: 'far',
        shot: cam([1.4, 1.5, 7], [2.6, 0.95, 1.2]),
        say: X.far,
        start: () => {
          s.sfx.wind()
          pola.place(1.6, Y, 1.6, 40)
          pebble.place(3, Y, 2, 20)
          terry.place(4.2, Y + 2.2, 1.4, -60)
          terry.flying = true
        },
        tick: (_k, t) => (terry.pos.y = Y + 2.2 + Math.sin(t * 2) * 0.15),
      },
      {
        id: 'hop',
        shot: cam([1, 1.6, 8], [3.4, 0.9, 1.6], { eye: [0.2, 1.9, 8.6], look: [4.6, 0.7, 1.8] }),
        say: X.hop,
        start: () => (pola.turnTo(9, 6), pebble.turnTo(9, 7)),
        cues: [[1, () => pola.pull('sad')]],
      },
      {
        // The water bulges, a tusk comes up, then all of Nari.
        id: 'ride',
        shot: cam([3.4, 1.4, 8.4], [7, 0.7, 2.6]),
        say: X.ride,
        sayAt: 1.5,
        start: () => {
          s.put(nari.root, 7.6, 0, 2.6, -70)
          nari.dive = 1.6
        },
        tick: (_k, t) => (nari.dive = Math.max(0, 1.6 - t * 1.9)),
        cues: [[0.5, () => (s.splash(7.6, 2.6, 1.3), s.sfx.whale())], [0.9, () => (pola.pull('wow'), pebble.hop())]],
      },
      {
        id: 'unicorn',
        shot: close(pebble, 0.4, 2.4),
        say: X.unicorn,
        start: () => (pebble.pull('wow'), (pebble.armsUp = 0.8)),
      },
      {
        id: 'sea',
        shot: cam([4.4, 1.2, 7.4], [7.4, 0.75, 2.8], { eye: [5, 1.3, 8] }),
        say: X.sea,
        hold: 1.4,
        start: () => (pebble.armsUp = 0),
        cues: [
          [1.6, () => (pola.hopTo(7.6, 0.75, 2.4, 0.7, -70, 0.9), s.sfx.pop())],
          [2.1, () => pebble.hopTo(7.6, 0.8, 2.9, 0.7, -70, 1)],
          [2.35, () => pola.ride(nari.saddle, 0, 0, -0.25, 0)],
          [2.85, () => (pebble.ride(nari.saddle, 0, 0.05, 0.45, 0), pebble.pull('happy'), (nari.speed = 0.6))],
        ],
      },
    ]
  },
}

/** Nari drops them at the balloon, moored on the ice by the big bergs. */
const narwhalOut: StoryFilm = {
  id: 'narwhal-out',
  set: 'arctic',
  beats(s) {
    const { pola, pebble, nari, balloon } = s
    const X = S.narwhalOut
    return [
      {
        id: 'here',
        shot: cam([4, 2.4, 13], [3, 2, 0.5], { eye: [3.4, 2, 11.5] }),
        say: X.here,
        sayAt: 1.6,
        start: () => {
          s.sfx.wind()
          s.sfx.music('happy')
          s.put(balloon.root, 0.4, Y + 0.25, -0.6)
          s.put(nari.root, 16, 0, 3, -90)
          nari.speed = 0.8
          pola.ride(nari.saddle, 0, 0, -0.25, 0)
          pebble.ride(nari.saddle, 0, 0.05, 0.45, 0)
        },
        tick: (k) => {
          nari.root.position.x = lerp(16, 7.4, ease(Math.min(1, k * 1.5)))
          nari.speed = k < 0.6 ? 0.8 : 0.15
        },
        cues: [[1.5, () => s.sfx.whale()]],
      },
      {
        id: 'thanks',
        shot: cam([3.2, 1.4, 7.6], [5, 0.85, 2.4]),
        say: X.thanks,
        sayAt: 1.5,
        start: () => {
          pola.hopTo(3.4, Y, 2.2, 0.7, 60, 0.9)
          s.sfx.pop()
        },
        cues: [[0.5, () => pebble.hopTo(4.4, Y, 2.8, 0.7, 50, 1)], [1.6, () => pebble.wave()]],
      },
      {
        id: 'bye',
        shot: cam([6, 1.4, 9.4], [7.2, 0.8, 2.8]),
        say: X.bye,
        hold: 1.3,
        cues: [[2.6, () => (s.splash(7.4, 3, 1.2), s.sfx.whale())]],
        tick: (_k, t) => (nari.dive = Math.max(0, (t - 2.5) * 1.6)),
      },
    ]
  },
}

// ---------------------------------------------------------------- Snow Coats

/** Terry flies south when the snow comes and the fox turns white. But the fox is still brown. */
const coatsIn: StoryFilm = {
  id: 'coats-in',
  set: 'tundra',
  beats(s) {
    const { pola, pebble, terry, fox } = s
    const X = S.coatsIn
    return [
      {
        id: 'when',
        shot: cam([0.4, 1.5, 9.6], [0.2, 0.85, 4.4]),
        say: X.when,
        start: () => {
          s.sfx.wind()
          s.winter(false)
          pola.place(-1.4, Y, 4.6, 32)
          pebble.place(-0.1, Y, 5, 10)
          terry.place(1.5, Y, 4.5, -32)
          fox.place(7, Y, -5, -90)
          fox.walkTo(3, -3, 3.4, -15)
        },
      },
      {
        id: 'snow',
        shot: close(terry, 0.4, 2.3, 0.1),
        say: X.snow,
        cues: [[0.5, () => terry.wave()]],
      },
      {
        id: 'brown',
        shot: close(fox, -0.7, 3.2, 0.15),
        say: X.brown,
        start: () => {
          for (const a of [pola, pebble, terry]) a.turnTo(3, -3)
        },
        cues: [[1.3, () => (fox.hop(), fox.wave())]],
      },
      {
        id: 'help',
        shot: cam([0.4, 1.6, 10], [0.6, 0.9, 2]),
        say: X.help,
        hold: 0.8,
        start: () => {
          pola.place(-1.4, Y, 4.6, 32)
          pebble.place(-0.1, Y, 5, 10)
          terry.place(1.5, Y, 4.5, -32)
          s.snow(0.5, [1, 0, 1])
        },
        cues: [[1, () => (pola.hop(), pebble.hop())]],
      },
    ]
  },
}

/** The snow is here and the coats are white: winter. Time to fly south. */
const coatsOut: StoryFilm = {
  id: 'coats-out',
  set: 'tundra',
  beats(s) {
    const { pola, pebble, terry, snowfox } = s
    const X = S.coatsOut
    return [
      {
        id: 'white',
        shot: close(snowfox, -0.7, 3.2, 0.15),
        say: X.white,
        sayAt: 1,
        dur: 4,
        start: () => {
          s.sfx.wind()
          s.sfx.music('happy')
          s.winter(true)
          s.snow(1, [1, 0, 1])
          pola.place(-1.4, Y, 4.6, 32)
          pebble.place(-0.1, Y, 5, 10)
          terry.place(1.5, Y, 4.5, -32)
          snowfox.place(3, Y, -3, -15)
        },
        cues: [[0.4, () => snowfox.hop()], [1.4, () => terry.hop()]],
      },
      {
        id: 'time',
        shot: close(terry, 0.4, 2.4, 0.1),
        say: X.time,
        cues: [[0.3, () => terry.wave()]],
      },
      {
        id: 'bye',
        shot: cam([-5.5, 1.8, 8.6], [1.4, 0.8, 0.6]),
        say: X.bye,
        hold: 1.2,
        start: () => {
          for (const a of [pola, pebble]) a.turnTo(3, -3)
          pola.wave()
        },
        cues: [[0.6, () => pebble.wave()], [1.2, () => snowfox.wave()], [2.2, () => ((terry.flying = true), terry.flyTo(4, Y + 4, 12, 1.6, null, 0.4))]],
      },
    ]
  },
}

// ---------------------------------------------------------------- Penguin Slide

/** Meanwhile, at the bottom of the world: Papa calls for Pebble, asks the Adélies, and sets off to look everywhere. */
const slideIn: StoryFilm = {
  id: 'slide-in',
  set: 'antarctic',
  beats(s) {
    const { papa, adelies, colony } = s
    const X = S.slideIn
    return [
      {
        id: 'meanwhile',
        shot: cam([-6, 9, 26], [-4, 3, -20], { eye: [-3, 3, 13], look: [-1, 1.2, 0] }),
        say: X.meanwhile,
        sayAt: 0.8,
        dur: 4.4,
        start: () => {
          s.sfx.wind()
          s.sfx.music()
          papa.place(-7, SNOW_Y, -1, 90)
          papa.walkTo(-0.6, 0.4, 4.2, 15)
          colony.slice(0, 4).forEach((c, i) => c.place(-12 - i * 1.5, SNOW_Y, -8 - (i % 2) * 1.6, 40 + i * 20))
          adelies[0].place(2.2, SNOW_Y, 1, -40)
          adelies[1].place(3.3, SNOW_Y, 0.2, -50)
        },
      },
      {
        id: 'call',
        shot: close(papa, 0.8, 4.8, 0.1),
        say: X.call,
        start: () => (papa.armsUp = 0.5),
        cues: [[0.2, () => s.sfx.call()], [1.6, () => ((papa.headTurn = 0.6), 0)], [2.4, () => (papa.headTurn = -0.6)]],
      },
      {
        // He asks the Adélies: they look at each other and shake their heads.
        id: 'seen',
        shot: cam([1, 1.4, 6.4], [1.2, 0.8, 0.6]),
        say: X.seen,
        start: () => {
          papa.armsUp = 0
          papa.headTurn = 0
          papa.turnTo(2.6, 0.8)
          papa.root.rotation.y -= 0.5
        },
        cues: [[2, () => (adelies[0].shake(), adelies[1].shake())], [2.6, () => papa.pull('sad')]],
      },
      {
        id: 'look',
        shot: cam([-1.6, 1.5, 5.2], [-0.5, 1.1, 0.4], { eye: [-2.2, 1.7, 6.4] }),
        say: X.look,
        hold: 1.8,
        start: () => papa.place(-0.6, SNOW_Y, 0.4, 10),
        cues: [[0.3, () => papa.hop()], [4.6, () => papa.slideTo(9, 6, 1.4)]],
      },
    ]
  },
}

/** No Pebble in the sea. But Papa caught his favorite supper, and keeps it for when he's home. */
const slideOut: StoryFilm = {
  id: 'slide-out',
  set: 'antarctic',
  beats(s) {
    const { papa, adelies, krill } = s
    const X = S.slideOut
    return [
      {
        id: 'none',
        shot: cam([8.4, 1.6, 7.4], [11, 1, 1], { eye: [9.2, 1.5, 6.4] }),
        say: X.none,
        sayAt: 1.3,
        start: () => {
          s.sfx.wind()
          s.sfx.music()
          papa.place(15.6, SNOW_Y, 1.4, -90)
          papa.hopTo(12, SNOW_Y, 1, 0.8, -20, 1.2)
          s.splash(16.8, 1.4, 1)
          adelies[0].place(8.6, SNOW_Y, 0.2, 50)
          adelies[1].place(7.8, SNOW_Y, 1.5, 60)
        },
        cues: [[0.9, () => papa.shake()], [1.6, () => papa.pull('sad')]],
      },
      {
        id: 'supper',
        shot: cam([10.6, 1.1, 5.4], [11.4, 0.6, 1.6]),
        say: X.supper,
        start: () => {
          s.put(krill, 11, SNOW_Y, 2.1)
          papa.lean = 0.35
          s.sfx.pop()
        },
        cues: [[1.2, () => (adelies[0].hop(), adelies[1].hop())]],
      },
      {
        id: 'soon',
        shot: cam([10.8, 1.2, 5.6], () => papa.head(tmpC), { eye: [11.6, 0.9, 4.6] }, { fov: 34 }),
        say: X.soon,
        hold: 1.6,
        start: () => {
          papa.lean = -0.12
          papa.headTurn = 0
        },
      },
    ]
  },
}

// ---------------------------------------------------------------- Emperor Huddle

/** Winter at the South Pole: the long night. Papa waits with the other dads and remembers the night Pebble hatched
 *  (the game that follows is that memory). */
const huddleIn: StoryFilm = {
  id: 'huddle-in',
  set: 'night',
  beats(s) {
    const { papa, colony } = s
    const X = S.huddleIn
    const huddle = () => colony.forEach((c, i) => c.place(-3.6 + (i % 3) * 1.15 + (i > 2 ? 0.5 : 0), SNOW_Y, -1.6 - Math.floor(i / 3) * 1.1, 20 - i * 8))
    return [
      {
        id: 'dark',
        shot: cam([2, 4.5, 16], [0, 14, -60], { eye: [1, 2, 10], look: [-1, 1.2, -1] }),
        say: X.dark,
        sayAt: 1,
        dur: 5.4,
        start: () => {
          s.sfx.wind(true)
          s.sfx.music()
          s.snow(0.6, [-1, 0, 0])
          huddle()
          papa.place(0.4, SNOW_Y, 0.2, 8)
        },
      },
      {
        id: 'wait',
        shot: close(papa, 0.8, 4.8, 0.1),
        say: X.wait,
        start: () => (papa.lean = -0.14),
      },
      {
        id: 'remember',
        shot: cam([1.8, 1.5, 5.4], () => papa.head(tmpC), { eye: [1.2, 1.4, 4.2] }, { fov: 34 }),
        say: X.remember,
        hold: 1.4,
        start: () => ((papa.lean = 0.1), papa.pull('happy')),
        cues: [[2.2, () => s.aurora.flare()]],
      },
    ]
  },
}

/** He kept him warm all winter. The sun comes back at last, and there's something in the sky. */
const huddleOut: StoryFilm = {
  id: 'huddle-out',
  set: 'night',
  beats(s) {
    const { papa, colony, balloon } = s
    const X = S.huddleOut
    let dawn = 0
    return [
      {
        id: 'warm',
        shot: close(papa, 0.8, 4.8, 0.1),
        say: X.warm,
        start: () => {
          s.sfx.wind(true)
          s.sfx.music()
          colony.forEach((c, i) => c.place(-3.6 + (i % 3) * 1.15 + (i > 2 ? 0.5 : 0), SNOW_Y, -1.6 - Math.floor(i / 3) * 1.1, 20 - i * 8))
          papa.place(0.4, SNOW_Y, 0.2, 8)
        },
      },
      {
        // The first sunrise in months.
        id: 'sun',
        shot: cam([3.4, 1.6, 8], [-3, 2.4, -20], { look: [-6, 3.4, -30] }),
        say: X.sun,
        sayAt: 1.4,
        dur: 5,
        start: () => {
          papa.turnTo(-30, -80)
          colony.forEach((c) => c.turnTo(-30, -80))
        },
        tick: (k) => s.dawn((dawn = ease(k))),
        cues: [[2.6, () => colony.forEach((c, i) => i % 2 && c.hop())]],
      },
      {
        // A dot in the sky: pink and lavender, getting bigger.
        id: 'dot',
        shot: cam([2.6, 1.5, 6.6], [-8, 8, -40], { look: [-10, 11, -50], fov: 26 }, { fov: 36 }),
        say: X.dot,
        sayAt: 1,
        hold: 1.6,
        start: () => {
          s.dawn(Math.max(dawn, 1))
          s.put(balloon.root, -30, 34, -150)
          papa.lean = -0.2
          papa.pull('wow')
        },
        tick: (k) => balloon.root.position.set(lerp(-30, -22, k), lerp(34, 26, k), lerp(-150, -110, k)),
      },
    ]
  },
}

// ---------------------------------------------------------------- the finale

/** All aboard: Pola and Pebble in the basket, Mama waving, Terry out in front. The balloon lifts off the ice. */
const homeIn: StoryFilm = {
  id: 'home-in',
  set: 'arctic',
  beats(s) {
    const { pola, pebble, mama, terry, balloon } = s
    const X = S.homeIn
    const bx = 4
    const bz = -22
    let up = 0
    return [
      {
        id: 'aboard',
        shot: cam([bx + 1, 2, bz + 11], [bx + 0.6, 2, bz], { eye: [bx + 0.6, 1.7, bz + 8.4] }),
        say: X.aboard,
        sayAt: 0.8,
        start: () => {
          s.sfx.wind()
          s.sfx.music('happy')
          s.put(balloon.root, bx + 1.6, Y + 0.25, bz)
          pola.ride(balloon.basket, ...balloon.seat(0), 0)
          pebble.ride(balloon.basket, ...balloon.seat(1), 0)
          pebble.root.position.y += 0.3
          mama.place(bx - 1.9, Y, bz + 1, 40)
          terry.place(bx + 4.4, Y + 2.6, bz + 2, -50)
          terry.flying = true
        },
        cues: [[1.2, () => pola.wave()], [1.6, () => pebble.wave()]],
      },
      {
        id: 'bye',
        shot: close(mama, 0.7, 3.8, 0.1),
        say: X.bye,
        start: () => (mama.wave(), (mama.armsUp = 0.2)),
        cues: [[1.7, () => mama.wave()]],
      },
      {
        // Up she goes; Terry leads the way.
        id: 'follow',
        shot: cam([bx - 3, 1.6, bz + 11], () => tmpC.copy(balloon.root.position).setY(balloon.root.position.y + 2.4), { eye: [bx - 4, 1.4, bz + 13] }, { fov: 40 }),
        say: X.follow,
        sayAt: 0.9,
        hold: 1.6,
        dur: 5,
        start: () => {
          s.sfx.burner()
          mama.armsUp = 0
          terry.flyTo(bx + 9, Y + 9, bz + 6, 4.6, null, 0.6)
        },
        tick: (k) => {
          up = ease(k)
          balloon.root.position.set(bx + 1.6 + up * 3, Y + 0.25 + up * 9, bz + up * 3)
        },
        cues: [[1.4, () => mama.wave()], [3, () => mama.wave()]],
      },
    ]
  },
}

/** The balloon lands in Antarctica. Pola finds ground under the ice, the penguins find a polar bear, and Pebble can't
 *  tell which penguin is Papa: every papa has his own song (the game that follows). */
const homeLand: StoryFilm = {
  id: 'home-land',
  set: 'antarctic',
  beats(s) {
    const { pola, pebble, papa, colony, balloon } = s
    const X = S.homeLand
    return [
      {
        id: 'land',
        shot: cam([3, 2, 12], [0, 4, -2], { look: [0, 1.6, -1] }),
        say: X.land,
        sayAt: 1.6,
        dur: 4.6,
        start: () => {
          s.sfx.wind()
          s.sfx.music('happy')
          s.put(balloon.root, 0, 9, -2)
          pola.ride(balloon.basket, ...balloon.seat(0), 0)
          pebble.ride(balloon.basket, ...balloon.seat(1), 0)
          pebble.root.position.y += 0.3
          colony.forEach((c, i) => c.place(-9 - (i % 3) * 1.3, SNOW_Y, -2 - Math.floor(i / 3) * 1.4 + (i % 2) * 0.4, 70))
          papa.place(-10.4, SNOW_Y, 0.2, 70)
        },
        tick: (k) => (balloon.root.position.y = lerp(9, SNOW_Y + 0.25, ease(Math.min(1, k * 1.4)))),
        cues: [[3.3, () => (s.puff(0, 0.1, -2, 20), s.sfx.thump())]],
      },
      {
        // Pola hops out and stamps: this ice has ground under it.
        id: 'ground',
        shot: cam([2.6, 1.3, 5.6], [1.6, 0.7, 0.8]),
        say: X.ground,
        sayAt: 1.3,
        start: () => {
          pola.hopTo(1.7, SNOW_Y, 0.8, 0.7, -10, 0.9)
          s.sfx.pop()
        },
        cues: [[0.9, () => (pola.hop(), s.sfx.thump())], [1.5, () => (pola.hop(), s.sfx.thump())], [0.6, () => pebble.hopTo(0.5, SNOW_Y, 1.5, 0.7, -5, 0.9)]],
      },
      {
        // The colony waddles up, sees her, and all jump back at once.
        id: 'what',
        shot: cam([-1, 1.7, 8.4], [-3, 1.1, 0]),
        say: X.what,
        sayAt: 1.9,
        start: () => {
          colony.forEach((c, i) => c.walkTo(-3.4 - (i % 3) * 1.25, -0.6 - Math.floor(i / 3) * 1.3 + (i % 2) * 0.4, 1.6, 78))
          papa.walkTo(-3.2, 1.2, 1.6, 74)
          pola.turnTo(-4, 0.5)
        },
        cues: [
          [1.7, () => (s.sfx.gasp(), colony.forEach((c) => (c.hopTo(c.pos.x - 0.7, SNOW_Y, c.pos.z, 0.4, 78, 0.5), c.pull('wow'))), papa.hopTo(-3.9, SNOW_Y, 1.2, 0.4, 74, 0.5), papa.pull('wow'))],
        ],
      },
      {
        id: 'bear',
        shot: close(pola, -0.9, 3.2),
        say: X.bear,
        start: () => ((pola.root.rotation.y = -0.5), pola.wave(), pola.pull('happy')),
      },
      {
        // Pebble looks along the row: every one of them is tall, black and white.
        id: 'same',
        shot: cam([-0.2, 1.2, 5], [-2.6, 1.1, 0.4], { look: [-5.2, 1.1, -0.6] }),
        say: X.same,
        sayAt: 0.6,
        start: () => {
          pebble.walkTo(-1, 1.4, 0.8, -78)
          colony.forEach((c) => c.cheer())
        },
        cues: [[1.4, () => pebble.pull('sad')]],
      },
      {
        id: 'song',
        shot: cam([0.4, 2, 9.4], [-2.6, 1.1, 0]),
        say: X.song,
        hold: 1,
        cues: [[1.2, () => (s.sfx.call(), colony[1].hop())], [2.4, () => (s.sfx.call(), colony[4].hop())]],
      },
    ]
  },
}

/** Papa and Pebble, together. A polar bear at the South Pole. The southern lights; and Terry has a quiz. */
const homeReunion: StoryFilm = {
  id: 'home-reunion',
  set: 'antarctic',
  beats(s) {
    const { pola, pebble, papa, terry, colony } = s
    const X = S.homeReunion
    const crowd = () => colony.forEach((c, i) => c.place(-4.6 - (i % 3) * 1.25, SNOW_Y, -1.6 - Math.floor(i / 3) * 1.3, 62))
    return [
      {
        id: 'pebble',
        shot: cam([-0.6, 1.5, 6.4], [-1.4, 0.95, 1]),
        say: X.pebble,
        sayAt: 0.5,
        start: () => {
          s.sfx.wind()
          s.sfx.music('happy')
          crowd()
          papa.place(-2.4, SNOW_Y, 1, 60)
          pebble.place(-1.5, SNOW_Y, 1.2, -60)
          pola.place(2.8, SNOW_Y, 0.6, -40)
          papa.armsUp = 0.6
        },
        cues: [[0.4, () => (s.sfx.chime(), pebble.pull('happy', true), papa.pull('happy', true), (papa.lean = 0.3))]],
      },
      {
        id: 'papa',
        shot: close(pebble, 0.5, 2.3),
        say: X.papa,
        start: () => ((pebble.armsUp = 0.9), pebble.hop()),
      },
      {
        id: 'friend',
        shot: cam([0.4, 1.4, 6.6], [0.4, 0.9, 0.9]),
        say: X.friend,
        start: () => {
          pebble.armsUp = 0
          papa.lean = 0
          papa.armsUp = 0
          pebble.turnTo(2.8, 0.6)
          pola.walkTo(1, 0.9, 1, -50)
        },
        cues: [[1.4, () => pola.wave()]],
      },
      {
        id: 'thanks',
        shot: close(papa, 0.9, 4.8, 0.1),
        say: X.thanks,
        start: () => papa.turnTo(1, 2.5),
        cues: [[2.6, () => (papa.lean = 0.4)], [3.4, () => (papa.lean = 0)]],
      },
      {
        id: 'quiz',
        shot: cam([0.6, 1.6, 7.6], [0, 1.2, 1]),
        say: X.quiz,
        sayAt: 1.5,
        hold: 1,
        start: () => {
          for (const a of [pola, pebble, papa]) a.turnTo(0.4, 12)
          colony.forEach((c, i) => i % 2 && c.hop())
          s.sfx.chime()
          terry.place(7, 5, -3, -70)
          terry.flyTo(0.3, SNOW_Y + 1.5, 1.6, 1.3, 0, 0.5)
          s.sfx.swoop()
        },
        tick: (_k, t) => t > 1.3 && (terry.pos.y = SNOW_Y + 1.5 + Math.sin(t * 2.4) * 0.12),
        cues: [[3, () => (pola.hop(), pebble.hop())]],
      },
    ]
  },
}

/** Every film, by id. */
export const FILMS = {
  intro,
  'floe-in': floeIn,
  'floe-out': floeOut,
  'narwhal-in': narwhalIn,
  'narwhal-out': narwhalOut,
  'coats-in': coatsIn,
  'coats-out': coatsOut,
  'slide-in': slideIn,
  'slide-out': slideOut,
  'huddle-in': huddleIn,
  'huddle-out': huddleOut,
  'home-in': homeIn,
  'home-land': homeLand,
  'home-reunion': homeReunion,
} satisfies Record<FilmId, StoryFilm>
export type { FilmId }

// (Types the films use, re-exported for a game that adds a beat of its own.)
export type { Beat, StoryStage, V3 }
