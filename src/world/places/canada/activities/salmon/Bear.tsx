// Salmon Leap's bears: a layered SVG puppet drawn inside the river's SVG (<g>, feet at 0,0, in stage units), standing up
// in the falls and facing left, down the river. Two looks: the black bear (charcoal fur, a tan muzzle, like a real black
// bear) and the spirit bear (a Kermode bear: the same black bear, with creamy white fur; not a polar bear), and a
// little black bear cub on the bank. They breathe, blink, watch her finger and talk in the `bear` voice. The river
// (SalmonLeap.tsx) moves them about and calls their actions:
//   swipe   fishing: the paw goes up (anticipation), and SWIPES down into the water
//   snap    a catch at a salmon flying past: the head lunges and the jaws snap (they never catch one)
//   sneeze  booped on the nose: ah... (head back, eyes squeezed) CHOO (head down), a shake
//   plop    sits down in the water with a squash, arms flopping up, and bobs back
//   roll    rolls right over in the water, legs up, and settles
//   munch   berries: paws at the mouth, three happy chews, eyes shut happy
//   hello   a poke: a head wobble and a little wave
// `ctl.lunge` (0..1, the river sets it while a salmon flies near) leans the head out with the mouth open; `ctl.walk`
// makes the legs walk and the body bob (wading to the berry bushes).
import { forwardRef, useId, useRef } from 'react'
import { bell, clamp, lerp, setA, setT, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../../kit/ink'
import { BLUSH, Eye, INK, updateEyes, type EyeKind, type EyePart } from '../../../poles/puppets/face'

export interface BearCtl {
  lunge: number
  walk: boolean
}

export const BEAR_ACTIONS = { swipe: 1, snap: 0.6, sneeze: 1, plop: 1.1, roll: 1, munch: 1.3, hello: 0.9 }
export type BearAction = keyof typeof BEAR_ACTIONS

const LOOKS = {
  black: { fur: '#3B3442', dark: '#29232F', muzzle: '#C9A27A', belly: '#4A4252', ear: '#6A5A6E', nose: '#1E1A24', pad: '#7E6A74' },
  spirit: { fur: '#F7EEDB', dark: '#E6D7BC', muzzle: '#E9CDA4', belly: '#FFF7E6', ear: '#F2B8B0', nose: '#3A2E36', pad: '#C9A98E' },
}

const inkPass = () => inkPassIn(4.5, INK)
const line = (w?: number) => lineIn(w, INK)

type Part = 'root' | 'body' | 'head' | 'jaw' | 'armF' | 'armB' | 'legF' | 'legB' | 'blush' | EyePart

const HEAD = 'M-62 -150 C-66 -178 -34 -192 -10 -186 C14 -180 22 -160 18 -136 C14 -110 -6 -100 -30 -102 C-50 -104 -60 -122 -62 -150Z'
const BODY = 'M-44 -110 C-62 -96 -66 -44 -52 -14 C-40 6 34 6 46 -14 C60 -44 54 -100 32 -116 C14 -128 -26 -126 -44 -110Z'
const ARM = 'M-13 -6 C-14 14 -14 36 -10 50 C-6 62 8 62 12 50 C15 36 14 14 13 -6Z'
const LEG = 'M-14 -14 C-16 0 -16 10 -12 16 C-6 22 6 22 12 16 C16 10 16 0 14 -14Z'

/** A bear (or `cub`, drawn smaller), feet at (0, 0), facing left. */
export const Bear = forwardRef<PuppetHandle, { spirit?: boolean; cub?: boolean; ctl?: BearCtl }>(function Bear({ spirit = false, cub = false, ctl }, ref) {
  const id = useId().replace(/:/g, '')
  const c = spirit ? LOOKS.spirit : LOOKS.black
  const st = useRef({ head: 0, armF: spring(120, 9), armB: spring(120, 9), headLag: spring(140, 10) }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'bear',
    actions: BEAR_ACTIONS,
    eyes: [-30, -150],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const lunge = ctl?.lunge ?? 0
      const walking = !!ctl?.walk
      const breath = Math.sin(t * 2 + (spirit ? 1 : 0))
      let sx = 1 - breath * 0.01
      let sy = 1 + breath * 0.018
      let rootY = 0
      let rootX = 0
      let rot = 0
      let headRot = Math.sin(t * 0.9) * 3 + look.x * 4 - lunge * 16
      let headX = -lunge * 18
      let jaw = 0.1 + lunge * 0.8 + f.mouth * 0.9
      // Arms hang down; the near (front) one reaches out with a lunge.
      let armF = 10 + lunge * 70
      let armB = -8 + lunge * 30
      let legF = 0
      let legB = 0
      let eye: EyeKind = 'open'
      let shut = 0
      const env = smooth(span(q, 0, 0.12)) * (1 - smooth(span(q, 0.85, 1)))
      if (walking) {
        const w = Math.sin(t * 9)
        legF = w * 22
        legB = -w * 22
        rootY -= Math.abs(Math.cos(t * 9)) * 6
        rot += w * 2
        armF = 14 + w * 16
        armB = -10 - w * 16
      }
      if (act === 'swipe') {
        // Up (a slow lean back), then the fast swipe down into the water, then the settle.
        const up = smooth(span(q, 0, 0.4))
        const down = smooth(span(q, 0.4, 0.52))
        const back = smooth(span(q, 0.7, 1))
        armF = lerp(armF, lerp(lerp(10, 150, up), 40, down), 1 - back)
        rot += (up * 5 - down * 12) * (1 - back)
        headRot += (-up * 6 + down * 14) * (1 - back)
        sy *= 1 + up * 0.04 - bell(span(q, 0.45, 0.65)) * 0.07
        sx *= 1 - up * 0.02 + bell(span(q, 0.45, 0.65)) * 0.05
      } else if (act === 'snap') {
        const out = bell(span(q, 0, 1))
        headX -= out * 22
        headRot -= out * 14
        jaw = Math.max(0, Math.sin(q * Math.PI * 4)) * out
        armF = lerp(armF, 90, out)
      } else if (act === 'sneeze') {
        // Ah... (back) CHOO (forward and down) and a shake.
        const ah = smooth(span(q, 0, 0.45))
        const choo = smooth(span(q, 0.45, 0.58))
        const shake = span(q, 0.62, 1)
        headRot += ah * 22 * (1 - choo) - choo * 26 * (1 - smooth(shake)) + Math.sin(shake * 40) * 8 * (1 - shake) * (shake > 0 ? 1 : 0)
        headX += choo * -10 * (1 - shake)
        jaw = q < 0.45 ? 0.5 * ah : q < 0.62 ? 1 : 0.3 * (1 - shake)
        shut = q < 0.62 ? 0.4 + ah * 0.6 : 0
        eye = q >= 0.45 && q < 0.75 ? 'happy' : 'open'
        sy *= 1 + ah * 0.05 - bell(span(q, 0.45, 0.7)) * 0.1
        sx *= 1 - ah * 0.02 + bell(span(q, 0.45, 0.7)) * 0.07
        armF = lerp(armF, 40, ah)
        armB = lerp(armB, 30, ah)
      } else if (act === 'plop') {
        // Down onto his bottom in the water (squash), arms up, then back up with a wobble.
        const down = smooth(span(q, 0, 0.25))
        const upAgain = smooth(span(q, 0.6, 0.9))
        rootY += 34 * down * (1 - upAgain)
        sy *= 1 - 0.12 * bell(span(q, 0.15, 0.4)) + 0.06 * wobble(span(q, 0.85, 1), 2)
        sx *= 1 + 0.1 * bell(span(q, 0.15, 0.4))
        armF = lerp(armF, 140, down * (1 - upAgain))
        armB = lerp(armB, 120, down * (1 - upAgain))
        eye = q > 0.2 && q < 0.7 ? 'happy' : 'open'
        jaw = Math.max(jaw, 0.6 * down * (1 - upAgain))
      } else if (act === 'roll') {
        // Right over, legs in the air, and up again.
        const r = smooth(q)
        rot -= 360 * r
        rootY += 30 * bell(q)
        rootX += 20 * bell(q)
        legF = 50 * bell(q)
        legB = -50 * bell(q)
        armF = lerp(armF, 120, bell(q))
        armB = lerp(armB, 100, bell(q))
        eye = 'happy'
        jaw = 0.6 * bell(q)
      } else if (act === 'munch') {
        const chew = Math.abs(Math.sin(q * Math.PI * 3))
        armF = lerp(armF, 128, env)
        armB = lerp(armB, 110, env)
        jaw = 0.15 + chew * 0.6 * env
        headRot += (6 + Math.sin(q * Math.PI * 6) * 4) * env
        eye = env > 0.4 ? 'happy' : 'open'
        sy *= 1 + 0.03 * chew * env
      } else if (act === 'hello') {
        headRot += wobble(q, 2) * 14
        armF = lerp(armF, 150 + Math.sin(q * Math.PI * 6) * 18, env)
        jaw = Math.max(jaw, 0.5 * env)
        eye = q > 0.2 && q < 0.7 ? 'happy' : 'open'
      }
      // Follow-through: the head and arms lag a little behind the body.
      const hr = st.headLag.step(headRot, dt)
      const af = st.armF.step(armF, dt)
      const ab = st.armB.step(armB, dt)
      setT(p.root, `translate(${rootX.toFixed(1)} ${rootY.toFixed(1)}) rotate(${rot.toFixed(1)} 0 -60) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`)
      setT(p.head, `translate(${headX.toFixed(1)} 0) rotate(${hr.toFixed(1)} -16 -108)`)
      setT(p.jaw, `rotate(${(-clamp(jaw) * 26).toFixed(1)} -40 -112)`)
      setT(p.armF, `translate(-30 -92) rotate(${af.toFixed(1)})`)
      setT(p.armB, `translate(26 -94) rotate(${ab.toFixed(1)})`)
      setT(p.legF, `translate(-22 -12) rotate(${legF.toFixed(1)})`)
      setT(p.legB, `translate(20 -12) rotate(${legB.toFixed(1)})`)
      setA(p.blush, 'opacity', eye === 'happy' ? '1' : '0.7')
      updateEyes(p, eye, eye === 'open' ? Math.max(shut, 1 - f.blink) : 0, look, 7, 9)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))
  const limb = (name: 'armF' | 'armB' | 'legF' | 'legB', pass: boolean, fill: string) => {
    const arm = name === 'armF' || name === 'armB'
    const tr = { armF: 'translate(-30 -92)', armB: 'translate(26 -94)', legF: 'translate(-22 -12)', legB: 'translate(20 -12)' }[name]
    return (
      <g ref={r(name, pass)} transform={tr}>
        <path d={arm ? ARM : LEG} fill={fill} />
        {/* The near arm gets its own line, so a dark paw reads against the dark body as it swipes. */}
        {!pass && name === 'armF' && <path d={ARM} {...line(3)} />}
        {!pass && arm && <ellipse cy={50} rx={9} ry={6} fill={c.pad} />}
      </g>
    )
  }
  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {/* Round ears on top. */}
      <circle cx={-46} cy={-180} r={15} fill={c.fur} />
      <circle cx={2} cy={-182} r={15} fill={c.fur} />
      <path d={HEAD} fill={c.fur} />
      {/* The muzzle, sticking out down the river (left), its lower jaw on a hinge. */}
      <g ref={r('jaw', pass)}>
        <ellipse cx={-62} cy={-110} rx={20} ry={10} fill={c.muzzle} />
      </g>
      <ellipse cx={-64} cy={-124} rx={26} ry={16} fill={c.muzzle} />
      {!pass && (
        <>
          <circle cx={-46} cy={-180} r={7} fill={c.ear} />
          <circle cx={2} cy={-182} r={7} fill={c.ear} />
          <ellipse cx={-86} cy={-130} rx={10} ry={8} fill={c.nose} />
          <ellipse cx={-89} cy={-133} rx={3.5} ry={2.2} fill="#fff" opacity={0.55} />
          <path d="M-86 -122 Q-78 -114 -68 -118" {...line(2.6)} />
          <Eye id={id} side="L" x={-50} y={-152} skin={c.fur} part={part} rx={7} ry={9} />
          <Eye id={id} side="R" x={-22} y={-154} skin={c.fur} part={part} rx={7} ry={9} />
          <ellipse ref={part('blush')} cx={-30} cy={-130} rx={9} ry={5} fill={BLUSH} opacity={0.7} />
        </>
      )}
    </g>
  )
  const whole = (pass: boolean) => (
    <>
      {limb('legB', pass, c.dark)}
      {limb('armB', pass, c.dark)}
      <g ref={r('body', pass)}>
        <path d={BODY} fill={c.fur} />
        {/* A little round tail at the back. */}
        <circle cx={52} cy={-36} r={10} fill={c.fur} />
      </g>
      {!pass && <ellipse cx={-6} cy={-48} rx={30} ry={36} fill={c.belly} />}
      {limb('legF', pass, c.fur)}
      {head(pass)}
      {limb('armF', pass, c.fur)}
    </>
  )
  return (
    <g ref={svg}>
      <g transform={cub ? 'scale(0.5)' : undefined}>
        <g ref={part('root')} strokeLinejoin="round">
          <g {...inkPass()}>{whole(true)}</g>
          {whole(false)}
        </g>
      </g>
    </g>
  )
})
