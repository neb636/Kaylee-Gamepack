# 🗺️ The Krabi map

Built 2026-11-13, rebuilt 2026-11-14, calmed down 2026-11-14 · the boat trip's hub (3D) · code: `src/world/places/thailand/activities/boat-trip/map/`

Krabi opens on a toy diorama of **Krabi and Phang Nga Bay** floating in the sky, in the same tray as the Thailand map
and the Nan map. The first version (a songthaew driving along cream roads between round trees and pointed mountains)
looked too much like the Nan map and not like Krabi, so on 2026-11-14 the roads, the songthaew and the fields went, and
the board was rebuilt around what Krabi looks like:

- **A calm emerald sea** (pale mint over the sand, emerald, deep teal out in the Andaman Sea), with pale sandbars
  (`SHOALS`) and the walk-across sandbar off Chicken Island. No foam rings drifting out from the shore, only a few
  wave dashes far out (the shared `Sea`'s `rings` and `dashes`).
- **A few groups of limestone towers**: soft green humps of jungle over cream cliffs, the sea's notch cut round the
  foot. Eleven stand in the sea (`KARSTS`) in three loose groups (Phang Nga Bay, the Hong islands off Ao Nang, one or
  two out at sea) with open water between; four crags stand up out of the jungle on the land (`CRAGS`).
- **Rainforest and coconut palms**: the hills are round domes of jungle (no pointed mountains), big soft clumps up
  the hills, palms in loose groups along the beaches (about 110 trees, not 330), wide pale beaches, mangroves round
  the top of the bay.
- The coasts are real (Natural Earth, `scripts/krabi-map-land.mjs` writes `coast.ts`). Koh Phi Phi is a toy island.

**Calmed down (2026-11-14):** the rebuilt board was "way too busy". You sent two pictures of calm karst bays as the
mood (a few groups of green rock islands in open turquoise water, one boat). Kept: the places, the pins, Ao Nang's
beach, Railay's monkey, Chicken Island, Koh Phi Phi, Ko Tapu, the lighthouse, one longtail, the dolphins, the
yacht. Gone: the lavender pins of the places to come, the whale shark, the ferry, the sea turtle, the sea eagle,
the second longtail, Krabi Town's giant crab and market umbrellas, Ko Panyee's stilt village, the Emerald Pool,
Khao Phanom Bencha's waterfall, Koh Lanta's huts, two thirds of the trees and rock towers. (A see-through mist among
the rocks was tried and dropped: it didn't show on the pale toy water.)

## How it plays

- **The toy: pins.** Over each place she can go to floats a pink pin with a toy of the place on its head: 🐘 a baby
  elephant with bananas over Baan Chang, 🚤 a longtail under a rock tower over the pier. Tap the pin (or the place):
  it hops and spins in sparkles, the camera dives in and that part of the trip opens. Any order.
- **Home:** after one place the ✈️ plane's pin pops up over the airport: tap it, the plane takes off and the trip ends
  (photo on Agong's wall, the stamp, back to the Thailand map).
- **Coming back:** after the splash at Baan Chang and at the pier at sunset, a big 🗺️ goes back to the map, where
  that place's stamp lands in its pin's place. Away from the map, the top-left button goes back to it.
- **The places to come** (Ao Nang's beach, Koh Lanta's lighthouse) have no pin: they're toys to poke (the sailfish
  statue leaps, the lamp comes on) until one becomes a real place.
- **Talk (no new lines, all recorded already):** Dad's "Where to, Captain?" the first time, "Pai!" when she picks;
  Sparkle's hints after ~8 s (elephants or the boat, the elephants are waiting, tap the boat, tap the plane).
- **Pokes:** Ao Nang's beach, Railay's monkey, Chicken Island (it clucks), Koh Phi Phi, Koh Lanta's lighthouse, Ko
  Tapu (the Nail Island), Krabi Town (its shophouses bounce), the longtail, the dolphins, the yacht, the clouds, the
  rock towers, the tiny plane.

## Making Ao Nang or Koh Lanta a real place

In `layout.ts`: give it a `PLACES` entry and a pin in `PINS` (with its `place`), add its stop to `STOPS` and
`STOP_PLACE`, and give it a section in the trip. A tap on its pin dives in. Keep the board calm: a new place's toy
replaces its poke toy rather than adding to it.

## Knobs and links

- `#/world/thailand/boat-trip/map` (fresh), `?been=chang` (Baan Chang's stamp lands, the plane's pin pops up),
  `?been=chang,bay` (both stamps).
- `?feel=1`: the camera's entrance (`krabi-map-cam`).

## Next

- Kaylee's playtest: does she find the pins, and does she poke the sea toys? If the calm board feels too empty to her,
  add back one thing at a time, not the lot.
- Ao Nang or Koh Lanta as real places, when you pick one.
