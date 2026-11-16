// The films of the Poles' new ending, The Longest Night (planning/around-the-world/poles-ending.md, the script; the
// chapter's runner is activities/night/Night.tsx). Same stage and rules as story/films.ts: a set, the actors on their
// marks, one line a beat (lines.ts `L.night`), the usual camera on +z looking toward -z.
//   night-in       time to fly: the white fox, Mama's goodbye, Nari can't come, down the little globe, Papa waits
//   night-lost     the storm: the balloon comes down in the whiteout; the memory of the night Pebble hatched
//   night-colony   so many papas: the huddle of hundreds; Pola lets Pebble go the last bit on his own
//   night-sunrise  the reunion as the first sun in months comes up; a polar bear at the South Pole
//   night-goodbye  a pebble for Pola
//   the-end        top and bottom of the world at once, split screen: "They never meet..." "Except best friends!"
import { Vector3 } from 'three'
import { sayAlong } from '../../../../sdk'
import { lerp, smooth as ease } from '../../../../sdk/math'
import { L } from '../lines'
import { sing, TUNES } from '../activities/party/sounds'
import { cam, close, tmpC } from './shots'
import { ICE_Y as Y, SNOW_Y, type StoryFilm } from './stage'

const N = L.night
const tmpD = new Vector3()

// ---------------------------------------------------------------- night-in

/** The fox is white: time to fly. Mama's goodbye, the balloon lifts, Nari can't come. Down the little globe into the
 *  dark, where Papa waits in the long night and hums his song into the wind. About 40 seconds. */
const nightIn: StoryFilm = {
  id: 'night-in',
  set: 'tundra',
  beats(s) {
    const { pola, mama, terry, snowfox, balloon, nari, papa } = s
    const X = N.in
    const bx = 3.2
    const bz = 1.2
    let up = 0
    return [
      {
        // The autumn tundra under fresh snow; the fox, all white now, pounces in a drift.
        id: 'fox',
        shot: cam([1, 2.4, 11], [-1, 0.6, -3], { eye: [0.4, 1.6, 8.4] }),
        say: X.fox,
        sayAt: 1.8,
        dur: 4.6,
        start: () => {
          s.winter(true)
          s.snow(0.4, [0, 0, -2])
          s.sfx.wind()
          s.sfx.music('happy')
          snowfox.place(-2.6, Y, 1.2, 30)
          snowfox.hopTo(-1.2, Y, 2.6, 0.8, 20, 0.9)
          terry.place(4, 4, -2, -60)
          terry.flying = true
          terry.flyTo(-0.2, Y + 1.4, 1.4, 1.4, 10, 0.5, false)
          s.put(balloon.root, bx, Y + 0.25, bz, 0)
          mama.place(bx - 1.6, Y, bz + 0.6, 30)
          pola.place(bx - 0.7, Y, bz + 0.9, -30)
        },
        cues: [[0.8, () => (s.puff(-1.2, Y, 2.6, 16), s.sfx.thump())], [2.2, () => snowfox.hopTo(-0.4, Y, 1.8, 0.7, 40, 0.8)]],
      },
      {
        // Mama hugs Pola at the balloon.
        id: 'bye',
        shot: close(mama, 0.8, 4.2, 0.1),
        say: X.bye,
        start: () => {
          terry.hide()
          snowfox.hide()
          mama.armsUp = 0.7
          pola.armsUp = 0.7
          // (Cheated toward the camera: a hug in profile reads as two backs of heads.)
          mama.root.rotation.y = 0.75
          pola.root.rotation.y = -0.7
        },
      },
      {
        id: 'promise',
        shot: close(pola, -0.6, 2.8),
        say: X.promise,
        start: () => {
          mama.armsUp = 0
          pola.armsUp = 0
          pola.root.rotation.y = -0.4
          pola.pull('happy')
        },
      },
      {
        // Up she goes, Pola in the basket, Mama waving below.
        id: 'lift',
        shot: cam([bx - 3, 1.6, bz + 10], () => tmpC.copy(balloon.root.position).setY(balloon.root.position.y + 2.4), { eye: [bx - 4, 1.4, bz + 12] }, { fov: 40 }),
        dur: 3.4,
        start: () => {
          s.sfx.burner()
          pola.ride(balloon.basket, ...balloon.seat(0), 0)
          mama.place(bx - 1.9, Y, bz + 0.8, 30)
        },
        tick: (k) => {
          up = ease(k)
          balloon.root.position.set(bx + up * 2, Y + 0.25 + up * 7, bz - up * 2)
        },
        cues: [[0.6, () => mama.wave()], [2, () => mama.wave()]],
      },
      {
        // At the ice edge, Nari bursts up and spins as the balloon goes over.
        id: 'nari',
        shot: cam([2.4, 2.4, 9], [0, 2.2, -1], { eye: [1.6, 2, 7.6] }),
        say: X.nari,
        sayAt: 1.2,
        start: () => {
          s.use('arctic')
          s.put(nari.root, 0, 0, 0.5, 30)
          nari.dive = 0
          s.put(balloon.root, -6, 9, -6)
          pola.ride(balloon.basket, ...balloon.seat(0), 0)
          s.splash(0, 0.5, 1.4)
        },
        tick: (k, t) => {
          nari.root.position.y = Math.sin(Math.min(1, t * 1.5) * Math.PI) * 0.8
          nari.root.rotation.y = 0.5 + t * 2.4
          balloon.root.position.set(lerp(-6, 6, k), 9 + Math.sin(t) * 0.2, -6)
        },
      },
      {
        id: 'aboard',
        shot: cam([0, 6, 14], () => tmpC.copy(balloon.root.position).setY(balloon.root.position.y + 2), undefined, { fov: 38, blend: 0.6 }),
        say: X.aboard,
        sayAt: 0.5,
        start: () => {
          nari.root.visible = false
          s.put(balloon.root, 4, 9, -6)
          terry.place(9, 12, -6, -90)
          terry.flying = true
        },
        tick: (k) => {
          balloon.root.position.set(lerp(4, 10, k), lerp(9, 12, k), -6)
          terry.pos.set(lerp(9, 16, k), 12.5, -6)
        },
      },
      {
        // Down the little globe, into the dark.
        id: 'meanwhile',
        shot: cam(() => tmpC.set(0, 400.3, 3.2), () => tmpD.set(0, 400.3, 0), { eye: [0, 399.2, 3], look: [0, 399.4, 0] }),
        say: X.meanwhile,
        sayAt: 1,
        dur: 4.4,
        start: () => {
          s.use('globe')
          s.sail(0.7)
        },
        tick: (k) => s.sail(0.7 - k * 0.7),
      },
      {
        // The long night: a huddle of dads under the stars, Papa at the windy edge, looking up.
        id: 'wait',
        shot: cam([2.6, 1.8, 7], () => papa.head(tmpC), { eye: [1.6, 1.5, 4.6] }, { fov: 34 }),
        say: X.wait,
        sayAt: 1.6,
        start: () => {
          s.use('night')
          s.sfx.stop()
          s.sfx.wind(true)
          s.sfx.music()
          s.snow(0.5, [-1, 0, -2])
          s.showHuddle(-3, -5, 4.2, 15)
          papa.place(0.6, SNOW_Y, 0, 10)
          papa.lean = -0.18
        },
      },
      {
        // He hums his song into the wind, alone; the wind carries it away.
        id: 'hum',
        shot: cam([3.4, 1.2, 6.4], [0.4, 1.6, -2], { eye: [3.8, 1.6, 8], look: [-2, 3, -10] }),
        dur: 4.6,
        start: () => {
          papa.lean = -0.1
          sing(TUNES[0], 'papa', 0, 0.6)
        },
        cues: [[2.4, () => s.aurora.flare()]],
      },
    ]
  },
}

// ---------------------------------------------------------------- night-lost

/** A gust, the flame gutters out, the balloon sinks into deep snow. White everywhere. Pebble loses hope; Pola holds
 *  him. The memory: the night he hatched, Papa's song (the 3D huddle's hatch, on the stage). "Then we'll ALL sing
 *  it!" About 40 seconds. */
const nightLost: StoryFilm = {
  id: 'night-lost',
  set: 'blizzard',
  beats(s) {
    const { pola, pebble, terry, balloon, papa, colony } = s
    const X = N.lost
    let tip = 0
    const down = () => {
      // Where they are after the landing: the balloon on its side, the friends by it in the snow.
      s.put(balloon.root, -1.6, SNOW_Y - 0.1, -1.4, 20)
      balloon.root.rotation.z = 1.1
      pola.place(0.6, SNOW_Y, 0.4, -20)
      pebble.place(1.5, SNOW_Y, 0.9, -30)
      terry.place(-0.4, SNOW_Y, 0.8, 30)
      terry.flying = false
    }
    return [
      {
        id: 'down',
        shot: cam([2, 2.6, 11], [-1, 3, -1], { look: [-1, 0.8, -1] }),
        dur: 4.2,
        start: () => {
          s.sfx.blizzard()
          s.sfx.gust()
          s.snow(2.4, [0, 0, 0])
          s.put(balloon.root, -1.6, 8, -1.4)
          pola.ride(balloon.basket, ...balloon.seat(0), 0)
          pebble.ride(balloon.basket, ...balloon.seat(1), 0)
          pebble.root.position.y += 0.3
        },
        tick: (k) => {
          tip = ease(Math.min(1, k * 1.25))
          balloon.root.position.y = lerp(8, SNOW_Y - 0.1, tip)
        },
        cues: [[3.3, () => (s.sfx.thump(), s.puff(-1.6, 0, -1.4, 30), down())]],
      },
      {
        id: 'terry',
        shot: close(terry, 0.4, 2.2),
        say: X.terry,
        start: () => {
          down()
          terry.pull('sad')
          terry.shake()
        },
      },
      {
        // Pebble, very small in the snow.
        id: 'how',
        shot: cam([2.8, 1.4, 4.4], () => pebble.head(tmpC), undefined, { fov: 40 }),
        say: X.how,
        sayAt: 0.8,
        start: () => {
          pebble.pull('sad', true)
          pebble.turnTo(4, 6)
        },
      },
      {
        // Pola wraps him in a hug.
        id: 'friends',
        shot: cam([1.6, 1.3, 4.4], [1, 0.8, 0.6]),
        say: X.friends,
        start: () => {
          pola.walkTo(1.1, 0.9, 0.6, -30)
          pebble.cheer()
        },
        cues: [[0.6, () => (pola.armsUp = 0.7)]],
      },
      {
        // The memory, in the storybook look: the night he hatched. Papa bends to the newborn.
        id: 'song',
        turn: true,
        memory: true,
        shot: cam([1.4, 1.2, 4.4], [0, 0.8, 0]),
        say: X.song,
        sayAt: 0.8,
        start: () => {
          s.use('night')
          s.snow(0.2, [0, 0, -1])
          s.showHuddle(-1, -5, 3.6, 10)
          colony.forEach((c, i) => c.place(-2.8 + (i % 3) * 1.1, SNOW_Y, -1.6 - Math.floor(i / 3) * 1.1, 20 - i * 6))
          papa.place(0, SNOW_Y, 0, 10)
          papa.lean = 0.35
          pebble.place(0.08, SNOW_Y, 0.55, 180)
          pebble.root.scale.setScalar(0.62)
          pebble.pull('wow')
          s.sfx.crack()
        },
      },
      {
        id: 'peep',
        memory: true,
        shot: cam([0.9, 0.7, 2.4], [0.1, 0.5, 0.4]),
        dur: 4.2,
        start: () => sing(TUNES[0], 'papa', 0, 0.7),
        cues: [[2.2, () => (sing(TUNES[0], 'chick', 0, 0.6), pebble.hop())]],
      },
      {
        id: 'always',
        memory: true,
        shot: close(papa, 0.6, 3),
        say: X.always,
        start: () => (papa.pull('happy'), (papa.lean = 0.15)),
      },
      {
        // Back in the storm.
        id: 'sing',
        turn: true,
        shot: cam([2.4, 1.2, 4.4], () => pebble.head(tmpC), undefined, { fov: 40 }),
        say: X.sing,
        start: () => {
          s.use('blizzard')
          s.snow(2.4, [0, 0, 0])
          s.sfx.gust()
          pebble.root.scale.setScalar(1)
          down()
          pola.place(1.1, SNOW_Y, 0.6, -30)
          pebble.pull('happy')
          pebble.hop()
        },
      },
      {
        // He peeps it, tiny; the wind tears the notes away.
        id: 'windy',
        shot: close(pebble, 0.5, 2.4),
        say: X.windy,
        sayAt: 2.4,
        start: () => {
          sing(TUNES[0], 'chick', 0, 0.35)
          s.sfx.gust()
        },
        cues: [[2, () => pebble.pull('sad', true)]],
      },
      {
        // Pola stands up tall, Terry on her head.
        id: 'all',
        shot: cam([0.4, 1.1, 5.2], [0.9, 1.1, 0.4]),
        say: X.all,
        sayAt: 0.9,
        hold: 1,
        start: () => {
          pebble.cheer()
          pola.armsUp = 0
          pola.place(1.1, SNOW_Y, 0.6, -10)
          terry.flyTo(1.1, SNOW_Y + pola.height + 0.02, 0.62, 0.8, -10, 0.5, true)
          terry.flying = true
        },
        cues: [[0.9, () => (pola.armsUp = 1, pola.pull('happy'))]],
      },
    ]
  },
}

// ---------------------------------------------------------------- night-colony

/** Over the hill, in the dark: a huddle of hundreds of dads, steaming. They all look the same. Gold notes rise from
 *  deep inside; the dads near Pola shuffle away (shy of a bear). She lifts Pebble down. About 20 seconds. */
const nightColony: StoryFilm = {
  id: 'night-colony',
  set: 'night',
  beats(s) {
    const { pola, pebble, terry, colony } = s
    const X = N.colony
    const front = () => colony.forEach((c, i) => c.place(-2.6 + i * 1.05, SNOW_Y, -3.6 - (i % 2) * 0.6, 0))
    return [
      {
        id: 'whoa',
        shot: cam([1.4, 3.6, 7], [0, 0.6, -6], { eye: [1, 3, 5.6] }),
        say: X.whoa,
        sayAt: 1.2,
        start: () => {
          s.sfx.wind(true)
          s.sfx.colony()
          s.snow(0.3, [0, 0, -4])
          s.showHuddle(0, -9, 6.5, 0)
          front()
          pola.place(0.4, SNOW_Y, 1.6, 180)
          pebble.ride(pola.root, 0, 0.72 * (pola.height / 1.1), -0.28, 180)
          terry.ride(pola.root, 0.16, pola.height - 0.04, 0.1, 160)
        },
      },
      {
        id: 'same',
        shot: close(pebble, 0.5, 2.4),
        say: X.same,
        start: () => pebble.pull('wow'),
      },
      {
        // Gold notes deep inside; the dads near Pola squeeze together and shuffle away.
        id: 'shy',
        shot: cam([0.6, 2.4, 5.6], [0, 0.8, -4]),
        say: X.shy,
        sayAt: 1.4,
        start: () => {
          sing(TUNES[0], 'papa', -0.2, 0.4)
          s.sfx.gasp()
          colony.forEach((c) => c.walkTo(c.pos.x * 1.1, c.pos.z - 1.2, 1.4, 0))
        },
        cues: [[0.5, () => colony.forEach((c) => c.pull('wow'))]],
      },
      {
        // Pola kneels and lifts Pebble down from her back.
        id: 'go',
        shot: cam([1.6, 1.1, 4.4], [0.6, 0.7, 1]),
        say: X.go,
        sayAt: 1.2,
        hold: 1,
        start: () => {
          pola.lean = 0.4
          pebble.release()
          pebble.hopTo(0.9, SNOW_Y, 0.8, 0.6, 160, 0.4)
        },
        cues: [[1, () => ((pola.lean = 0), pola.wave())], [2.4, () => pebble.walkTo(1.1, -1, 2, 180)]],
      },
    ]
  },
}

// ---------------------------------------------------------------- night-sunrise

/** Pebble on Papa's feet. The first sunrise in months as they meet; a polar bear comes over the hill; everyone sings
 *  Papa's song, the whole colony too. About 50 seconds. */
const nightSunrise: StoryFilm = {
  id: 'night-sunrise',
  set: 'dawn',
  beats(s) {
    const { pola, pebble, papa, terry, colony } = s
    const X = N.sunrise
    let dawn = 0
    const sunAt = (k: number) => s.put(s.sunDisc, -30, lerp(-6, 9, k), -150)
    return [
      {
        id: 'pebble',
        shot: cam([0.3, 1.5, 4.6], [0, 1, 0.2]),
        say: X.pebble,
        sayAt: 0.6,
        start: () => {
          s.sfx.wind(true)
          s.sfx.music('happy')
          s.showHuddle(0, -9, 4.6, 0)
          colony.forEach((c, i) => c.place(-3.4 + (i % 3) * 3.4 + (i > 2 ? 1.4 : 0), SNOW_Y, -3 - Math.floor(i / 3) * 1.4, 0))
          papa.place(0, SNOW_Y, 0, 0)
          pebble.ride(papa.root, 0, 0.06, 0.34 * papa.height, 0)
          pebble.root.scale.setScalar(0.85)
          papa.lean = 0.3
          papa.pull('happy', true)
          pebble.pull('happy', true)
          sunAt(0)
        },
      },
      {
        id: 'papa',
        shot: cam([0.9, 0.75, 2.8], () => pebble.head(tmpC), undefined, { fov: 34 }),
        say: X.papa,
        start: () => (pebble.armsUp = 0.8),
      },
      {
        id: 'heard',
        shot: close(papa, 0.6, 3),
        say: X.heard,
        start: () => ((pebble.armsUp = 0), (papa.lean = 0.15)),
      },
      {
        // A thin line of gold on the horizon; light runs across the snow, every penguin lifts its head.
        id: 'sun',
        shot: cam([3.6, 1.4, 7.6], [-4, 2, -24], { look: [-8, 4, -40] }),
        say: X.sun,
        sayAt: 1.6,
        dur: 6,
        start: () => {
          s.sfx.hug()
          papa.turnTo(-30, -150)
          colony.forEach((c) => c.turnTo(-30, -150))
        },
        tick: (k) => {
          dawn = ease(k)
          s.dawn(dawn)
          sunAt(dawn)
        },
        cues: [[2.6, () => colony.forEach((c, i) => i % 2 && c.hop())]],
      },
      {
        // Over the hill: Pola, Terry on her head. The dads gasp.
        id: 'what',
        shot: cam([0.5, 1.6, 6.4], [0.8, 1, -0.4]),
        say: X.what,
        sayAt: 1.6,
        start: () => {
          s.dawn(1)
          sunAt(1)
          pola.place(5, SNOW_Y, 1.4, -70)
          pola.walkTo(2.6, 0.8, 1.4, -60)
          terry.ride(pola.root, 0.16, pola.height - 0.04, 0.1, 160)
          papa.turnTo(2.6, 0.8)
        },
        cues: [[1.4, () => (s.sfx.gasp(), colony.forEach((c) => (c.pull('wow'), c.hop())), papa.pull('wow'))]],
      },
      {
        id: 'bear',
        shot: close(pola, -0.8, 3.2),
        say: X.bear,
        start: () => (pola.wave(), pola.pull('happy')),
      },
      {
        id: 'friend',
        shot: cam([1.6, 1.2, 4.6], [1.2, 0.8, 0.4]),
        say: X.friend,
        start: () => pebble.turnTo(2.6, 0.8),
      },
      {
        id: 'thanks',
        shot: close(papa, 0.9, 4.4, 0.1),
        say: X.thanks,
        cues: [[2.2, () => (papa.lean = 0.4)], [3, () => (papa.lean = 0.15)]],
      },
      {
        id: 'friends',
        shot: close(pola, -0.6, 3),
        say: X.friends,
        start: () => ((pola.armsUp = 1), pola.hop()),
        cues: [[1.2, () => (pola.armsUp = 0)]],
      },
      {
        // Papa sings his song, Pebble joins in, Pola growls along, Terry whistles; the whole colony hums it.
        id: 'song',
        shot: cam([1, 2, 9], [0.6, 1, -1], { eye: [1.6, 3.4, 13], look: [0, 1.4, -4] }),
        dur: 7,
        start: () => {
          s.sfx.cheer()
          sing(TUNES[0], 'papa', 0, 0.8)
          colony.forEach((c) => c.cheer())
        },
        cues: [[0.4, () => sing(TUNES[0], 'chick', 0.2, 0.7)], [1, () => (pola.hop(), terry.hop())], [3.6, () => colony.forEach((c, i) => i % 2 || c.hop())], [5, () => s.sfx.chime()]],
      },
    ]
  },
}

// ---------------------------------------------------------------- night-goodbye

/** Morning. Pola has to go home. Pebble gives her a smooth round pebble: penguins give pebbles to best friends. */
const nightGoodbye: StoryFilm = {
  id: 'night-goodbye',
  set: 'dawn',
  beats(s) {
    const { pola, pebble, papa, balloon, stone } = s
    const X = N.goodbye
    return [
      {
        id: 'go',
        shot: cam([0.4, 1.4, 6], [0.6, 1, 0]),
        say: X.go,
        sayAt: 0.8,
        start: () => {
          s.dawn(1)
          s.put(s.sunDisc, -30, 12, -150)
          s.sfx.wind()
          s.sfx.music('happy')
          s.put(balloon.root, 3.6, SNOW_Y, -1.6)
          pola.place(1.6, SNOW_Y, 0.4, -20)
          pebble.place(-0.2, SNOW_Y, 0.8, 40)
          papa.place(-1.4, SNOW_Y, -0.2, 30)
          // (Looking north, cheated toward the camera.)
          pola.root.rotation.y = 1.1
        },
      },
      {
        id: 'wait',
        shot: close(pebble, 0.5, 2.2),
        say: X.wait,
        start: () => {
          pebble.armsUp = 0.8
          pebble.hop()
          pola.root.rotation.y = -0.6
        },
      },
      {
        // He waddles off and comes back with a smooth round pebble in his beak.
        id: 'pebble',
        shot: cam([0.8, 1.2, 4.6], [0.6, 0.6, 0.6]),
        say: X.pebble,
        sayAt: 3,
        dur: 5,
        start: () => {
          pebble.armsUp = 0
          pebble.walkTo(-2, 1.6, 1.2, -90)
        },
        cues: [
          [1.4, () => s.put(stone, 0, 0, 0)],
          [1.5, () => pebble.walkTo(0.9, 0.6, 1.3, 70)],
        ],
        tick: (_k, t) => {
          if (t > 1.4) stone.position.copy(pebble.head(tmpD)).add(tmpC.set(Math.sin(pebble.root.rotation.y) * 0.18, -0.08, Math.cos(pebble.root.rotation.y) * 0.18))
        },
      },
      {
        id: 'keep',
        shot: close(pola, -0.6, 2.8),
        say: X.keep,
        start: () => {
          pola.root.rotation.y = -0.5
          pola.pull('happy', true)
          stone.position.copy(pola.at(0.45, tmpD)).add(tmpC.set(0, 0, 0.25))
        },
        cues: [[0.4, () => (pola.armsUp = 0.3)]],
      },
      {
        // Into the basket.
        id: 'climb',
        shot: cam([1, 2, 9], [2.6, 1.6, -1]),
        dur: 3,
        start: () => {
          pola.cheer()
          pola.armsUp = 0
          pola.hopTo(3.4, SNOW_Y + 0.4, -1.5, 0.8, 0, 0.8)
          pebble.wave()
        },
        cues: [[0.9, () => (pola.ride(balloon.basket, ...balloon.seat(0), 0), s.sfx.burner())], [1.6, () => papa.wave()]],
      },
    ]
  },
}

// ---------------------------------------------------------------- the-end

/** Top and bottom of the world at once: the screen splits. Above, night falling and the northern lights, Pola with her
 *  pebble against Mama on the floe; below, the sun up, Pebble on Papa's feet in his woolly hat. Both hum the song.
 *  "They never meet..." "Except best friends!" Terry flies up between them. About 25 seconds. */
const theEnd: StoryFilm = {
  id: 'the-end',
  set: 'arctic',
  beats(s) {
    const { pola, mama, pebble, papa, terry, stone, colony } = s
    const X = N.end
    const bottomEye = (k: number) => s.split.cam.position.set(lerp(1.2, 0.6, k), 1.3, lerp(4.4, 3.8, k))
    return [
      {
        id: 'top',
        shot: cam([0.6, 1.4, 5.6], [-0.2, 0.9, 0], { eye: [0.4, 1.3, 4.8] }),
        say: X.top,
        sayAt: 1,
        dur: 4,
        start: () => {
          s.sfx.music('happy')
          s.sfx.hug()
          // Above: the floe at night.
          mama.place(-0.6, Y, -0.3, 20)
          pola.place(0.3, Y, 0.3, -10)
          pola.armsUp = 0.2
          s.put(stone, 0.32, Y + pola.height * 0.45, 0.62)
          // Below: Antarctica in the sun.
          papa.place(0, SNOW_Y, 0, 0)
          pebble.ride(papa.root, 0, 0.06, 0.34 * papa.height, 0)
          pebble.root.scale.setScalar(0.85)
          papa.lean = 0.25
          colony.forEach((c, i) => c.place(-3 + (i % 3) * 3 + (i > 2 ? 1.4 : 0), SNOW_Y, -2.4 - Math.floor(i / 3) * 1.4, 0))
          s.split.on = true
          s.split.top = { set: 'arctic', look: 'night', show: [pola.root, mama.root, stone, terry.root] }
          s.split.bottom = { set: 'antarctic', show: [papa.root, pebble.root, ...colony.map((c) => c.root)] }
          bottomEye(0)
          s.split.cam.lookAt(0, 0.95, 0)
          sing(TUNES[0], 'papa', 0, 0.3)
        },
        tick: (k) => {
          bottomEye(k)
          s.split.cam.lookAt(0, 0.95, 0)
        },
      },
      {
        id: 'bottom',
        say: X.bottom,
        start: () => sing(TUNES[0], 'chick', 0, 0.35),
      },
      {
        id: 'never',
        say: X.never,
        hold: 0.3,
      },
      {
        // Pola and Pebble together, from the two ends of the world.
        id: 'except',
        say: X.except[0],
        start: () => {
          pola.pull('happy')
          pebble.pull('happy')
          pola.hop()
          pebble.hop()
        },
        cues: [[0.25, () => sayAlong(X.except[1])]],
      },
      {
        // Terry flies up the screen between them.
        id: 'year',
        say: X.year,
        sayAt: 0.6,
        hold: 1.2,
        start: () => {
          terry.place(1.6, Y - 1.4, 1.2, -40)
          terry.flying = true
          terry.flyTo(0.8, Y + 2.4, 0.4, 2.2, -20, 0.4)
          s.aurora.flare()
        },
      },
    ]
  },
}

export const NIGHT_FILMS = {
  'night-in': nightIn,
  'night-lost': nightLost,
  'night-colony': nightColony,
  'night-sunrise': nightSunrise,
  'night-goodbye': nightGoodbye,
  'the-end': theEnd,
}
