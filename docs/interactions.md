# Interactions cookbook: what to reach for

Most moments in a game are plain React + `motion`: tap a thing, it bounces, a puppet reacts. For harder
hands-on play, use the kit in `src/sdk/interact/` (exported from `../../sdk`). You can try every piece at
`#/playground` (source: `src/shell/InteractionDemos.tsx`). Nothing here replaces the older pieces; existing
games keep working as they are.

## Pick the tool

| She should... | Reach for | Notes |
|---|---|---|
| Tap the right answer | `ChoiceCards`, `motion.button` | Keep it a small part of the game. |
| Drag something to one of a few places | `PlayArea` + `Piece` + `Target` | Hover glow, magnetic snap, a hint pulse, and it's safe for many quick drags. Prefer it over `Draggable` in new code. |
| Sort into baskets | `SortIntoBins` (simple) or `PlayArea` (custom look) | |
| Put pieces into exact spots (jigsaw, shape puzzle, build a castle) | `JigsawPuzzle`, or `PlayArea` with `snapTo` | `JigsawPuzzle` cuts any scene picture into tab-and-blank pieces. |
| Place things anywhere (pizza, cake, sundae, sticker scene, decorate a tree) | `StickerBoard` + `countByKind` | Unlimited stamps from a tray; move them again; drag off to remove. |
| Build a look (avatar, dress-up, decorate a room) | `DressUpStudio`, `OptionPicker`, `Swatch` + `useSaved` | Draw the character as layered SVG whose colors are fills. |
| Follow a path or trace a letter, draw | `usePointerDrag` + `perfect-freehand` (pre-approved) | Smooth, finger-width strokes as SVG paths. |
| Scratch or paint to reveal | Canvas + `usePointerDrag` | See `ColoringPage` in `src/world/kit/` for canvas pixel mapping. |
| Something moving by itself (catch falling stars, steer a boat) | `useGameLoop` + refs | A few moving things. Write to `el.style`, not state. |
| Real-time arcade or physics (bouncing, stacking, many sprites, particles) | **Phaser 4** (pre-approved) | Only when the DOM really can't do it; see the recipe below. |

## The kit

### `usePointerDrag(ref, { onStart, onMove, onEnd, onTap, onCancel, threshold })`
Plain pointer events with pointer capture and an 8px threshold. `onTap` never fires together with `onEnd`.
You decide what moving means (usually `el.style.transform = ...`). Nothing re-renders per move.
Helpers: `toLocal(el, clientX, clientY)` gives 0..1 inside a box, plus `centerOf(el)` and `distance(a, b)`.

### `PlayArea` / `Piece` / `Target`
```tsx
const [misses, setMisses] = useState(0)
const [inRoof, setInRoof] = useState(false)
<PlayArea style={{ flex: 1 }}>
  <Target id="roof" hint={misses > 0} style={slotStyle}>{inRoof && <Triangle />}</Target>
  {!inRoof && (
    <Piece
      snapTo="roof"
      onPlace={({ target }) => {
        if (target === 'roof') { setInRoof(true); say(`The roof! Great job, ${KID_NAME}!`); return 'snap' }
        setMisses((m) => m + 1); sounds.oops(); return 'home'
      }}
      onTap={() => setMisses((m) => m + 1)} // tapping shows where it goes
    ><Triangle /></Piece>
  )}
</PlayArea>
```
- `onPlace` returns `'snap'` (click + springy glide), `'stay'` (plop), `'home'` (floats back) or `'reset'`
  (jumps back unseen, for tray stamps).
- After a drop, move the piece in your state (new `left/top`, or render it inside the target). It glides from
  where her finger let go to the new spot, even into a different parent, as long as it keeps the same `id`.
- `snapTo` + `snapRadius` pull the piece toward its spot when it gets close, so it feels like it wants to go there.
- `Target hint` pulses gold. Turn it on after a wrong try (rule: after a mistake, *help*).
- Drop positions come back as fractions of the `PlayArea` (`drop.x`, `drop.y`) and in client px.

### `JigsawPuzzle`
```tsx
<JigsawPuzzle img={scene} rows={2} cols={2} onSnap={(n, total) => setProgress(n, total)}
  onMiss={() => say('Look for the glowing spot!')} onDone={nextRound} />
```
Start at 2×2, finish at 3×3. Use a picture with big, clear shapes. It doesn't speak, so say lines from the
callbacks (and put them in `voice-lines.json`). Tapping a piece lights up its spot.

### `StickerBoard`
```tsx
const [items, setItems] = useState<Placed[]>([])
<StickerBoard surface={<img src={pizza} style={{ width: '100%' }} />} shape="circle" max={20}
  stickers={[{ kind: 'basil', content: <img src={basil} style={{ width: '100%' }} />, size: 0.14, say: 'Basil!' }]}
  items={items} onChange={setItems} onPlace={() => chef.current?.play('nod')} />
countByKind(items).basil // e.g. an order: "3 basil leaves, please!"
```
Positions are fractions of the surface, so the pizza looks the same after the iPad rotates. Pair it with an
order to fill (count, colors, patterns) so it teaches something, and let free decorating be the reward.

### `DressUpStudio` + `useSaved`
```tsx
const [look, setLook] = useSaved(`${meta.id}:look`, { hair: 'long', hairColor: 'brown' })
<DressUpStudio slots={SLOTS} values={look} onChange={setLook} character={<Avatar look={look} />} />
```
Each slot has an `icon` (she can't read) and big options (`thumb` = small drawing or `<Swatch color>`).
Draw the character once as layered SVG: back hair, body, outfit, head, face, front hair, accessory. Colors are
just fills. Build it as a puppet (`usePuppet`) if it should blink and talk. See `Avatar` in
`src/shell/InteractionDemos.tsx`.

### Hooks
`useLandscape()`, `useElementSize(ref)`, `useGameLoop((dt) => ..., running)`, `useSaved(key, initial)`.
New sounds: `sounds.pickup()`, `sounds.place()`, `sounds.snap()`.

## Pitfalls we've hit

- **Motion `drag` can lock up in iPad Safari** when an element unmounts or toggles `drag={false}` right after a
  drop. For many quick drags use `Piece` / `usePointerDrag` (plain pointer events).
- **Don't `setState` 60 times a second.** In `useGameLoop` and `onMove`, write to refs and `el.style`.
- **Store positions as fractions** (0..1 of a box), never px, so rotating the iPad doesn't scramble her work.
- **Targets at least 88px**, and a tap alternative for every drag (tap shows the spot, or places it for her).
- `touch-action: none` goes on draggable things only (the kit does this), or the page can't scroll.
- Test drags in WebKit: `npx playwright test` drives them with the mouse (see the interaction test in
  `tests/smoke.spec.ts`).

## Phaser recipe (real-time or physics games only)

Phaser draws to a canvas. Inside it you lose SVG puppets, lip-sync, `Buddy`, `motion`, crisp HTML text and
real `<button>`s. So keep Phaser to the play field and put everything else in React on top of it.

```tsx
// src/games/<id>/Arcade.tsx: only this folder imports phaser, so only this game downloads it (~360 KB gzipped).
import { useEffect, useRef } from 'react'
import { sounds, say } from '../../sdk'

export function Arcade({ onCaught }: { onCaught: (n: number) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const cb = useRef({ onCaught }); cb.current = { onCaught }
  useEffect(() => {
    let game: import('phaser').Game | undefined
    let cancelled = false
    void import('phaser').then((Phaser) => {
      if (cancelled || !host.current) return
      class Play extends Phaser.Scene {
        create() { /* sprites, physics, input; call sounds.pop(), cb.current.onCaught(n), say(...) */ }
      }
      game = new Phaser.Game({
        type: Phaser.AUTO, parent: host.current, transparent: true,
        scale: { mode: Phaser.Scale.RESIZE }, physics: { default: 'arcade' }, scene: Play,
      })
    })
    return () => { cancelled = true; game?.destroy(true) }
  }, [])
  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />
}
```
- Put the React overlay (prompt, `SayButton`, `SparklePuppet`, progress) above the canvas, and keep ~104px
  clear at the top for the shell.
- Load art with `this.load.image('star', starUrl)` using the imported `.webp` URLs.
- Gentle speeds, nothing to lose, and spoken instructions, same as every game.
- The smoke test still needs at least 2 real `<button>`s on screen (the overlay has them).
- Never import `phaser` from `src/sdk`, the shell or a `meta.ts`. `npm run check` fails if you do
  (`scripts/check-heavy-imports.mjs`).

## Adding a library

Pre-approved (already installed): **phaser**, **perfect-freehand**. Anything else: see "Dependencies" in
`AGENTS.md`. Ask first, and explain what it enables and what it costs.
