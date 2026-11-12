# Bo Kluea salt wells: a story (2026-11-12)

The user asked for a story for the salt hut in the same way as Lung's rice farm (`nan-rice.md`, `docs/films.md`):
something that draws Kaylee in, the salt aunty with a good backstory, films and cinema mode, and non-playable
story-only scenes where they help. Check-in 1: three stories pitched on branch `neb636/salt-story` (PR #416). **You picked No Salt for the Soup!** (2026-11-12). The name Pa Kluea was not answered; it stays until you say otherwise.

The salt aunty gets a name in all three: **Pa Kluea** ("Auntie Salt"), the pony in the sun hat and mint apron
(`cast.json` `saltaunty`). The hut's three rounds stay as built (dip and pour, the fire, scrape); each story gives them
a reason and adds one moment to the verb she already has.

## The three pitches

1. **Grandma's Lost Bracelet** (a mystery). Memory film: little Pa Kluea, a filly, drops her grandma's silver bracelet
   down the well. Grandma: "The well keeps what it loves. One day it gives it back." Now: some buckets bring up silly
   finds (Dad's sunglasses, a sandal, a grumpy frog) that pop out onto the floor; in the fire round something glints
   under the boiling brine; while scraping, her paddle goes *clink* and the bracelet sparkles in the salt. Payoff: she
   gives it back; Pa Kluea wears it in the trip photo. Teaches: boiling the water away leaves what was in it.
2. **The Sea Under the Mountain** (a wonder tale; she loves *Little Lost Dolphin*). Grandma's tale as a memory film:
   long, long ago the valley was a sea, and Grandma Turtle lived here. When the sea went away she swam to the far
   ocean and left her salt sleeping under the mountain, a present for the people. Now: each bucket sparkles blue (a bit
   of the old sea); in the fire round the steam curls into fish and crabs she pops; payoff: a jar of salt for Grandma
   Turtle, and for a moment the hut fills with storybook sea and the turtle swims through and waves. Teaches the real
   fact (an ancient sea left the rock salt).
3. **No Salt for the Soup!** (a comedy rescue, like *Peck's Trail Mix Mix-up*). Opening film: tonight is the village
   dinner and every cook's salt jar is empty: the buffalo noodle uncle, the hen egg auntie, the goose fish grandma each
   taste and go "blehh!". She makes the salt (the cooks peek in between rounds), then a new street scene at dusk: she
   carries her basket stall to stall and sprinkles with her finger; each face lights up ("Aroi!"), a lantern comes on,
   and the party starts. Teaches: salt makes food yummy and keeps eggs and fish. Silly: too much and the face puckers.

Kept out: the salt well's spirit ceremony and the Buddhist Lent closing (rule 8: no temples, Buddhas or religious
rites). The legends of who first found the well are not checked, so none is told as fact; the ancient sea is.

## As built (check-in 2, 2026-11-12)

`salt/story.ts` (the cooks, the memory, the films, the sprinkle), `salt/dinner.ts` (the dinner set), rounds and places
in `salt/layout.ts`, wired into `salt3d.ts` like the rice farm's films (`docs/films.md`).

- **Rounds (all links):** `story` (the way-in film, then round 1), `1`, `2`, `3`, `dinner` (the dusk film, the play,
  the party film, then the salt video and the end card). From the Nan map the hut opens at `story`; 🔁 starts at `1`.
- **The way in (`intro`, ~45 s):** Pa Kluea's hello; Lung Kwai, Pa Kai and Yai Nak waddle in and pull "blehh" faces;
  the empty jar (its lid hops off, it tips, one grain falls); "the dinner is tonight"; the memory (storybook look,
  Grandma stirring the pan, little Pa Kluea in a pink dress walking off with a tiny basket); the ask.
- **While she makes the salt:** the cooks wait across the road by the painted house (tap them: hungry lines). Half a pan:
  "Is it salt yet?" / "Not yet!". The first white salt: Pa Kai's "Ooh! Salt!".
- **The dinner (`dusk`, then play):** evening on the same road at x = 16 (pink-lavender sky tint, warm light, unlit
  lanterns and string lights). Her finger held over a food: salt streams from her hand to the nearest food spot on
  screen (`SPOT_R`, `SALT_RATE`). The soup pot (1 spot), Pa Kai's jar (1 spot, then 4 eggs hop in), Yai Nak's three fish
  (3 spots, a drag across them). Each done: the cook tastes, a yum face, their line, the lantern lights. A new press on
  a done food: a pucker face and a "too salty" line. A quick tap is a pinch (about a second of salt).
- **The party (`party`):** the string lights pop on one by one, Pa Kluea's thanks, Dad's "Mmm! Just right!", a cheer.
- **New:** a `hen` species in the shared rig (comb, wattle, tail fan); voices `kwai` (onyx), `kai` (shimmer),
  `nak` (fable) in `cast.json`. The fish grandma is an otter (no goose rig yet).
- **Scratch:** the films borrow the rice farm's story music and memory bed; no ElevenLabs sounds of its own yet.
- **QA:** screens `nan-salt-story`, `nan-salt-memory`, `nan-salt-dinner`; motion `nan-salt-story`,
  `nan-salt-story-skip`, `nan-salt-dinner` (a robot drags over each food until the party ends).

## Next

You hear the table read and watch the reel (check-in 2). Then Kaylee plays it (check-in 3): does she follow the story,
and is the dinner long enough? Own music and sounds after the script is heard.
