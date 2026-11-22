# 🏙️ The Bangkok map

Built 2026-11-19 · what Bangkok's pin on the Thailand map opens (3D) · code: `src/world/places/thailand/activities/hub/bangkok/` · hub section `bangkok`

Bangkok used to open straight into the house, and the mall day started inside it. Now Bangkok opens on a toy diorama
of **the middle of Bangkok** floating in the sky, in the same tray as the Thailand, Nan and Krabi maps. The house and
ICONSIAM each have their own place on it, and there's room for more (Asiatique, Chinatown).

## Real places, real sizes

The board is about 14 km of city across (one meter of board is about 2.6 km), north up. Nothing on it is drawn by hand:

- **The Chao Phraya** is the real river (OpenStreetMap, `scripts/bangkok-map-land.mjs` writes `geo.ts`): its long S
  past the old town, Chinatown and ICONSIAM, then the big loop round Bang Krachao. So are the khlongs, the main roads
  and the big parks. The river is drawn 3 cm wider on each bank (`RIVER_FAT`): it's what makes the board Bangkok, so
  it's the biggest shape on it. Its banks are smoothed a little.
- **Every place is put down by its longitude and latitude** (`layout.ts`, `ll(lon, lat)`): ICONSIAM on the west bank,
  Asiatique downriver, Chinatown's gate at Odeon Circle, Lumphini Park and its lake, Mahanakhon, Central Rama 3, the
  flower market, the port at Khlong Toei, Sanam Luang's field, Bang Krachao in the loop. The towers stand in the
  districts they really stand in (Silom and Sathon, Siam and Pratunam, Sukhumvit), the seven bridges where they really
  cross, the skytrain runs through its real stations, and the taxi and the fruit boat keep to a real road and khlong.
- **The house** is the one place that isn't where it really is: it's out in Bang Bon, a few kilometers past the
  board's west edge, so it stands at that edge as far south as it really is (your call, 2026-11-19; it stood near
  Central Rama 3 before). `PLACES.house` is one line to move. Widening the board to reach Bang Bon would make it half
  as wide again and shrink everything on it.
- Bangkok is flat, so the board is too: a low slab of city, the river cut through it. What gives it shape is the
  skyline, the bridges and Bang Krachao's jungle.
- **Wat Arun stands on the board as scenery** (your call, 2026-11-19: it's what anyone sees first when they look up
  Bangkok, and rule 8 is about games). It's where it really is, a little bigger than life, on the Thonburi bank (the
  tall corncob prang in rings of porcelain dots, its four little prangs, the pavilions, a pier).
  **Never a toy:** no pin, and nothing moves it. A tap only names it (your call, 2026-11-19): the light runs up its
  gold, a soft shimmer (`dawn-shimmer`, ElevenLabs), and Sparkle says "Wat Arun, the Temple of Dawn! It sparkles
  with tiny pieces of colorful china." every time (`LANDMARKS` in `layout.ts`, `arunParts()` in `diorama.ts`). A
  smaller, more detailed rebuild was tried and reverted: you liked this size better. Still no Buddha image, no Giant
  Swing, and no other temple. A cloud moved off the old town to make room. The Grand Palace was built across the
  river and then taken out (you, 2026-11-19: the old town got too busy); the kites over Sanam Luang went too.

## The look (2026-11-19, from your four pictures)

Your pictures were a river city in gold light: the Chao Phraya as the biggest shape, landmarks standing up off a
printed map, longtails, a tuk-tuk, a skyline. Their guardian statue is left out; Wat Arun came in later as
scenery (above).
What the board took from them, in the app's toy look:

- **The river leads.** Wide, bright teal, a pale promenade down both banks, coconut palms leaning over it.
- **A map printed on warm paper.** The city floor is a few creams and peaches that sit close together, the little
  streets a thin tan print. (The compass in the south-west corner came off, your call 2026-11-19.) (Before: seven pastels, a white grid and dotted orchards.
  It read as a quilt.)
- **Thonburi and the south are city, only leafier** (your call, 2026-11-19, from the view from the air: they were
  orchards once, built up now, still green here and there). They're the same paper, streets and printed rooftops as
  the middle of town, a few more shophouse rows of their own, and gardens speckled through them: little patches of
  lawn under round toon trees, a yard's tree among the roofs, thickest along the khlongs and toward the board's west
  and south edges (`leafy()`, `lawnAt()`, `crowns()` in `ground.ts`). About 56 of those trees stand up off the paper
  (`GARDEN_TREES`). The middle of town has none. Bang Mot's orange orchard is the one striped green patch left, round
  the orchard toy (`inOrchard()`). (Until then the whole west strip and the south were striped farmland.)
- **A skyline in bunches** (Silom and Sathon, Siam, Sukhumvit, Phloen Chit and Nana): 19 towers in stronger candy
  glass, each with a long afternoon shadow painted the same way, all lining the skytrain (see the phone pass below).
  The rest of the city stays low.
- **Shophouse rows under terracotta roofs,** in neighborhoods (see the phone pass below). (Before that: about 30 rows
  dropped here and there, and before that 140 single houses and 230 trees scattered.)
- **Bangkok's own things:** a hot pink taxi on Rama III Road,
  a fruit seller's boat on Khlong Bangkok Yai, kites over Sanam Luang, street-food umbrellas by Chinatown's gate.
- **Calm, but not empty.** The first look pass left the south-west and north-east corners bare, and you said so
  (2026-11-19). Each corner now has a real thing of its own, and the paper between has texture instead of props:
  - **North-east:** the night market on Ratchadaphisek Road (twelve tents in every color behind a gate of lights),
    a street of shophouses in Huai Khwang beside it, Khlong Saen Saep's fast boat.
  - **South-west:** a floating market on Khlong Dao Khanong (stilt houses, a jetty, four boats under big umbrellas)
    and Bang Mot's orange orchard (trees heavy with oranges, the farmer's house, baskets).
  - **Everywhere:** rooftops printed tone on tone inside the street grid (the city looks built up with nothing standing
    on it), neat groves of fruit trees on the orchard's painted rows (`GROVES`), and traffic: 24 little cars in taxi
    colors on six real roads (`TRAFFIC`, one instanced mesh).
- Still few big shapes ([the Krabi map](krabi-map.md) taught this): the pins and the river are what she sees first.
  A new thing should be a real place with a poke, not scatter.

(The very first try scattered thousands of little blocks and dots and looked like confetti.)

## The phone pass (2026-11-20)

On a phone the board read as busy and unfinished at once: lots of landmarks, but small and alone on the same pale
paper, the river thin past the old town, the house and ICONSIAM small under their pins. Nan's village and Krabi's
coast read before any single thing does; this pass gives Bangkok the same: the river, then neighborhoods, then the
places.

- **The river leads.** Never narrower than `RIVER_MIN` (0.105 m) either side of its middle line, a little wider
  everywhere (`RIVER_FAT` 0.04), and stronger teal (`RIVER` in `ground.ts`), so it reads from end to end at phone size.
  The bend round Bang Krachao is as it was.
- **To the water:** ICONSIAM, Asiatique, the flower market and Wat Arun each have a pier out into the river and a paved
  way down to it (`PIERS`).
- **Neighborhoods, not scatter** (`STREETS`): 13 short streets, each a lane with rows of shophouses facing each other
  across it and a row back to back behind each (doors and awnings on their own street), a street that doesn't fit
  slides a little until it does. Two are market lanes (warm tiles, stalls under umbrellas): Sampeng Lane between the
  flower market and Chinatown's gate, and Yaowarat behind the gate. The house has a street of its own neighbors.
  Nothing else stands between them: the paper is quiet there. Thonburi's big trees line its khlongs instead of
  standing anywhere (`GARDEN_TREES` 44).
- **The towers line the skytrain** on a band of cool lilac paving (each steps in to the track's side, a little along it
  if that spot is taken). The two at Rama 9 moved to Phloen Chit and Nana, where the track turns down Sukhumvit.
- **Wat Arun** stands in a stone court with a lawn behind it: its white prang has green behind it on the screen, and
  nothing stands up there. Still scale 1.7, still scenery.
- **Asiatique's wheel** is bigger (2.1) and leans back on its stand (`WHEEL_TILT`) so its round face looks up at the
  camera; it moved a little south along the bank so its top isn't under ICONSIAM's pin on a phone held sideways.
- **The places she can go are the biggest toys:** the house at 2.4 (bright roofs, the pink one in the middle, a step
  in from the board's edge so its pin can be tapped upright) and ICONSIAM at 2.3, about as big on screen as Nan's
  village and Krabi's elephant camp. The house's pin floats over its roof; ICONSIAM's stays low in front of it (that
  stretch of river is crowded on a phone: the flower market, Chinatown's gate and the wheel are all close by).
- **Upright, the camera looks from a little higher, unturned, and a little closer** (`TALL` in `map3d.ts`): the square
  board fills more of a phone's height (Nan's long board turns to fill it; a square board can't). Sideways is as it
  was.
- Known: on a phone held sideways ICONSIAM's pin still sits over Chinatown's gate (it did before too), and the top of
  the wheel just under the pin; the wheel's lower half and the gate's left side still take a tap.

## How it plays

- **The toy: pins.** A pink pin floats over each place she can go to, with a toy of what she does there on its head:
  🏠 a little house with a heart over the house, 🛝🍕 a slide and a slice of pizza in front of ICONSIAM. Tap the pin
  (or the place): it hops and spins in sparkles, the camera dives in and the place opens. Both stay open for good.
- **The house** opens where she left it (the tuk-tuk ride the first time). Its top-left button comes back to this map.
- **ICONSIAM** opens the mall day straight at the mall (`mall-trip/arrive`). With a day half done, or after her first
  whole day, the day pass asks where to start, as it does in the house. Mom and Dad still ask about the mall inside
  the house too. The day still ends in the house, by her photo.
- **The mall day's stamp** floats beside ICONSIAM's pin once she has it. The first time she sees this map with it, it
  lands with a ka-chunk (`?stamp=mall-trip` plays that again).
- **Sparkle's balloon** floats over the board's corner: a toy to poke, like the Thailand map's (the burner roars, it
  climbs and spins, sparkles fall). No ring round it. The top-left button is the way back up to the Thailand map.
  (Until 2026-11-19 the balloon was the way back.)
- **Talk** (`lines.ts` `L.bangkok`, Sparkle): "This is Bangkok! Tap the house or the mall!" once a visit; something true
  the first time she pokes a thing (15 of them: the kites, the taxi, the night market, the floating market and the
  orchard were added with the look); after ~8 s with nothing done, "Tap the house or the mall!" (at most three times),
  the pins bounce and a 👆 points at one.
- **Pokes:** Asiatique's wheel (it spins to a tune), Chinatown's gate (the lanterns swing, a lion drum), Lumphini
  (the monitor lizard slides into the lake; the swan boat twirls), Mahanakhon (its blocks twinkle), Central Rama 3,
  the flower market (petals fly), the port (the crane lowers its box), Bang Krachao (the birds fly up), the skytrain
  (ding-dong, off it zooms), the two river boats (toot toot; the longtails came off the river, your call 2026-11-19), the tuk-tuk on Rama IV Road, the pink taxi on Rama III
  Road (beep beep, off it zips), the fruit seller's boat (it spins in a splash), the kites over Sanam Luang (they loop
  the loop one after another), the night market (its rows of tents hop one after another to a tune), the floating
  market (the boats bob and splash), the orange orchard (oranges fly), Khlong Saen Saep's boat (toot, off it races),
  the clouds (rain), every tower (a higher tune for a taller one), every bridge (beep beep), the river (a splash).
- **Always alive:** the skytrain runs back and forth, boats sail the river end to end, the taxi and the tuk-tuk drive,
  the traffic goes up and down the big roads, the khlong boat races, the market's boats bob, the fruit seller paddles, the kites sway on their strings, the wheel turns, ICONSIAM's fountain dances every few
  seconds, the water and the towers glint.
- She can swing the board round with a drag and pinch it closer, like every map (`boardShot()`, `trip/sky.ts`).

## Adding a place (Asiatique, Chinatown, more)

Everything is where it really is, so a new place needs no layout work:

1. `layout.ts`: give it a `PLACES` entry (`at: ll(lon, lat)`) and a pin in `PINS`. If it's a toy to poke today
   (Asiatique, Chinatown), take it out of `SPOTS`.
2. `diorama.ts`: its toy becomes the place's toy (`places`), and `buildPin()` gets a little toy for its pin's head.
3. `map3d.ts`: `choose()` already dives to any place; say what its dive sounds like. `BangkokMap.tsx` `go()` says
   which activity opens.
4. A place somewhere new: add its tower, park or landmark by longitude and latitude; `diorama.ts` leaves out any
   tower that would stand on it. Past the board's edges (`EDGES`): widen them, and run
   `node scripts/bangkok-map-land.mjs` again if they pass the data's box.

The QA hook (`__thaiBangkokQA`) lists anything standing in the river (`wet`) and any toy whose middle sits under a
pin's tap target (`covered`); `tests/thailand-maps.spec.ts` checks both are empty. (ICONSIAM's pin first floated over
its towers, which put its tap target on top of Chinatown's gate on the screen: it floats in front of the mall now.)

## Sounds

`sounds.ts`. Eleven recorded clips are written up in `sfx/sfx.json` (the city by the river, the skytrain and its
chime, a boat's horn, the wheel's tune, the lion drum, the lizard, the crane, the petals, the fountain, the birds):
36 s. **None is made yet:** ElevenLabs refused them twice on 2026-11-19 (the account has an unpaid invoice). Until
then every sound plays its synthesized fallback. The taxi's beep, the fruit boat's splash and the kites' flutter reuse
the Nan map's recorded clips; the night market, the floating market and the oranges have three more clips written up
(14 clips, 42 s in all). Once billing is sorted:
`node scripts/generate-sfx.mjs src/world/places/thailand/activities/hub/bangkok/sfx`.

## Knobs and links

- `#/world/thailand/hub/bangkok` (the map), `?stamp=mall-trip` (the mall day's stamp lands).
- `?feel=1`: the camera's entrance (`bangkok-map-cam`).

## Next

<<<<<<< HEAD
- Kaylee's playtest: does she find the pins among the city, and what does she poke? Does the river read to her?
=======
- Her play data: does she find the pins among the city, and what does she poke?
>>>>>>> origin/main
- The real sounds (above).
- Asiatique and Chinatown as places, when you pick what she does there.
- The mall day could end back on this map (the stamp landing on ICONSIAM) instead of in the house: your call.
