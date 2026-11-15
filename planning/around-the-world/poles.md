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
| 🥚 | **Emperor Huddle** `huddle` (2D) | south | carries cold dads into the middle | the long night; Papa remembers the night Pebble hatched (the game is that memory) | huddling; dads keep the egg on their feet; months without the sun |
| 🎈 | **Home** `party` (the finale) | both | steers Terry, the balloon behind him; finds Papa by his song; Terry's quiz | the flight down the world, a polar bear at the South Pole, Papa and Pebble | the poles are opposite ends, warm in between; penguins know each other's calls; the quiz, answered by doing |

- **Any order still holds.** Every chapter is open from the start. The globe shows them as one trail of pictures from
  the top of the world to the bottom, with Sparkle's balloon on the next one; she can tap any. The south's two chapters
  are told as "meanwhile, at the bottom of the world", so they make sense before or after the north's.
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

## Next

Kaylee plays it. Watch for: does she say "penguin" and "home"; does she tap the next picture without help; does she sit
through the way-in film or hold ⏭ (her diary counts both); which chapter she replays; whether Papa's song is too hard
or too easy by ear.

Still open for the user: the friends' names (recorded as Pola, Pebble, Terry and Nari: a new name means re-recording),
and whether the Arctic should get a hello word (an Inuktitut greeting needs a checked pronunciation before it is
recorded).
