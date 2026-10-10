import { forwardRef, useRef } from 'react'
import { bell, span, spring, setT, setA, usePuppet, type PuppetHandle } from '../../../../sdk'
import { ClothingShape } from './Clothing'
export const LUNA_ACTIONS = ['wave', 'shiver', 'snuggle', 'reach', 'nod', 'cheer', 'giggle', 'shake']
interface Props { height: string; hat?: boolean; scarf?: boolean; jacket?: boolean; zipped?: boolean; cold?: boolean; onTap?: () => void }
type Part = 'root' | 'head' | 'earL' | 'earR' | 'eyes' | 'pupils' | 'mouth' | 'legL' | 'legR' | 'tail'
const INK = '#2B2330'
// Front-facing elevation, matching luna.webp. Clothes stay nested under their owning body/head parts.
export const Luna = forwardRef<PuppetHandle, Props>(function Luna({ height, hat, scarf, jacket, zipped, cold = false, onTap }, ref) {
  const ears = useRef({ l: spring(145, 9), r: spring(145, 9), tail: spring(120, 8) }).current
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'peru-luna', eyes: [200, 200], reach: [200, 300],
    actions: { wave: 1.2, shiver: 1.4, snuggle: 1.3, reach: .9, nod: .8, cheer: 1.3, giggle: 1, shake: .8 },
    frame: (f, p) => {
      const e = bell(f.p), cheer = f.action === 'cheer'
      const crouch = cheer ? bell(span(f.p, 0, .22)) : 0
      const jump = cheer ? bell(span(f.p, .22, .75)) : 0
      const settle = cheer ? Math.sin(span(f.p, .75, 1) * Math.PI * 4) * (1 - span(f.p, .75, 1)) : 0
      const shiver = (f.action === 'shiver' ? e : cold && !f.action ? .25 : 0) * Math.sin(f.t * 28) * 3
      const snuggle = f.action === 'snuggle' ? e : 0
      const giggle = f.action === 'giggle' ? Math.sin(f.p * Math.PI * 8) * e : 0
      setT(p.root, `translate(${shiver} ${-jump * 34 + crouch * 9}) translate(200 555) scale(${1 + crouch * .06 - jump * .035 + settle * .02} ${1 - crouch * .08 + jump * .04 - settle * .025 + Math.sin(f.t * 2) * .007}) translate(-200 -555)`)
      const rotation = Math.sin(f.t * 1.4) * 1.3 + f.look.x * 2 + (f.action === 'shake' ? Math.sin(f.p * Math.PI * 6) * e * 9 : 0)
      const nod = f.action === 'nod' || f.action === 'reach' ? e * 8 : 0
      setT(p.head, `translate(${giggle * 2} ${snuggle * 10 + nod}) rotate(${rotation} 200 300)`)
      setT(p.earL, `rotate(${ears.l.step(-rotation * 1.4 - snuggle * 12 - jump * 18, f.dt)} 125 160)`)
      setT(p.earR, `rotate(${ears.r.step(-rotation * 1.4 + snuggle * 12 + jump * 18, f.dt)} 275 160)`)
      setT(p.tail, `rotate(${ears.tail.step(Math.sin(f.t * 2) * 5 + jump * 22, f.dt)} 300 420)`)
      setT(p.eyes, `translate(0 ${200 * (1 - f.blink)}) scale(1 ${f.blink})`)
      setT(p.pupils, `translate(${f.look.x * 5} ${f.look.y * 4})`)
      const mouth = Math.max(f.mouth, cheer ? e * .55 : Math.abs(giggle) * .25)
      setA(p.mouth, 'd', `M181 253Q200 ${260 + mouth * 2} 219 253Q219 ${261 + mouth * 30} 200 ${263 + mouth * 32}Q181 ${261 + mouth * 30} 181 253Z`)
      setT(p.legL, `rotate(${f.action === 'wave' ? Math.sin(f.p * Math.PI * 6) * e * 14 - e * 25 : snuggle * 7} 151 465)`)
      setT(p.legR, `rotate(${-snuggle * 7} 249 465)`)
    },
  })
  return <svg ref={svg} viewBox="0 0 400 600" role="img" aria-label="Luna the alpaca" onClick={onTap} style={{ height, width: 'auto', maxWidth: '100%', overflow: 'visible', cursor: onTap ? 'pointer' : undefined }}>
    <g ref={part('root')} stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <g ref={part('tail')}><path d="M293 410Q335 377 341 410Q358 430 329 452L293 450Z" fill="#FFC2A8" /></g>
      <path d="M112 458L108 539Q124 558 143 539L148 458M252 458L257 539Q276 558 292 539L288 458" fill="#F5AD88" />
      <path d="M108 532Q127 542 143 532V548Q124 562 108 548ZM257 532Q276 542 292 532V548Q276 562 257 548Z" fill={INK} />
      <path d="M143 281Q135 306 143 326Q120 338 126 363Q89 366 95 396Q74 415 92 437Q82 467 113 475Q126 500 150 490Q171 507 199 497Q228 507 250 490Q278 501 290 475Q322 466 309 441Q329 420 309 397Q315 369 279 363Q285 337 259 325Q266 305 258 281Z" fill="#FFC2A8" />
      <g ref={part('legL')}><path d="M129 455L135 562Q151 580 176 563L181 455Z" fill="#FFC2A8" /><path d="M135 550Q157 558 176 550V571Q155 588 136 571Z" fill={INK} /></g>
      <g ref={part('legR')}><path d="M219 455L224 563Q249 580 265 562L271 455Z" fill="#FFC2A8" /><path d="M224 550Q245 558 265 550L264 571Q245 588 224 571Z" fill={INK} /></g>
      {jacket && <g transform="translate(102 351) scale(.82)"><ClothingShape kind="jacket" zipped={zipped} /></g>}
      {scarf && <g transform="translate(99 272) scale(.84)"><ClothingShape kind="scarf" /></g>}
      <g ref={part('head')}>
        <g ref={part('earL')}><path d="M130 165Q75 122 91 38Q144 49 158 133Z" fill="#FFC2A8" /><path d="M129 140Q105 111 108 65Q135 85 139 126Z" fill="#FF8FB8" stroke="none" /></g>
        <g ref={part('earR')}><path d="M270 165Q325 122 309 38Q256 49 242 133Z" fill="#FFC2A8" /><path d="M271 140Q295 111 292 65Q265 85 261 126Z" fill="#FF8FB8" stroke="none" /></g>
        <path d="M110 139Q112 112 143 117Q161 99 179 115Q204 97 225 115Q253 107 267 128Q290 132 290 157Q319 177 303 198Q319 218 305 238Q313 265 286 274Q270 297 244 288Q219 310 200 295Q176 309 157 289Q125 298 114 275Q87 270 97 244Q79 222 95 201Q80 177 104 166Z" fill="#FFC2A8" />
        <path d="M149 129Q140 91 169 96Q177 71 202 92Q232 83 240 114Q262 139 235 149Q218 177 198 151Q172 166 162 145" fill="#FFC2A8" />
        <ellipse cx="200" cy="252" rx="48" ry="44" fill="#FFF7F0" stroke="none" />
        <g ref={part('eyes')}>
          <ellipse cx="144" cy="204" rx="25" ry="31" fill="#FFF7F0" stroke="none" /><ellipse cx="256" cy="204" rx="25" ry="31" fill="#FFF7F0" stroke="none" />
          <g ref={part('pupils')} fill={INK} stroke="none"><ellipse cx="146" cy="206" rx="21" ry="28" /><ellipse cx="254" cy="206" rx="21" ry="28" /><circle cx="139" cy="194" r="7" fill="#fff" /><circle cx="247" cy="194" r="7" fill="#fff" /></g>
        </g>
        <path d="M123 181l-8-7M277 181l8-7M127 158q12-8 22-1M251 157q12-7 22 1" fill="none" />
        <ellipse cx="122" cy="245" rx="17" ry="12" fill="#FF8FB8" stroke="none" /><ellipse cx="278" cy="245" rx="17" ry="12" fill="#FF8FB8" stroke="none" />
        <path d="M189 233Q200 223 211 233Q215 240 200 246Q185 240 189 233Z" fill={INK} stroke="none" />
        <path ref={part('mouth')} d="M181 253Q200 260 219 253Q219 261 200 263Q181 261 181 253Z" fill="#FF8FB8" strokeWidth="3" />
        <path d="M200 245v9" fill="none" strokeWidth="3" />
        {hat && <g transform="translate(104 42) scale(.8)"><ClothingShape kind="hat" /></g>}
      </g>
    </g>
  </svg>
})
