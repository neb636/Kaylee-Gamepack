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
- [ ] **More frames as trips grow.** Each trip keeps one frame (the newest photo of that trip); later trips' frames go
  toward the door or in a row above (`WALL_SLOTS`). Playtest QA suggested the wall should grow a little every replay
  (more photos, or the critters she found); not built.

## The mall trip: HarborLand's Big Frame

- [ ] **On an iPhone held sideways, the ↩️ (back to the hall) sits under the 🗺 button,** in every mini game (the top
  bar's clearance is small there). The iPad is fine.
  - Check: `#/world/thailand/mall-trip/frame` at iPhone landscape size.
  - Code: `activities/mall-trip/MallTrip.tsx` (the ↩️'s `top`).
- [ ] **The sign's letters draw over anything in front of them** (they're HTML over the 3D). Nothing passes in front
  of them now; they fade for Kaylee climbing behind them, not for the kids.
  - Code: `activities/mall-trip/harborland/sign.tsx`, `frame.ts` (`signDim`).
- [ ] **The kids in the frame climb by hopping straight up the nets** (they follow their loops, not the walk grid).
  - Code: `activities/mall-trip/harborland/frame.ts` (the kids' loops), `hall/hall.ts` (the hall's frame kid).

## The mall trip: found while building, not checked by QA (Dad skipped it, 2026-10-21)

- [ ] **Nine slots on the sock band** cover the hall's "Muay Thai" sign on an iPhone, and on iPhone landscape a mini
  game's 🛝 (back to the hall, at the end) sits over the sock band.
  - Check: `#/world/thailand/mall-trip/hall?from=boxing` and `skypod?round=3` at iPhone landscape size.
  - Code: `activities/mall-trip/MallTrip.tsx` (`SockBand`), each game's 🛝 button.
- [ ] **Muay Thai, round 3:** when Daddy holds the pad on her left, he hides the coach and the drum.
  - Check: `#/world/thailand/mall-trip/boxing?round=3`.
- [ ] **The pizza box only closes with two slices in it.** If she hands out all eight onto plates, nothing tells her to
  move two into the box, so the trip doesn't go home until she does. Make the box glow when the pan is empty.
  - Check: `#/world/thailand/mall-trip/share`, give every slice to a plate.
  - Code: `activities/mall-trip/pizza/table.ts` (`checkDone`, the box's glow).
- [ ] **The pizza table to home, and home to the stamp,** were never played end to end by a script (the trip loop's
  greybox ran out of time there).
  - Check: `#/world/thailand/mall-trip/share?shared=6`, then on to `home`.
- [ ] **The hall's Sky Pod wall is 4 by 3; the game's has nine pods.**

## The Nan trip: the rice farm (the look and voices)
- [ ] **The terraces don't show on the farm.** Sapan's rice steps sit at the valley's sides: the deck looks out at them,
  but the farm's camera only catches them on very wide screens. Frame one terrace hill on the farm camera.
  - Check: `#/world/thailand/nan-trip/rice?round=plant` in iPad landscape.
- [ ] **Grow has short stretches where only the clock moves.** Shorter rests for the first wave of birds would help.
  - Check: `#/world/thailand/nan-trip/rice?round=grow`.
- [ ] **Daddy stands still while she threshes,** apart from the hop on "Whack! Good one!".
  - Check: `#/world/thailand/nan-trip/rice?round=thresh`.
- [ ] **The 🏠 sits on the hut's roof corner** at the top left of the farm (the hut is scenery, not a target).
- [ ] **Listen to the rice farm's voices** (32 clips): is Daddy too chatty (8-10 one-time lines a run)? The transcription
  check heard "Go, farmer Kaylee!" as "Cayley" (likely just spelling).

## The Nan trip: the look and the voices (steps 8-10)
The step 6 issues (the small map on a tall iPad, the back of Kaylee's head at the belt, the car starting at the last
stop after the city road) are fixed.
- [ ] **The Pajero from behind still reads boxy** on the chase camera (the new grille and lights are at the front).
  - Check: `#/world/thailand/nan-trip/drive?road=valley`. Code: `trip/vehicles/pajero.ts` (the tailgate and rear lamps).
- [ ] **The sea of clouds is hard to see** from the chase camera, which mostly looks at the hillside.
  - Check: `#/world/thailand/nan-trip/drive?road=sky`, past the cloud. Code: `drive/mountain.ts`, `trip/road/clouds.ts`.
- [ ] **Daddy, the elephant toy and the wipers' tap targets overlap a little** on the small car (each keeps an area of
  its own). Code: `drive/mountain.ts` (the anchors).
- [ ] **On the grass the Pajero drives straight through the chevron signs** and the round mirrors (they stand 1.7 m
  past the edge; it can go 4.6 m out). A wobble or a boing off them would be sillier.
  - Check: `#/world/thailand/nan-trip/drive?road=sky`, steer onto the grass on a bend. Code: `drive/mountain.ts` (`edges`).
- [ ] **The `weather` param drops out of the address bar** once a drive starts (`NanTrip.tsx` doesn't pass it to
  `enter`). The drive the link opened still uses it.
- [ ] **The salt wells' three verbs** (bucket, logs, paddle) are one grab-and-move verb but feel like three; round 2 has
  ~20-30 s of waiting for the boil. Playtest QA scored it OK, not fun.
  - Check: `#/world/thailand/nan-trip/salt?round=2`. Code: `activities/nan-trip/salt/salt3d.ts`.
- [ ] **A first trip is long** (~15-20 min with packing, the plane and the rental desk before two stops). Watch where she
  drifts; ideas: ✈️🏠 after one stop on a first trip, a shorter rental desk.
- [ ] **Kaylee is mostly seen from behind** at the mushroom rack (she faces the bags).
- [ ] **The map's crayons and cloth are clipped** at the board's edge in some sizes (nothing she plays with).
- [ ] **Listen:** the clerk, the mushroom aunty, the salt aunty (new voices, northern Thai accent), Daddy's "Whoa! Beep
  beep!" (heard as Chinese by the transcription check), "Wheee! Bumpy!", and whether the sky road talks too much.

## Listen on the iPad (automated checks can't hear)
- [ ] **The mall trip's new voices** (2026-10-21): the transcription check flagged Thai words written back in Thai
  ("Sawasdee ka", "Khob khun ka"), "Kaylee" heard as "Kaley", Daddy's "Ooh, strong!" heard in Japanese, the coach's
  "wai kru" heard as "Y crew", and "Phi Ta Khon" as "Fi ta'kan". Listen in the vet, the barber, the hall's staff, the
  Muay Thai warm-up and the Big Frame's mask.

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
