import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { burst, lineText, Piece, PlayArea, say, SayButton, sounds, SparklePuppet, Target, usePointerDrag, type PuppetHandle } from '../../../../sdk'
import { StoryBeat } from '../../../kit/StoryBeat'
import { art } from '../art'
import { L } from '../lines'
import { BeachHat, Clothing, type Garment } from '../puppets/Clothing'
import { Luna } from '../puppets/Luna'
interface Props { onDone: () => void; setProgress: (done: number, total: number) => void }
const kinds: Garment[] = ['hat', 'scarf', 'jacket']
const targets = [{ top: '12%', left: '24%', width: '52%', height: '19%' }, { top: '48%', left: '24%', width: '52%', height: '17%' }, { top: '59%', left: '20%', width: '60%', height: '26%' }]
export function CozyAndes({ onDone, setProgress }: Props) {
  const [intro, setIntro] = useState(true)
  const [step, setStep] = useState(0)
  const [misses, setMisses] = useState(0)
  const stepRef = useRef(0)
  const luna = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const prompt = L.cozy.prompts[Math.min(step, 3)]
  useEffect(() => { setProgress(step, 4) }, [step, setProgress])
  useEffect(() => {
    if (intro || step === 4) return
    let cancelled = false
    void (async () => {
      const reaction = L.cozy.reactions[step - 1]
      if (reaction) await say(reaction)
      if (!cancelled) void say(prompt)
    })()
    return () => { cancelled = true }
  }, [intro, step, prompt])
  const place = (expected: number) => {
    // Same-step multi-touch and repeated pointerup callbacks can advance only once.
    if (stepRef.current !== expected || intro) return
    stepRef.current = expected + 1
    setStep(expected + 1)
    setMisses(0)
    sounds.snap()
    burst(.45, .55)
    void luna.current?.play(expected === 2 ? 'reach' : 'snuggle')
    void sparkle.current?.play('nod')
  }
  const help = (wrong = false) => {
    setMisses(n => n + 1)
    sounds.oops()
    void luna.current?.play('shake')
    void say(wrong ? L.cozy.wrong : L.cozy.miss)
  }
  const zipDone = () => {
    if (stepRef.current !== 3) return
    stepRef.current = 4
    setStep(4)
    sounds.correct()
    burst(.5, .5)
    void luna.current?.play('cheer')
    void sparkle.current?.play('cheer')
    void say(L.cozy.ready)
    onDone()
  }
  return <div className="peru-screen peru-cozy" style={{ backgroundImage: `url(${art.andes})` }}>
    <Ambient />
    <div className="peru-prompt"><SparklePuppet ref={sparkle} height="min(106px, 10vh)" /><p>{step === 4 ? lineText(L.cozy.ready) : prompt}</p><SayButton text={step === 4 ? L.cozy.ready : prompt} size={88} /></div>
    <PlayArea style={{ flex: 1, minHeight: 0 }}>
      <div className="peru-play-layout">
        <div className="peru-hero">
          <div className="peru-luna-slot">
            <Luna ref={luna} height="100%" hat={step >= 1} scarf={step >= 2} jacket={step >= 3} zipped={step >= 4} cold={step === 0} onTap={() => { sounds.pop(); void luna.current?.play('giggle'); void say(L.tickle[0]) }} />
            {step < 3 && <Target id={kinds[step]} hint={misses > 0} style={{ position: 'absolute', ...targets[step], borderRadius: '45%', minWidth: 88, minHeight: 88, border: '3px dashed rgba(255,255,255,.8)', background: 'rgba(255,247,240,.1)' }} />}
            {step === 3 && <Zipper onDone={zipDone} onMiss={() => { sounds.oops(); setMisses(n => n + 1); void say(L.cozy.zipHint) }} />}
          </div>
        </div>
        <div className="peru-tray" aria-label="Clothing tray">
          {step < 3 ? <>
            <Piece key={kinds[step]} id={`peru-${kinds[step]}`} snapTo={kinds[step]} snapRadius={95} label={kinds[step] === 'hat' ? 'Warm hat' : kinds[step] === 'scarf' ? 'Scarf' : 'Warm jacket'}
              onPickUp={() => { sounds.pickup(); void luna.current?.play('reach') }}
              onTap={() => place(step)} onPlace={({ target }) => { if (target === kinds[step]) { place(step); return 'snap' } help(); return 'home' }}
              style={{ width: 'var(--peru-piece)', height: 'var(--peru-piece)', borderRadius: 28, background: '#FFF7F0', border: '5px solid #FF8FB8', boxShadow: 'var(--shadow)', padding: 8 }}>
              <Clothing kind={kinds[step]} />
            </Piece>
            {step > 0 && misses < 2 && <motion.button aria-label="Beach hat" onClick={() => help(true)} animate={misses ? { rotate: [0, -5, 5, 0] } : {}} style={{ width: 'var(--peru-piece)', height: 'var(--peru-piece)', padding: 8, borderRadius: 28, border: '5px solid #fff', background: '#FFF7F0', boxShadow: 'var(--shadow)' }}><BeachHat /></motion.button>}
          </> : <div className="peru-zip-card" aria-hidden="true">{step === 4 ? '💖' : '⬆️'}<span>{step === 4 ? '✨' : '⭐'}</span></div>}
        </div>
      </div>
    </PlayArea>
    {intro && <StoryBeat lines={[L.cozy.story]} bg={art.andes} friend={<Luna height="100%" cold />} onDone={() => setIntro(false)} />}
  </div>
}
function Zipper({ onDone, onMiss }: { onDone: () => void; onMiss: () => void }) {
  const pull = useRef<HTMLButtonElement>(null)
  const progress = useRef(0)
  const completed = useRef(false)
  const travel = () => (pull.current?.parentElement?.getBoundingClientRect().height ?? 500) * .113
  const reset = () => { progress.current = 0; if (pull.current) pull.current.style.top = '80%' }
  const finish = () => { if (!completed.current) { completed.current = true; onDone() } }
  usePointerDrag(pull, {
    onStart: () => sounds.pickup(),
    onMove: ({ dy }) => { progress.current = Math.max(0, Math.min(1, -dy / travel())); if (pull.current) pull.current.style.top = `${80 - progress.current * 11.3}%` },
    onEnd: () => { if (progress.current >= .8) finish(); else { reset(); onMiss() } },
    onTap: finish, onCancel: reset,
  })
  return <>
    <div className="peru-zip-star" aria-hidden="true">⭐</div>
    <div className="peru-zip-track" aria-hidden="true" />
    <button ref={pull} aria-label="Zip Luna's jacket" onClick={e => { if (e.detail === 0) finish() }} className="peru-zip-pull">↑</button>
  </>
}
function Ambient() {
  return <div className="peru-ambient" aria-hidden="true">
    <motion.div className="peru-cloud" animate={{ x: [0, 30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
    {[8, 92].map((left, i) => <motion.span key={left} style={{ position: 'absolute', left: `${left}%`, bottom: '5%', fontSize: 'min(70px, 8vw)' }} animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 3 + i, repeat: Infinity }}>🌼</motion.span>)}
  </div>
}
