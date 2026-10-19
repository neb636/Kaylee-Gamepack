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
- [ ] **Some of Sparkle's album facts are long (4–5 s).** She's five: keep them under about 3 s.
  - Check: open the 📔 album at `#/world/thailand/boat-trip/nail?stops=village,cave&photos=village,hong&found=crab,eagle,needlefish`
    and tap each sticker and photo.
  - Code: `lines.ts` (the `L.bay` facts). Regenerate the clips after editing (`node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs`).
- [ ] **On portrait, the chase camera crops the village's houses.** The stilt houses get cut off at the sides on a
  tall screen.
  - Check: `#/world/thailand/boat-trip/village` on the iPad held upright.
  - Code: `activities/boat-trip/bay/village.ts` (its shot), `bay/bay.ts` (`shot`, where the village tightens it).

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
