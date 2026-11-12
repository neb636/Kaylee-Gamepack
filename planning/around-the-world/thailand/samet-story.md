# Koh Samet, salvaged: The Lost Fireflies (2026-11-12)

The first build (`samet-trip.md`) was an open island to roam with an animal photo book. It looked the best of any
place in the game and played the worst: long walks between beaches, nothing to say where to go or why, a puppy guide
that didn't help, a photo book nobody wanted. The user asked for a salvage with full authority to change anything:
easier to get around, a plot and characters like the Nan rice farm and the salt hut, films and back stories, and what
doesn't make sense removed. This file is what the trip is now. `samet-trip.md` and `samet-wayfinding.md` are history.

## The story

**Every night two little geckos, Tuk and Kae, dance the fire show on Sai Kaew, and four fireflies light it up. Last
night a big wind blew the fireflies all over the island. Tofu the beach puppy chased them and saw where each one
landed. No fireflies, no show tonight: will she help find them?**

Each firefly is hiding in the game it loves, so every stop is "play its game and it comes home with you":

| Firefly | Color | Stop | Where it is | How she wins it |
|---|---|---|---|---|
| **Zoom** | pink | the jet ski, Sai Kaew | zooming round the jet ski man's buoys | she only stops for someone fast: ride, jump, race |
| **Sandy** | gold | the sandcastle, Ao Hin Khok | glowing down a crab hole in the sand, shy | build her a castle; when the moat fills she moves in |
| **Bubbles** | blue | the snorkel, Ko Kudi | in an air bubble down on the reef, the cuttlefish hugging it | follow the parrotfish, make friends with the cuttlefish; the bubble floats up and pops |
| **Peekaboo** | green | hide and seek, Ao Prao | peeking round the driftwood tree | play her game: find Dad (she twinkles near him), then hide with her |

With all four, Dad calls the sunset at the driftwood tree, night falls, and on Sai Kaew the fireflies light the
dancers' poi and hers: the fire show she twirls in is the one she saved.

### Who's in it

- **Tuk** (blue gecko, voice `tuk`): the big brother, a showman who worries out loud. "Oh no, oh no, oh no!"
- **Kae** (mint gecko, voice `kae`): his little sister, giggly and sure it will turn out fine. Together their names
  are the tokay gecko's call.
- **Tofu** the beach puppy: he saw where they went. Barks only. He trots along with her, and runs to a stop's ring when
  it's on her beach.
- **The fireflies** (`story/firefly.ts`): no voices, each tinkles on its own note. Round faces, pink cheeks, a halo.
- The jet ski man (otter), the captain (pelican), the taxi driver (sun bear), Mom, Dad, Sparkle as before.

The user left the islanders to us (2026-11-05), so these names and the puppy's are ours to pick. Family stays Mom and Dad.

## The shape of the trip now

1. Pack (first trip of a session), the speedboat cutscene (17 s), as before.
2. **Na Dan pier: the way-in film** (`island?story=intro`, about 45 s, hold ⏭ to skip): Mom, Tofu, the geckos and the
   empty lantern, the memory of last night's wind in the storybook look, the ask.
3. **The pictures** (`island?board=1`): four round pictures of the beaches come up, each with its firefly (grey until
   found). Tap one: the green taxi drives across the screen and she is there, a few steps from the stop, Tofu running
   to its ring. No long walks, no loop to ride, nothing to work out. The top-right button brings the pictures back any
   time; so does a tap on the taxi.
4. **A stop**: its way-in film (`<stop>?round=story`, 10-18 s), its three rounds as built, its found film
   (`round=found`, 8-10 s). Then the island at that beach with the firefly flying in to join the others round her
   horn, Sparkle counts ("Two fireflies! Two more to find!"), and the pictures come up again.
5. **All four** (`island?story=all`): a short film, then the pictures show only the sunset. The driftwood tree, the
   sunset, the fire show (`fireshow?round=story` and `round=thanks` are its films), home, the stamp.

Any order still holds: all four pictures are open from the start. She can still lead her unicorn round each beach,
swim, poke things, ride the jet ski once it's hers. Walking between neighbouring beaches works; it's just never needed.

## What came out

- **Mom's phone and the animal book** (the photo button, the book, its 14 pages, `book` section, `phone`/`book`
  params). The animals stay on the island as life that reacts to a tap. The snorkel keeps Mom's camera for the fish.
- **The puppy as the way-finder** across the island (leading her 200 m, calling the taxi, riding it, the fetch across
  beaches). He only leads on the beach she's on.
- **The taxi as a ride** (the 107 s loop, getting on and off). It is the travel animation now.
- "(greybox)" from every section name.

## Rules for every stop's films (read `docs/films.md` first)

- `engine3d/film.ts` `FilmPlayer` + `cinema.ts` `Letterbox` in the world, `FilmOverlay` on the screen with
  `speaker={(v) => WHO[v]}`; while a film is on the world takes no taps and hides its tap targets and hints.
- `finish()` leaves the world exactly as the next round needs it, from any beat (skip is tested).
- `round=story` plays the way in then starts the first play round; `round=found` plays the found film then calls the
  stop's `onIsland` (which raises the flag). A stop already done (its flag in `flags`) opens at its first play round.
- The firefly is in play too, not only in the films: something she sees while her hands are busy.
- Lines are in `lines.ts` `L.samet.story.<stop>`. Chibi faces to the camera, close shots for the firefly, a beat with
  no line when the picture tells it. Portrait as well as landscape.
- QA: a motion run that watches each film to the end, one that skips it mid-way, and a screen of each
  (`samet-trip/qa/<stop>.mjs`).

## Built (2026-11-12)

- **Shared** (`story/`): `firefly.ts` (Firefly, Swarm, their chimes; the glow is back-faced so it never covers a
  firefly's face up close), `islander.ts` (a talking islander with a walk and faces; `makeGeckos`), `sounds.ts` (film
  music borrowed from the rice farm, the beach-at-night bed for memories).
- **The island** (`island/`): `story.ts` (films `intro`, about 40 s, and `all`, about 9 s; the geckos and their
  lantern at Na Dan; the fireflies waiting at each stop and circling her horn; a found one swooping in), `Board.tsx`
  (the pictures and the taxi's ride card), `travel()` in `island.ts` (puts everyone a few steps from the picked
  stop), Tofu leading only on her own beach, the top-right button glowing after a quiet while.
- **The jet ski** (`jetski/story.ts`): way in at the hut (the otter, Zoom zipping round the buoys, her close-up);
  Zoom loops over the bay in every round and darts ahead when she's fast; parking in the ring after a decent ride, or
  finishing a race (won or lost), plays the found film (she lands on the horn).
- **The sandcastle** (`sandcastle/story.ts`): the gold glow in the sand, Sandy popping out of her hole; she peeks from
  holes and towers while the castle grows; when the moat fills she moves into the tallest tower (found film).
- **The snorkel** (`snorkel/story.ts`): the captain (now on camera) saw a blue light fall in the sea; Bubbles in a
  bubble down on the reef, the cuttlefish hugging it; when it turns pink it lets go, the bubble rises and pops. Mom's
  camera stays in the cuttlefish round as play only.
- **Hide and seek** (`hideseek/peekaboo.ts`): Peekaboo peeks round the tree; in her seeking rounds she twinkles near
  Dad (folded into the stop's own help); she hides with her on her turn; found film: she lands on Dad's nose. A later
  visit (Peekaboo already found) skips the found film and keeps the stop's own 🏝️ button.
- **The finale** (`finale/story.ts`): the fire show's way in (Tuk and Kae in the dark, the fireflies light each poi in
  their colors, lights for her too) and `thanks` (the bow, the fireflies' heart in the sky); the fireflies ride her
  ribbons and lead each flag's surprise; they circle her at the sunset and are in Mom's photo.
- **QA**: each stop's `qa.mjs` has its films watched to the end and skipped, and a whole-stop play-through; the
  island's runs are in `samet-trip/qa.mjs` (`thailand-samet-story-*`).

## Next

Kaylee plays it. Watch for: does she follow the story (does she say "firefly"?), does she tap a picture without
help, which firefly she goes for first, and whether the films run long for her (the ⏭ count in her diary).

Small things left: the 66 new lines are recorded by the PR's voices job (listen for Tuk and Kae); the films borrow
the rice farm's music (Koh Samet's own cue with the `sfx` skill); Sparkle's film lines show no speaker chip (`WHO` in
`trip/legs/Guide.tsx` has no Sparkle entry, on purpose: it would add a chip to every Sparkle bubble).
