# 🗺️ The Krabi map

Built 2026-11-13 · the boat trip's hub (3D) · code: `src/world/places/thailand/activities/boat-trip/map/`

The old way into Krabi (the songthaew at the arrivals arch and Dad's two postcards) is gone. Now Krabi opens on a toy
diorama of **Krabi and Phang Nga Bay** floating in the sky, in the same look as the Thailand map and the Nan map: the
same tray, clouds, sky, camera entrance and sea. The coasts are real (Natural Earth, `scripts/krabi-map-land.mjs`
writes `coast.ts`): Phuket's east side, Phang Nga Bay full of limestone towers, Koh Yao Noi and Yai, the Krabi coast,
Ao Nang, and Koh Lanta Noi and Yai. Koh Phi Phi is a toy island (too small for the data).

## How it plays

- **The toy:** the little pink songthaew sits on the roads. Tap a place and it drives there (or grab it and pull it
  along the roads, let go at a place). The camera dives in and that part of the trip opens.
- **The places:** 🐘 Baan Chang (the elephants) and 🚤 the pier (the longtail revs off into the bay), in any order.
  Krabi Town is on the way (its giant fiddler crab waves). After one place the ✈️ airport opens: the plane takes off
  and the trip ends (photo on Agong's wall, the stamp, back to the Thailand map).
- **Coming back:** after the splash at Baan Chang and at the pier at sunset, a big 🗺️ goes back to the map, where
  that place's stamp lands. Away from the map, the top-left button goes back to it.
- **Talk (no new lines, all recorded already):** Dad's "Where to, Captain?" the first time, "Pai!" when she picks;
  Sparkle's hints after ~8 s (elephants or the boat, the elephants are waiting, tap the boat, tap the plane).
- **Pokes:** Ao Nang's beach, Railay's monkey, Chicken Island (it clucks), Koh Phi Phi, Koh Lanta's huts and its
  lighthouse, Khao Phanom Bencha's waterfall, Ko Tapu (the Nail Island), Ko Panyee's floating pitch, the longtails,
  the ferry to Phi Phi and Lanta, dolphins, a whale shark, a sea turtle, a yacht, a sea eagle, the clouds, the rock
  towers, the tiny plane.

## Room for more

Ao Nang and Koh Lanta stand on the board already as toys to poke (`SPOTS` in `layout.ts`). A trip there later is a
new entry in `PLACES` (and `STOPS`), a road in `ROADS` (Ao Nang's is painted already: `MORE_ROADS`), and its own
section. Koh Lanta has no road: a new place there would want the longtail or the ferry instead of the songthaew.

## Knobs and links

- `#/world/thailand/boat-trip/map` (fresh), `?been=chang` (Baan Chang's stamp lands), `?been=chang,bay` (the airport).
- `?feel=1`: the camera's entrance (`krabi-map-cam`) and how the songthaew drives and drags (`krabi-map-drive`).

## Next

- Kaylee's playtest: does she find the songthaew, and does she poke the sea toys?
- Ao Nang or Koh Lanta as real places, when you pick one.
