// Mommy asks if she's ready to go on a trip, with two big buttons that need no reading: 👍 yes (with the suitcase) and
// ✋ not yet. With one trip on the card (the house: only the mall, since the other trips start on the Thailand map), she
// asks about that one and 👍 carries its picture. Once there are two trips (`trips`), she asks where to, and 👍 becomes a picture button for each: 🚤 the
// boat trip, 🛝🍕 the mall day, 🏔️🚙 the Nan road trip. It shows in the house (when Kaylee comes up to her room, or taps Mommy) and as each
// trip's first section. "Not yet" gets a happy "OK! Tell me when!" and the card goes, nothing lost. Mommy says it out
// loud in her own voice (her 3D mouth moves with it); the card shows the words for Dad. On the street Daddy asks
// instead (`who="nick"`, tap him), so a trip can start right where the tuk-tuk drops her off.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ChoiceCard, Dialogue, lineText, say, sounds, type Line } from '../../../../../sdk'
import { WHO } from '../../who'
import { L } from '../../lines'
import meta from '../../meta'

/** She said yes in the house: the trip she picked opens straight on its first leg instead of asking again. */
export const saidYes = { at: 0, trip: 'boat-trip' }
export const justSaidYes = (trip = 'boat-trip') => saidYes.at > 0 && saidYes.trip === trip && performance.now() - saidYes.at < 8000

/** A trip she can pick on Mommy's card: its activity id and its picture. */
export interface TripChoice {
  id: string
  label: string
  icon: string
  color: string
}
/** The family's trips from the house, in the order the card shows them. */
export const TRIP_CHOICES: TripChoice[] = [
  { id: 'boat-trip', label: 'The boat trip', icon: '🚤', color: 'var(--sky)' },
  { id: 'mall-trip', label: 'The mall', icon: '🛝🍕', color: 'var(--butter)' },
  { id: 'nan-trip', label: 'The mountains', icon: '🏔️🚙', color: 'var(--mint)' },
]
/** The trips on Mommy's card: the ones in the game (meta.ts `activities`), and `also` (a trip still in the works, on
 *  its own card: only its links reach it). */
export const tripChoices = (also?: string) => TRIP_CHOICES.filter((t) => t.id === also || meta.activities.some((a) => a.id === t.id))
/** Who asks: Mommy upstairs and in the trips, Daddy on the street. Their lines (one trip / two or more / not yet), their
 *  name and the color of their unicorn. */
const ASKERS = {
  ji: { name: 'Mommy', color: '#FF8FB8', question: L.trip.ask.question, where: L.mall.trip.where, later: L.trip.ask.later, mall: L.trip.ask.mall },
  nick: { name: 'Daddy', color: '#7FD1B9', ...L.trip.ask.daddy },
} satisfies Record<string, { name: string; color: string; question: Line; where: Line; later: Line; mall: Line }>
export type Asker = keyof typeof ASKERS

interface Props {
  open: boolean
  /** She picked a trip (its id; with no `trips`, the one trip there is). */
  onYes(trip?: string): void
  /** After their "OK! Tell me when!". */
  onNotYet(): void
  /** Two or more trips: a picture button for each instead of 👍. */
  trips?: TripChoice[]
  /** Who asks (Mommy unless set). */
  who?: Asker
}

export function Ask({ open, onYes, onNotYet, trips, who = 'ji' }: Props) {
  const asker = ASKERS[who]
  const [later, setLater] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    if (open) setLater(false)
  }, [open])
  useEffect(() => () => clearTimeout(timer.current), [])
  const where = !!trips && trips.length > 1
  const one = trips?.length === 1 ? trips[0] : null
  const line = later ? asker.later : where ? asker.where : one?.id === 'mall-trip' ? asker.mall : asker.question
  useEffect(() => {
    if (open) void say(line)
  }, [open, line])
  const yes = (trip?: string) => () => {
    sounds.correct()
    onYes(trip)
  }
  const picks = where ? trips.map((t) => ({ id: t.id, label: t.label, icon: t.icon, extra: '', color: t.color, on: yes(t.id) })) : [{ id: 'yes', label: 'Yes', icon: '👍', extra: one ? one.icon : '🧳', color: one ? one.color : 'var(--mint)', on: yes(one?.id) }]
  const buttons = [
    ...picks,
    { id: 'not-yet', label: 'Not yet', icon: '✋\uFE0F', extra: '⏳\uFE0F', color: 'var(--lavender)', on: () => {
      sounds.pop()
      setLater(true)
      timer.current = setTimeout(onNotYet, 1300)
    } },
  ]
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ask"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 22px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(18px, 3vh, 28px)', padding: '0 16px', zIndex: 50, pointerEvents: 'none' }}
        >
          <Dialogue who={who === 'ji' ? WHO.ji : WHO.nick} size="lg" avatar={72}>
            {lineText(line)}
          </Dialogue>
          {!later && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(16px, 4vw, 36px)', pointerEvents: 'auto' }}>
              {buttons.map((b, i) => (
                <ChoiceCard
                  key={b.id}
                  aria-label={b.label}
                  icon={`${b.icon}${b.extra}`}
                  label={b.label}
                  color={b.color}
                  big={!where}
                  initial={{ scale: 0, rotate: i % 2 ? 4 : -4 }}
                  animate={{ scale: i < picks.length ? [1, 1.05, 1] : 1, rotate: 0 }}
                  transition={i < picks.length ? { scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.4 + i * 0.3 }, rotate: { type: 'spring' } } : { type: 'spring', delay: 0.1 }}
                  onClick={b.on}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
