# 🍁 Canada: Maple's Team (rebuilt 2026-11-20)

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
| ⛺ | **Campfire Night** `campfire` (2D) | the campsite | shines the flashlight round the dark forest | a little paw takes Maple's marshmallows | Roxy has the puck before Maple can blink; her kits come to cheer |
| 🛶 | **Red Canoe** `canoe` (3D) | Banff, the turquoise lake | paddles across the lake to the glacier | a loon calls across the water: Lulu | she will sing her best song; her chick squeaks |
| 🐟 | **Salmon Leap** `salmon` (2D) | the rainforest river | flicks the salmon up the falls, past the bears | Misty swings at a salmon: a huge splash, no fish | berries are easier; one swing of the hockey stick sends a pinecone over the cedars |
| 🐋 | **Whale Watch** `whales` (3D) | Tofino, the Pacific | steers the little boat out to the whales | Ollie is out in the kelp, where the whales swim | "Hockey? Is it wet?" A whale soaks everybody |

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

## Open (for the user, on the review page)

- The names (Monty, Roxy, Tuque, Lulu, Misty, Ollie, Gus) are first picks.
- Lulu and Gus have new voices nobody has heard yet.
