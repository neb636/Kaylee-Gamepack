// Station 6 - Are there enough? Give each plushie guest one teacup, then decide if there were enough cups.
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ChoiceCards, DragArea, DropZone, randomInt, say, sample, shuffle, sounds, useAlive } from '../../../sdk'
import { art, Draggable, Stage, type StationProps } from '../shared'

const GUESTS = [
  { name: 'Bear', img: art.bear },
  { name: 'Bunny', img: art.bunny },
  { name: 'Kitty', img: art.kitty },
  { name: 'Puppy', img: art.puppy },
]

type Kind = 'enough' | 'short' | 'extra'

function makeRound(kind: Kind) {
  const guests = sample(GUESTS, randomInt(kind === 'short' ? 3 : 2, kind === 'extra' ? 3 : 4))
  const cups = kind === 'enough' ? guests.length : kind === 'short' ? guests.length - 1 : guests.length + 1
  return { guests, cups, kind }
}

export function Enough({ onDone }: StationProps) {
  const [rounds] = useState(() => shuffle<Kind>(['enough', 'short', 'extra']).map(makeRound))
  const [round, setRound] = useState(0)
  const [served, setServed] = useState<number[]>([]) // guest indexes that have a cup
  const [helping, setHelping] = useState(false) // after a wrong answer, point at every friend's cup spot
  const alive = useAlive()
  const { guests, cups } = rounds[round]
  const cupsLeft = cups - served.length
  const asking = cupsLeft === 0 || served.length === guests.length
  const enough = cups >= guests.length

  const serve = (guest?: number) => {
    if (asking) return false
    const target = guest ?? guests.findIndex((_, i) => !served.includes(i))
    if (target < 0 || served.includes(target)) {
      sounds.oops()
      void say('That friend has a cup already. Give the next cup to someone without one!')
      return false
    }
    sounds.pop()
    setServed((s) => (s.includes(target) ? s : [...s, target]))
    void say(`Here's a cup for ${guests[target].name}!`)
    return true
  }

  const correct = async () => {
    const hungry = guests.find((_, i) => !served.includes(i))
    const response = hungry
      ? `No, there aren't enough cups. ${hungry.name} is still waiting! You spotted that!`
      : cups > guests.length
        ? "Yes! Everyone has a cup, and there's one left over!"
        : 'Yes! Everyone has a cup!'
    await say(response)
    if (!alive()) return
    if (round + 1 < rounds.length) {
      setRound(round + 1)
      setServed([])
      setHelping(false)
    } else onDone()
  }

  const choices = useMemo(
    () => [
      { key: 'yes', content: <Answer emoji="👍" label="Yes" />, correct: enough, ariaLabel: 'yes' },
      { key: 'no', content: <Answer emoji="👎" label="No" />, correct: !enough, ariaLabel: 'no' },
    ],
    [enough],
  )

  const prompt = asking
    ? 'Does every friend have a cup?'
    : round === 0
      ? 'The friends are here for tea! Give each one a cup, then we will see if there are enough.'
      : 'More friends are here! Give each one a cup.'

  const guestSize = `min(230px, calc((100vw - 60px) / ${guests.length} - 16px), 20vh)`
  return (
    <Stage prompt={prompt} queuePrompt={asking}>
      <DragArea style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 20 }}>
        {/* Cups waiting on the tray */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, width: 'min(100%, 600px)', minHeight: 'min(130px, 14vh)', alignItems: 'center', background: 'rgba(255,255,255,0.75)', borderRadius: 40, padding: '8px 12px', boxShadow: 'var(--shadow)' }}>
          <AnimatePresence>
            {Array.from({ length: cupsLeft }, (_, i) => (
              <motion.div key={`${round}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, position: 'absolute' }}>
                <Draggable onDrop={(zone) => (zone ? serve(Number(zone.split('-')[1])) : false)} onTap={() => serve()} disabled={asking}>
                  <img src={art.teacup} alt="teacup" style={{ width: 'min(100px, 11vh, 19vw)' }} />
                </Draggable>
              </motion.div>
            ))}
          </AnimatePresence>
          {cupsLeft === 0 && <span style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink-soft)' }}>No more cups!</span>}
        </div>

        {/* Guests at the table */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: '3vh' }}>
          {guests.map((g, i) => (
            <DropZone key={`${round}-${g.name}`} id={`guest-${i}`} style={{ width: guestSize, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                animate={helping ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={helping ? { repeat: Infinity, duration: 1, delay: i * 0.25 } : {}}
                style={{ height: 'min(80px, 9vh)', display: 'grid', placeItems: 'center' }}
              >
                {served.includes(i) ? (
                  <motion.img initial={{ y: -80, scale: 0 }} animate={{ y: 0, scale: 1 }} src={art.teacup} alt="" style={{ width: 'min(80px, 9vh)' }} />
                ) : (
                  <div style={{ width: 70, height: 50, borderRadius: '50%', border: helping ? '5px dashed var(--hotpink)' : '4px dashed rgba(255,255,255,0.9)' }} />
                )}
              </motion.div>
              <motion.img
                initial={{ y: 60, opacity: 0 }}
                animate={asking && !served.includes(i) ? { y: [0, -10, 0], opacity: 1 } : { y: 0, opacity: 1 }}
                transition={asking && !served.includes(i) ? { repeat: Infinity, duration: 0.8 } : { delay: i * 0.1 }}
                src={g.img}
                alt={g.name}
                // Same box for every guest so the taller bunny doesn't sit lower than her friends.
                style={{ width: '100%', height: guestSize, objectFit: 'contain', objectPosition: 'bottom' }}
              />
            </DropZone>
          ))}
        </div>
      </DragArea>
      <div style={{ minHeight: 140 }}>
        {asking && (
          <ChoiceCards
            key={round}
            size={Math.min(170, window.innerHeight * 0.14)}
            choices={choices}
            onCorrect={() => void correct()}
            onWrong={() => {
              setHelping(true)
              void say('Look closely. Does every friend have a cup?')
            }}
          />
        )}
      </div>
    </Stage>
  )
}

function Answer({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
      <span style={{ fontSize: '0.75em' }}>{emoji}</span>
      <span style={{ fontSize: '0.5em' }}>{label}</span>
    </span>
  )
}
