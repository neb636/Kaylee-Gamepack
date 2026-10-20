# Thailand: known issues

Small things QA found that don't block play, kept here for a later QA pass. Each one has a link to the section where it
shows, what to look for, and where the code is. Tick it off (or delete it) once it's fixed and checked on the iPad.

Links open the live site: `https://neb636.github.io/Kaylee-Gamepack/` + the path below.
Code paths are under `src/world/places/thailand/`.

## The boat trip: the bay (step 3, PR #101)

- [ ] **The sunset's lower third is plain water.** The sky turns pink and gold, but the bottom of the screen is flat
  water with nothing in it, so the payoff frame looks empty.
  - Check: `#/world/thailand/boat-trip/sunset`, drive toward the pier.
  - Code: `activities/boat-trip/bay/sunset.ts` (the sunset's shot), `bay/sky.ts`, `engine/water.ts` (`setColors`).
  - Ideas: sparkles of sun on the water, the porpoise closer in front, the camera lower so the towers fill more of it.
- [ ] **The canoe's oar crosses the tunnel walls.** In the low cave, the paddle sometimes swings visibly through the
  rock.
  - Check: `#/world/thailand/boat-trip/cave`, paddle in.
  - Code: `activities/boat-trip/bay/cave.ts` (the tunnel), `trip/vehicles/` (the canoe's paddling).
- [ ] **Mommy and Daddy lie down in one frame.** Tap them in the canoe and they jump from sitting to flat on their
  backs, with no movement in between.
  - Check: `#/world/thailand/boat-trip/cave`, tap Daddy, then Mommy.
  - Code: `activities/boat-trip/bay/cave.ts` (`lieDown`), `bay/poses.ts`.
  - Fix: ease into it (lean back, settle) like the hops do.
- [x] **Some of Sparkle's album facts are long (4–5 s).** She's five: keep them under about 3 s. *(Step 5: shortened, now
  2.5–3.5 s in her slow voice; they're on the stamp screen and the passport too. Listen on the iPad.)*
  - Check: open the 📔 album at `#/world/thailand/boat-trip/nail?stops=village,cave&photos=village,hong&found=crab,eagle,needlefish`
    and tap each sticker and photo.
  - Code: `lines.ts` (the `L.bay` facts). Regenerate the clips after editing (`node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs`).
- [ ] **In the village, the cave's and the beach's glows sit under the village's own tap targets.** A tap on the glow
  can land on a house or the ball instead of setting the boat off (step 5's timing robot got stuck there). Driving with a
  finger still works, and the badges at the screen's edge work when the glow is off screen.
  - Check: `#/world/thailand/boat-trip/village`, score the goal, then tap the cave's golden light.
  - Code: `activities/boat-trip/bay/bay.ts` (`anchorAt` priorities), `bay/village.ts`.
- [ ] **Tapping the way out of the hong: the canoe paddles back slowly.** In a test browser it took over a minute (slow
  motion there); check it feels quick enough on the iPad.
  - Check: `#/world/thailand/boat-trip/hong`, wait for the glow at the tunnel, tap it.
  - Code: `activities/boat-trip/bay/cave.ts` (the paddle back).
- [ ] **On portrait, the chase camera crops the village's houses.** The stilt houses get cut off at the sides on a
  tall screen.
  - Check: `#/world/thailand/boat-trip/village` on the iPad held upright.
  - Code: `activities/boat-trip/bay/village.ts` (its shot), `bay/bay.ts` (`shot`, where the village tightens it).

## The boat trip: the way there (step 4, PR #103)

- [x] **The goodbye's name pills crowd each other.** With the whole family at the shutter, the house's name pills
  overlapped. *(Step 5: the trip shows no name pills (the goodbye and coming home); the guide's bubble says who's
  talking. The house itself keeps them.)*
  - Check: `#/world/thailand/boat-trip/goodbye`.
  - Code: `activities/boat-trip/BoatTrip.tsx` (`ANCHORS_OF.house`).
- [ ] **In the cabin Kaylee sits toward the left edge.** Mommy is the middle of the shot, and Daddy has to stay in frame
  because tapping him is a toy.
  - Check: `#/world/thailand/boat-trip/fly` on the iPad held upright and sideways.
  - Code: `trip/legs/plane.ts` (`shot`, the cabin's camera in the aisle).
  - Ideas: aim the shot between Kaylee and Mommy and let Daddy's shoulder and face sit at the edge.
- [x] **While Mommy asks, only Mommy and Kaylee react to taps.** *(Step 5: everyone else in her room hops, and things
  wobble with their sound; Kaylee still stays put until she answers.)*
  - Check: `#/world/thailand/boat-trip/invite`, tap Gan, the fan, the mattress.
  - Code: `trip/legs/house-plugin.ts` (`tap`, the `invite` phase).
- [ ] **On an iPhone held upright, Aunty Sri's van is cut off at the side** when it pulls up for the goodbye (step 5's
  layout QA). The iPad is fine.
  - Check: `#/world/thailand/boat-trip/van` at iPhone portrait size.
  - Code: `trip/legs/house-plugin.ts` (`shot`, the `goodbye` phases' tall framing).

## The boat trip: the way home and the photo wall (step 5)

- [ ] **On an iPhone held upright, her photo's frame on Agong's wall is cut by the left edge.** `at=photos` starts with
  the camera on the wall, which fits the iPad; the narrow phone still shows only part of the frame (and the same at the
  gather, where Agong is cut too). The frame still opens when tapped.
  - Check: `#/world/thailand/hub/downstairs?at=photos` at iPhone portrait size, after playing `home` once.
  - Code: `trip/wall.ts` (`WallPlugin.shot`), `trip/legs/house-plugin.ts` (`shot`, the gather's tall framing).
  - Ideas: aim further left on very narrow screens, or let the camera come further out.
- [ ] **The picture book (no WebGL) draws its scenes with emoji.** It's only for a browser without WebGL2 (or
  `?gl=off`); Sparkle, the crab sticker and the drawn photo are real, the family and the legs are emoji.
  - Check: `?gl=off#/world/thailand/boat-trip/invite`.
  - Code: `activities/boat-trip/Flat.tsx` (`LEGS`, `STOPS`, `Home`).
- [ ] **More frames as trips grow.** Each trip keeps one frame (the newest photo of that trip); later trips' frames go
  toward the door or in a row above (`WALL_SLOTS`). Playtest QA suggested the wall should grow a little every replay
  (more photos, or the critters she found); not built.

## Listen on the iPad (automated checks can't hear)

- [ ] **The village kids say "Kaylee".** The transcription check heard "Haley" (and "เคลลี่" in the Thai line). It's
  likely the accent, but listen to "The ball, Kaylee!" and "Khob khun ka, Kaylee!". The kids' voice is OpenAI `coral`
  at +4 semitones; it's one line in `cast.json` (`kids`) to try another.
  - Check: `#/world/thailand/boat-trip/village`, wait for the kids to call, then score a goal.
- [ ] **Daddy's "Pai!"** The transcription check heard it as Chinese (派). Listen for whether it sounds like the Thai word.
  - Check: `#/world/thailand/boat-trip/pier`, tie three ribbons and the garland, then drive off.
- [ ] **Lip sync and sound in the bay overall.** The engine putt-putt to RRRAAAH, the echoes in the cave, the
  porpoise's blow.

## Check on the iPad (automated browsers can't measure)

- [ ] **Frame rate and draw calls in the bay.** Headless runs showed about 90–150 draw calls while driving. Open any bay
  link with `?debug=1` (for example `?debug=1#/world/thailand/boat-trip/bay`) and drive around: it should stay smooth,
  especially in the village and with the sunset sky.
