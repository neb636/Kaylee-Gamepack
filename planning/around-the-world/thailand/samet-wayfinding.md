# Koh Samet: finding her way (pitch, check-in 1)

Written 2026-11-10. A rethink of how Kaylee finds her way round the island in `samet-trip.md` (`island`), for the
seven "Finding her way" and taxi items still open in issue #357. Read it with `samet-trip.md`,
`../ACTIVITY-TEMPLATE.md` and `docs/play-design.md`. Branch `neb636/samet-wayfinding`.

**Status:** card B built (2026-11-10, PR #369): the beach puppy, his shortcut and sand slide, the taxi that goes where he goes, the top-left button that calls him, home by the speedboat. Next: Kaylee's playtest.

## What it has to fix (#357)

1. Nothing says where she is: the beach name shows ~2 s, then nothing; no island map, no signs (`island?at=hinkhok`).
2. The only "where next" help is a small silent flag badge after 7-10 s; at Hat Phai it sits on the phone button and
   vanishes on touch (`island?at=phai`).
3. The longest walk is 75 s (Prao to Wong Duan), 39 s of it look-alike road (`island?at=prao`).
4. The taxi gives no choice: one tap starts a fixed 107 s loop, nothing shows how to get off, no stop at Hin Khok, Phai
   or Ao Noi Na (`island?at=nadan`).
5. The taxi says "Hat Sai Kaew!" while still parked at Na Dan, then nothing on arrival.
6. The taxi leaves unless she's close, and can be off-screen when she's right beside it (`island?at=saikaew`).
7. The big top-left map button leaves Koh Samet with one tap, and reopening restarts at Pack and the boat ride
   (`island?at=saikaew`). It's the only map-looking thing she can see.

## The three pitches (each solves all seven, a different verb)

- **A. Kaylee's Island Map**: open her toy map (the top-left button), tap a beach's picture, follow a trail of glowing
  shells on the ground. Far beaches: the trail leads into the taxi, which has the same map on its dashboard (tap a
  beach, it drives straight there). Her pin is always on the map; idle 8 s, the button wiggles and the shells start.
- **B. Follow the Beach Puppy**: a new islander, a beach dog. Tap him and chase him: he runs to a beach she hasn't
  played and waits, wagging; his thought bubble shows where he's going, he barks the beach's name on arrival. Takes
  shortcuts (a sand slide, a rope swing) on the long road. Top-left button: the puppy (tap, he runs to her). Far
  beaches: he jumps into the taxi first.
- **C. The Sun Bear's Taxi Bell**: ride the taxi and pull the bell cord when her beach's picture glows on the route
  strip; it stops at every beach (seven stops) and says each name on arrival. Every beach gets a big picture sign
  (tap: it says its name). Top-left button: the horn (the taxi drives to her). The long west road: the pelican
  captain's longtail boat, with a bell too.

All three: leaving Koh Samet moves to the speedboat at Na Dan pier (a deliberate tap, then the home picture), and
coming back lands her on the beach she left, not Pack. The taxi waits whenever she's on screen and stays in view. No
temples, shrines or Buddhas on any map, sign or road (the island's temple and shrines stay out).

Pictures: `review/pitch/` (mock-ups drawn over real screenshots of the island, published to the review-pages branch).

## the user's pick

**B, Follow the Beach Puppy.** The user asked for a guiding wind too, then dropped it as too much like Ghost of Tsushima:
the world doesn't point the way, the puppy does.

## What's built (card B)

- **The beach puppy** (`island/puppy.ts`, his look `PUPPY` in `cast.ts`, in the character lab): a cream island dog with
  brown floppy ears and a pink bandana, on the islanders' chibi rig. He breathes (pants after a run), wags (harder when
  she's near), trots with a bounce, sits to wait, turns his head to look back for her. Poke him: in turn he chases his
  tail, rolls over, does a big hop, with two woofs. His voice is barks (synth woofs, no clips).
- **Where he goes** (`island.ts`, "the beach puppy"): the stop still to do that's quickest to reach from her (all four
  done: the driftwood tree for the sunset). The way is found with A* over what she can walk on (`island/route.ts`:
  roads and paths cheapest, sand, rocks, the shallows; never the forest or the deep sea) and pulled straight. He runs
  ahead `wait` m (less where that's off her screen), sits and looks back; when she's within `lead` m he runs on. At
  the stop he sits beside its pink ring. Any order: if she goes her own way he watches, comes along if she goes far,
  and plans again from wherever she is; a new beach is a new plan.
- **His bubble**: a picture of the beach he's taking her to (never words), drawn from the island itself on the 4th
  frame (`LANDMARKS` in `layout.ts`: the pier, the mermaid, the sandcastle spot, Ao Phai's new pink lifeguard tower,
  the snorkel boat, the driftwood tree, the hammock).
- **He fetches her** when nothing's touched for `idle` (8 s): runs back, hops, two woofs, off again. Each fetch waits
  `again` (1.6×) longer until she touches again (help, not nagging). The first time, Sparkle: "The puppy wants you to
  come!". The old flag badge is gone.
- **Arriving**: he barks the beach's name (a woof a syllable, `BEATS`) and Sparkle says it (`L.samet.puppy.name`;
  the first visit's longer beach line instead; not again within 45 s).
- **Shortcut**: `path-west` over the low west hills from Ao Prao's south end to Ao Wong Duan, ending in the sand slide
  (`SLIDE`): walk onto its top heading down and she sits and whooshes down (`slide` s); Daddy: "Wheee! A sand slide!"
  the first time. Landmarks on the long road: the coconut stall where it tops the spine, the balancing rocks halfway
  to Wong Duan (both poke).
- **The taxi** (`taxi.ts`): drives straight between any two stops (`roadBetween`). For a far beach (a walk over
  `taxiFrom` m and the ride quicker) the puppy calls it to the stop nearest her and jumps in; walking up to it (or
  tapping him) gets her in; it drives straight to the stop nearest his beach, the sun bear names the stop there (never
  before), and everyone hops off, the puppy first. It waits while she's near, while it's on her screen, while the
  puppy waits in it. Beside it, the camera takes it in (`frame` m). Every beach is reachable on foot (Hin Khok, Phai,
  Ao Noi Na) or by taxi.
- **The top-left button** calls the puppy (`kit/topLeft.ts`, a small shared hook PlaceFrame reads). Inside a stop it
  goes back to that beach (no flag). Packing and the speedboat ride keep the map button.
- **Home**: tap the speedboat at Na Dan pier: she walks to the pier's end, Mommy: "Time to go home?", the home picture
  comes up; tap it and they go (back to the Thailand map, the trip saved). The Thailand map's 🏝️ pin puts a trip half
  done straight back on the beach she left (no packing, no boat ride). All four flags: the speedboat still opens the
  sunset.
- **Knobs** (`sametPuppy`, `?feel=1`): lead, wait, speed, idle, again, taxiFrom, offFrom, offAfter, slide, frame.
- **She walks off from the taxi** (Codex on #369): he hops out after `offAfter` s with her `offFrom` m away, or when
  she calls him, and comes after her.
- **Robot readout**: `__thaiSametQA().puppy` (state, goal, beach, taxi from/to, x, z, d, screen, onScreen, route,
  ahead, bubble, pictures, fetches, named, calls, pokes); `clock` (scene seconds), `reach` (every beach on foot from Na
  Dan), `taxi.next/onScreen/d`, `leaving`. Robot runs `thailand-samet-wayfind-*`.

## Numbers (WebKit robot, iPad landscape unless said)

| | main | card B |
|---|---|---|
| Ao Prao → Ao Wong Duan, a finger held toward the way | 74.5 s (the road) | 44 s (following the puppy: the shortcut and the slide) |
| Beaches the taxi reaches | its fixed 107 s loop of 4, no choice | the stop nearest the puppy's beach, straight there; Hin Khok, Phai, Ao Noi Na on foot (`reach`: 146, 170, 91 m from Na Dan) |
| Na Dan → Wong Duan (only the snorkel left) | — | 62 s: walk to the taxi, ride straight there, off |
| Top-left button | leaves for the Thailand map | the puppy comes (hash stays on the island) |
| Reopening from the 🏝️ pin | packing, then the boat ride | the beach she left (`island?at=hinkhok`) |
| Idle at Ao Phai | a silent flag badge on the phone button | the puppy fetches her at 8.0-9.0 s, again at ~21 s (iPhone portrait, iPad landscape) |
| Standing beside the taxi at Sai Kaew (14 s) | can be off screen, can leave | on screen 14/14, left 0 |

## Known, and next

- Kaylee's playtest decides: does she follow him, does the bubble mean anything to her, is a fetch every 8 s too much.
- The puppy waits at the water's edge when she swims; he doesn't swim (the pitch's third panel, "he swims, she
  paddles after", isn't built).
- The bubble pictures are taken once in the light of the moment (at night they're dark).
- New lines are recorded by the PR's voices job.
