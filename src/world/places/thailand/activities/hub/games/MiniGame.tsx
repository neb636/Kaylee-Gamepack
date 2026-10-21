// The house's mini games: tap a family member downstairs and, after they hop together, a game with them opens over
// the house. Putto (at the big table) plays tic-tac-toe, Aunt Joy (by the couch) runs a beauty salon, and Aunt Jum
// (in the kitchen) makes mango sticky rice. Each is a hub section (sections.ts) so Dad can open it straight from a link.
import { AnimatePresence } from 'motion/react'
import { Salon } from './Salon'
import { StickyRice, STEPS, type Step } from './StickyRice'
import { TicTacToe } from './TicTacToe'

export type GameId = 'tic-tac-toe' | 'salon' | 'sticky-rice'
/** Who hosts which game (a family id from characters/family.ts). */
export const HOSTS: Record<string, GameId> = { putto: 'tic-tac-toe', joy: 'salon', jum: 'sticky-rice' }
export const isGame = (s: string): s is GameId => Object.values(HOSTS).includes(s as GameId)

interface Props {
  game: GameId | null
  /** Params from the deep link the game was opened with (only for the first game shown). */
  look?: string
  step?: string
  onClose(): void
  /** The game's state changed (for the address bar). */
  onState(state: { look?: string; step?: string }): void
}

export function MiniGame({ game, look, step, onClose, onState }: Props) {
  return (
    <AnimatePresence>
      {game === 'tic-tac-toe' && <TicTacToe key="ttt" onClose={onClose} />}
      {game === 'salon' && <Salon key="salon" onClose={onClose} start={look || undefined} onLook={(l) => onState({ look: l })} />}
      {game === 'sticky-rice' && <StickyRice key="rice" onClose={onClose} start={STEPS.includes(step as Step) ? (step as Step) : undefined} onStep={(s) => onState({ step: s })} />}
    </AnimatePresence>
  )
}
