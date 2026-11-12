# 🗺️ The Thailand map: tap a pin

Built: a 3D toy map · Country hub (3D) · updated 2026-11-10

Thailand has grown past one house. Now when Sparkle's balloon lands in Thailand, Kaylee sees a big **map of Thailand** with a pin for each place, like Australia's map. She taps **Bangkok** (Agong's house), **Krabi** (the boat and the elephants) or **Nan** (the mountains) and that place opens; the animals and boats on the map hop when she taps them. Trips end back on the map, where their stamp lands on the pin. The mall day still starts at the house: Mom or Dad asks if she wants to go to the mall.

**Next:** The user taps around [the map](#/world/thailand) on the iPad, opens Krabi and Nan, and plays a trip to its end. The **[open questions](#questions)** went with my picks for now (they're easy to change). Next: **the look**, the painted map in layers with the pokes as sprites.

- Bangkok · Krabi · Nan (room for more): 3 pins
- tap a pin and that place opens: 1 tap
- packing and the window seat, the first trip only: once a session
- every trip after that: straight there
- plan, greyboxes built; the look, voices + QA next: 3 of 5

Related: [← Thailand plan](../thailand.md), [🏔️ The Nan road trip](nan-trip.md), [Canada's train map (the 3D hub)](../canada.md), [Activity template](../ACTIVITY-TEMPLATE.md), [Play design](../../../docs/play-design.md)

## 💡 Why a map

Every Krabi or Nan trip starts upstairs in Agong's house today: walk up, find Mom, pick a trip, pack, say goodbye, the x-ray belt, the window seat. With three trips (and more coming) that's a long walk to the fun, and the house doesn't show *where* in Thailand the places are. A map does both: it's the quickest way in, and it teaches that Krabi is down by the sea and Nan is up in the mountains.

Now: 🌍 World map → 🛺 Agong's house → 👩 Mom upstairs (🚤 🛝🍕 🏔️🚙) → 🧳 Pack, goodbye, x-ray, window seat → 🌴 The trip → 🖼️ Agong's wall

New: 🌍 World map → 🗺️ Thailand map (fly the plane) → 📍 Land on a pin → 🌴 The trip → 🗺️ Back on the map (the stamp lands on the pin)

## 🧔 the user's picks

2026-10-27

- **Why change?** Thailand has grown: starting every trip from Agong's house doesn't make sense any more. A big Thailand map, like the other countries have.
- **2D or 3D?** **A 2D painted map** (like Australia's), not a 3D toy table.
- **How does she get around?** **The family's little toy plane**, the way they really fly to Krabi and Nan.
- **Packing, the goodbye, the x-ray, the window seat?** **Packing and the window seat, once per session** (the first trip after the app opens). Every trip after that: the plane flies across the map for a moment and lands her straight at the landing spot (Krabi) or the other map (Nan's). The goodbye at Agong's door and the x-ray belt drop out of the path. *(Since 2026-10-28 there's no flight on the map: a later trip opens straight at its landing spot.)*
- **Where does a trip end?** **Back on the Thailand map**, where the stamp lands on that place's pin.
- **The mall?** **Still starts at the house**: Mom (upstairs) or Dad (on the street) asks only if she wants to go to the mall, 👍 or ✋.
- **2D or 3D, again (2026-11-10):** “The thailand map looks super lame. Since Thailand is full 3d I think the map should be as well.” He sent three pictures of 3D diorama maps: great, but too realistic; ours keeps the app's fun, kid-game look. **The map is 3D now** (see What's built).
- **The toy plane? (2026-10-28)** **Too confusing. Make it a normal map to tap, like Australia's.** The plane, its flights and its feel knobs are gone: tap a pin and that place opens.

## 👆 The map: tap a pin

> **👆 How it plays**
>
> Like Australia's map: big round pins she taps. The ones without a stamp yet bob; tap one and it grows, sparkles, and that place opens. Everything else on the map hops and makes its sound when she taps it.

1. **Tap a pin**
   Bangkok opens Agong's house, Krabi the boat trip, Nan the road trip. After ~8 s with nothing touched Sparkle says “Tap a picture” and the pins glow.
2. **Poke the map**
   The elephant, the rain cloud, the gibbon, the buffalo, the hornbill, the tuk-tuk, the dolphins, the longtail and the palm hop with a sound. Sparkle says one short fact the first time she meets each.
3. **The stamp lands**
   Back from a trip, its stamp drops onto the pin with a ka-chunk.

### Things to poke (tap)

- 🛺 **A tuk-tuk in Bangkok**: honks and zips round the block
- 🏙️ **ICONSIAM by the river**: its lights twinkle
- 🚢 **A rice barge on the Chao Phraya**: toots and chugs along
- 🇹🇭 **The flag over Bangkok**: it waves
- 🗻 **Krabi's limestone towers**: a monkey pops out on top
- 🚤 **A longtail boat**: zooms off in a curve of foam
- 🐘 **The elephants**: trumpet and squirt water
- ☁️ **Clouds over Nan**: rain on the rice terraces
- 🍄 **The big pink mushroom**: puffs pink spores
- 🐬 **Dolphins in the Gulf**: jump
- 🐢 **A sea turtle on a beach**: flips into the sea
- 🐒 **Gibbons in the jungle**: whoop and swing
- 🦜 **A hornbill**: flaps and squawks
- 🌴 **Coconut palms**: a coconut drops, bonk

> **🙏 No temples or Buddhas**
>
> Bangkok's skyline is the river, ICONSIAM and the shophouses: no Wat Arun, no Grand Palace, no temple anywhere on the map (AGENTS.md rule 7).

## 📍 The pins

- 🏠 **Bangkok: Agong's house**: The plane's home. Landing here opens the house (the tuk-tuk ride, `hub/arrive`). The **mall day** starts inside: Mom or Dad asks. The mall's stamp shows on this pin.
- 🚤 **Krabi: the boat and the elephants**: Lands at Krabi airport, where Dad's postcards ask 🐘 the elephants or 🚤 the boat (the fork that's already built). The boat trip's stamp lands here.
- 🏔️ **Nan: the mountains**: Lands straight on the **Nan map**, the Pajero waiting at the airport (PR #228 already skips the rental desk). The Nan trip's stamp lands here.

**What floats over each place (user feedback, 2026-11-10):** a friend she'll meet there, bobbing and waving like a pin (`map/pins.ts`): Agong in Bangkok, the baby elephant in Krabi, Moon the sun bear in Nan, the jet ski otter on Koh Samet. The boats' and the turtle's loops (`geo.ts`) are measured to stay out at sea.

A new trip later (Chiang Mai, Songkran, the night market) is a new pin. Until it's built there's no pin for it (see the open questions).

## 🧳 How a trip goes now

First trip this session: 📍 Tap Krabi or Nan → 🧳 Pack the suitcase → 🪟 The window seat (seatbelt, snacks, Thailand below) → 🛬 Landing (Krabi's fork or the Nan map)

Every trip after: 📍 Tap Krabi or Nan → ⚡ Straight there → 🛬 Krabi's fork or the Nan map

The end: 🌅 The last stop (Krabi's sunset, Nan's 3 road) → 🏅 The stamp and the sticker → 📍 Back on the map: the stamp lands on the pin

The mall (from the house): 🏠 Bangkok pin → the house → 👩 Mom or Dad: “Shall we go to the mall?” (👍 or ✋) → 🚗 The Veloz to ICONSIAM → 🍕 HarborLand, the pizza, home to Agong

> **🔁 “Once per session”**
>
> **Changed 2026-11-10:** tapping a pin on the map now goes straight to the trip's landing spot (Krabi `land?quick=1`, the Nan map, Koh Samet's speedboat or saved island); no packing or window seat from the map. The pack/goodbye/airport/takeoff/fly legs are untouched and deep links still open them; a place-picker inside Agong's house will start them again. (Before: the first Krabi or Nan trip of an app session packed and rode the window seat.)

### What leaves the path (the links still work for now)

- Mom's trip card upstairs and Dad's on the street stop offering 🚤 and 🏔️🚙: they ask only about the mall.
- The goodbye at Agong's door and Aunty Sri's van, and the x-ray belt (`goodbye`, `airport`).
- The flight home and the photo for Agong's wall (`home`) on the boat and Nan trips (see the open questions).
- The boat trip's `replay` shortcut: the once-per-session rule replaces it.

## 🔗 Section links

1. `#/world/thailand/hub/map` The Thailand map: tap a pin
2. `#/world/thailand/hub/map?stamp=boat-trip` Home from Krabi: the stamp lands on the pin
3. `#/world/thailand/hub/arrive` Landed in Bangkok: the tuk-tuk to Agong's house

### The map's params (hub section `map`)

| Param | Values | What it does |
|---|---|---|
| `stamp` | boat-trip, nan-trip, mall-trip | this pin's stamp lands now (the end of a trip) |

### The trips' new ends

1. `#/world/thailand/boat-trip/land?quick=1` Krabi on a later trip: straight to the signpost
2. `#/world/thailand/boat-trip/pack` The first trip of the session: pack, then down the stairs to the window seat
3. `#/world/thailand/boat-trip/sunset?been=chang` ✈️🏠 at the pier ends the trip: the stamp, then the map
4. `#/world/thailand/nan-trip/three?stops=mushrooms,rice,salt` ✈️🏠 at the 3 ends the Nan trip: the stamp, then the map
5. `#/world/thailand/hub/upstairs` Mom asks: shall we go to the mall?

## 🛠️ Build plan

1. **This plan** [done] · 2026-10-27 · PR #230
2. **Greybox 1: the map toy** [done] · 2026-10-27 · PR #230
   A code-drawn Thailand (a soft SVG outline, pastel sea, the neighbours in lavender), the plane under her finger with knobs on `?feel=1`, the three pins (glow, wheels down, land, or tap to fly there). Thailand opens on the map (not the tuk-tuk). Bangkok opens the house; Krabi and Nan play the short flight into their landing spot. No art, no voices.
3. **Greybox 2: trips start and end on the map** [done] · 2026-10-27 · PR #230
   The first trip per session: pack, the plane takes off on the map, the window seat, landing. Trips end on the map with the stamp landing on the pin. Mom's and Dad's cards in the house ask only about the mall. AGENTS.md and the Thailand plan updated (“trips start from the house” isn't true any more).
4. **Greybox 3: a tap map, no plane** [done] · 2026-10-28
   the user found flying the plane confusing: the map is a normal tap map like Australia's. The plane, its flights, its knobs and the `plane`/`fly` params are gone.
5. **The look** [done] · 2026-11-10 · in 3D (see What's built)
   The painted map in layers (sea, land, landmarks, clouds above), the pokeables as sprites in the same camera, their reactions.
6. **Voices, hints, QA** [todo]
   Sparkle's welcome and the first-time facts (lines.ts), the hint after ~8 s (a fresh “tap a pin” line), the map in `qa-screens`, a `qa-motion` scenario for a tap, `qa-pacing`, full QA.

## ❓ Open questions

- **Agong's wall: the trip photos?** OPEN: Trips no longer go home through the house, so she doesn't pick a photo for Agong. My pick: the trip's best photo goes up on his wall by itself, and she finds it next time she's in the house. Or drop the wall for the boat and Nan trips. *Built with my pick for now.*
- **The finale (the family party): where?** OPEN: My pick: at Agong's house. When every pin wears its stamp, the Bangkok pin grows a 🎉 and landing there opens the party. *Built with my pick for now.*
- **Pins for places that aren't built yet?** OPEN: My pick: none until they're built (no taps that go nowhere). Or grey “coming soon” pins so she can see more is coming. *Built with my pick for now.*
- **Where does Sparkle's balloon go?** OPEN: My pick: it floats in at the map's edge when she arrives, and Sparkle talks from the corner as she does in the trips. *For now Sparkle sits in the corner, as in the trips; no balloon yet.*

## 📒 What's built

### The look, in 3D ([done] · 2026-11-10)

The user: the 2D map “looks super lame”; make it 3D like the rest of Thailand, with the fun of his diorama pictures but in our toy look.

- **A toy board in the sky** (`map/world.ts`, `terrain.ts`, `toys.ts`, `field.ts`): a pink and cream tray with clouds drifting under and over it. Thailand stands up out of a turquoise sea like a slice of cake, cut from its **real coastline** (`land.ts`, from Natural Earth by `scripts/thailand-map-land.mjs`), with beaches, hills, rice fields, rivers and a dotted trail from Bangkok to each place painted on top. The neighbours are low cream paper with dashed borders, doodled hills and a compass rose. The sea foams along every shore.
- **The four places are little models** with a fat bobbing pin over each: Bangkok's pastel shophouses, towers and flag; Nan's rice terraces and mountains; Krabi's limestone towers; Koh Samet's beach island with a speedboat going round it. Tap one: the pin spins, the camera swoops down, the place opens (the same rules as before). A stamp rides on its pin.
- **Everything answers a poke:** the elephants trumpet and squirt, the rain cloud rains on Nan and leaves a rainbow, the gibbon swings wildly, the buffalo shakes its head, the hornbill loops, the tuk-tuk honks and zooms, the dolphins leap, the longtail roars off, the big palm drops a coconut, plus (no line) Sparkle's balloon, a sea turtle, a rice barge. Trees and mountains puff leaves, the sea splashes, the ground pops confetti, clouds squish.
- **She can turn it:** a drag swings the board round, a pinch brings it closer (the same camera as her Roblox controls, `Shot.roam`).
- **Voices:** no new lines. The welcome and the nine facts are the recorded ones.
- **No temples or Buddhas** (rule 8): the user's pictures had several; none are on the map.
- QA: `thai-map-alive`, `thai-map-pokes`, `thai-map-spin`, `thai-map-pin` motion runs; `window.__thaiMapQA()`.
- Not done: the game shelf's card picture still shows the old map; Koh Samet sits a little south of where it really is, and bigger, so she can see and tap it.

### Greybox 3: a normal tap map ([done] · 2026-10-28)

The user: “the fly the plane thing is confusing. Let's just make it a normal map to tap like in Australia. Remove any dead code.”

- **Pins** are tapped, like Australia's: unstamped ones bob, a tapped one grows and sparkles and that place opens after ~0.45 s (the same rules as before: the first Krabi or Nan trip of a session packs; later ones open at `boat-trip/land?quick=1` or the Nan map).
- **Gone:** the toy plane (drawing, flight, puff trail, buzz, landing), its 10 feel knobs and `watch()` graph, the per-frame loop, flying low over pokes, `tripSession.plane`, the `plane` and `fly` params (and `PIN_IDS`/`pinOf` in `geo.ts`). A trip's end opens `hub/map?stamp=<trip>`.
- **Pokes** always have their own tap targets now (before, on a tiny screen only the plane woke them). The pins sit above them.
- **Hint:** after ~8 s with nothing touched Sparkle speaks and the pins glow (was a 👆 on the plane).
- **Voices:** no new clips. The welcome and the hint reuse the recorded “This is Thailand! Tap a picture to explore.”; the plane lines are dropped. The game shelf's card is “Thailand map” and says “Where should we fly?” (its cover picture still shows the plane until the look step).
- QA: the `thailand-plane` motion scenario and the `plane=krabi` screen are gone; `thailand-map-home` is `?stamp=boat-trip`.

### Greyboxes 1 + 2: the map toy, and the trips start and end on it ([done] · 2026-10-27 · PR #230)

The user said “build it out”: the plan and both greyboxes in one PR.

- **The map** (`activities/hub/map/ThaiMap.tsx`, shapes in `geo.ts`): Thailand drawn in code (the border and coasts simplified, hills, the Mekong and the Chao Phraya, a few islands) on lavender neighbours and blue seas that run past the stage on wide screens. Thailand opens on it (`#/world/thailand`, section `hub/map`).
- **The plane:** pink with lavender wings, a gold horn on the nose and a blurring propeller. Grab it and it follows her finger, banks into turns (its wings foreshorten), buzzes and puffs a trail; let go and it glides into a lazy circle; tap the map and it flies there. Its feel is on 10 knobs (`?feel=1`), with her finger, the plane, its speed and bank on the graph.
- **Pins:** Bangkok (🏠, the mall's stamp), Krabi (🚤, the boat trip's) and Nan (🏔️). Let go over one (it grows and the plane's wheels drop) or tap it, and the plane lands with a bump and that place opens. Bangkok: the house (the tuk-tuk the first time a session, then where she left off).
- **The trips:** the first Krabi or Nan trip a session packs, then straight down the stairs to the window seat (the goodbye and the x-ray belt are out of the way). After that Krabi opens at `boat-trip/land?quick=1` (straight to the airport's signpost) and Nan on the Nan map. ✈️🏠 at the pier, after the splash or at the 3 ends the trip: the photo goes on Agong's wall by itself, the stamp, then back on the map, where the plane flies home and the stamp lands on the pin.
- **The house:** Mom upstairs and Dad on the street only ask “Shall we go to the mall?” (👍 with 🛝🍕, or ✋). The top bar's back button in the house goes to the map (`PlaceMeta.hubHome`).
- **Pokes:** the elephant, the rain cloud, the gibbon, the buffalo, the hornbill, the tuk-tuk, the dolphins, the longtail and the palm, tapped or flown low over: a hop and a sound, and Sparkle's fact the first time (voiced, `L.map`). Sparkle welcomes her once a session and hints after ~8 s with nothing touched.
- QA: `qa-screens` (`thailand-map*`), a `qa-motion` scenario (`thailand-plane`) and `qa-pacing` cover it.

> **Changed from the plan**
>
> - The first trip of a session packs and goes **straight from the stairs to the window seat**, with no takeoff on the map in between (it would mean leaving the trip and coming back mid-way).
> - On the first trip, dropping the plane on Krabi or Nan opens packing at home (the plane stays at Bangkok for it).
> - The open questions went with my picks: the photo hangs by itself, the 🎉 is on the map once every stamp is in, no pins for places that aren't built, Sparkle in the corner.
> - On a tiny screen (iPhone landscape) the pokes have no tap targets of their own (they'd overlap): the plane flown over them still wakes them.

## 🎨 The look and the camera (for the builder)

> **📷 One camera**
>
> A storybook map seen from a **high bird's-eye view, about 60°**, so the landmarks stand up a little like toys. Every sprite on it (the elephants, the boats, the towers) uses the same view. Write it into every prompt (`art/STYLE.md`): “high bird's-eye view at about 60 degrees, no side view, no flat top-down”.

- **Layers**, so it's a world, not a picture: the sea (a seamless tile, gently moving), the land with the landmarks painted in, the neighbours (Myanmar, Laos, Cambodia, Malaysia) as soft lavender land, and clouds above that drift and move faster than the land when the view pans.
- **Stages:** Thailand is tall. A tall stage on a portrait iPad shows the whole country; on a wide screen the sea fills the sides.
- **Pins** are big round React buttons (≥ 88 px on iPad, 64 on iPhone) with the place's picture, glowing until stamped, like Australia's. The stamp is the sticker on the pin, tilted, with a ✅.
- **No text in the art.** Place names, if any, are HTML labels for the user.
- Kaylee's colors: pink and lavender in the sea's sparkle and the pins.

## 🧩 Tech plan (for the builder)

- **Where:** `src/world/places/thailand/activities/hub/map/` (2D, React + SVG + `motion`, no three.js; the hub stays one activity, `HUB`). `Place.tsx`'s default is the map, not the house; the house opens from the `arrive`/`street`/`downstairs`/`upstairs` sections as now.
- **Sections:** `map` first in `activities/hub/sections.ts`, with `stamp` (see Section links). The README's Thailand directory is generated from it.
- **Pins** read `meta.activities[].pos`: today boat 50,70 / mall 50,40 / nan 50,22 are placeholders; set them to the map's Krabi, Bangkok and Nan. The mall pins to Bangkok, so the Bangkok pin shows the mall's stamp and opens the house.
- **The session flag:** a module-level `tripKitDone` (like Australia's `introSeen`), set when a trip's packing starts. `first=1` forces it.
- **Later trips** open at each trip's landing spot: the boat trip's `land` section with `quick=1` (straight to the signpost), the Nan trip's `map` section.
- **The first-trip path:** the trip's `pack`, then down the stairs to the window seat (`takeoff`/`fly`/`land`). `trip/legs/plane.ts` ends the Nan landing on the Nan map (PR #228).
- **Endings:** the boat trip's `sunset`/`splash` ✈️🏠 and the Nan trip's `three` call `onDone` (the stamp screen, `Place.tsx`) and its close goes to `hub/map?stamp=<trip>` instead of `hub/downstairs?at=photos`. The mall keeps its `home` ending at Agong's.
- **The house:** `trip/legs/Ask.tsx`'s `tripChoices` offers only the mall; the house's Mom and Dad use the single-trip 👍/✋ card with a new line (“Shall we go to the mall?”). Boat and Nan `invite` sections go (their links redirect to the map).
- **Startup:** the map's layout data goes in a pure file (no three.js) if `sections.ts` reads it. Nothing that describes the house goes outside `places/thailand/` (the lock).
