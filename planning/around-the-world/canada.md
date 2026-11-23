# 🍁 Canada: Maple's Team (rebuilt 2026-11-20; round two built 2026-11-21)

The first Canada (its plan and build log are in git history: this file before 2026-11-20) was eight unconnected
mini-games round a flat map with emoji pins. Its one line of story ("Let's find a hockey team!") was never told, the
map was the weakest screen in the app, Sugar Snow (pouring syrup) wasn't fun and the Red Canoe's paddling fought her
finger. The user took it off Kaylee's map, and on 2026-11-20 asked for a salvage with full authority: follow what worked
in Koh Samet and on the Nan rice farm (one story, film cutscenes), rebuild the map, fix or delete what's weak. This
file is what the place is now.

## The story

**Every winter, when Ottawa's canal turns to ice, the animals play hockey for the Maple Cup. The geese win it every
year: nobody else even has a team. Last winter Maple the beaver played all by herself: six geese, one beaver. She
can't win alone. But her friends live all across Canada, from one ocean to the other, and every one of them is very
good at something.**

The place's lessons are the plot. *Canada is huge, ocean to ocean*: that's how far apart her friends live. *Its
animals*: they are the team. *Winter, ice, hockey*: the game. *Bonjour*: Maple and Tuque are from Quebec. *Maple
syrup*: the Cup is full of it, and the story ends with taffy on the snow for everybody, geese too.

### Who's in it

| | Who | Voice (`cast.json`) | On the team because | Comes from |
|---|---|---|---|---|
| 🦫 | **Maple** the beaver, the captain. Small, brave, bouncy, Québécois. | `maple` | it's her dream | Ottawa |
| ⛄ | **Tuque** the snowman. Jolly, wobbly, just woke up. | `snowman` | nothing gets past his tummy | `snowman`, Quebec City |
| 🫎 | **Monty** the moose. Slow, kind, always chewing. | `moose` | the goalie: he fills the whole net | `bike`, Mont-Sainte-Anne |
| 🦝 | **Roxy** the raccoon and her three kits. Sneaky, giggly, a mama. | `raccoon` | the quickest paws in Canada: she steals the puck (her kits are the fans) | `campfire`, the campsite |
| 🎵 | **Lulu** the loon and her chick. Soft, musical. | `loon` | every big game starts with a song | `canoe`, Banff |
| 🐻‍❄️ | **Misty** the spirit bear. Big, soft, shy, thinking about supper. | `bear` | the biggest slap shot in Canada | `salmon`, the rainforest |
| 🦦 | **Ollie** the sea otter. Giggly, spins like a top. | `otter` | slides and spins: the fastest pass | `whales`, Tofino |
| 🪿 | **Gus**, the captain of the geese, and his five geese. A cheeky show-off, never mean, a good sport when he loses. | `gus` | the other team | Ottawa |

Sparkle tells it and gives the instructions. Everybody on the team wears Maple's pink scarf (`scarf(true)`); the geese
have blue. Names are ours to pick (friend-led, no family in Canada); the user chose Maple, the trophy title **Canada
Champion** and Moraine Lake earlier.

## The shape of the place

1. **The way in** (`#/world/canada`, first visit; `story/intro`): about 50 s, hold ⏭ to skip. The canal, the Cup, the
   geese, the memory of last winter, "I need a team!", Sparkle's balloon.
2. **The map** (`hub/map`): a toy tray of Canada floating in the sky, like Thailand's maps. Her friends stand on it
   where they live, big enough to tap; the canal in Ottawa has the Cup, Maple, the geese skating rings, and every
   friend who has joined, in their scarves. Tap a friend: the chapter. Any order.
3. **A chapter**: its film in (10-18 s), the game, its film out (8-14 s: the friend shows what they're good at and
   joins), the stamp and sticker, then the map, where that friend now stands at the rink and Sparkle counts ("Two
   friends! Four more to find.").
4. **The big game** (`party`, with all six): `game-in` (the team skates out, Gus scoffs, Lulu sings), Pond Hockey
   (three goals; every friend's talent shows), `game-win` (the Cup, taffy for everybody), the trophy.

| | Chapter | Where | What she does | The film in | The film out |
|---|---|---|---|---|---|
| ⛄ | **Carnival Snowballs** `snowman` (3D) | Quebec City, the Winter Carnival | pushes snowballs that grow, stacks and dresses snowmen | nobody here plays hockey, only snow... "Let's make a player!" | her snowman in the red tuque wakes up; a snowball bounces off his tummy |
| 🚵 | **Mountain Bike** `bike` (3D) | Mont-Sainte-Anne | steers the bike down the forest trail | Monty is having his bath at the waterfall, way down there | "What does a goalie do?" "You stand there." "I am very good at standing." Bonk |
| ⛺ | **Campfire Night: Flashlight Statues** `campfire` (3D) | the campsite | her finger is the flashlight: whoever it lands on freezes with a silly face (the night animals, Roxy's three kits, then Roxy sneaking to the marshmallows); roasts marshmallows; turns the light off for the stars and the northern lights | a little paw takes Maple's marshmallows | Roxy has the puck before Maple can blink; her kits come to cheer |
| 🛶 | **Red Canoe** `canoe` (3D) | Banff, the turquoise lake | paddles across the lake to the glacier | a loon calls across the water: Lulu | she will sing her best song; her chick squeaks |
| 🛁 | **Misty's Bubble Bath** `bath` (3D) | the rainforest river | rubs a muddy spirit bear clean, fluffs her, paints her with berries and decorates her; the mirror pool; her paw print on a team sweater. The look stays | Misty swings at a salmon, misses and slides into the mud: a white bear, all brown | in her new look, one swing of the hockey stick sends a pinecone over the cedars |
| 🐋 | **Whale Peek-a-Boo** `whales` (3D) | Tofino, the Pacific | touches the bubbles and a whale comes up right there: the grey whale (spout, roll, barnacles, tail), the humpback (hold it down, let go, it jumps; the longest hold is a ride), the baby orca with the rock on its nose | a whale's spout blows Ollie's lucky rock out to sea | "Hockey? Is it wet?" Ollie juggles her rock; a whale soaks everybody |

- **Gone:** Sugar Snow (`taffy`), Animal Bridge (`bridge`), the finale's Animal Homes quiz, the old map and its train,
  bubbles and leader lines. The syrup is in the ending; the animal bridges are still a passport fact and a Theater
  video.
- **No video after a chapter** (it broke up the Poles' story): the real videos wait in the Theater.
- **Maple's animal book** stays: the first poke of an animal still names it (`meet(id)`), and the 📒 opens from the map.

## How it's built

```
src/world/places/canada/
  Place.tsx            the flow: Arrival (the way-in film, the map), Chapter (film, game, film), FilmLink
  story/stage.ts       the film stage: one small 3D world that only plays films (FilmSet, StoryFilm, s.use/s.show/s.put...)
  story/cast.ts        everybody as a Performer, built on first use: s.cast.maple, .monty, .roxy, .kits, .ollie, .misty,
                       .tuque, .lulu, .chick, .gus, .geese; teamScarf(), Friend.scarf(on)
  story/chapters.ts    which films round which game, who each chapter brings (TEAM), teamOf(stamps), films seen
  story/films/<id>.ts  a chapter's two films (intro.ts is the finished one to copy; game.ts is the big game's)
  story/sets/<id>.ts   a chapter's film set (rink.ts is the finished one)
  story/props.ts       the Maple Cup, a puck, a hockey stick for a rig friend's arm, Sparkle's balloon, a maple leaf
  story/sounds.ts      the films' shared sounds and music (s.sfx)
  characters/          looks.ts (the rig friends), toy.ts (ToyActor + Performer), goose.ts, tuque.ts, lulu.ts
  activities/<id>/     the games; activities/story/sections.ts lists every film link
  map/, activities/hub/  the map
  sfx/                 recorded sounds: sfx.json (+ parts/<id>.json per chapter, merged by the lead), url('id')
```

- **Films** follow `docs/films.md`. The usual camera stands on +z and looks toward -z, so an actor facing 0° faces
  it; two who talk are cheated about 30° toward it (chibi profiles read as backs of heads); small characters get
  close-ups; a beat with no line when the picture tells it. Every film opens from `#/world/canada/story/<film>` and
  `npm run build && node scripts/film-strip.mjs '#/world/canada/story/<film>'` makes a contact sheet
  (`--portrait` too).
- **A game knows the film has played** from `filmed` (`CanadaActivityProps`): it then skips its own hello line and
  starts with Sparkle's one instruction and her hands busy. From a section link or a replay it says its one line.
- **The friend is in the game too**, not only in the films (Monty in his pond at the bottom of the trail, Roxy's paw
  prints, Lulu's bubbles, Ollie in the kelp, Misty at the falls, the snowman she builds).

## Lines and voices

`lines.ts` is in play order, one block a chapter: `filmIn`, the game's lines, `filmOut`; the way in and the big
game's films are `L.story`. Speaker ids are the animals (`moose` is Monty, `bear` is Misty, `snowman` is Tuque).
New voices: `loon` (Lulu) and `gus`. The PR records every new line.

## What changed in each game (2026-11-20)

- **Red Canoe:** one control. A finger held on the water and Maple paddles there by herself, a stroke at a time (the
  rhythm and the glide are the feel); a tap sends the canoe a short way. Built on `engine3d/drive.ts` like the whale
  boat; feel knobs `canoe` and `canoeStroke` (`canoe/glide?feel=1`). The old drag-a-stroke control moved the canoe
  5 m in a minute of robot play; a robot now crosses the lake in about 40 s without touching a shore, taps only
  too. The loon in the game is Lulu (`characters/lulu.ts`), and her bubbles always come up toward the glacier.
  **The look (2026-11-21, at the Nan forest's level of detail):** `canoe/nature.ts` has the plants (layered spruce,
  subalpine fir, a golden larch high up, aspens, pink fireweed, bushes, grass; instanced and tinted per plant like
  Nan's forest, whose helpers moved to `engine3d/plants.ts`), faceted mossy boulders and jagged crags with snow by
  height and in the gullies. `canoe/glacier.ts` is a valley glacier (snowfield, icefall with seracs and crevasses,
  ogives, moraines, a fluted ice cliff with a cave). The creek is a smooth channel with a pebble bed, a waterfall at
  its top and its own shader (`canoe/flow.ts`), and its own sound (`canoe-creek`, louder near it). The reflection
  draws plainer trees and leaves out grass, pebbles and bushes: the scene is about 424k triangles (Samet 396k).
- **Whale Watch:** the sleepy otter is Ollie; towed home, she asks to come and rides along on the rope, spinning at
  every whale. The wheel steering mode is gone.
- **Carnival Snowballs:** the first snowman she finishes is Tuque himself (his cap, face and mittens on the balls she
  rolled) and leads the parade; a lower camera shows the castle hotel; soft shadows and lanterns.
- **Mountain Bike:** Monty waits in the waterfall pool at the bottom, big and unmissable; the ending hands to his film.
  In the gondola opening, the cabins share a continuous cable loop around the two station wheels.
  The intro's long zoom to his pool uses a farther near clipping plane to keep the distant outlines stable, then
  restores the close-up plane when the film cuts back to Maple.
- **Campfire Night:** Roxy has three kits; the hunt helps after 8 s; the goodnight is skipped when her film follows.
- **The big game:** the story's team on the ice, each talent in play (Roxy steals from the rush, shots boing off
  Tuque and bonk off Monty, Ollie fetches a loose puck, Misty flattens the goose wall for the last goal, Lulu calls on
  every goal, the kits wave flags). The geese rush her net after each goal and may score once (never the winning
  goal), so it is a contest she always wins.
- **After the fresh-eyes review (the same day):** a pink heart pin over every place still to do on the map; the 2D
  Maple wears her scarf and the 2D Roxy and Misty match their 3D selves; sleepy Ollie is big with floating Zs and a
  sparkle path leads to her and to each spout; hockey shows the whole rink on an iPad and slides with the play on a
  phone (still under her finger), each friend's first talent gets a gold ring; the canoe reads red from above; only
  Tuque wears the red tuque in the parade.
- **The map:** `map/shape.ts` (a caricature of Canada in curves), `terrain.ts`, `places.ts` (seven dioramas),
  `critters.ts` (the snowy owl, orca, bison, beluga), `pins.ts` (the pink heart pin over every place still to do), `world.ts`. Portrait looks along the country from the east.

- **Rideau Canal skaters:** six winter outfits, expressive faces and alternating skate pushes. The opening film and
  hockey finale share the figures and their continuous loops, using the existing recorded canal ambience.

## Round two (built 2026-11-21; its plan and log, `canada-round-2.md`, are in git history)

Three chapters were rebuilt on what she replays (her finger on a friend, nothing can be missed, what she makes stays,
a silly face in close-up), and every chapter now has the same shape: the friend has a trouble, her play fixes it, the
fix is what the team needs.

- **Misty's Bubble Bath** (`activities/bath/`, replaces Salmon Leap): the river set is shared with its films
  (`story/sets/bath.ts`). Her look (`looks.ts` `MistyLook`: zone colors, fluff, hairdo, decorations, the sweater's paw
  print) is saved and put on by `characters/mistyLook.ts` `dressMisty` in the films, on the map and in the big game.
  Sections `story`, `wash`, `fluff`, `colors`, `mirror`; `?look=` is sticky. Knobs `bath`.
  Polish pass (2026-11-21, after the user's notes, research into Talking Tom / Pou / Nintendogs / Dr. Panda baths):
  `suds.ts` is soft foam (a foam shader, lilac rim, no ink line; muddy tan over thick mud, whitening as she scrubs)
  plus `Floaters`, rainbow soap bubbles that float up and pop under her finger (a tap or a swipe through). A pink
  unicorn rubber duck (`props.ts` makeDuck) squeaks and hops; each patch the rain rinses clean rings `bath-ding` a
  step higher. Misty's mud is a light dusting plus round splats with drops (no splats over her eyes); `plainChest` on
  her look drops the sun bear's crescent. No silly faces in the bath: the user found Maple's "way overboard", so
  Maple pulls `wow` after the shake and the mirror close-up keeps Misty's own happy face. The river set
  (`story/sets/bath.ts` + `bathWater.ts`) is a shader waterfall that curls over its lip, a round pool with shore
  stones, leg rings (`river.wade`, the game moves it with her), lily pads, flowers, sunbeams and a faint drizzle.
- **Flashlight Statues** (`activities/campfire/`, 3D): the clearing is built from the film set
  (`story/sets/campfire.ts` `buildCamp`). `light.ts` (the beam), `shade.ts` (dark shapes with shining eyes),
  `roast.ts`, `sky.ts`. The night critters live in `characters/critters.ts` (shared with the bike), the statue poses in
  `characters/statues.ts`. Sections `story`, `eyes`, `peek`, `statues`, `roast`, `sky`. Knobs `torch`, `campRoast`.
- **Whale Peek-a-Boo** (`activities/whales/`): the whales are characters (`whale.ts` on the modelling kit `body.ts`);
  `?lab=grey|humpback|grandma|mama|baby&view=...` looks at one. Ollie's rock is `characters/rock.ts`. Sections `story`,
  `grey`, `humpback`, `orcas`. Knobs `whales`. A do-nothing player still finishes (the baby boops the boat).
- **The Team Cabin** (`activities/cabin/`, `#/world/canada/cabin`; the skate hut on the map opens it): she dresses the
  friends who have joined (jerseys, hats, scarves, cheek stamps; `looks.ts` `Worn`, put on by `characters/worn.ts`
  everywhere the team shows). No stamp, no end. `?fit=hat.crown` shows one thing on all eight. Knobs `cabin`.
- **On the map**: each friend who comes home shows their move at the rink (`map/moves.ts`: a wind-up, then the
  payoff), then Gus says one line by how many are on the team (`L.hub.gusCount`), bragging a little less each time. A
  tap on a teammate plays their move again. The hut is `map/hut.ts`.
- **Silly faces**: `engine3d/characters/face.ts` (crossed, soaked, dazzled, dizzy, sudsy), `silly()` on every actor,
  and the close-up helper `characters/closeup.ts` (`docs/films.md`).
- A finished Canada became unfinished: the `salmon` stamp is gone and `bath` is earned by playing it. The trophy stays.

## Round three, planned 2026-11-22: every game is a try-out (nothing built yet)

**What the user said:** the rebuild is great, but "a lot of the mini-games don't seem to have a purpose. The whale one
you go to recruit the otter and then you tow him around and then see some whales." Make every scene tie in with the
hockey team, and give the whale game and the canoe "more of a reason". A rework, not a rewrite.

**What's wrong (from reading every script and game):** the hockey lives in the films, not in her hands. In most
chapters the game is the trip to the friend (bike, canoe) or a toy beside the story (the whales), and the friend's
talent is shown to her afterwards in the film out. Campfire and the bath already work, and they are the model: Roxy's
sneaking *is* her talent, and Misty's look goes to the big game.

**The rule for every chapter (three threads, same verbs, same scenes):**

1. **The need.** The film in's first line says what the team is missing (a wall, a goalie, quick paws, a song, a big
   shot, a puck), so she knows why she's going.
2. **The try-out is in the game.** The game's last beat is the friend's hockey talent, done by her finger with the
   game's own verb. The film out stops showing the talent and shrinks to the ask and the scarf.
3. **Something comes home.** A thing from her play stands at the rink on the map and is used in the big game.

| Chapter | The need (film in) | The try-out (her finger, the game's verb) | What comes home | Size |
|---|---|---|---|---|
| 🐋 `whales` Ollie | "A team needs a puck!" Ollie's lucky rock is flat, round and slides: the best puck in Canada. The spout blows it away (as now) | The rock is on screen the whole game and every whale toy moves it on (below). Last: Ollie catches it and spin-passes it across the deck to Maple: the fastest pass | **The rock is the big game's puck** (it twinkles) | medium |
| 🛶 `canoe` Lulu | "Every big game starts with a song" (as now), but Lulu's call is worried: her chick has paddled off, and she can't sing till it's back | Find the chick in the milky water, bring it to Lulu's bubbles, then **tap Lulu and she sings**: the glacier echoes it back, the chick squeaks after | The chick sings the last note at the big game and squeaks at every goal | medium |
| ⛄ `snowman` Tuque | "Nobody here plays hockey... let's make a player!" (as now) | When Tuque wakes, the next snowball she pushes at him boings off his tummy (any later one too) | The other snowmen she built are the crowd along the canal (how many she made) | small |
| 🚵 `bike` Monty | "We need a goalie. Somebody big!" | At the bottom Monty stands across the trail: she steers left, he's there; right, he's there. A soft bonk and a giggle each time, then "Nothing gets past Monty!" | His lily pad stays on his antler | small |
| ⛺ `campfire` Roxy | "We need quick paws" (one line added) | Already the game. Maple's puck sits on the marshmallow bag: what Roxy holds up at "Yoink!" (or hands back at "Let's share") is the puck | The kits' marshmallow sticks are their flags | tiny |
| 🛁 `bath` Misty | "We need a big, strong shot" (one line added) | Already there as a silly (the soap batted over the cedars): make it a sure beat before the sweater, Maple tosses the soap, a tap and Misty swats it | Her look (as now) | tiny |

### Whale Peek-a-Boo: the rock goes whale to whale

Same three whales, same touches, same sections (`grey`, `humpback`, `orcas`). New: the rock is always somewhere she can
see, and Ollie has a job on the rope (she is the catcher, and points at the rock: that replaces a hint).

- `grey`: the rock is stuck in the barnacles on its back, twinkling. Blowhole: the spout pops it up and it lands back
  (Ollie reaches, misses, spins). Barnacles: it laughs and the rock wobbles. Tail (the tap she'd do last): it flicks
  the rock off toward the next bubbles. The sea star joke stays ("That's a sea star, silly!").
- `humpback`: the rock sits on its nose. Hold and let go: the jump throws the rock, a longer hold throws it nearer
  Ollie. The biggest jump (the ride) and the baby orca snatches it out of the air.
- `orcas`: as now (peek-a-boo, Grandma, the flick to Ollie). New last beat: tap Ollie, she spins and slides the rock
  across the deck to Maple, puck-style. A do-nothing player still finishes.
- Lines: about four new for Ollie ("Almost!", "Over here!"), one for Maple ("What a pass!"), `filmIn.ollie` and
  `filmIn.hop` reworded for the puck. `rockFly` in `watch.ts` already flies the rock; `characters/rock.ts` is the prop.

### Red Canoe: bring Lulu's chick home

Same lake, same control, same sections. The two errands (the milky water, the bubbles) become one job.

- `glide`: Lulu's call across the lake, as in the film.
- `stream`: the sparkle path to the milky water now leads to a tiny squeak (louder as she nears, like the creek's
  sound). The chick hops on the bow. The rock-flour fact moves to a poke on the milky water.
- `loon`: the bubbles are Lulu diving to look for her baby; each time she comes up nearer. The third time she sees
  the chick: the reunion (today's `family` payoff, the chick on her back).
- `glacier`: new last beat, the try-out: tap Lulu, she sings, the glacier answers. Tap again, again.
- Open for the user: is the chick lost (a little sad, a big hug) or playing hide-and-seek (all giggles)?

### The map and the big game

- The heart pin over each friend still to find carries a small picture of what the team needs (net, music note,
  puck, stick, paw, snowball).
- Back on the map, after Sparkle's count, Maple says what the team has now, one short line per friend ("Now we have
  a goalie!"). Six lines.
- The big game: the puck is the rock, the chick ends Lulu's song, the snowmen are the crowd. Nothing else changes.

### How to build it

Three PRs, one at a time: **1** the whales, **2** the canoe, **3** the small ties (snowman, bike, campfire, bath, map,
big game) together. About 30 new or reworded lines in all (a table read each PR), new sounds for the rock, the chick
and the echo (`sfx` skill). Doesn't change: any verb, control, scene, set, knob or section id. The bike's change is
only its last stretch (`falls`), so it doesn't touch the handling work.

## Next

- Round three (above) is planned and waits for the user's answers on its review page.
- Kaylee plays it. Watch for: which of the three she goes back to; whether she finds the hut; does she hold the
  humpback or only tap (taps still grow the jump); is the campfire too dark on her iPad in a bright room; how long
  Flashlight Statues really takes her (a perfect-aim robot does it in about 70 s; the plan wanted 2.5 min).
- Mountain Bike and Red Canoe are still steering toys: rethink them only if her play data says so.
- Small things seen and left: the flamingo statue can't lift a leg (the code-built rig has no leg bones); some moves
  still read small from the board's high camera; in the film `campfire-in` Maple's face touches the left edge in the
  snatch shot; the cabin's team photo is small per friend on a 4:3 screen; Maple alone in the cabin is about 55 px
  on an iPhone on its side; the banana slug is off-screen in the bath on an upright iPad; the porcupine's new
  always-on quills were checked in the campfire, not on the bike trail.
- A fresh-eyes pass ran on the merged game the same day (four reviewers who hadn't built it, each fixing what they
  found): the mud reads as mud on a white bear, the whales are big and lie broadside with separate tap zones, Roxy's
  statues have props and a close-up that shows her whole pose, the cabin's bench reads as a bench and worn things come
  off with a tap.
- The films by their recorded lines: the way in has about 32 s of talk (about 45 s in all); a chapter's film in has
  5-10 s of talk and its film out 10-14 s; `game-win` about 14 s. If she skips them, shorten them.

## Open (for the user, on the review page)

- The names (Monty, Roxy, Tuque, Lulu, Misty, Ollie, Gus) are first picks.
- Lulu and Gus have new voices nobody has heard yet.
