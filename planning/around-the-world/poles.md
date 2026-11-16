# 🧊 The Poles: Pebble's Long Way Home (rebuilt 2026-11-15)

The first Poles (its plan and build log are in git history: this file before 2026-11-15) was five unconnected
mini-games round a globe: Pola and Pebble were pen pals who never met, and nothing said where to go or why. The user
called it very weak, named Iceberg Maker's crack-tapping as not fun, and asked for what worked in Koh Samet and on the
Nan rice farm: one story that ties everything together, film cutscenes, the learning kept, and full freedom to change,
delete and create. This file is what the place is now.

## The story

**Pebble, a penguin chick, climbed into a fish crate on the scientists' red ship and fell asleep. The ship sailed all
the way up the world. He wakes up at the North Pole, where Pola the polar bear cub has never seen a penguin. Terry the
Arctic tern, who flies from pole to pole every year, knows where penguins live, and Sparkle's balloon can carry him
home. Meanwhile, at the bottom of the world, Papa is looking everywhere.**

The place's one big fact used to be a line Sparkle said: polar bears live in the north, penguins live in the south,
and they never meet. Now it is the plot. Nobody up north knows what Pebble is; nobody down south has seen a bear; and
getting from one to the other means going down the whole world, through the warm middle.

### Who's in it

- **Pebble** (emperor chick, voice `pebble`, he): small, brave, misses his Papa. He can't swim yet: a chick's fluff
  isn't waterproof, which is why he needs carrying.
- **Pola** (polar bear cub, `pola`, she): finds him, carries him, goes all the way with him. Curious about everything.
- **Mama Bear** (`mama`): "Pola, go with him. Friends help friends."
- **Terry** (Arctic tern, `terry`): the one who knows the way. Leads the balloon; asks the quiz at the end.
- **Nari** (narwhal, `nari`, new): the unicorn of the sea, and proud of it. Gives rides.
- **Papa** (emperor penguin, `papa`): looks down the hill, in the sea, waits through the long night.
- Sparkle tells it and gives the instructions; her balloon is the way home. The red ship, the colony, the Adélies and
  the Arctic fox have no lines.

## The shape of the place

| | Chapter | Pole | What she does | The story | What it teaches by doing |
|---|---|---|---|---|---|
| 🎬 | The way in | north | watches (about a minute, hold ⏭ to skip) | Pola finds Pebble; the red ship (storybook look, the ship sailing up a little globe); Terry; the balloon | the top and the bottom of the world; who lives where |
| 🐻‍❄️ | **Ice Floe Hop** `floe` | north | flings Pola floe to floe, Pebble on her back | across the floating ice to Mama Bear | the Arctic is frozen sea: the ice floats; polar bears swim |
| 🦄 | **Narwhal Ride** `narwhal` (new) | north | steers Nari, both friends riding | out past the icebergs to the balloon | most of an iceberg is under the water; icebergs break off glaciers; under the sea ice there is only sea |
| 🦊 | **Snow Coats** `coats` (2D) | north | rubs coats white, then brown | Terry flies south when the snow comes and the fox turns white | camouflage; the Arctic has land animals and seasons |
| 🐧 | **Penguin Slide** `slide` | south | steers Papa down the ice and under the sea | meanwhile: Papa looks everywhere, and catches Pebble's favorite supper | Antarctica is high land under ice, downhill to the sea; penguins fly under water |
| 🥚 | **Emperor Huddle** `huddle` (3D, rebuilt 2026-11-16) | south | carries cold dads into the middle | the long night; Papa remembers the night Pebble hatched (the game is that memory), and it ends with Papa singing Pebble his song | huddling; dads keep the egg on their feet and don't eat all winter; months without the sun; each papa's own song |
| 🎈 | **Home** `party` (the finale) | both | steers Terry, the balloon behind him; finds Papa by his song; Terry's quiz | the flight down the world, a polar bear at the South Pole, Papa and Pebble | the poles are opposite ends, warm in between; penguins know each other's calls; the quiz, answered by doing |

- **In order the first time, any order after.** The Poles is a story, so the first time through it goes in order (the
  user asked for this 2026-11-16, an exception to "any order"): the globe's trail of pictures, top of the world to
  the bottom with Sparkle's balloon on the next one, shows only the finished chapters and the next one; each new
  picture appears when the one before earns its stamp. Once every stamp is in, every picture shows and she can pick
  any game at any time. Starting the story over puts it back in order.
- **The real animals' videos wait for the end.** A video after each chapter broke up the story (the user, 2026-11-16),
  so none plays after a chapter: the stamp goes straight back to the globe and the next picture. Once the whole story
  is told (every stamp and the trophy), home wears its stamp and a movie ticket joins the end of the trail, with
  Sparkle's "Movie time!": it opens the Theater, every real animal from the story. The Theater button in the top bar
  still opens them any time.
- **A chapter** is a film, the game, a film, then its stamp and sticker (`Place.tsx`, `story/chapters.ts`). The films
  play the first time; a link to one of a game's sections goes straight to the game.
- **Iceberg Maker is gone** (all four sections). Its lessons moved into the Narwhal Ride, where she sees them from the
  water instead of tapping cracks. The narwhal sticker was already its sticker.
- **The pen-pal postcards are gone** (the finale's delivery), and the globe's "lost penguin" mini-game: with Pebble
  lost for real, a second lost penguin adrift only confused things.

## The films (`src/world/places/poles/story/`, read `docs/films.md` first)

The Poles' games each have their own 3D world (and two are 2D), so the films don't live inside them. They play on one
**film stage** (`stage.ts`): a small 3D world that only plays films, with the story's sets (the Arctic's floes, the
autumn tundra and the same tundra under snow, Antarctica by day and in its long night, and a little globe for the
ship's voyage), the whole cast as actors (`actor.ts`: walk, hop, fly, wave, faces, riding on someone's back) and the
props (`props.ts`: the balloon, the red ship and its crate, Nari, ice, mountains, stars, the lights). The games use the
same props, so the balloon she follows in the finale is the one in the films.

- A film is a `StoryFilm` in `films.ts`: a set and a list of beats. Its lines are `L.story.<film>` in `lines.ts`, in
  play order. Fourteen films: `intro`, an `-in` and an `-out` for each chapter, and the finale's `home-in`,
  `home-land`, `home-reunion`.
- Every film opens from a link, `#/world/poles/story/<film>`, and then goes on into the game as it does for her.
- The stage is thrown away when a film ends, so a film has nothing to put back and skipping is always safe.
- Staging rules that held up: the camera stands on +z; two who talk are cheated about 30° toward it; small characters
  (Pebble, Terry) get close-ups; a beat with no line when the picture tells it (the crate knocking, the ship on the
  globe); the storybook look for the memory.
- To look at a film without filming a reel: `npm run build && node scripts/film-strip.mjs '#/world/poles/story/intro'`
  writes a contact sheet to `qa-output/films/` (`--portrait`, `--at=12,23` for full-size frames).

## The look (2026-11-16)

The look pass brought the 3D scenes up to Koh Samet's bar, from the user's references (a pink aurora dusk, chunky snowy
floes with turquoise sides in deep blue water, a sunny bay of ice). One kit in `places/poles/look/`, used by the film
stage and every 3D game:

- `sky.ts` `PolarSky`: a painted dome (deep blue overhead, a peach or pink blush on the horizon, the low sun's glow or a
  crescent moon), toon clouds with lavender bellies, stars. Moods: `day` (the Arctic), `autumn` (the tundra), `south`
  (Antarctica), `dusk`, `night`, `globe`; `blend()` eases between two (the huddle's sunrise). It runs the look's clock
  and colors the fog.
- `sea.ts` `PolarSea`: sapphire water in drifting patches, a painted web of ripples, the horizon mirrored at a low
  angle, a glitter path under the sun, cloud shade; it rises and falls with `engine3d/water.ts` `swell()` exactly, so
  whatever bobs on the swell rides what she sees. From below it is the bright ceiling of the sea (Narwhal Ride under the
  ice, Papa's dive). `skirt()` is the turquoise glow of ice under the water round anything floating, with foam lapping
  at its edge (`skirtGeo` for an outline, `roundSkirt` for a berg, `floeSkirt` for a `floeGeo`).
- `look.ts` `dress(scene)`: the shared toon material swapped for one with drifting cloud shade, a faint blue dapple on
  snow and little pastel glints that wink on it. Call it once a world is built.
- `ground.ts`: rolling snowfields and the tundra (`field`), an ice cliff (`iceCliff`).
- `story/props.ts`: floes are slabs with a cushion of snow and turquoise sides (`iceSlab`, `roundOff` turns a layout's
  octagon into a floe); icebergs, table bergs and mountains are faceted lumps (`bergGeo` has a `detail` for far ones);
  ice and snow have a soft blue-grey line (`ICE_LINE`), never ink.

Costs: Narwhal Ride draws about 310k triangles (127k before), Penguin Slide 360k (300k), Ice Floe Hop 125k (59k); Koh
Samet's island is 397k (`node scripts/qa-perf.mjs --only=poles`). The globe hub and the finale's flight over the toy
globe kept their look: they are the toy globe, not a place.

## Emperor Huddle in 3D (2026-11-16)

The user asked for the huddle to be rebuilt in 3D with the penguins the films animate, and freedom to improve the play
and the story. It is now a 3D world (`activities/huddle/world.ts`) on the films' night Antarctica, with the films' and
the finale's emperor (story/actor.ts) as every dad and Pebble.

- **Same verb, a real huddle.** Pick a dad up (flippers flap), carry him, set him down: the huddle squishes and shuffles
  together. Seen from above at 34°, the middle of the huddle is a real place (it glows pink-gold on the snow, brighter
  the more dads are out of the wind), where the 2D side view squashed it into a line.
- **Cold you can see without reading:** a snowflake shakes over a cold dad's head, snow piles on his cap and shoulders,
  his breath puffs, he shivers and droops. Warm again: the snow falls off, a heart, a hop.
- **Papa is one dad from the start** (the first, the one alone on the windy edge), and the only one who talks; the
  others honk their own songs. While it's his egg he has a soft gold glow under him.
- **The hatch is a little scene:** warm in the middle, his egg wobbles; at the first crack he waddles out to the front
  of the huddle and faces her, the camera comes in low, crack, and Pebble pops out at his feet.
- **The ending changed: Papa's song, not the sunrise.** The film after the game (`huddle-out`) already shows the sun
  coming back, so the game's own sunrise made two in a row. Now the payoff is the moment the finale depends on: under
  the southern lights Papa sings Pebble his song (party/sounds.ts `TUNES[0]`, the tune the finale's chick hums to find
  him) and Pebble peeps it back: "Now you'll always find me." The section is `song` (it was `sunrise`).
- **New things to poke:** a Weddell seal in its breathing hole (pops up now and then), the snow, each dad's song, and
  in the close-ups the lights and the moon. Facts reused from the hub (the seal, the southern lights) and the finale
  (family by their song); one new fact (dads don't eat all winter).
- **Lines:** four new (Sparkle's "Shh. Papa is singing to Pebble.", Papa's two song lines, the fast fact); the three
  sunrise lines are gone. Sounds reuse the Poles' recorded clips; three new prompts (`huddle-brrr`, `huddle-sneeze`,
  `huddle-crack`) are in `sfx.json`, waiting to be made (the synth plays until then).
- Robot-played in a cloud session (software GL, very slow): the carry, the warm-ups into the blizzard, the hatch, the
  tuck and the song all run from their links. Not yet: a reel on a real GPU, `qa-pacing` touches and minutes, an
  iPhone check.
- Next for the huddle: film the reel on the Mac (`poles-huddle-carry`, `-hatch`, `-tuck`, `-song` in its qa.mjs), make
  the three new sounds, then Kaylee plays it. Watch for: does she find Papa by his glow, does she carry Pebble back
  without the hint, does she sit through the song. `assets/bg-huddle-night.webp` (the 2D game's painting) is unused now.

## North and south at a glance (the facts the place is built on)

| | 🐻‍❄️ North Pole (the Arctic) | 🐧 South Pole (Antarctica) |
|---|---|---|
| Under the ice | Ocean: the ice floats | Land: a continent, ice up to about 4 km thick |
| Who lives there | Polar bears, Arctic foxes and hares, walruses, narwhals, belugas | Penguins, seals, whales; no land animals all year |
| People | Arctic peoples have lived there for thousands of years | Only scientists at research stations |
| Icebergs | Tall and pointy, from Greenland's glaciers | Huge and flat, from the ice shelves |
| Seasons | Summer in June and July | Summer in December and January: the opposite |
| Day and night | Months of daylight, then months of dark | The same, at the opposite time of year |
| Visits both | The Arctic tern, every year: the longest trip any animal makes | |

Stickers: polar bear (floe), narwhal (narwhal), Arctic fox (coats), Adélie penguin (slide), emperor chick (huddle).

## Known small things (2026-11-15)

- Narwhal Ride: the three waves read as flat foamy bands; from the chase
  camera Pebble sits hidden behind Pola most of the ride; four lines play in about 16 s under the ice.
- Penguin Slide: a run is about 1:45 (the course length was kept); the humpback under the sea is easy to miss; in
  portrait the station hut is mostly off the right edge.
- The finale: the friends in the balloon's basket are small on an iPhone; Papa's song leaves empty snow above and
  below the row in portrait; the whole chain (film, flight, film, song, film, quiz) was checked piece by piece from
  its links, not played end to end by a robot.
- Nobody ran `qa-pacing` on the rebuilt games: touches and minutes are unmeasured.
- Snow Coats is an unchanged 2D game; only its films are new.

## Next

**The new ending, The Longest Night, is being built** (plan and script: [poles-ending.md](poles-ending.md), PR #475,
with #474's 3D huddle folded into the same branch). It's `activities/night/`, not on the globe yet (`info.ts`
READY = false), so Emperor Huddle and the finale still play for her until it's done.

- **Milestone 1 (2026-11-16): Act 2 and the whole script.** Every line of the ending is in `lines.ts` as one block,
  `L.night`, in play order (films, acts, goodbye, the end), so `node scripts/table-read.mjs poles night` is the
  ending as she hears it. Lines already recorded elsewhere keep their words and share their clips (the table read
  marks them `reused`). Act 2, Sing in the Dark, is playable: `#/world/poles/night/whiteout`, `/edge`, `/together`
  (`chorus.ts`). Hold Pebble and a dashed circle shows how far the song will go; let go and the ring rolls across the
  snow on the ground's own shape (it rolls over the hills to the colony at the end), lighting what it passes. Each
  friend found adds a band of color and a voice (`sounds.ts` `voice`: one synth per singer on `TUNES[0]`). Feel knobs
  `chorus` (`?feel=1`): tap length, peep/smallest/biggest ring, hold-to-full and its curve, ring speed and width,
  glow time, misses before a friend answers anyway, and the big song's hold.
- Decided on my own: the hat is the slide's grey woolly hat (the plan's end film says pink; the slide's is grey);
  holding Pola sings too (her finger may land on her, not the chick); the leopard seal's wobbly note is left out of
  Act 2 for now; the end of Act 2 offers 🔁 until Act 3 exists. No ElevenLabs key in the cloud session: Act 2 reuses
  the Poles' recorded clips (Weddell trill, whale, Adelie honks, tern, hat, reveal) and synthesizes the ring's shimmer.
- **Next (milestone 2, after you hear the script):** Act 1 (the balloon), then Act 3 on the 3D huddle's world, the
  five films, the goodbye flight, then swapping the chapter in for Emperor Huddle and the finale on the globe and
  retiring their lines. Make the ring shimmer and a sunrise swell with ElevenLabs on a session with a key. Film the
  reel on the Mac (`poles-night-*` in `activities/night/qa.mjs`).

Kaylee plays it. Watch for: does she say "penguin" and "home"; does she tap the next picture without help; does she sit
through the way-in film or hold ⏭ (her diary counts both); which chapter she replays; whether Papa's song is too hard
or too easy by ear.

Still open for the user: the friends' names (recorded as Pola, Pebble, Terry and Nari: a new name means re-recording),
and whether the Arctic should get a hello word (an Inuktitut greeting needs a checked pronunciation before it is
recorded).
