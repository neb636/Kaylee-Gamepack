// Station 6 - Are there enough? Give each plushie guest one teacup, then decide if there were enough cups.
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ChoiceCards, DragArea, Draggable, DropZone, KID_NAME, praise, randomInt, say, sample, shuffle, sounds, useAlive } from '../../../sdk'
import { art, Stage, type StationProps } from '../shared'

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
      void say('That friend already has a cup! One cup for each friend.')
      return false
    }
    sounds.pop()
    setServed((s) => [...s, target])
    void say(`A cup for ${guests[target].name}!`)
    return true
  }

  const correct = async () => {
    const hungry = guests.find((_, i) => !served.includes(i))
    const why = hungry
      ? `Not enough! ${hungry.name} doesn't have a cup.`
      : cups > guests.length
        ? 'Yes, there are enough! Every friend has a cup, and there is one extra!'
        : 'Yes, there are enough! Every friend has one cup!'
    await say(`${why} ${praise()}`)
    if (!alive()) return
    if (round + 1 < rounds.length) {
      setRound(round + 1)
      setServed([])
    } else onDone()
  }

  const choices = useMemo(
    () => [
      { key: 'yes', content: <span style={{ fontSize: 44 }}>👍 Yes</span>, correct: enough, ariaLabel: 'yes' },
      { key: 'no', content: <span style={{ fontSize: 44 }}>👎 No</span>, correct: !enough, ariaLabel: 'no' },
    ],
    [enough],
  )

  const prompt = asking
    ? 'Are there enough cups for every friend?'
    : round === 0
      ? `Are there enough? The friends are here for tea! ${KID_NAME}, give each friend one teacup.`
      : 'New friends! Give each friend one teacup.'

  const guestSize = `min(170px, calc((100vw - 60px) / ${guests.length} - 16px), 17vh)`
  return (
    <Stage prompt={prompt}>
      <DragArea style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 20 }}>
        {/* Cups waiting on the tray */}
        <div style={{ display: 'flex', gap: 16, minHeight: 'min(110px, 12vh)', alignItems: 'center', background: 'rgba(255,255,255,0.75)', borderRadius: 999, padding: '8px 28px', boxShadow: 'var(--shadow)' }}>
          <AnimatePresence>
            {Array.from({ length: cupsLeft }, (_, i) => (
              <motion.div key={`${round}-${served.length + i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Draggable onDrop={(zone) => (zone ? serve(Number(zone.split('-')[1])) : false)} onTap={() => serve()} disabled={asking}>
                  <img src={art.teacup} alt="teacup" style={{ width: 'min(96px, 10vh)' }} />
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
              <div style={{ height: 'min(80px, 9vh)', display: 'grid', placeItems: 'center' }}>
                {served.includes(i) ? (
                  <motion.img initial={{ y: -80, scale: 0 }} animate={{ y: 0, scale: 1 }} src={art.teacup} alt="" style={{ width: 'min(80px, 9vh)' }} />
                ) : (
                  <div style={{ width: 70, height: 50, borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.9)' }} />
                )}
              </div>
              <motion.img
                initial={{ y: 60, opacity: 0 }}
                animate={asking && !served.includes(i) ? { y: [0, -10, 0], opacity: 1 } : { y: 0, opacity: 1 }}
                transition={asking && !served.includes(i) ? { repeat: Infinity, duration: 0.8 } : { delay: i * 0.1 }}
                src={g.img}
                alt={g.name}
                style={{ width: '100%' }}
              />
            </DropZone>
          ))}
        </div>
      </DragArea>
      <div style={{ minHeight: 140 }}>
        {asking && <ChoiceCards key={round} size={Math.min(170, window.innerHeight * 0.14)} choices={choices} onCorrect={() => void correct()} hint="Look at the friends. Does every friend have a cup?" />}
      </div>
    </Stage>
  )
}
