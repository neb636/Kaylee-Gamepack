# The controls: one family, six places

Every game used to draw its own back, skip, again and done buttons, each in its own corner, size and colour, often
with a system emoji for a picture. The same job should look the same and sit in the same place everywhere.
New code follows this now; old code moves over **one country per PR** (see "Rollout" below), so each one is small
enough to play through. `scripts/check-hud.mjs` (part of `npm run verify`) checks the countries that have moved.

## Where things live

| Place | What goes there | How |
|---|---|---|
| Top left | **Leave.** The only back button. One level up per tap; its picture says where it goes | The shell draws it (`PlaceFrame`). A game inside a trip or a room takes it over with `useTopLeft` (`kit/topLeft.ts`) |
| Beside it | **Progress.** One pill, never a second row of the game's own | `setProgress(done, total)`; a game in parts passes `parts` and they show as dashes under the stars |
| Top right | **Tools** she opens and closes (dress-up, the games shelf) | `<HudButton role="open" size="sm" slot="top-right" />` |
| Bottom left | **Sparkle** and her bubble; tap her to hear it again | `kit/Guide.tsx` |
| Bottom centre | **The end card**, only when a round is over: a small again, a big way on | `<EndCard>` with `<HudButton role="again" />` and `<HudButton role="go" size="lg" pulse />` |
| Bottom right | **The way on, done, again or skip**, when it's the only one | `<HudButton slot="bottom-right" />` |

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
for a control** (🔁 ↩️ ⏩ ⏭ 👋 ↻): they are Apple's art, not the game's, and differ on every device. A picture of the
thing itself (a stop on a road, the sun coming back) may still be an emoji as the button's child. Inside a pill
(`BigButton`) or a line of text, use `<HudGlyph icon="again" />`.

`aria-label` (`label`) is what the robots and the tests click: keep a button's label when you restyle it.

A button that should wait a moment before it pops in passes `delay` (seconds); a press is never delayed.

## Layers

`--z-guide` (25) < `--z-hud` (45) < `--z-bar` (50) < `--z-sheet` (60), in `world.css`. Use these instead of a new number.

## Rollout: one country per PR

Moving a country over: swap its hand-made corner buttons and emoji control pictures for `HudButton`/`HudGlyph` in
the slots above, keep every `aria-label`, add the country's folder to `UPGRADED` in `scripts/check-hud.mjs`, and
put a before-and-after of each button on the review page. One country per PR so each can be played through on its
own.

| Country / part | Status |
|---|---|
| The Poles | done: the three "again" buttons and "bring the summer back" are `HudButton`s, bottom right |
| Peru | done: Terraces' done is a mint `HudButton` bottom right (her photo pile sits just above it, and Sparkle stands bottom left for the photo); the balloon-soon screen's way back to the map is a pink `HudButton` bottom right |
| Australia | done: the postcard's Send is a pink `HudButton` (the way on), still at the end of the crayons where the colouring page keeps it a space |
| Egypt | done: it draws no buttons of its own. The Nile's lotus row (moved from bottom right to top right) and the passage's scarab row stay as picture counters, both top right (pictures of the thing she collects, inside the part the star pill counts); the ✅ on map stops and recipe steps are status marks, not controls |
| Italy | done: the three ticks on "done" pills (the mask shop, the pizza toppings, the pizza cutter) are the drawn check (`HudGlyph`), same mint pills in the same places. The stamp pills (🍕 ⭐, 🏛️ ⭐, 🫒 ⭐), the "let's cook" and "next customers" pills (🍕 ▶) and the oven's 🍕⬇️ / 🔄 are pictures of the thing she does, so they stay; the ✅ on map stops and pizza tickets are status marks |
| China | done: the Great Wall's "follow Hou Hou" arrow is a pink `HudButton` with the drawn play (the way on, breathing while Hou Hou waits); it stays halfway up the side it points to and turns round (`hud-flip`) when she has to walk back. The dumpling pills (🥟 ▶) are pictures of the thing she does, the ▶ on video cards is part of the picture, and the ✅ on map stops and tickets are status marks |
| Canada | done: the five "again" pills (bath, canoe, snowmen, campfire, whales) are lavender with the drawn again (`HudGlyph`) beside the picture of the game, where they were. The campfire roast's own star row is gone: its order stars go in the shell's pill, with the campfire's parts as pink dashes under them (`setProgress(done, total, parts)`). The animal book's ✖️ is a white `HudButton` with the drawn close. `PlaceFrame` keeps stars with the activity that set them, so they no longer vanish when the country's code is already loaded |
| Thailand | done: one back button. Inside a mall game, at the game table and in a Koh Samet stop the top-left button goes one level up (`useTopLeft` is a stack, so the table hands it back to the house); the lavender ↩️ and the table's 👋 are gone. The eight mall games' way on is a pink `HudButton` bottom right (it used to float top centre, and over Sparkle at the slide); on an upright phone the sock band of stickers wraps to two rows so it clears the back button. End cards (`EndCard`: a small again, a big way on) for the boat race podium, the Nan roads and the three farm stops. Skip (the house arrival, both planes, the speedboat), done (the wardrobe, the album, the suitcase) and open (the party, the album, dress-up, the games, the HarborLand map) are `HudButton`s in their slots; the board games' again is lavender bottom centre. The jet ski's again pill and "So close!" use the drawn again (`HudGlyph`) |
| Shared screens | their own PR: the stamp screen, story beat, videos, trophy, film skip, colouring undo, puzzle book, `SayButton` |

The first full try at all of this, in one PR, is #566: borrow from it.
