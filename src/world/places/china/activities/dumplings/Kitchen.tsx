// Chef Fu's kitchen, in layers: the generated back wall (crops freely), Chef Fu standing behind the counter, the counter
// drawn in code, then the work top where she makes dumplings, the stove and steamers on the right, and the order
// tickets. Everything in front of Chef Fu is placed from the screen size, so he is always behind the counter.
import type { ReactNode, Ref } from 'react'
import { PlayArea, useLandscape, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { art } from '../../art'
import { L } from '../../lines'
import { Counter } from '../../props'
import { ChefFu } from '../../puppets/ChefFu'
import { WordCard, type WordId } from '../../WordCard'
import { tickle } from './shared'

export interface KitchenProps {
  chef: Ref<PuppetHandle>
  prompt?: Line
  /** Order tickets (top left, under the top bar). */
  tickets?: ReactNode
  /** The stove (right end of the counter). */
  stove?: ReactNode
  /** What she's working on, centered on the work top. */
  children?: ReactNode
  word?: WordId | null
}

export function Kitchen({ chef, prompt, tickets, stove, children, word }: KitchenProps) {
  const landscape = useLandscape()
  return (
    <PlayArea style={{ position: 'absolute', inset: 0, overflow: 'hidden', ['--counter-h' as string]: landscape ? '40%' : '36%', ['--stove-w' as string]: landscape ? 'min(27vw, 36vh)' : 'min(27vw, 20vh)', ['--ticket-d' as string]: 'clamp(30px, min(5vw, 5vh), 52px)' }}>
      {/* The wall is drawn taller than the screen and pinned to the top, so the painted counter (and its wok) sits behind ours. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: landscape ? '130%' : '118%', background: `url(${landscape ? art.bgKitchen : art.bgKitchenTall}) center top / cover` }} />
      {/* Chef Fu, behind the counter: about a third of him hides below the counter edge. */}
      <div style={{ position: 'absolute', left: landscape ? '4%' : '6%', bottom: `calc(var(--counter-h) - ${landscape ? 'min(60vh, 40vw)' : 'min(44vh, 66vw)'} * 0.32)`, height: landscape ? 'min(60vh, 40vw)' : 'min(44vh, 66vw)' }}>
        <ChefFu ref={chef} height="100%" onTap={() => tickle(chef, L.dumplings.tickle.cheffu, 'laugh')} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 'var(--counter-h)' }}>
        <Counter />
      </div>
      {/* The stove sits on the right end of the work top. */}
      <div style={{ position: 'absolute', right: landscape ? '3%' : '2%', bottom: 'calc(var(--counter-h) * 0.42)', zIndex: 3 }}>{stove}</div>
      {/* Work area: things stand on the work top; tall moments (steam, the pleat circle) can reach up over the wall. */}
      <div style={{ position: 'absolute', left: landscape ? '6%' : '2%', right: 'calc(var(--stove-w) + 4%)', top: 'calc(var(--top-clear) + 70px)', bottom: landscape ? 'calc(var(--counter-h) * 0.3)' : 'calc(var(--counter-h) * 0.34)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', zIndex: 4, pointerEvents: 'none', containerType: 'size' }}>
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</div>
      </div>
      {/* Order tickets hang under the prompt (just pictures to count; they never catch a tap). */}
      {tickets && <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(var(--top-clear) + 84px)', display: 'flex', justifyContent: 'center', gap: 24, zIndex: 6, pointerEvents: 'none' }}>{tickets}</div>}
      {prompt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      <WordCard word={word ?? null} />
    </PlayArea>
  )
}
