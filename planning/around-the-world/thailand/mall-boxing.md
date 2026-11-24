# Muay Thai at HarborLand: a bout with Dad (rebuilt 2026-11-24)

Toy notes for `#/world/thailand/mall-trip/boxing` (`activities/mall-trip/games/boxing/`). The user doesn't read these.

**Why it was rebuilt.** The user, 2026-11-24: "The game mechanics are super lame. Let's make it much more fun. Take
inspiration from popular boxing games for iPad. You have freedom to change whatever you want." The old game was three
tap counters: tap her gloves six times (the wai kru), tap the bag eight times, tap it on the beat six times, tap Dad's
pad six times, one kick. No opponent, nothing to react to, and the best moment (Dad flying into the ropes) came once.

**What it borrows.** Punch-Out!! (an opponent with a tell you answer, a star punch you earn), Wii Sports Boxing (your
taps are your gloves, a knock-down and a count), and brawlers' juggles (keep him in the air). Checked against what
she replays (`docs/play-data.md`, the user's 2026-11-20 list): her finger on a character, nothing she can miss, Dad
being silly, something she wins. No aim-and-release, no hold-and-wait meter, no silly-face eyes on Dad (he acts dizzy
with his body and stars round his head).

### Muay Thai 🥊 (Thailand: the bow before a bout, the referee's "Chok!", counting nueng, song, saam)

**One-line pitch:** Dad puts on the sparring mitts; she punches him round the ring and knocks him into the ropes.

**The toy (core verb):** punch Dad where her finger lands.
- How it feels: the punch starts as her finger goes down (no waiting for it to lift), gloves take turns, she lunges and
  leaps for his head; he staggers back a step per hit; quick hits are a combo (a number over his head, a note higher
  each hit); every fifth is a big POW with a blink of freeze and a camera shake.
- Why it's fun with no goal: mashing Dad makes music, stars and a bigger and bigger number, and he ends up in the ropes.

**How the verb deepens (3 rounds, same verb):**
1. Dad just takes it. Twelve hits fill the super punch (the lamps on the board; her gloves turn gold). The next punch
   is in slow motion: he flies into the ropes, they sling him back through the air, a tap up there bounces him again
   (a juggle), he lands on his bottom and the coach counts him out.
2. Dad swings back: his near mitt swells like a balloon over his head, then bops her (she squashes and giggles, nothing
   lost). A punch on the big mitt first pops it: BONK, he spins dizzy and her hits count double.
3. Dad guards high or low: a punch on the mitts counts 0.4, one on the open spot counts 1. The super punch is the
   unicorn kick; then the belt.
Then the bout goes on (round after round, punch and kick taking turns) until she leaves.
Side verb: none.

**Her choices:** head or tummy; pop the mitt or keep punching; how many times to bounce him in the air.

**Pokeables:** the big bag, the small bag (the coach spin-kicks it), the drum, the bell, the ropes, the bottle, the
star board (the fact), the coach (the fact), herself (a ram muay dance step).

**Silly moments:** Dad pushed into the ropes is boinged back in; popped mitt deflates with a raspberry; a bop squashes
her flat for a moment; Dad sitting on the mat wiggles when poked; her gold gloves make his knees knock.

**Can she lose?** No. A bop is the only thing that goes against her and it costs nothing; his wind-up gets 0.35 s
slower after each one that lands (twice), and the first one of a visit is 0.6 s slower.

**Story frame:** coach "Sawasdee krap! First we say thank you." / Sparkle "Tap your gloves to bow!" One tap, then the
bell. Sparkle after that: "Tap Dad to punch!" (round 1), "Super punch!" (first time), "Punch his big
glove!" (first wind-up), "Big kick!" (round 3), and the idle hint.

**What it teaches, by doing:** the wai before a bout (she bows, they bow back); the referee's "Chok!"; counting in Thai
with the coach over a knocked-down Dad. Tap-to-hear facts: the coach, the star board.

**Payoff:** a star per knock-down, the gold belt after the third.

**Numbers:** see the log below (robot play).

**Sections and carried state:** `boxing?round=1|2|3` (1 starts with the bow; 2 and 3 start at the bell).

**Tech:** `ring.ts` (the world, a `Stage`), `build.ts` (the gym, Dad's gear), `coach.ts`, `beat.ts` (the drum: faster
as the super punch fills), `sounds.ts` (ElevenLabs clips over synth, `mall-trip/sfx/`). Feel knobs: `boxBout`
(`?feel=1`).

## Log

- 2026-11-24: rebuilt as above, on the user's "freedom to change whatever you want" (no pitch cards: they handed the
  pick over). 18 recorded sound effects (30.7 s). The wai kru is one bow now (it was six forced taps), and the ram
  muay dance step moved to a poke on herself. The pad and the beat ring are gone.
