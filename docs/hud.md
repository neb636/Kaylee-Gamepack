# The controls: one family, six places

Every game used to draw its own back, skip, again and done buttons, each in its own corner, size and colour, often
with a system emoji for a picture. Now the same job looks the same and sits in the same place everywhere.
`scripts/check-hud.mjs` (part of `npm run verify`) keeps it that way.

## Where things live

| Place | What goes there | How |
|---|---|---|
| Top left | **Leave.** The only back button. One level up per tap; its picture says where it goes | The shell draws it (`PlaceFrame`). A game inside a trip or a room takes it over with `useTopLeft` (`kit/topLeft.ts`; they stack, so the game table inside the house gives it back to the house) |
| Beside it | **Progress.** One pill, never a second row of the game's own | `setProgress(done, total)`. A game with parts and a goal inside the part passes `parts` too: the stars are what she is doing now, the dashes under them are the parts (the campfire roast) |
| Top right | **Tools** she opens and closes (dress-up, the games shelf) | `<HudButton role="open" size="sm" slot="top-right" />` |
| Bottom left | **Sparkle** and her bubble; tap her to hear it again | `kit/Guide.tsx` |
| Bottom centre | **The end card**, only when a round is over: a small again, a big way on | `<EndCard>` with `<HudButton role="again" />` and `<HudButton role="go" size="lg" pulse />` |
| Bottom right | **The way on, done or skip.** | `<HudButton slot="bottom-right" />` |

Only one thing on a screen breathes (`pulse`): the way on.

## The buttons

`<HudButton role icon label slot />` from `src/world/kit/Hud.tsx`. One size (`--target`; `sm` is the top bar's, `lg`
the end card's way on), one white ring, one press lip. A small one still takes a full-size finger.

| `role` | Colour | For |
|---|---|---|
| `leave` | white | going back (the top-left button) |
| `go` | pink | the way on |
| `done` | mint | finishing something she chose to do (the wardrobe, the album, the suitcase) |
| `again` | lavender | one more round |
| `open` | butter | opening something: a map, an album, the party, another road |
| `skip` | quiet white, smaller | skipping a ride or a story |

Pictures are drawn, in `src/sdk/components/HudIcons.tsx` (`HUD_ICONS`): back, map, play, check, again, skip, sound,
close, home, party, mirror, dice, album. Add one there when a control needs a new picture. **Never a system emoji
for a control** (🔁 ↩️ ⏩ ⏭ 👋): they are Apple's art, not the game's, and differ on every device. A picture of a place
(a stop on a road, the island) may still be an emoji as the button's child. Inside a pill (`BigButton`) or a line of
text, use `<HudGlyph icon="again" />`.

`aria-label` (`label`) is what the robots and the tests click: keep a button's label when you restyle it.

## Layers

`--z-guide` (25) < `--z-hud` (45) < `--z-bar` (50) < `--z-sheet` (60), in `world.css`. Use these instead of a new number.

## Not done yet

- 2D games still show the instruction at the top (`kit/Stage`'s prompt bubble); 3D games show it beside Sparkle.
- The private guides (Thai house, trip legs, Canada hub, whales) are still their own copies of `kit/Guide`.
- Thailand's trips and the Poles don't report progress to the shell's pill.
- Egypt's lotus and scarab rows and the sky pod's stars are still the game's own counters.
