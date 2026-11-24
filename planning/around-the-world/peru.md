# Peru: toy notes

Luna's Fluffy Day, Pepa's Penguin Cliff and Tika's Mountain Terraces are finished (read their code). The old plan for
the whole country is retired (git history). This file holds the notes for the one toy in the works.

### 4. Swim with Rosa 🐬 (Peru's Amazon: the flooded forest, pink river dolphins)

Replaces Rosa's Rainy River (squeeze a cloud to make rain). The user, 2026-11-24: the level "looks lame visually",
"drop the cheesy ChatGPT generated images", "the story is kind of boring", complete creative freedom. They picked this
pitch out of three (the others: Rosa and the Baby Cloud, Rosa's Lily Pad Pile-Up). The activity id stays `river`, so a
stamp she already has stays hers.

**One-line pitch:** the river has grown into the forest and the otters dare Rosa to a race; she swims Rosa through the
treetops, leaps for the monkeys' fruit and races to the rainbow.

**The toy (core verb):** hold Rosa (or the water anywhere) and she swims after the finger.
- How it feels: she eases after the finger like something in water, her tail beating harder the faster she goes, and
  turns her whole body the way she's heading. Above the waterline nothing steers her: she flies on the speed she left
  the water with and falls back with a splash. So a slow rise is a little hop and a run-up from the deep is a big leap.
- Why it's fun with no goal: leaping a pink dolphin out of the water and splashing back in. Greybox test: a pink blob
  that follows the finger and arcs out of a blue rectangle.

**How the verb deepens (3 steps, same verb):**
1. Swim the treetops: say hello to the capybaras (the baby rides on her back until she dives or leaps), wake the
   sloth with a splash.
2. Leap for the fruit: three fruits hang over the water, each higher. A leap that boops one drops it in, and the fish
   come to nibble.
3. Race the otters to the rainbow: the same swimming, fast, with logs to leap over or duck under.
Side verb: none.

**Her choices:** where to swim, which fruit first, over or under each log, whether to take the baby capybara along.

**Pokeables:** the sloth, the toucan, the macaws, the frog on its leaf, the turtle on its log, the fish, the
butterflies, the monkeys, the capybaras, Rosa herself (a spout).

**Silly moments:** leap with the baby capybara on her back and the baby flies off with a plop; bump a log and the turtle
falls in; a splash near anyone soaks them.

**Can she lose?** Only the race, and rarely. The otters swim slower than Rosa's top speed, slow down when they are
ahead, and one stops to float on his back. A loss is "So close! Again?" with an again button and the way on; after a
loss they are slower still. The stamp comes after the race either way.

**Story frame:** Rosa: "The river is in the treetops!" / Sparkle: "Hold Rosa and swim!"
Sparkle talks when: the forest appears (how to swim), under the sloth (how to leap), the first fruit the fish eat (the
fact), and after about 8 s stuck.

**What it teaches, by doing:** in the rainy season the river rises into the forest and the dolphins swim among the
trees (she swims between trunks, under branches, past roots); fish eat fruit that falls in the water (she knocks it
down for them); pink dolphins live in rivers (tap Rosa).

**Payoff:** friends she has met follow the race from the banks; the rainbow stands at the finish.

**Replay:** which fruit colours hang where and which otter leads change; the race is close every time.

**Numbers:** swimming is one long touch, so count moments: about 25-35 holds and taps, 2-3 min, 1 spoken line before
the first touch.

**Camera and art:** straight-on side view, cut through the water. All art is drawn in code in the shelf's flat look
(`src/world/shelf/STYLE.md`: no outlines, base/shade/light, light from the top left). No generated pictures in this
level. Layers: sky, two hazy canopies, far trunks, the riverbed and big trunks, the water, the swimmers and friends,
the surface, leaves in front. Puppets: Rosa (her puppet, in its flat look), sloth, monkeys, capybaras, otters, birds,
frog, turtle, fish.

**Screens:** the waterline is world y = 0. Wide screens show 1000 units of height, tall ones 1400; the width is whatever
fits, and the camera follows Rosa along a world 10400 units long. Everything she needs sits between y = -370 (the
monkeys' heads, on the branch at -275) and the riverbed at 440, which keeps it under the top bar on a wide screen.

**Sections and carried state:** `story`, `treetops`, `fruit`, `race`, `rainbow`. Params: `met` (friends already
greeted), `fruit` (how many are down), `rival` (the otters' pace, to see a loss), `result` (how the race ended).

**Tech:** DOM + `useGameLoop`; positions in refs. Riskiest piece: how the swim and the leap feel (knobs in the feel
lab, `?feel=1`).

## Log

- 2026-11-24: pitch picked (1 of 3). Notes written, build started on `neb636/swim-with-rosa`.
- 2026-11-24: first playable. Built: the whole forest and its animals drawn in code (`activities/river/Forest.tsx`,
  `Friends.tsx`), Rosa's puppet in a `flat` look, the swim and leap, the capybaras (the baby rides), the sloth, three
  fruits with the monkey's help after two misses, the otters' race with an again button after a loss, taps on
  everything. Rosa's sticker and map pin are a hand-drawn SVG (`assets/sticker-rosa.svg`); the 14 generated pictures the
  old level used are deleted. Changed from the first numbers after robot play: top speed 820 → 600 and gravity 1900 →
  1100 (at 820 she crossed the forest in nine seconds; slower, floatier leaps read better), the forest 7600 → 10400
  units so the race lasts about ten seconds.
  Still to do: recorded sound effects (`activities/river/sfx/sfx.json` is written, the clips are not made: no
  ElevenLabs key in the cloud session; `node scripts/generate-sfx.mjs src/world/places/peru/activities/river/sfx` on
  the Mac, the code picks the clips up by itself). Ideas held back: friends she met watching the race from the banks;
  a leap through the rainbow as the last beat; fruit colours shuffled each visit.
