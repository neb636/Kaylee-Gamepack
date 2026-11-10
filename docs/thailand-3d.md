# Thailand: the 3D country

Thailand is where the app is going: the family's own country, built in 3D with three.js. This is the builder's
reference for it. The look, the engine, the hub, the trip kit and the labs are below; the family code that keeps the
house private is at the end.

Read `planning/around-the-world/thailand.md` (the family, the house), then the notes of the trip you're working on in
`planning/around-the-world/thailand/` (`nan-trip.md` is the road trip and the road kit, `samet-trip.md` the open
island). The finished boat and mall trips (and Baan Chang) have no notes left; read their code in `trip/` and
`activities/`. `thailand/known-issues.md` lists small things QA found, with links and code paths.

- **The look:** flat pastel 3D. Toon shading in a few flat bands with lavender shadows, screen-space ink outlines like
  the 2D art, blob shadows, no post-processing (`engine3d/toon.ts`, `engine3d/outline.ts`).
- **The engine** (`src/world/engine3d/`, outside the locked folder) is shared by every 3D country: one shared
  renderer (we make the WebGL2 context ourselves, so no console error without one), the frame loop (60 fps cap; 30
  when nothing moves; slower in test browsers), a box-fitting follow camera, a walk grid with A*, the tap marker, the finger drive control for vehicles (`drive.ts`), water and particles. `View3D.tsx` mounts any 3D world with its DOM tap
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
  the ground once (distance to the coast); the terrain, its painted top and the sea's foam all read it. Bangkok opens the house; a trip somewhere else gets a pin, starts there and ends there
  (the stamp lands on its pin, the trip's photo goes on Agong's wall by itself). Tapping a pin goes straight
  to the trip's landing spot: the map no longer packs or rides the window seat (2026-11-10; the pack, goodbye, airport
  and window-seat sections are still in each trip, for a place-picker inside the house to start later). The mall day, in Bangkok,
  still starts in the house (Mommy or Daddy asks) and ends there.
- **The trip kit** (`trip/`): packing, the goodbye, the vehicles, the airport, the window seat, the photo wall. Reuse it
  for a new trip instead of building travel again.
- **Debugging:** `?debug=1` shows a tuning panel (camera, light bands, outlines, walk), `?fps=N` overrides the frame cap,
  `window.__thaiHouseQA()` is read-only state for tests (no jump hooks: tests open section links).
- **The camera lab:** `?cam=1` on any 3D section link opens it (`src/world/labs/camera/`): the real game in an iPad
  or iPhone frame, a panel that nudges the game's camera or locks one of your own (`CameraRig.setOverride`, so no game code
  changes), freeze, orbit by hand, guides (the fit box, the top bar, tap-target sizes), and a Cinema switch. When Dad sends a lab link or a
  "Copy for agent" note, bake it into that world's `shot()` for that round and screen shape (tall or wide) and its
  `rig.fov`. Leave the other branches alone unless he says otherwise, and check the targets stay at 64 px or more.
- **The cinema camera (cutscenes):** `engine3d/cinema.ts` films a moment like a game's cinematic: a `Director` cuts
  between authored, eased camera moves round a moving subject (crane, chase, low hero shot, a fixed camera it drives
  past, a two-shot), `rig.setCine()` takes the camera and hands back smoothly (the lens too), its `Letterbox` draws the bars in the frame.
  `?cine=1` (sticky) turns it on; the speedboat to Koh Samet is the reference. Reuse it for any ride or cutscene
  instead of scripting camera paths by hand, and keep a `playable` shot for when her finger is down.
- **The feel lab:** `?feel=1` on any section link (2D or 3D, `src/world/labs/feel/`) puts sliders over the real, playable game
  for every number the scene declares with `knobs()` (`src/world/kit/knobs.ts`), and a live graph of whatever it
  `watch()`es (her finger against what the car does). Playwright can check that a mechanic *works*; only Dad's finger
  can say it *feels* right, and we got steering wrong twice in a row by guessing. So whenever a core verb has numbers
  that decide its feel (steering, dragging, throwing, a hop, a swing, smoothing, dead zones), declare them as knobs
  in the first playable (the code's `value`s are the defaults; read them every frame, never copy them into a const),
  watch the input and the result, and put a `?feel=1` link in the review page's links. When Dad sends a "Copy for agent" note, bake the
  changed numbers into the knobs' `value`s and leave the knobs in.
- **Gotchas:** never name a shader variable `patch` or `sample` (reserved in WebGL2; the shader silently fails). Dispose
  what you create (`engine3d/dispose.ts`). Keep three.js out of `meta.ts` and `sections.ts`.
- **Dad decides the family:** who each person is, which animal, who comes on a trip. Ask, don't invent family facts.
  Photos of Kaylee stay out of this public repo; describe them in words in the plan.

## Thailand is locked (the family code)

Thailand's 3D house is the family's real home, and the site is public, so the deployed builds (main and every PR
preview) encrypt Thailand's code: it opens only after a grown-up types the family code once on that device
(`src/world/lock.ts`, `LockScreen.tsx`; the character lab asks too). The build does it (`scripts/vite-lock.ts`) when
`LOCK_CODE` is set, which the deploy and preview workflows take from the `THAILAND_CODE` repository secret (they fail
without it). `npm run dev`, CI tests and local builds lock nothing. Try the lock locally with
`LOCK_CODE=test npm run build && npm run preview`.
- Startup code stays readable (Thailand's `meta.ts`, `sections.ts`, `lines.ts`, voice clips, pictures). Never put the
  house's layout or anything that describes the home in those files or in shared code outside `places/thailand/`.
- The build fails if code that loads at startup imports a locked chunk: move the shared piece out of `places/thailand/`.
- Code another country needs (the 3D engine, the rig, the labs) lives outside `places/thailand/` (`src/world/engine3d/`,
  `src/world/labs/`), or that country would be locked too. The family's looks, the house and Kaylee stay inside.
- This repo is public, so the source itself is still readable on GitHub until the repo goes private.
