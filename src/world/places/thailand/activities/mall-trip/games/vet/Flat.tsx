// The Vet Clinic without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the patient as a big picture,
// its thought bubble, and the tray as big buttons. The right tool does the next thing (with a pop and a sound); any
// other one makes it giggle. All better: it hops off to the waiting row at the top, and the next one comes in.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { L } from '../../../../lines'
import { PATIENTS, type PatientId } from '../../sections'
import { NEED_TOOL, NEEDS, PATIENT_ICONS, TOOL_ICONS, TRAYS } from './layout'
import { vetSfx as sfx, voiceOf } from './sounds'
import { mallVoice } from '../../voice'

interface Props {
  patient: PatientId
  onPatient: (id: PatientId) => void
  onHealed: (id: PatientId) => void
  onAllDone: () => void
}

const big = { width: 'clamp(88px, 13vmin, 120px)', height: 'clamp(88px, 13vmin, 120px)', borderRadius: 24, border: '5px solid #fff', background: 'rgba(255,255,255,.8)', boxShadow: 'var(--shadow)', fontSize: 'clamp(44px, 7vmin, 62px)', padding: 0, position: 'relative' } as const

export function VetFlat({ patient, onPatient, onHealed, onAllDone }: Props) {
  const [who, setWho] = useState(patient)
  const [step, setStep] = useState(0)
  const [wiggle, setWiggle] = useState(0)
  const [done, setDone] = useState(false)
  const healed = PATIENTS.slice(0, PATIENTS.indexOf(who) + (done ? 1 : 0))
  // (The sneeze happens by itself.)
  const needs = NEEDS[who].filter((n) => NEED_TOOL[n])
  const want = done ? null : NEED_TOOL[needs[step]]
  // Sparkle says who's coming in.
  useEffect(() => {
    mallVoice.say(L.mall.vet.patient[who])
  }, [who])

  const tap = (tool: string) => {
    if (done) return
    if (tool !== want) {
      setWiggle((w) => w + 1)
      sfx.giggle()
      return
    }
    sfx.chime()
    if (step + 1 < needs.length) return setStep(step + 1)
    sfx.healed()
    voiceOf(who)()
    onHealed(who)
    const next = PATIENTS[PATIENTS.indexOf(who) + 1]
    if (!next) {
      setDone(true)
      onAllDone()
      return
    }
    setTimeout(() => {
      setWho(next)
      setStep(0)
      onPatient(next)
    }, 900)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#DDF7EC, #F6F0FF)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--top-clear)', paddingBottom: 16 }}>
      <div aria-label="Waiting room" style={{ display: 'flex', gap: 12, minHeight: 64, fontSize: 'clamp(40px, 6vmin, 56px)' }}>
        {healed.map((id) => (
          <motion.span key={id} initial={{ y: 60, scale: 0.4 }} animate={{ y: 0, scale: 1, rotate: [0, -10, 10, 0] }} transition={{ rotate: { repeat: Infinity, duration: 1.2 } }}>
            {PATIENT_ICONS[id]}
          </motion.span>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.button
            key={`${who}-${wiggle}`}
            aria-label="Patient"
            onClick={() => voiceOf(who)()}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1, rotate: wiggle ? [0, -8, 8, 0] : 0 }}
            exit={{ y: -200, opacity: 0 }}
            style={{ border: 'none', background: 'none', fontSize: 'clamp(140px, 30vmin, 240px)', padding: 0 }}
          >
            {PATIENT_ICONS[who]}
          </motion.button>
        </AnimatePresence>
        {want && (
          <div aria-hidden style={{ position: 'absolute', right: '-12%', top: '-8%', width: 'clamp(64px, 10vmin, 90px)', height: 'clamp(64px, 10vmin, 90px)', borderRadius: '50%', background: '#fff', border: '4px solid var(--lavender-dark)', display: 'grid', placeItems: 'center', fontSize: 'clamp(34px, 5.5vmin, 50px)' }}>
            {TOOL_ICONS[want]}
          </div>
        )}
      </div>
      <div aria-label="Tool tray" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(8px, 1.6vmin, 16px)', padding: '0 16px', maxWidth: 900 }}>
        {TRAYS[who].map((t) => (
          <motion.button key={t.key} aria-label={t.key} whileTap={{ scale: 0.85, rotate: -8 }} onClick={() => tap(t.tool)} style={{ ...big, borderColor: t.color ?? '#fff' }}>
            {TOOL_ICONS[t.tool]}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
