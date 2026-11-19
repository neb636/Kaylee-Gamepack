# Thailand: the 3D country

Thailand is where the app is going: the family's own country, built in 3D with three.js. This is the builder's
reference for it. The look, the engine, the hub, the trip kit and the labs are below.

Read `planning/around-the-world/thailand.md` (the family, the house), then the notes of the trip you're working on in
`planning/around-the-world/thailand/` (`nan-trip.md` is the road trip and the road kit, `samet-story.md` the
island). The finished boat and mall trips (and Baan Chang) have no notes left; read their code in `trip/` and
`activities/`. `thailand/known-issues.md` lists small things QA found, with links and code paths.

- **The look:** flat pastel 3D. Toon shading in a few flat bands with lavender shadows, screen-space ink outlines like
  the 2D art, blob shadows, no post-processing (`engine3d/toon.ts`, `engine3d/outline.ts`).
- **The engine** (`src/world/engine3d/`, outside `places/thailand/`) is shared by every 3D country: one shared
  renderer (we make the WebGL2 context ourselves, so no console error without one), the frame loop (60 fps cap; 30
  when nothing moves; slower in test browsers), a box-fitting follow camera, a walk grid with A*, the tap marker, the finger drive control for vehicles (`drive.ts`), water (`water.ts`, `lagoon.ts`, running water `flow.ts`), particles and floaters (`floaters.ts`: sparkles, puffs, crumbs, one draw call), and the instanced ink line (`instancedOutlineMaterial`). Use these before writing your own: a copy drifts (two hand-made outline shaders drew lines a third too thick). Number helpers (`clamp`, `damp`, `wrapAngle`, `DEG`) are `src/sdk/math.ts`. `View3D.tsx` mounts any 3D world with its DOM tap
  targets (`Anchors.tsx`): real buttons, at least 64 px, placed over the 3D things every frame, so VoiceOver and
  QA can find them. Overlapping targets must not steal each other's taps.
- **Layouts are data in meters** (`activities/hub/layout.ts`): the build, the walk grids and the tap targets all
  read the one source of truth.
- **The hub is a toy:** tap the floor and Kaylee walks there; tap a thing and it reacts at once, then she uses it; tap
  someone and they hop and say hello. Sacred things (the altar, the spirit house) never wobble: they glow, a bell rings,
  she does a wai.
- **The Thailand map** (`activities/hub/map/`, 3D, plan `thailand/thailand-map.md`) is where she lands: a toy board
  with Thailand standing up out of the sea (its real coastline, `land.ts`, written by `scripts/thailand-map-land.mjs`
  from Natural Earth), a little model and a bobbing pin for each place, and animals, boats and clouds that answer a
  poke. A drag swings the board round, a pinch brings it closer. Tapping a pin opens that place. `field.ts` works out
  the ground once (distance to the coast); the terrain, its painted top and the sea's foam all read it. Bangkok opens the Bangkok map (below); a trip somewhere else gets a pin, starts there and ends there
  (the stamp lands on its pin, the trip's photo goes on Agong's wall by itself). Tapping a pin goes straight
  to the trip's landing spot: the map no longer packs or rides the window seat (2026-11-10; the pack, goodbye, airport
  and window-seat sections are still in each trip, for a place-picker inside the house to start later). The mall day, in Bangkok,
  starts at ICONSIAM's pin on the Bangkok map (or in the house: Mom or Dad asks) and ends in the house.
- **The Bangkok map** (`activities/hub/bangkok/`, hub section `bangkok`, notes: `thailand/bangkok-map.md`) is what
  Bangkok's pin opens: the middle of the real city on a board (the Chao Phraya, the khlongs, the main roads and the
  parks are `geo.ts`, written by `scripts/bangkok-map-land.mjs` from OpenStreetMap; every place is put down by its
  longitude and latitude in `layout.ts`). The house and ICONSIAM each have a pin, Sparkle's balloon goes back up to
  the Thailand map, and the house's top-left button comes back here. A new Bangkok place is a `ll(lon, lat)` and a pin.
- **A trip's own map** looks like the Thailand map: the board floats in the same sky and tray and opens with the same
  camera entrance behind the loading cover (`trip/sky.ts`: `skyTexture`, `puffCloud`, `trayParts`, `mapCamKnobs`,
  `Entrance`, `boardShot`; `trip/MapCover.tsx`). The Nan map (`activities/nan-trip/map/`) and the Krabi map
  (`activities/boat-trip/map/`) use them; a new trip's map should too.
  Its camera frames the board like CSS `object-fit: contain`: the shot's box is the board and its tray (`trayBox`)
  with `objectFit: 'contain'`, and the rig centers that box's picture below the top bar and fits it, on any screen
  shape (`'cover'` fills the screen instead). A tilted board's near edge looks bigger than its far edge, so a camera
  that just looks at the board's middle leaves it low and off to one side; don't fix that with a center per screen
  shape. A screen shape may pick its own angle (a wide screen looks from lower and further round).
  Every map is hers to turn, like the Thailand map: a one-finger drag (or the mouse) swings the board round and a
  pinch brings it closer, within `MAP_ROAM`. Frame the overview with `boardShot()` (trayBox, object-fit: contain and
  `roam: MAP_ROAM` in one) and it turns; a `Stage` turns whenever its shot has a `roam` (a dive in has none, so it's
  the game's), and a drag on something of the board's own (Nan's car) returns true from `roamGrabbed()`.
- **The trip kit** (`trip/`): packing, the goodbye, the vehicles, the airport, the window seat, the photo wall. Reuse it
  for a new trip instead of building travel again.
- **Debugging:** `?debug=1` shows a tuning panel (camera, light bands, outlines, walk), `?fps=N` overrides the frame cap,
  `window.__thaiHouseQA()` is read-only state for tests (no jump hooks: tests open section links).
- **The camera lab:** `?cam=1` on any 3D section link opens it (`src/world/labs/camera/`): the real game in an iPad
  or iPhone frame, a panel that nudges the game's camera or locks one of your own (`CameraRig.setOverride`, so no game code
  changes), freeze, orbit by hand, guides (the fit box, the top bar, tap-target sizes), and a Cinema switch. When the user sends a lab link or a
  "Copy for agent" note, bake it into that world's `shot()` for that round and screen shape (tall or wide) and its
  `rig.fov`. Leave the other branches alone unless they say otherwise, and check the targets stay at 64 px or more.
- **The cinema camera (cutscenes):** `engine3d/cinema.ts` films a moment like a game's cinematic: a `Director` cuts
  between authored, eased camera moves round a moving subject (crane, chase, low hero shot, a fixed camera it drives
  past, a two-shot), `rig.setCine()` takes the camera and hands back smoothly (the lens too), its `Letterbox` draws the bars in the frame.
  `?cine=1` (sticky) turns it on; the speedboat to Koh Samet is the reference. Reuse it for any ride or cutscene
  instead of scripting camera paths by hand, and keep a `playable` shot for when her finger is down.
- **Films (stories, scripted cutscenes):** `engine3d/film.ts` plays a storyboard of beats (a shot, a line, what happens),
  with a storybook look for memories and a hold-to-skip ⏭ (`engine3d/FilmOverlay.tsx`). How to write one: `docs/films.md`.
- **The feel lab:** `?feel=1` on any section link (2D or 3D, `src/world/labs/feel/`) puts sliders over the real, playable game
  for every number the scene declares with `knobs()` (`src/world/kit/knobs.ts`), and a live graph of whatever it
  `watch()`es (her finger against what the car does). Playwright can check that a mechanic *works*; only the user's finger
  can say it *feels* right, and we got steering wrong twice in a row by guessing. So whenever a core verb has numbers
  that decide its feel (steering, dragging, throwing, a hop, a swing, smoothing, dead zones), declare them as knobs
  in the first playable (the code's `value`s are the defaults; read them every frame, never copy them into a const),
  watch the input and the result, and put a `?feel=1` link in the review page's links. When the user sends a "Copy for agent" note, bake the
  changed numbers into the knobs' `value`s and leave the knobs in.
- **Gotchas:** never name a shader variable `patch` or `sample` (reserved in WebGL2; the shader silently fails). Dispose
  what you create (`engine3d/dispose.ts`). Keep three.js out of `meta.ts` and `sections.ts`.
- **The user decides the family:** who each person is, which animal, who comes on a trip. Ask, don't invent family facts.
  Photos of Kaylee stay out of this public repo; describe them in words in the plan.
