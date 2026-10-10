# Peru: Luna’s Animal Explorer Mission

## Summary and release decisions

A complete Peru destination for Around the World, guided by **Luna, a curious alpaca girl with a pink explorer satchel**. Sparkle gives instructions; Luna and the animals tell their own stories.

**Story:** Luna’s explorer journal has five empty picture windows. Kaylee helps discover mountain weather, weaving, condors, river dolphins, and Machu Picchu. Every activity earns a passport stamp, an animal sticker, and a journal picture. Completing all five unlocks a short balloon expedition finale.

Peru combines cute animals and distinctive hands-on play. Alpaca fiber and weaving are living Andean traditions; condors inhabit Colca Canyon; pink river dolphins inhabit Peru’s Amazon region. References: [textiles](https://www.peru.travel/attractions/awanacancha), [Colca](https://www.peru.travel/experiences/visiting-colca-canyon-and-spotting-condors), [Amazon](https://www.peru.travel/stories/pacaya-samiria-all-you-have-to-know-about-this-peruvian-amazon-paradise).

Full release: five activities, one finale, eight optional passport facts, three coloring pages, two bonus puzzles. No videos. First visit targets 5–7 minutes excluding extras; each activity has 3–5 meaningful touches and takes roughly 45–75 seconds. These are pacing targets, never enforced timers. All activities are open initially; only the finale is locked.

**Current implementation request (2026-10-05): build only Cozy Andes.** Establish a Peru hub and one playable activity. Show the other four discoveries as coming soon; do not award the full country trophy from this partial chapter. Keep the country finale as a spoken coming-soon screen until all five activities exist. Preserve the complete script below for subsequent chapters.

**Camera consistency requirement:** the activity scene is an eye-level, straight-on view. Luna and all wearable props use a matching front-facing orthographic elevation. No overhead/flat-lay clothes, isometric pieces, or unrelated 3/4-view assets. Clothing uses identical SVG shapes in its tray and on the puppet. Compare the scene, reference, tray, and dressed puppet together during visual QA. The future country map is intentionally a separate cartographic view; it is not mixed into the play scene.

## Play and exact spoken script

All quoted phrases are exact recording text. Sparkle speaks instructions and hints; characters speak their own lines. Introductions are skippable, every active prompt has a replay button, and no gesture waits for speech. Plain strings in `lines.ts` are Sparkle; other lines are tagged by speaker. Every phrase, including titles, trophy lines, hints and tickles, belongs in the voice manifest.

### Arrival and hub

Illustrated Peru map: Pacific coast left, Andes through the middle, rainforest east. Five large activity pins; Luna and the journal sit beside it in landscape and below it in portrait. Journal windows derive from saved stamps. Animals stay in illustrated habitat windows, rather than gathering outside their natural homes.

| Trigger | Speaker | Exact line |
| --- | --- | --- |
| First arrival | Luna | Hola, Kaylee! I’m Luna! |
| Arrival continues | Luna | Let’s fill my explorer journal! |
| First actionable hub | Sparkle | Tap a picture to explore Peru! |
| Return after activity | Luna | Another discovery, Kaylee! |
| Returning visit | Sparkle | Where shall we explore? |
| All stamps collected | Luna | Our journal is full! |
| Finale available | Sparkle | Tap the balloon for our adventure! |
| Finale before completion | Sparkle | Explore each picture first! |
| Tap Luna | Luna | Hee hee! My fluffy ears! |
| Tap Luna again | Luna | I love exploring with you! |
| Optional greeting explanation | Sparkle | Hola means hello in Spanish! |
| Optional greeting | Luna | Hola, Kaylee! |

Spanish is one of Peru’s languages. Optional facts acknowledge Quechua and Aymara too: [reference](https://www.peru.travel/yourperfectperu/about-peru/language).

For the partial first chapter, the hub’s prompt is “Tap the warm hat to help Luna!”; unavailable pins say “This discovery opens soon!” The finale says “Our expedition opens soon!” and offers return to the map. One saved stamp fills only the first of five journal windows.

### 1. Cozy Andes

**Place:** highland meadow near Cusco. **Goal:** discover mountain weather and help Luna stay comfortable. **Mechanic:** dress a live puppet, then use an oversized zipper. **Four actions:** hat, scarf, jacket, zip. **Reward:** alpaca sticker and a journal picture of warmly dressed Luna.

1. Drag a knitted hat onto Luna’s head.
2. Drag a scarf around her neck.
3. Drag a jacket onto her body.
4. Pull its oversized zipper upward.

One request at a time. First item has only the useful object. Later requests add one clear distractor (beach hat/swim ring). Suitable clothing colors are accepted. Luna shivers gently, watches approaching clothes, lowers her head for the hat, then snuggles into her outfit. Grass and clouds move softly.

| Trigger | Speaker | Exact line |
| --- | --- | --- |
| Story | Luna | Brrr! It’s chilly up here! |
| Hat | Sparkle | Give Luna the warm hat! |
| Hat placed | Luna | Cozy ears! |
| Scarf | Sparkle | Wrap Luna in the scarf! |
| Scarf placed | Luna | Soft and snuggly! |
| Jacket | Sparkle | Put on Luna’s warm jacket! |
| Zipper | Sparkle | Pull the zipper up! |
| Wrong item | Sparkle | Find the warm, woolly one! |
| Missed target | Sparkle | Try the glowing spot! |
| Short zipper stroke | Sparkle | Pull up to the glowing star! |
| Completion | Luna | Ready to explore, Kaylee! |
| Sticker screen | Sparkle | Alpaca sticker! Alpacas have soft fleece! |

After a mistake, pulse the correct object and target. A second mistake removes the distractor. Tapping an object places it; tapping the zipper completes the motion. The weather line refers to this scene, not all of Peru: [regional climate](https://www.peru.travel/es/datos-utiles/clima).

### 2. Rainbow Weaving

**Place:** contemporary weaving courtyard near Cusco. **Goal:** experience weaving and repeat a pattern. **Mechanic:** move a large shuttle across a loom. **Four passes:** right, left, right, left. **Reward:** llama sticker and woven-panel journal picture.

Large vertical threads and a ghost preview show pink, lavender, pink, lavender rows. The shuttle carries the next color automatically. Each pass visibly alternates thread crossings. Last two passes have fewer directional cues, restored immediately when needed. The finished panel becomes the journal’s fabric pocket. Luna reaches toward the arriving shuttle and cheers.

| Trigger | Speaker | Exact line |
| --- | --- | --- |
| Story | Luna | Our journal needs a colorful pocket! |
| First pass prompt | Sparkle | Slide the shuttle to the star! |
| First pass | Sparkle | Pink! |
| Second prompt | Sparkle | Now slide it back! |
| Second pass | Sparkle | Lavender! |
| Third prompt | Sparkle | Pink again! Keep weaving! |
| Fourth prompt | Sparkle | Lavender again! |
| Incomplete pass | Sparkle | Keep sliding to the glowing star! |
| Wrong direction | Sparkle | Follow the glowing arrow! |
| Completion | Luna | You made a pattern, Kaylee! |
| Craft connection | Sparkle | People in Peru weave beautiful cloth! |
| Sticker | Sparkle | Llama sticker! Llamas can carry supplies! |

Tap shuttle to complete a pass. No precise over/under finger path. Original stripes are inspired by weaving, without invented meanings for traditional designs: [reference](https://www.peru.travel/es/atractivos/mundo-alpaca).

### 3. Condor Sky Ride

**Place:** Colca Canyon. **Character:** Coco, an Andean condor. **Goal:** discover soaring and directional movement. **Mechanic:** guide a live puppet through rising air. **Three actions:** nearby ribbon, higher ribbon, across-canyon ribbon. **Reward:** condor sticker and canyon-flight picture.

Three broad translucent air ribbons appear sequentially. Drag Coco into each one; he banks, opens his articulated wings, then rises on a forgiving curve. He waits on safe ledges between glides. Nothing falls, escapes or runs out.

| Trigger | Speaker | Exact line |
| --- | --- | --- |
| Story | Coco | Come glide over my canyon! |
| First prompt | Sparkle | Move Coco into the rising air! |
| First glide | Coco | Up we go! |
| Second prompt | Sparkle | Find the next windy ribbon! |
| Second glide | Coco | Look at my wide wings! |
| Third prompt | Sparkle | Glide across the canyon! |
| Miss | Sparkle | The glowing ribbon lifts Coco! |
| Completion | Coco | What a view, Kaylee! |
| Sticker | Sparkle | Condor sticker! Condors soar on rising air! |

Tap the current ribbon to guide Coco. Misses return him gently to his ledge and enlarge the highlighted target.

### 4. Rosa’s River Ripples

**Place:** a Peruvian Amazon river. **Character:** Rosa, a pink river dolphin. **Goal:** discover a river animal and ripple cause/effect. **Mechanic:** water taps lead a playful puppet. **Four actions:** four ripple targets with progressively curved swim paths. **Reward:** dolphin sticker and Rosa surfacing picture.

Tap a large glowing water patch; ripples expand and Rosa turns, swims over, then surfaces. This is fictional character play, not a claim that real dolphins follow ripples. Never feed or handle wildlife. Luna stays at a balloon landing area above the bank; Rosa stays in the river.

| Trigger | Speaker | Exact line |
| --- | --- | --- |
| Story | Rosa | Hello! I live in this river! |
| First prompt | Sparkle | Tap the water to make a ripple! |
| First response | Rosa | Splash! Here I am! |
| Second prompt | Sparkle | Make a ripple by the big leaf! |
| Second response | Rosa | Follow my swishy tail! |
| Third prompt | Sparkle | Try the glowing water! |
| Third response | Rosa | Wheee! |
| Fourth prompt | Sparkle | One more ripple, Kaylee! |
| Off-target tap | Sparkle | Tap the glowing water! |
| Completion | Rosa | You’re a wonderful river friend! |
| Sticker | Sparkle | Pink dolphin sticker! These dolphins live in rivers! |

Off-target water taps still make small ripples and sounds. Help by pulsing/enlarging the current target; no scolding.

### 5. Machu Picchu Lookout

**Place:** a visitor lookout facing Machu Picchu. **Goal:** recognize landmark and flag. **Mechanic:** assemble a journal flag, then open viewing shutters. **Five actions:** left red stripe, middle white, right red, left shutter, right shutter. **Reward:** spectacled bear sticker and landmark picture.

Reveal Machu Picchu, terraces and mountains. Kaylee changes her journal and viewing frame only, never the archaeological site. Plain national flag: three vertical red–white–red bands, no coat of arms ([official law](https://busquedas.elperuano.pe/dispositivo/NL/2363369-4)). Landmark: [UNESCO](https://whc.unesco.org/en/list/274).

| Trigger | Speaker | Exact line |
| --- | --- | --- |
| Story | Luna | A mountain discovery for our journal! |
| First stripe | Sparkle | Put red on the glowing side! |
| Middle stripe | Sparkle | White goes in the middle! |
| Last stripe | Sparkle | Red on the other side! |
| Flag complete | Luna | Peru’s flag! Red, white, red! |
| First shutter | Sparkle | Slide this shutter open! |
| Second shutter | Sparkle | Open the other one! |
| Wrong placement | Sparkle | Match the glowing stripe! |
| Incomplete shutter | Sparkle | Slide toward the glowing star! |
| Reveal | Luna | Machu Picchu! |
| Landmark connection | Sparkle | The Inca built this place long ago! |
| Completion | Luna | A wonderful discovery, Kaylee! |
| Sticker | Sparkle | Bear sticker! These bears have pale face markings! |

Bear appears in a cloud-forest journal illustration, without promising a sighting at the lookout. Tap alternatives for stripes/shutters; red pieces interchangeable.

### Finale: Kaylee’s Explorer Expedition

20–30 seconds in Luna’s balloon landing meadow. Journal windows animate animals in their own habitats. **Three actions:** tap journal to illuminate discoveries; drag it into Luna’s satchel; tap basket to launch Luna and Sparkle.

| Trigger | Speaker | Exact line |
| --- | --- | --- |
| Opening | Luna | Five discoveries, Kaylee! |
| Journal prompt | Sparkle | Tap your explorer journal! |
| Journal opens | Luna | Look at everything we discovered! |
| Packing | Sparkle | Put the journal in my satchel! |
| Packed | Luna | Gracias, Kaylee! |
| Translation | Sparkle | Gracias means thank you! |
| Launch | Sparkle | Tap the basket. Let’s fly! |
| Departure | Luna | You’re my explorer friend! |
| Shell trophy | Sparkle | Kaylee, you did it! You won the Peru Explorer trophy! |
| Trophy Room | Sparkle | Kaylee, Peru Explorer! From Peru. |

Call `onWin()` exactly once after launch. Shell handles trophy/fanfare/confetti. Partial first chapter does not implement or trigger this ending.

### Shared feedback and extras

Fixed Sparkle feedback: “Great exploring, Kaylee!”, “You did it!”, “Try the glowing spot!”, “Tap it, and I’ll help!” Replay never resets progress. Fast touches update immediately; speech does not overlap.

Optional passport facts (Sparkle):

| Button | Exact line |
| --- | --- |
| Location | Peru is in South America! |
| Hello | Hola means hello in Spanish! |
| Languages | People also speak Quechua and Aymara! |
| Weather | Peru has coast, mountains, and rainforest! |
| Alpacas | Alpacas have soft fleece! |
| Weaving | People in Peru weave beautiful cloth! |
| Landmark | The Inca built Machu Picchu long ago! |
| Flag | Peru’s flag is red, white, red! |

Passport intro: “This is Peru! Tap a picture to explore.” Coloring pages: Luna in meadow, Rosa in river, Coco over canyon. Puzzles: Machu Picchu panorama and Luna’s explorer meadow, using existing difficulty controls. Extras earn no required stamps. Defer these art extras until the full release; first chapter includes relevant facts.

## Implementation

### Integration and state

- Country folder `src/world/places/peru/`: metadata, hub/router, `lines.ts`, cast, puppets, activities, assets, voice manifest/map/clips. Existing `PlaceMeta` and `PlaceProps`; no new public contracts.
- IDs: `cozy-andes`, `weaving`, `condor`, `river`, `lookout`; finale `expedition`. ID `peru`, name `Peru`, emoji 🦙, friend Luna the alpaca, trophy Peru Explorer, implementation date for `createdAt`.
- Required shared exception: add `peru` to SVG flag kit. No SDK, dependency, workflow or other-country edits. World registry auto-discovers the country. No Peru coming-soon world pin needs removing. Place the pin over Peru on the actual illustrated map and verify visually.
- Saved stamps are journal truth. Persist woven appearance via Peru-local `useSaved`; incomplete activities reset on exit. Each activity saves its stamp immediately, then shows `StampEarned`; replay never duplicates rewards.
- Full-release finale requires all five IDs even for direct navigation. Before completion show hub and spoken hint. First chapter uses coming-soon finale instead, regardless of its single stamp.
- Preserve smoke-test compatibility: accessible finale button label `Party`, visible balloon expedition design. Current smoke test’s stamp-all and trophy dev hooks remain supported, but ordinary partial-chapter play cannot win.

### Puppets and interactions

Luna: wave, shiver, snuggle, reach, nod, cheer, giggle. Coco: spread wings, bank left/right, soar, settle, cheer. Rosa: turn, swim, surface, splash, nod, giggle. `usePuppet` supplies blinking, breathing, gaze and per-speaker mouths. Luna clothing follows body/head transforms; Coco wings articulate; Rosa bends her tail/body. Secondary sprites use Buddy; Sparkle uses SparklePuppet.

React/motion plus SDK `PlayArea`/`Piece`/`Target` for clothes, flag and journal; `usePointerDrag` for shuttle, zipper, shutters and flight; ref-based `useGameLoop` for brief swimming/gliding. No new packages; Phaser unnecessary. Touch targets ≥88px on supported iPads, shell top clearance, fractional coordinates. Every drag has a tap alternative; cancelled gestures recover safely.

### Cast and assets

Defaults: Luna `nova` pitch +2; Coco `ash` pitch −1; Rosa `shimmer` pitch +2. Warm, playful, short delivery and natural Latin American Spanish pronunciation, no exaggerated accent. Sparkle retains existing voice.

Full assets: square cover with Sparkle/Luna; Peru hub; five activity backgrounds (reuse meadow in finale); three puppet reference portraits; llama/bear stickers; hat/scarf/jacket/shuttle/satchel props where raster helps; three coloring pages and two puzzle scenes. First chapter generates Luna reference, cover and Andes meadow only; wearable props are shared SVG shapes.

Follow `art/STYLE.md`: flat pink/lavender accents, outlined cutouts on pure white, no generated text. Flags, loom threads, journal windows, arrows and clothing are SVG/HTML. Save source PNGs under `art/source/world/peru/`, optimize into country assets; inspect contact sheets and compare puppets beside references. Record final art prompts and explicit camera constraints in the Peru folder.

## Validation and delivery

- Generate manifests from `lines.ts`, then verified voice clips. Commit Peru-only generated changes. All titles, instructions, hints, reactions and trophy lines must have clips.
- Typecheck, build, check with local server. Add Peru-local Playwright configuration/tests; shared QA scripts contain fixed routes, so add local screen/motion/pacing coverage without changing them.
- First/middle/helped/completed states at four iPad and three phone sizes. Verify rotations, no overflow, ≥88px iPad targets, no large empty bands, clothing camera/proportions consistent.
- Real gestures and tap-only completion; wrong items, target misses, cancellation, fast taps, prompt replay, exit during reaction. Verify any-order stamps in full release; first chapter’s one stamp survives reload, journal remains 1/5, unbuilt activities stay unavailable, no ordinary trophy ending.
- Filmstrip every puppet action and key game moment. At least three visual review/fix passes. Compare reference + puppet + tray + dressed scene for camera/style consistency.
- Actual clips: actionable touch within six seconds, individual lines ~3 seconds or less, no required waiting between touches. Listen on iPad for pronunciation, lip sync and overlap; automated browsers cannot prove audio quality.
- Commit completed implementation; draft PR assigned `neb636`, with screenshots, motion samples and remaining real-device audio checks.

## Assumptions

Country rather than school-paper game. Animal explorer mission selected by dad; no videos. All five full-release activities open initially; finale locked. Optional coloring/puzzles no stamps. Fictional speaking animals support accurate geography/culture/flag facts. This document preserves the entire approved design; current implementation is first activity only.
