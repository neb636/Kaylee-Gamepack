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
- **The house** stands near Central Rama 3, for now (your call, 2026-11-18): `PLACES.house` is one line to move.
- Bangkok is flat, so the board is too: a low slab of city, the river cut through it. What gives it shape is the
  skyline, the bridges and Bang Krachao's jungle.
- **No temples or Buddhas** (AGENTS.md rule 8): the old town is rooftops, streets and the flower market. No Grand
  Palace, no Wat Arun, no Giant Swing.

## The look (2026-11-19, from your four pictures)

Your pictures were a river city in gold light: the Chao Phraya as the biggest shape, landmarks standing up off a
printed map, longtails, a tuk-tuk, a skyline. Their temples, golden chedis and guardian statue are left out (rule 8).
What the board took from them, in the app's toy look:

- **The river leads.** Wide, bright teal, a pale promenade down both banks, coconut palms leaning over it.
- **A map printed on warm paper.** The city floor is a few creams and peaches that sit close together, the little
  streets a thin tan print, Thonburi's and the south's orchards soft striped green, a compass in the quiet corner.
  (Before: seven pastels, a white grid and dotted orchards. It read as a quilt.)
- **A skyline in bunches** (Silom and Sathon, Siam, Sukhumvit, a pair at Rama 9): 19 towers in stronger candy glass,
  each with a long afternoon shadow painted the same way. The rest of the city stays low.
- **Shophouse rows under terracotta roofs:** about 30 rows of three or four pastel fronts, close together in the old
  town and Chinatown (`OLD_TOWN`), few and far apart elsewhere. (Before: 140 single houses and 230 trees scattered.)
- **Bangkok's own things:** longtails with striped roofs and ribbons on their noses, a hot pink taxi on Rama III Road,
  a fruit seller's boat on Khlong Bangkok Yai, kites over Sanam Luang, street-food umbrellas by Chinatown's gate.
- **Calm, but not empty.** The first look pass left the south-west and north-east corners bare, and you said so
  (2026-11-19). Each corner now has a real thing of its own, and the paper between has texture instead of props:
  - **North-east:** the night market on Ratchadaphisek Road (twelve tents in every color behind a gate of lights),
    the Rama 9 towers either side of it (never in front: a tower hides what's behind it), Khlong Saen Saep's fast boat.
  - **South-west:** a floating market on Khlong Dao Khanong (stilt houses, a jetty, four boats under big umbrellas)
    and Bang Mot's orange orchard (trees heavy with oranges, the farmer's house, baskets).
  - **Everywhere:** rooftops printed tone on tone inside the street grid (the city looks built up with nothing standing
    on it), neat groves of fruit trees on the orchards' painted rows (`GROVES`), and traffic: 24 little cars in taxi
    colors on six real roads (`TRAFFIC`, one instanced mesh).
- Still few big shapes ([the Krabi map](krabi-map.md) taught this): the pins and the river are what she sees first.
  A new thing should be a real place with a poke, not scatter.

(The very first try scattered thousands of little blocks and dots and looked like confetti.)

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
- **Sparkle's balloon** floats over the board's corner: tap it, the burner roars and it lifts off, back up to the
  Thailand map. (The top-left button goes there too.)
- **Talk** (`lines.ts` `L.bangkok`, Sparkle): "This is Bangkok! Tap the house or the mall!" once a visit; something true
  the first time she pokes a thing (15 of them: the kites, the taxi, the night market, the floating market and the
  orchard were added with the look); after ~8 s with nothing done, "Tap the house or the mall!" (at most three times),
  the pins bounce and a 👆 points at one.
- **Pokes:** Asiatique's wheel (it spins to a tune), Chinatown's gate (the lanterns swing, a lion drum), Lumphini
  (the monitor lizard slides into the lake; the swan boat twirls), Mahanakhon (its blocks twinkle), Central Rama 3,
  the flower market (petals fly), the port (the crane lowers its box), Bang Krachao (the birds fly up), the skytrain
  (ding-dong, off it zooms), the four river boats (toot toot), the tuk-tuk on Rama IV Road, the pink taxi on Rama III
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

- Kaylee's playtest: does she find the pins among the city, and what does she poke?
- The real sounds (above).
- Asiatique and Chinatown as places, when you pick what she does there.
- The mall day could end back on this map (the stamp landing on ICONSIAM) instead of in the house: your call.
