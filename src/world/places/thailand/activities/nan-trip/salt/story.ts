// Pa Kluea's story at Bo Kluea's salt hut: "No Salt for the Soup!" (planning/around-the-world/thailand/nan-salt-story.md;
// docs/films.md, how films work). It gives the salt a reason: the village dinner is tonight, and nobody has any salt.
//
//   the way in (film `intro`, salt?round=story): Pa Kluea says hello; the three cooks come running, each tastes their
//     food and pulls a face (Lung Kwai's noodle soup "tastes like puddle water", Pa Kai's salty eggs aren't salty, Yai
//     Nak's fish is plain); Pa Kluea's salt jar is empty; the dinner is tonight. Then her memory, in the storybook look:
//     when she was little her grandma made the salt and she carried it to every pot. "Now you can be my salt carrier!"
//   making it (rounds 1-3): the cooks wait across the road by the painted house, peeking. Halfway through the pan Lung
//     Kwai calls "Is it salt yet?"; when the first white salt shows, Pa Kai clucks "Ooh! Salt!". Tapped, each says how
//     hungry they are.
//   the dinner (film `dusk`, then salt?round=dinner): the page turns to evening at three stalls along the road, lanterns
//     dark. She holds her finger over the food and salt sprinkles from her hand where it points: the soup pot, Pa Kai's
//     jar of water (then her eggs hop in, one by one: salty water makes salty eggs), and each of Yai Nak's three fish.
//     Each cook tastes ("Aroi mak!"), the lantern over their stall lights up. Keep sprinkling and they pucker up.
//   the party (film `party`): the string lights come on one by one, Pa Kluea says thank you, Daddy has a slurp, everyone
//     cheers. Then the real salt video and the end card.
//
// The hut (salt3d.ts) owns the salt game; this file owns the cooks, the memory's grandma and little Pa Kluea, the salt
// jar, the dinner set (dinner.ts) and the films' beats. Everything a film does that the game needs afterwards is also
// done by its finish(), so skipping from any beat leaves the world right.
import { Color, Group, Vector3, type Object3D } from 'three'
import { bell, clamp, type Line } from '../../../../../../sdk'
import type { Look } from '../../../../../engine3d/characters/look'
import type { Avatar } from '../../../characters/avatar'
import { Member } from '../../../characters/member'
import { L } from '../../../lines'
import type { Bag } from '../../../../../engine3d/dispose'
import type { Film, V3 as FV3 } from '../../../../../engine3d/film'
import { merge, P, solid } from '../../../../../engine3d/geo'
import type { Pose3, Rider } from '../../../trip/legs/stage'
import type { Floaters } from '../mushrooms/fx'
import { buildDinner, lightLantern, type Dinner } from './dinner'
import { SALT_AUNTY } from './hut'
import {
  AUNTY_AT,
  COOKS_IN,
  COOKS_WAIT,
  COOK_DX,
  COUNTER_Y,
  DINNER,
  DINNER_AUNTY,
  DINNER_JI,
  DINNER_KAYLEE_Z,
  DINNER_NICK,
  FOOD_SPOTS,
  FOOD_X,
  JI_AT,
  KAYLEE_AT,
  NICK_AT,
  PAN,
  SALT_JAR,
  SALT_RATE,
  SPOT_R,
  STALL_X,
  STALL_Z,
  TOO_SALTY,
} from './layout'
import { saltSfx as sfx, saltStoryMusic, saltMemoryBed } from './sounds'

const S = L.nan.salt.story
const deg = Math.PI / 180
const tmp = new Vector3()

// ---------------------------------------------------------------- the people

/** Lung Kwai: a big jolly water buffalo uncle in a sky-blue tee and an apron (the noodle soup). */
const KWAI: Look = { species: 'buffalo', height: 1.38, chub: 1.22, fur: '#77708A', light: '#CFC6D6', dark: '#45405A', ear: '#FFC2C8', outfit: { kind: 'tee', color: '#8FC6F2' }, extras: ['apron'], open: true }
/** Pa Kai: a plump cream hen auntie in a lilac blouse (the salty eggs). */
const KAI: Look = { species: 'hen', height: 1.12, chub: 1.18, fur: '#FFF1DE', light: '#FFFFFF', dark: '#FFC83D', ear: '#FFB45C', outfit: { kind: 'blouse', color: '#C9B6F5' }, lashes: true, open: true }
/** Yai Nak: a little old otter grandma with round glasses and a white bun (the grilled fish). */
const NAK: Look = { species: 'otter', height: 1.08, chub: 1.12, fur: '#9A7A66', light: '#EAD9C8', dark: '#5A4436', outfit: { kind: 'blouse', color: '#FFC2A8' }, extras: ['round-glasses', 'bun'], lashes: true }
/** In the memory: little Pa Kluea (a filly in a pink dress, no hat yet) and her grandma (a grey-maned pony in Pa
 *  Kluea's sun hat and apron: the hat is hers now). */
const FILLY: Look = { ...SALT_AUNTY, height: 0.82, chub: 1.0, outfit: { kind: 'dress', color: '#FFB3D6' }, extras: [], open: true }
const GRANDMA: Look = { ...SALT_AUNTY, height: 1.32, chub: 1.16, fur: '#EAD6C0', light: '#FFF6EC', mane: ['#F2EEF4', '#D9D3E0'], outfit: { kind: 'blouse', color: '#B9A6F5' }, extras: ['sunhat', 'apron', 'round-glasses'], open: false }

const COOK_IDS = ['kwai', 'kai', 'nak'] as const
const COOK_LOOKS = [KWAI, KAI, NAK]
const COOK_NAMES = ['Lung Kwai', 'Pa Kai', 'Yai Nak']

/** A face pulled for a moment: tasting no salt (blehh), just right (yum), too salty (pucker). */
type Face = 'bleh' | 'yum' | 'salty'

/** A villager: the family's Member rig (breathing, blinking, a mouth that moves with their voice, hops and waves) plus
 *  a waddling walk and faces. */
class Folk {
  readonly m: Member
  private walk: { from: Vector3; to: Vector3; t: number; dur: number; face: number } | null = null
  private face: { kind: Face; t: number } | null = null
  /** Leaning in over their food to taste it (0..1). */
  lean = 0
  private leanGoal = 0
  constructor(id: string, name: string, look: Look, bag: Bag, voice?: string) {
    this.m = new Member({ id, name, who: name, height: look.height, spot: null, pitch: 220 }, bag, look, voice)
    this.m.root.userData.pick = id
  }
  get root() {
    return this.m.root
  }
  get pos() {
    return this.m.root.position
  }
  place(x: number, z: number, face: number) {
    this.walk = null
    this.m.place(x, 0, z, face)
  }
  walkTo(x: number, z: number, dur: number, face: number) {
    const from = this.pos.clone()
    this.walk = { from, to: new Vector3(x, 0, z), t: 0, dur, face }
    this.m.root.rotation.y = Math.atan2(x - from.x, z - from.z)
  }
  get walking() {
    return !!this.walk
  }
  pull(kind: Face) {
    this.face = { kind, t: 0 }
  }
  taste(on: boolean) {
    this.leanGoal = on ? 1 : 0
  }
  /** Head height (world), for shots and tap targets. */
  head(out = new Vector3()) {
    const r = this.m.rig
    return r.head.localToWorld(out.set(0, r.face.headY, 0))
  }
  update(dt: number, t: number) {
    this.m.update(dt, t)
    const r = this.m.rig
    const w = this.walk
    if (w) {
      w.t = Math.min(1, w.t + dt / w.dur)
      this.pos.x = w.from.x + (w.to.x - w.from.x) * w.t
      this.pos.z = w.from.z + (w.to.z - w.from.z) * w.t
      // A waddle: a bounce each step and a rock from side to side.
      r.body.position.y = Math.abs(Math.sin(t * 11)) * 0.05
      r.body.rotation.z = Math.sin(t * 11) * 0.09
      if (w.t >= 1) {
        this.walk = null
        r.body.position.y = 0
        r.body.rotation.z = 0
        this.m.root.rotation.y = w.face * deg
      }
    }
    this.lean += (this.leanGoal - this.lean) * Math.min(1, dt * 6)
    r.body.rotation.x = this.lean * 0.35
    const f = this.face
    if (f) {
      f.t += dt / (f.kind === 'yum' ? 1.4 : 1.6)
      const k = bell(Math.min(1, f.t * 1.25))
      if (f.kind === 'bleh') {
        // Eyes squeezed shut, mouth wide and flat, a shudder of the head.
        r.eyes.scale.y = Math.max(0.12, 1 - k * 0.88)
        r.mouth.scale.set(1 + k * 0.5, 1 - k * 0.5, 1)
        r.head.rotation.z = Math.sin(f.t * 40) * 0.12 * k
      } else if (f.kind === 'salty') {
        // Eyes squeezed, mouth puckered small, the head shaking hard.
        r.eyes.scale.y = Math.max(0.12, 1 - k * 0.88)
        r.mouth.scale.set(1 - k * 0.6, 1 + k * 0.5, 1)
        r.head.rotation.y += Math.sin(f.t * 50) * 0.3 * k
      } else {
        // Happy: eyes squeezed into smiles, the mouth big, a little sway.
        r.eyes.scale.y = Math.max(0.2, 1 - k * 0.75)
        r.mouth.scale.setScalar(1 + k * 0.45)
        r.head.rotation.z = Math.sin(f.t * 9) * 0.12 * k
      }
      if (f.t >= 1) {
        this.face = null
        r.mouth.scale.set(1, 1, 1)
        r.head.rotation.z = 0
      }
    }
  }
}

// ---------------------------------------------------------------- what the story needs from the hut

export interface StoryHost {
  scene: Object3D
  bag: Bag
  kaylee: Avatar
  nick: Member
  ji: Member
  /** Pa Kluea (the hut's salt aunty rig). */
  aunty: Group
  sparkles: Floaters
  grains: Floaters
  steam: Floaters
  drops: Floaters
  put(c: Rider, x: number, y: number, z: number, pose: Pose3, face?: number): void
  /** Someone says something (in play, not in a film): their bubble and voice. */
  say(l: Line): void
  /** The hop Pa Kluea does (the hut animates her). */
  hopAunty(): void
  /** Later, on the world's clock (it stops when the world does). */
  after(s: number, f: () => void): void
  /** Long ago (the memory): Pa Kluea and the family aren't there; the fire's lit and the pan is full. Or back to now. */
  memory(on: boolean): void
  /** Evening for the dinner: the sky turns pink and lavender, the light warm. */
  dusk(on: boolean): void
}

/** Cooks standing behind their stalls. */
const COOK_AT = (i: number): FV3 => [STALL_X[i] + COOK_DX, 0, STALL_Z - 0.5]

export class SaltStory {
  readonly cooks: Folk[]
  private filly: Folk
  private grandma: Folk
  /** Kwai's bowl (in his hand in the way in), the filly's little basket. */
  private bowl: Group
  private tinyBasket: Group
  readonly jar: { root: Group; lid: Group }
  private jarTip = 0
  private lidOff = 0
  readonly dinner: Dinner
  /** Kaylee's salt basket at the dinner (she carries it on her hip). */
  private basket: Group
  /** How salted each food's spots are (0..1 each), and how much more than enough it's had since. */
  salted: number[][] = FOOD_SPOTS.map((s) => s.map(() => 0))
  private over = [0, 0, 0]
  done = [false, false, false]
  private lit = [0, 0, 0]
  private eggsIn = 0
  private eggT = -1
  private bulbsOn = 0
  /** At the dinner: what her finger is sprinkling on (the stall, and where on the counter), or null. */
  sprinkle: { stall: number; at: Vector3 } | null = null
  private sprinkleT = 0
  private stopMusic: (() => void) | null = null
  private stopBed: (() => void) | null = null
  private told = new Set<string>()
  /** It's evening (the dinner). */
  evening = false
  /** All three foods are salted (the party film plays next). */
  allSalted: (() => void) | null = null

  constructor(private h: StoryHost) {
    const { bag, scene } = h
    this.cooks = COOK_IDS.map((id, i) => new Folk(id, COOK_NAMES[i], COOK_LOOKS[i], bag, id))
    for (const c of this.cooks) scene.add(c.root)
    this.filly = new Folk('filly', 'Little Pa Kluea', FILLY, bag)
    this.grandma = new Folk('grandma', "Pa Kluea's grandma", GRANDMA, bag)
    for (const c of [this.filly, this.grandma]) {
      c.root.visible = false
      scene.add(c.root)
    }
    // Kwai's bowl of soup, in his right hand.
    this.bowl = solid(merge([P.cyl(0.09, 0.055, 0.06, '#FFFFFF', { at: [0, 0.03, 0] }), P.cyl(0.08, 0.08, 0.01, '#F2A04E', { at: [0, 0.055, 0] })]), bag, 2)
    const kr = this.cooks[0].m.rig
    this.bowl.position.set(0.07 * KWAI.height, -0.17 * KWAI.height, 0.08)
    kr.armR.add(this.bowl)
    this.bowl.visible = false
    // The filly's little basket of salt, in her left hand.
    this.tinyBasket = solid(merge([P.cyl(0.08, 0.06, 0.07, '#D2A56C', { at: [0, 0.035, 0] }), P.sphere(0.065, '#FFFFFF', { at: [0, 0.07, 0], scale: [1, 0.5, 1] })]), bag, 2)
    this.tinyBasket.position.set(-0.05 * FILLY.height, -0.17 * FILLY.height, 0.06)
    this.filly.m.rig.armL.add(this.tinyBasket)
    // Pa Kluea's big salt jar, beside her.
    const jar = new Group()
    jar.position.set(...SALT_JAR)
    jar.add(solid(merge([P.cyl(0.2, 0.16, 0.42, '#C98A6A', { at: [0, 0.21, 0] }), P.sphere(0.21, '#C98A6A', { at: [0, 0.38, 0], scale: [1, 0.4, 1] }), P.torus(0.12, 0.025, '#B87A5C', { at: [0, 0.46, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
    const lid = solid(merge([P.cyl(0.14, 0.14, 0.04, '#D2A56C', { at: [0, 0, 0] }), P.sphere(0.035, '#B8884F', { at: [0, 0.035, 0] })]), bag, 2)
    lid.position.set(0, 0.49, 0)
    jar.add(lid)
    jar.userData.pick = 'jar'
    scene.add(jar)
    this.jar = { root: jar, lid }
    // The dinner set, and her basket for it.
    this.dinner = buildDinner(bag)
    scene.add(this.dinner.root)
    this.basket = solid(merge([P.cyl(0.13, 0.1, 0.12, '#D2A56C', { at: [0, 0.06, 0] }), P.torus(0.13, 0.02, '#FF8FB8', { at: [0, 0.12, 0], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.12, '#FFFFFF', { at: [0, 0.13, 0], scale: [1, 0.45, 1] })]), bag, 2)
    this.basket.visible = false
    scene.add(this.basket)
    for (const [i, s] of this.dinner.stalls.entries()) s.food.userData.pick = `food${i}`
    this.wait()
  }

  /** The cooks across the road, waiting (while she makes the salt). */
  wait() {
    for (const [i, c] of this.cooks.entries()) {
      c.place(COOKS_WAIT[i][0], COOKS_WAIT[i][2], [10, 0, -12][i])
      c.root.visible = true
    }
    this.bowl.visible = false
  }

  // ---------------------------------------------------------------- talk in play

  private once(key: string, l: Line) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.h.say(l)
  }
  /** The pan is half full: Lung Kwai calls across the road, and Pa Kluea answers. */
  halfway(after: (s: number, f: () => void) => void) {
    if (this.told.has('yet')) return
    this.cooks[0].m.react('wave')
    this.once('yet', S.yet)
    after(2.2, () => {
      this.h.hopAunty()
      this.once('notYet', S.notYet)
    })
  }
  /** The first white salt: Pa Kai flaps and clucks. */
  firstSalt() {
    this.cooks[1].m.react('hop')
    sfx.cluck()
    this.once('ooh', S.ooh)
  }
  /** A tap on a cook: hungry before the dinner, happy after their food's salted. */
  private tapN = [0, 0, 0]
  pokeCook(i: number) {
    const c = this.cooks[i]
    c.m.react('hop')
    if (i === 1) sfx.cluck()
    const done = this.done[i]
    if (!done && this.evening) c.pull('bleh')
    if (done) c.pull('yum')
    this.h.say((done ? S.happy : S.waiting)[i])
    this.tapN[i]++
  }
  pokeJar() {
    sfx.echo()
    this.jarTip = 0.5
  }

  // ---------------------------------------------------------------- the way in

  intro(): Film {
    const h = this.h
    const { kaylee } = h
    const [kwai, kai, nak] = this.cooks
    return {
      id: 'intro',
      beats: [
        {
          id: 'hello',
          shot: { eye: [0.3, 2.6, 7.6], look: [0.5, 0.9, 0], fov: 34, to: { eye: [2.9, 1.45, 3.9], look: [2.25, 1.0, -0.3] }, move: 4.2, tall: { eye: [0.3, 3.0, 9.0], to: { eye: [1.9, 1.6, 4.6] } } },
          start: () => {
            this.stopMusic = saltStoryMusic()
            h.put(kaylee, -1.15, 0, 1.05, 'stand', 40)
            h.put(h.nick, ...NICK_AT, 'stand', 20)
            h.put(h.ji, ...JI_AT, 'stand', 30)
            h.aunty.position.set(...AUNTY_AT)
            h.aunty.rotation.y = -0.6
            for (const c of this.cooks) c.root.visible = false
            this.lidOff = 0
            this.jarTip = 0
            kaylee.lookAt(AUNTY_AT[0], 1.1, AUNTY_AT[2])
          },
          say: S.hello,
          sayAt: 3.0,
          dur: 4.8,
          cues: [[3.0, () => h.hopAunty()]],
        },
        {
          id: 'calling',
          shot: { eye: [0.7, 1.7, 5.6], look: [0.8, 0.8, 0.5], fov: 36, sway: 0.03 },
          start: () => {
            // In they come from the right, along the front, one behind the other.
            for (const [i, c] of this.cooks.entries()) {
              c.root.visible = true
              c.place(4.2 + i * 0.7, 1.15 + i * 0.1, -90)
              c.walkTo(COOKS_IN[i][0], COOKS_IN[i][2], 2.4 + i * 0.35, [35, 30, 25][i])
            }
            this.bowl.visible = true
            kwai.m.rig.armR.rotation.set(-1.1, 0, -0.2)
            sfx.cluck()
          },
          say: S.calling,
          sayAt: 0.6,
          dur: 3.4,
        },
        {
          id: 'puddle',
          shot: { eye: [0.1, 1.45, 4.3], look: () => kwai.head().clone().setY(0.95), fov: 34, blend: 0.6 },
          start: () => {
            for (const [i, c] of this.cooks.entries()) c.place(COOKS_IN[i][0], COOKS_IN[i][2], [35, 30, 25][i])
            kwai.taste(true)
          },
          cues: [
            [0.7, () => (kwai.taste(false), kwai.pull('bleh'), sfx.salty())],
            [0.75, () => kwai.m.rig.armR.rotation.set(-0.7, 0, -0.2)],
          ],
          say: S.puddle,
          sayAt: 1.0,
          dur: 3.0,
        },
        {
          id: 'eggs',
          shot: { eye: [0.75, 1.3, 4.1], look: () => kai.head().clone().setY(0.8), fov: 34, blend: 0.5 },
          start: () => {
            kai.m.react('hop')
            sfx.cluck()
            kai.pull('bleh')
          },
          say: S.eggs,
          sayAt: 0.4,
          dur: 2.4,
        },
        {
          id: 'fish',
          shot: { eye: [1.5, 1.25, 4.0], look: () => nak.head().clone().setY(0.75), fov: 34, blend: 0.5 },
          start: () => nak.pull('bleh'),
          say: S.fish,
          sayAt: 0.4,
          dur: 2.4,
        },
        {
          id: 'empty',
          shot: { eye: [2.0, 1.35, 2.7], look: [SALT_JAR[0] - 0.15, 0.75, SALT_JAR[2] + 0.1], fov: 36 },
          start: () => {
            h.aunty.rotation.y = 0.5
            this.lidOff = 0.001
          },
          cues: [
            [0.5, () => sfx.wobble()],
            [1.0, () => (this.jarTip = 0.001)],
            [1.5, () => (sfx.echo(), h.grains.burst(new Vector3(SALT_JAR[0] - 0.25, 0.5, SALT_JAR[2] + 0.05), 1, 0.2, 0.2, 0.8, 0.025))],
          ],
          say: S.empty,
          sayAt: 2.0,
          dur: 3.6,
        },
        {
          id: 'tonight',
          shot: { eye: [0.9, 1.8, 5.0], look: [0.9, 0.9, 0.4], fov: 38, tall: { eye: [0.8, 2.2, 7.2] } },
          start: () => {
            h.aunty.rotation.y = -0.6
            this.jarTip = 0
            for (const [i, c] of this.cooks.entries()) h.after(i * 0.12, () => c.m.react('hop'))
            this.bowl.visible = false
            kwai.m.rig.armR.rotation.set(0, 0, 0)
          },
          say: S.tonight,
          sayAt: 0.3,
          dur: 2.6,
        },
        {
          id: 'page-in',
          turn: true,
          memory: true,
          shot: { eye: [0.9, 1.5, 3.8], look: [0.9, 0.75, 0.1], fov: 36, to: { eye: [1.1, 1.3, 3.2] } },
          start: () => {
            this.stopBed = saltMemoryBed()
            h.memory(true)
            this.memoryOn(true)
            this.filly.place(-0.1, 0.72, 30)
          },
          say: S.little,
          sayAt: 0.9,
          dur: 4.0,
        },
        {
          id: 'carry',
          shot: { eye: [-2.9, 1.2, 3.3], look: () => this.filly.head().clone().setY(0.6), fov: 36, sway: 0.03 },
          start: () => this.filly.walkTo(-1.9, 1.5, 3.2, -40),
          say: S.carry,
          sayAt: 0.6,
          dur: 3.4,
          cues: [[0.2, () => this.filly.m.react('hop')]],
        },
        {
          id: 'ask',
          turn: true,
          shot: { eye: [0.6, 1.6, 5.3], look: [0.6, 0.85, 0.45], fov: 38, tall: { eye: [0.5, 2.0, 7.6] } },
          start: () => {
            this.stopBed?.()
            this.stopBed = null
            this.memoryOn(false)
            h.memory(false)
            h.aunty.rotation.y = -0.6
          },
          say: S.ask,
          sayAt: 0.8,
          dur: 3.6,
          cues: [[0.9, () => h.hopAunty()], [1.2, () => kaylee.react('hop')]],
        },
      ],
      finish: () => {
        this.stopMusic?.()
        this.stopMusic = null
        this.stopBed?.()
        this.stopBed = null
        this.memoryOn(false)
        h.memory(false)
        h.aunty.position.set(...AUNTY_AT)
        h.aunty.rotation.y = -0.9
        h.put(kaylee, ...KAYLEE_AT, 'stand', 0)
        h.put(h.nick, ...NICK_AT, 'stand', 10)
        h.put(h.ji, ...JI_AT, 'stand', 25)
        this.jarTip = 0
        this.lidOff = 1
        for (const c of this.cooks) c.taste(false)
        this.cooks[0].m.rig.armR.rotation.set(0, 0, 0)
        this.wait()
      },
    }
  }

  /** The memory's people: grandma at the pan stirring, little Pa Kluea beside her. */
  private memoryOn(on: boolean) {
    this.filly.root.visible = this.grandma.root.visible = on
    for (const c of this.cooks) c.root.visible = !on
    if (on) {
      this.grandma.place(PAN.x1 + 0.35, 0.05, -40)
      this.filly.place(-0.1, 0.72, 30)
    }
  }

  // ---------------------------------------------------------------- the dinner

  /** Everyone where they stand at the dinner (dusk on). */
  private toDinner() {
    const h = this.h
    this.evening = true
    h.dusk(true)
    for (const [i, c] of this.cooks.entries()) {
      c.root.visible = true
      c.place(COOK_AT(i)[0], COOK_AT(i)[2], 0)
      c.taste(false)
    }
    h.aunty.position.set(...DINNER_AUNTY)
    h.aunty.rotation.y = -0.5
    h.put(h.nick, ...DINNER_NICK, 'stand', 35)
    h.put(h.ji, ...DINNER_JI, 'stand', 30)
    h.put(h.kaylee, DINNER.x - 1.3, 0, DINNER_KAYLEE_Z, 'stand', 20)
    this.basket.visible = true
    for (const [i, s] of this.dinner.stalls.entries()) lightLantern(s, this.done[i] ? 1 : 0)
  }

  /** The page turns to evening at the stalls. */
  duskFilm(): Film {
    const X = DINNER.x
    return {
      id: 'dusk',
      beats: [
        {
          id: 'evening',
          turn: true,
          shot: { eye: [X, 2.3, 7.0], look: [X, 1.0, -0.5], fov: 36, to: { eye: [X - 0.3, 1.7, 5.6] }, tall: { eye: [X, 2.8, 9.6], to: { eye: [X, 2.2, 8.4] } } },
          start: () => this.toDinner(),
          say: S.dusk,
          sayAt: 1.1,
          dur: 4.4,
          cues: [[1.2, () => this.h.hopAunty()], [2.0, () => this.cooks.forEach((c, i) => this.h.after(i * 0.2, () => c.pull('bleh')))]],
        },
      ],
      finish: () => this.toDinner(),
    }
  }

  /** The dinner's play, every frame: her finger sprinkles salt where it points. */
  stepDinner(dt: number, t: number, hand: Vector3) {
    const d = this.dinner
    // Her basket on her left hip.
    const k = this.h.kaylee.root
    const yaw = k.rotation.y
    this.basket.position.set(k.position.x - Math.cos(yaw) * 0.26, 0.38, k.position.z + Math.sin(yaw) * 0.26)
    this.basket.rotation.y = yaw
    // A quick tap: a pinch of salt on the next spot that wants it.
    let sp = this.sprinkle
    if (!sp && this.pinchT > 0) {
      this.pinchT -= dt
      sp = this.done[this.pinchOn] ? null : { stall: this.pinchOn, at: this.nextSpot(this.pinchOn) }
    }
    if (sp && this.evening) {
      // Grains fall from her hand to where her finger points, and fill the spots there.
      this.sprinkleT -= dt
      if (this.sprinkleT <= 0) {
        this.sprinkleT = 0.18
        sfx.scrape()
      }
      for (let n = 0; n < 3; n++) {
        tmp.copy(sp.at).sub(hand)
        const life = 0.35
        this.h.grains.emit(hand.clone().add(new Vector3((Math.random() - 0.5) * 0.06, 0, (Math.random() - 0.5) * 0.06)), new Vector3(tmp.x / life, tmp.y / life + 2.5 * life * 0.5, tmp.z / life), life, 0.018 + Math.random() * 0.012)
      }
      const i = sp.stall
      const spots = i >= 0 ? d.stalls[i].spots : []
      let full = i >= 0
      for (const [j, s] of spots.entries()) {
        if (Math.hypot(s[0] - sp.at.x, s[1] - sp.at.y, s[2] - sp.at.z) < SPOT_R) this.salted[i][j] = Math.min(1, this.salted[i][j] + dt * SALT_RATE)
        if (this.salted[i][j] < 1) full = false
      }
      if (i < 0) {
        // On the ground, or on someone: a little sparkle where it lands.
        if (Math.random() < dt * 6) this.h.sparkles.emit(sp.at.clone().setY(0.1), new Vector3(0, 0.4, 0), 0.4, 0.02)
      } else if (full && !this.done[i]) this.justRight(i)
      else if (full && this.eggT < 0) {
        this.over[i] += dt
        if (this.over[i] > TOO_SALTY) {
          this.over[i] = 0
          this.tooSalty(i)
        }
      }
    }
    // The lanterns ease on, the bulbs pop on at the party.
    for (const [i, s] of d.stalls.entries()) {
      this.lit[i] += ((this.done[i] ? 1 : 0) - this.lit[i]) * Math.min(1, dt * 3)
      lightLantern(s, this.lit[i])
      s.lantern.rotation.z = Math.sin(t * 1.3 + i) * 0.05
      const b = s.food.userData.bounce as number | undefined
      if (b !== undefined && b < 1) {
        s.food.userData.bounce = Math.min(1, b + dt / 0.4)
        const e = bell(s.food.userData.bounce)
        s.food.scale.set(1 + e * 0.08, 1 - e * 0.1, 1 + e * 0.08)
      }
    }
    // The fish shine a little more as they're salted.
    for (const [j, f] of d.fish.entries()) f.scale.setScalar(1 + bell(clamp(this.salted[2][j], 0, 1)) * 0.06)
    // Steam off the soup pot.
    if (Math.random() < dt * 3) this.h.steam.emit(tmp.set(STALL_X[0] + FOOD_X[0] + (Math.random() - 0.5) * 0.3, COUNTER_Y + 0.45, STALL_Z), new Vector3(0, 0.35, 0), 1.4, 0.08)
    // Pa Kai's eggs hop into her salty water, one by one.
    if (this.eggT >= 0) {
      this.eggT += dt
      const n = Math.floor(this.eggT / 0.45)
      for (const [j, e] of d.eggs.entries()) {
        const home = e.userData.home as FV3
        const p = clamp((this.eggT - j * 0.45) / 0.4, 0, 1)
        const jar = tmp.set(0.12, 0.26, 0)
        e.position.set(home[0] + (jar.x - home[0]) * p, home[1] + (jar.y - home[1]) * p + bell(p) * 0.3, home[2] + (jar.z - home[2]) * p)
        e.visible = p < 1
      }
      if (n > this.eggsIn && this.eggsIn < d.eggs.length) {
        this.eggsIn++
        sfx.plop()
        this.h.drops.burst(new Vector3(...d.jarTop), 4, 0.4, 1, 0.4, 0.02)
      }
      if (this.eggT > d.eggs.length * 0.45 + 0.5) {
        this.eggT = -1
        this.cooks[1].m.react('hop')
        this.checkAll()
      }
    }
  }

  private justRight(i: number) {
    this.done[i] = true
    this.sprinkle = null
    const c = this.cooks[i]
    const s = this.dinner.stalls[i]
    s.food.userData.bounce = 0
    sfx.shimmer()
    this.h.sparkles.burst(s.lantern.getWorldPosition(new Vector3()), 14, 1.0, 1.0, 0.8, 0.04)
    c.taste(true)
    this.h.after(0.6, () => {
      c.taste(false)
      c.pull('yum')
      c.m.react('hop')
      sfx.full()
      this.h.say(S.salted[i])
    })
    if (i === 1) {
      // Salty water: her eggs go in now.
      this.h.after(0.9, () => (this.eggT = 0))
      return
    }
    this.h.after(1.2, () => this.checkAll())
  }
  private tooSalty(i: number) {
    const c = this.cooks[i]
    c.pull('salty')
    sfx.salty()
    this.h.say(S.tooSalty[i])
  }
  private checkAll() {
    if (this.done.every(Boolean) && this.eggT < 0 && this.allSalted) {
      const f = this.allSalted
      this.allSalted = null
      this.h.after(1.6, f)
    }
  }

  private pinchT = 0
  private pinchOn = 0
  /** A quick tap on a food: a pinch of salt, about a second's sprinkle. */
  pinch(i: number) {
    this.pinchOn = i
    this.pinchT = 0.9
  }
  /** The first spot on a food that still wants salt (its middle when it's all salted). */
  nextSpot(i: number) {
    const spots = this.dinner.stalls[i].spots
    const j = this.salted[i].findIndex((v) => v < 1)
    return new Vector3(...spots[j < 0 ? Math.floor(spots.length / 2) : j])
  }

  /** Which stall a point on the counter plane is over (or -1). */
  stallAt(p: Vector3) {
    for (const [i, x] of STALL_X.entries()) if (Math.abs(p.x - x) < 0.65 && Math.abs(p.z - STALL_Z) < 0.55) return i
    return -1
  }
  /** The next food that wants salt (the hint points there). */
  nextFood() {
    const i = this.done.findIndex((d) => !d)
    return i < 0 ? null : this.nextSpot(i)
  }
  /** Something is being salted now (a held finger, or a pinch). */
  get sprinkling() {
    return !!this.sprinkle || this.pinchT > 0
  }
  /** Where the salt is landing now (Kaylee walks there and faces it), or null. */
  get target() {
    return this.sprinkle?.at ?? (this.pinchT > 0 ? this.nextSpot(this.pinchOn) : null)
  }

  /** The string lights, all on (the party), or none. */
  private bulbs(n: number) {
    this.bulbsOn = n
    for (const [i, b] of this.dinner.bulbs.entries()) b.material = i < n ? this.dinner.bulbOn : this.dinner.bulbOff
  }

  partyFilm(): Film {
    const X = DINNER.x
    const h = this.h
    return {
      id: 'party',
      beats: [
        {
          id: 'lights',
          shot: { eye: [X, 1.6, 5.8], look: [X, 1.5, -0.6], fov: 40, to: { eye: [X, 1.8, 6.4] }, tall: { eye: [X, 2.0, 9.6], to: { eye: [X, 2.2, 10.2] } } },
          start: () => {
            this.stopMusic = saltStoryMusic()
            this.bulbs(0)
          },
          tick: (k) => {
            const n = Math.min(this.dinner.bulbs.length, Math.floor(k * 1.25 * this.dinner.bulbs.length))
            if (n > this.bulbsOn) {
              this.bulbs(n)
              sfx.plink()
            }
          },
          dur: 3.2,
        },
        {
          id: 'thanks',
          shot: { eye: [X + 1.7, 1.3, 3.2], look: [DINNER_AUNTY[0] - 0.2, 0.95, DINNER_AUNTY[2]], fov: 36, blend: 0.6 },
          start: () => {
            this.bulbs(this.dinner.bulbs.length)
            h.aunty.rotation.y = -0.7
            h.kaylee.root.rotation.y = 70 * deg
          },
          cues: [[0.6, () => h.hopAunty()]],
          say: S.thanks,
          sayAt: 0.5,
          dur: 3.4,
        },
        {
          id: 'yum',
          shot: { eye: [DINNER_NICK[0] + 0.5, 1.25, 2.5], look: [DINNER_NICK[0], 0.95, DINNER_NICK[2]], fov: 36 },
          start: () => h.nick.react('hop'),
          say: S.yum,
          sayAt: 0.4,
          dur: 2.2,
        },
        {
          id: 'cheer',
          shot: { eye: [X, 1.9, 6.6], look: [X, 1.0, -0.2], fov: 40, tall: { eye: [X, 2.4, 10.4] } },
          start: () => {
            sfx.cheer()
            h.kaylee.react('hop')
            h.ji.react('hop')
            h.nick.react('wave')
            h.hopAunty()
            for (const [i, c] of this.cooks.entries()) h.after(0.15 + i * 0.15, () => c.m.react('hop'))
            for (const s of this.dinner.stalls) h.sparkles.burst(s.lantern.getWorldPosition(new Vector3()), 16, 1.2, 1.2, 1.0, 0.05)
          },
          dur: 3.0,
        },
      ],
      finish: () => {
        this.stopMusic?.()
        this.stopMusic = null
        this.bulbs(this.dinner.bulbs.length)
      },
    }
  }

  /** Straight to the dinner (a link to round `dinner` after the dusk film, or a skipped film). */
  dinnerNow() {
    this.toDinner()
  }

  update(dt: number, t: number) {
    for (const c of [...this.cooks, this.filly, this.grandma]) if (c.root.visible) c.update(dt, t)
    // The grandma stirs the pan in the memory.
    if (this.grandma.root.visible) this.grandma.m.rig.armR.rotation.set(-1.0 + Math.sin(t * 3) * 0.25, 0, -0.3)
    // The jar: its lid hops off, it tips to show it's empty.
    if (this.lidOff > 0 && this.lidOff < 1) this.lidOff = Math.min(1, this.lidOff + dt / 0.5)
    const lo = this.lidOff
    this.jar.lid.position.set(lo > 0 ? 0.25 * Math.min(1, lo) : 0, 0.49 + bell(Math.min(1, lo)) * 0.25 - (lo >= 1 ? 0.47 : 0), lo > 0 ? 0.1 * Math.min(1, lo) : 0)
    this.jar.lid.rotation.z = lo > 0 ? -lo * 1.2 : 0
    if (this.jarTip > 0 && this.jarTip < 1) this.jarTip = Math.min(1, this.jarTip + dt / 1.6)
    this.jar.root.rotation.z = this.jarTip > 0 ? bell(this.jarTip) * 0.6 : 0
    // At the dinner the cooks look at her.
    if (this.evening) {
      const kp = this.h.kaylee.root.position
      for (const c of this.cooks) c.m.lookAt(kp.x, 0.9, kp.z)
    }
  }

  /** The QA readout. */
  qa() {
    return {
      evening: this.evening,
      salted: this.salted.map((s) => s.map((v) => Math.round(v * 100) / 100)),
      done: this.done,
      eggsIn: this.eggsIn,
      bulbs: this.bulbsOn,
      sprinkling: this.sprinkle?.stall ?? null,
    }
  }
}

/** The dusk sky: the painted mountains tinted pink and lavender, the light warm. */
export const DUSK = { sky: new Color('#E7B4CC'), bg: '#C7A9D9', light: new Color('#FFC6B8') }
