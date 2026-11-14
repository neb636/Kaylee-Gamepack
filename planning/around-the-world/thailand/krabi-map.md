# 🗺️ The Krabi map

Built 2026-11-13, rebuilt 2026-11-14 · the boat trip's hub (3D) · code: `src/world/places/thailand/activities/boat-trip/map/`

Krabi opens on a toy diorama of **Krabi and Phang Nga Bay** floating in the sky, in the same tray as the Thailand map
and the Nan map. The first version (a songthaew driving along cream roads between round trees and pointed mountains)
looked too much like the Nan map and not like Krabi, so on 2026-11-14 the roads, the songthaew and the fields went, and
the board was rebuilt around what Krabi looks like:

- **An emerald sea** (pale mint over the sand, emerald, deep teal out in the Andaman Sea), with pale sandbars
  (`SHOALS`) and the walk-across sandbar off Chicken Island.
- **Limestone towers everywhere**: cream rock streaked with rust, jungle spilling over the top, the sea's notch cut
  round the foot. About forty stand in the sea (`KARSTS`), more stand up out of the jungle on the land (`CRAGS`).
- **Rainforest and coconut palms**: the hills are round domes of jungle (no pointed mountains), palms on every flat,
  wide pale beaches, mangroves round the top of the bay.
- The coasts are real (Natural Earth, `scripts/krabi-map-land.mjs` writes `coast.ts`). Koh Phi Phi is a toy island.

## How it plays

- **The toy: pins.** Over each place she can go to floats a pink pin with a toy of the place on its head: 🐘 a baby
  elephant with bananas over Baan Chang, 🚤 a longtail under a rock tower over the pier. Tap the pin (or the place):
  it hops and spins in sparkles, the camera dives in and that part of the trip opens. Any order.
- **Home:** after one place the ✈️ plane's pin pops up over the airport: tap it, the plane takes off and the trip ends
  (photo on Agong's wall, the stamp, back to the Thailand map).
- **Coming back:** after the splash at Baan Chang and at the pier at sunset, a big 🗺️ goes back to the map, where
  that place's stamp lands in its pin's place. Away from the map, the top-left button goes back to it.
- **The places to come** wear a lavender pin (`PINS`, `soon`): ⛱️ Ao Nang's beach front (an umbrella, a beach ball and
  a sandcastle) and 🏝️ Koh Lanta (its lighthouse). A tap only plays with them (the sailfish statue leaps, the lamp
  comes on).
- **Talk (no new lines, all recorded already):** Dad's "Where to, Captain?" the first time, "Pai!" when she picks;
  Sparkle's hints after ~8 s (elephants or the boat, the elephants are waiting, tap the boat, tap the plane).
- **Pokes:** Ao Nang's beach, Railay's monkey, Chicken Island (it clucks), Koh Phi Phi, Koh Lanta's huts and its
  lighthouse, Khao Phanom Bencha's waterfall, the Emerald Pool, Ko Tapu (the Nail Island), Ko Panyee's floating
  pitch, Krabi Town's giant crab, the longtails, the ferry to Phi Phi and Lanta, dolphins, a whale shark, a sea
  turtle, a yacht, a sea eagle, the clouds, the rock towers, the tiny plane.

## Making Ao Nang or Koh Lanta a real place

In `layout.ts`: drop `soon` from its pin and give the pin a `place` (a new entry in `PLACES`), add its stop to `STOPS`
and `STOP_PLACE`, and give it a section in the trip. The pin turns pink and a tap dives in.

## Knobs and links

- `#/world/thailand/boat-trip/map` (fresh), `?been=chang` (Baan Chang's stamp lands, the plane's pin pops up),
  `?been=chang,bay` (both stamps).
- `?feel=1`: the camera's entrance (`krabi-map-cam`).

## Next

- Kaylee's playtest: does she find the pins, and does she poke the sea toys?
- Ao Nang or Koh Lanta as real places, when you pick one.
