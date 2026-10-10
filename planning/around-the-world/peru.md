# Peru: Luna's Animal Explorer Journal (plan)

## What changed in this version (2026-10-10)

The first Peru plan (2026-10-05, built as far as Cozy Andes in the closed PR #63) was written under the old
"3-5 touches, 45-75 seconds" rule that made Italy's first Venice and Etna feel thin (see `docs/play-design.md`).
Every activity was a short list of one-off steps (hat, scarf, jacket, zip). This version:

- **Drops Rainbow Weaving.** It replaces it with **Pepa's Penguin Cliff** on the desert coast. Peru has penguins,
  which surprises most grown-ups. It also gives the plan its missing third region: Peru is coast, mountains and
  rainforest, and the old plan had four Andes activities, one Amazon activity and no coast.
- **Makes every activity an animal one**, the way Australia's worked (feed Koko, carry Chompy's babies, hop with Pip).
  Cozy Andes becomes **Luna's Fluffy Day**, an alpaca salon. Machu Picchu Lookout (flag stripes and shutters) becomes
  **Tika's Mountain Terraces**: llamas really graze at Machu Picchu, and the Inca built its walls like puzzles.
- **Gives each activity one core verb that deepens three times**, 20-40 play touches and 1.5-3 minutes, using
  `ACTIVITY-TEMPLATE.md`. Each activity uses a different verb, so Peru doesn't feel like one game five times:
  | Activity | Region | Core verb | Animals |
  |---|---|---|---|
  | Luna's Fluffy Day | Andes highlands (near Cusco) | brush and clip fleece | alpacas |
  | Pepa's Penguin Cliff | desert coast (Paracas) | pull back and launch a diving penguin | Humboldt penguins, sea lions, pelicans, Inca terns |
  | Coco's Canyon Glide | Colca Canyon | steer a gliding condor into warm air | Andean condors |
  | Rosa's Rainy River | Amazon rainforest | squeeze a rain cloud to raise the river | pink river dolphin, sloth, monkeys, frogs, capybaras |
  | Tika's Mountain Terraces | Machu Picchu | fit stones into walls and steps | llamas (and a shy spectacled bear) |
  | Finale: Thank-You Balloon | over all of Peru | drop gifts from the balloon | every friend, at home |
- **Replaces the 25-second finale** (tap journal, drag to satchel, tap basket) with a short balloon trip that visits
  each friend in their own habitat.
- **Keeps** Luna the alpaca, the explorer journal with five picture windows, stamps and stickers, Spanish *hola* and
  *gracias*, the plain red-white-red flag, and the camera rule.

## The story in one breath

Luna the alpaca has a brand-new **explorer journal** with five empty picture windows, one for each corner of Peru.
Kaylee and Sparkle fly in by balloon and help Luna's animal friends: they give fluffy alpacas a haircut, help
penguins catch fish for their chicks, teach a baby condor to fly, make it rain so a pink dolphin can swim through the
forest, and build terraces for llamas at Machu Picchu. Each friend fills one journal window. When the journal is full,
Luna and Sparkle fly the balloon over all of Peru at sunset and drop a thank-you gift to every friend.

Peru's lesson is its **three worlds**: the dry coast by a cold ocean full of fish, the high cold Andes, and the hot
rainy Amazon. Kaylee *feels* each one (penguins in a desert, shivering alpacas, warm rain), and the hub map shows them
side by side.

## Not a clone of Australia, Egypt, China or Italy

- Australia: hop-counting, feeding, carrying babies, hide-and-seek on a reef. Peru doesn't hop, feed or hide-and-seek.
  The closest is the penguin chicks being fed, and there the verb is the launch, not the feeding.
- Italy: Venice and Etna drag a boat or a donkey along a scrolling scene. Only Coco's glide is a drag, and its physics
  is different: Coco sinks unless she finds warm air.
- New verbs for the project: grooming (brush and clip), slingshot launch, making weather, fitting stones.

## Friends (cast.json)

Every friend is a puppet (`usePuppet`) built from one generated reference picture, in the flat 5-unit-outline style.

| Friend | Who | Voice idea | Puppet actions |
|---|---|---|---|
| **Luna** | alpaca girl with a pink explorer satchel and the journal; the guide's friend in every activity | `nova`, +2, curious and warm, light Peruvian Spanish accent | wave, shiver, hum, giggle, look in mirror, nod, cheer; fleece made of removable puffs (activity 1) |
| **Paco** | Luna's little brother, chocolate-brown fleece, very ticklish | `fable` or a child voice, +3 | hop, wriggle, giggle fit |
| **Abuela Killa** | Luna's grandma, black fleece, sleepy | older warm voice, 0 | yawn, slow nod, snore |
| **Pepa** | Humboldt penguin mama, bossy-sweet | `shimmer`, +2, quick | waddle, flap, crouch on the launch rock, dive, porpoise, feed chick |
| **Pepa's chicks** (2, then a third hatches) | fluffy grey chicks in a burrow | Buddy sprites, peeps only | bob, beg, gulp, grow rounder |
| **Lobo** | sea lion pup, loves splashes | low playful voice, -1 | flop, bark, roll, clap flippers |
| **Coco** | Andean condor dad, huge wings, calm | `ash`, -1, slow and proud | spread wings, bank, circle, tuck, land, cheer |
| **Pluma** | Coco's fluffy brown chick, scared to fly | small voice, +4 | wobble, flap, peek over the ledge, glide |
| **Rosa** | pink river dolphin, giggly | `shimmer`, +2 | turn, swim, surface, spout, jump, nod |
| **Tika** | llama at Machu Picchu, a bit cheeky | `coral` or similar, +1 | munch, hop up a step, look smug, photobomb pose |

Sparkle (`SparklePuppet`) gives the instructions in her existing voice. Lines in `lines.ts` use straight apostrophes
(the PR #63 clips with curly apostrophes failed the transcription check). Audition the accent with
`node scripts/voice-audition.mjs`: light and natural, never exaggerated.

## Hub: Luna's map of Peru

An illustrated map in the cartographic hub view (its own camera, like the other countries): the Pacific coast on the
left (sand-colored desert, waves, a tiny penguin), the Andes down the middle (snowy peaks, the canyon, Machu Picchu on
its ridge), and green rainforest with a winding river on the right. Five big pins on the real places: Paracas (coast),
Colca Canyon, Cusco highlands, Machu Picchu, the Amazon near Iquitos. Luna and her journal sit beside the map in
landscape and below it in portrait. Each journal window shows its friend once the stamp is earned.

All five activities are open from the start (any order). The balloon (finale, button label `Party`) unlocks when all
five stamps are in.

**Pokeables on the hub:** Luna (giggle; second tap "I love exploring with you!"), the journal (flips open to the filled
windows; each window plays its friend's line), the balloon (puffs a little flame), a wave on the coast, a snowcap
(sparkle), the river (a pink fin pops up).

**Lines:** Luna: "Hola, Kaylee! I'm Luna!" / "Let's fill my explorer journal!" Sparkle: "Tap a picture to explore
Peru!" Return: Luna "Another discovery, Kaylee!" All done: Luna "Our journal is full!" Sparkle "Tap the balloon for our
adventure!" Balloon tapped early: Sparkle "Explore each picture first!"

## The five activities (any order; 1.5-3 min of play each, hands busy, each gets richer as it goes)

### 1. Luna's Fluffy Day ✂️ (Andes highlands near Cusco: alpacas, fleece, cold mountain air)

**One-line pitch:** Luna's fleece has grown so long she can't see where she's going; Kaylee brushes and clips her (and
her brother and grandma), and the wool becomes pink pompom hats for the chilly mountain wind.

**The toy (core verb): rub the fleece with a tool.** Her finger holds a big brush or round clippers and moves over the
alpaca. The fleece is made of many soft puffs. The brush makes them fluff up and sparkle and pulls out whatever is
stuck in them. The clippers snip puffs off; they float down into the wool basket with a soft *fwip*.
- How it feels: like Toca Hair Salon. Puffs wobble when the tool comes near and pop off in little clouds; Luna leans
  into the brush like a happy cat and hums (real: alpacas hum).
- Why it's fun with no goal: making a fluffy thing less fluffy is satisfying, and every puff reacts. Greybox test: a
  circle body covered in 80 grey circles; the finger removes the circles it passes over and they fall into a box.

**How the verb deepens (same verb, three times):**
1. **Brush Luna.** Her fleece is full of surprises: burrs, a twig, a dandelion, a sleepy baby bird that peeps and
   flutters to the fence, a beetle that waddles off. Each stroke pulls one out with a reaction. Her bangs cover her
   eyes; brushing them aside makes her blink and say "I can see you, Kaylee!"
2. **Clip Luna.** Now the clippers. Puffs fly into the basket. There's no right shape: she can leave a pompom on the
   tail, a big puff on the head, puffy socks on the legs. When the body is mostly done, Luna looks at herself in the
   pond and laughs at whatever Kaylee made ("I look so silly!" or "So pretty!"). A gust of wind comes and Luna shivers:
   "Brrr! It's chilly up here!"
3. **The family.** Paco (brown) and Abuela Killa (black) trot up for their turn. Paco is ticklish: clipping his tummy
   makes him giggle and hop, so he's a moving target (gentle, he comes back). Abuela falls asleep halfway and snores;
   her fleece puffs rise and fall with her breath. The basket fills with three colors of wool in stripes (real:
   alpacas come in about 22 natural colors).

**Side verb (one): put on the hats.** The full basket spins into yarn. Sparkle taps the prickly pear cactus by the
fence and a tiny white bug turns into a drop of pink (real: cochineal insects make red and pink dye, and Peru makes
most of the world's supply). The yarn turns pink and becomes three pompom hats. She drags each hat onto a shivering
alpaca, and they stop shivering and snuggle.

**Her choices:** the haircut shapes (all of them), who gets which hat (pink, plus natural white and brown if she
prefers), what order to clip Paco and Abuela.

**Pokeables:** the baby bird on the fence (peeps, flies a loop), the pond (ripples, Luna's reflection copies her), the
prickly pear (wobbles; the bug waves), a stone wall with a lizard that pops out, clouds (drift and puff),
a snowy peak far away (glints), Luna's satchel (the journal peeks out), a hummingbird at a flower.

**Silly moments instead of failure:** clip her face fleece and she gets a mustache puff; clip everything off and she's
a tiny skinny alpaca who says "Brrr! Hat please!"; tickle Paco too much and he rolls on his back laughing; tap Abuela
while she's asleep and she snores louder.

**Story frame (2 lines):** Luna: "My fleece is so long, I can't see!" Sparkle: "Brush Luna's fleece, Kaylee!"
Sparkle talks only when: the clippers appear ("Now the clippers! Snip snip!"), the family arrives, the yarn turns
pink, the hats appear, or after ~8 s with nothing touched.

**What it teaches, by doing:** alpacas live high in the Andes where the wind is cold; their thick fleece keeps them
warm (she takes it off and they shiver); haircuts don't hurt them; people make warm clothes from the wool (she makes the
hats); alpacas come in many natural colors; the cochineal bug. Tap-to-hear facts: "Alpacas hum when they're happy!",
"Alpacas come in lots of colors!", "A tiny bug makes pink color!"

**Payoff (builds while she plays):** the wool basket fills with stripes; three bare, shivering alpacas become three
snuggly alpacas in pink pompom hats, posing for Luna's first journal window.

**Replay:** the hidden things in the fleece are shuffled; the haircut is hers every time; the fleece regrows.

**Numbers:** about 30-40 touches (each stroke is a touch; the hats and pokeables add more) in 2-3 minutes; 2 lines
before the first touch.

**Camera and art:** straight-on eye-level side view, stage-like, alpacas standing on a ground line. Layers: sky with
clouds, far snowy peaks, mid green hills with stone walls, near meadow with the fence, cactus and pond, foreground
grass. Puppets: Luna, Paco and Abuela share one alpaca rig (`puppets/alpaca.ts`, like `roo.ts`) with removable puff
layers; the haircut state is kept as a set of removed puff ids. Sprites: brush, clippers, basket, hats (SVG so tray and
head match), cactus, fence, pond, bird, beetle.

**Screens:** wide stage about 1500 × 1000, tall about 1000 × 1400. The alpaca being groomed fills most of the stage
height so every puff is a fat target; the tool tray sits at the side (landscape) or bottom (portrait).

**Tech:** DOM/SVG + `usePointerDrag`; puffs are SVG circles hit-tested against the finger path each frame
(`useGameLoop`, written to refs). Riskiest piece to prototype: 300+ puffs across three alpacas in Safari at 60 fps.
Fall back to fewer, bigger puffs.

---

### 2. Pepa's Penguin Cliff 🐧 (desert coast at Paracas: Peru has penguins! a cold ocean full of fish)

**One-line pitch:** Pepa's fluffy chicks are hungry; Kaylee launches penguins off the rocks into the cold sea to catch
anchovies, and the chicks grow round enough for their very first swim.

**The toy (core verb): pull back and launch a penguin.** On the rock ledge, she grabs a penguin and pulls it back and
down (it crouches, flippers back, eyes squeezed); a dotted splash spot shows where it will land. She lets go: the penguin
leaps in an arc, splashes in, zooms under the water in a quick loop (her part is done, the swim is the reward), catches
a fish if it went near a school, porpoises out of the waves (real behavior) and hops back up the rocks.
- How it feels: a slingshot with a rubbery stretch. A small pull is a little hop and a shallow dive; a big pull is a
  big belly-flop splash and a deep dive.
- Why it's fun with no goal: launching something and watching it splash is fun on its own; Lobo the sea lion gets
  splashed and barks. Greybox test: a black oval on a grey ledge over a blue band; pull, release, arc, splash circles.

**How the verb deepens (same verb, three times):**
1. **Splash.** Just jump: big jumps, small jumps, splash Lobo, scare off a pelican. The penguins queue up on the
   ledge (the chubby one, the tiny one, one with a feather tuft), and she picks who goes next.
2. **Fishing.** Shimmering anchovy schools appear: near and shallow, or far and deep. A short pull reaches the near
   school, a long pull the far one. Each caught fish goes back to the burrow, where two chicks beg. The chick who gets
   fed gets visibly rounder and fluffier. Pepa says how many: "Two fish, please!" (counting 1-3), and the burrow shows
   one fish-shaped spot per fish.
3. **The twist: hungry neighbors and waves.** A Peruvian pelican dives for the same school (if he gets there first,
   the fish scatter and reform somewhere else: never a loss, just a new aim), waves rise and fall so a school slides
   nearer and farther, and an egg wobbles in the burrow and hatches a third chick that wants fish too.

**Her choices:** which penguin jumps, which school to aim for, which chick to feed, how big a splash to make.

**Pokeables:** Lobo (barks, rolls, claps; splashing him makes him dive and pop up with seaweed on his head), Inca
terns with curly white mustaches (tap: they twirl their mustache and squawk; real Peruvian bird), red Sally Lightfoot
crabs (scuttle sideways), a pelican (gulps air, wobbly pouch), a tour boat (toot, tiny people wave), the Paracas
Candelabra on the far hill (real geoglyph: glints), kelp, a jellyfish (jiggles), the sun on the dry desert cliffs.

**Silly moments instead of failure:** a tiny pull: the penguin plops in with a "blip"; launch a penguin at Lobo: they
both flip and Lobo claps; miss every fish: the penguin comes back with a sock-shaped bit of seaweed and a proud face;
pull too far: the penguin stretches like a rubber band and says "Whoa!"

**Story frame (2 lines):** Pepa: "Hola! My chicks are hungry!" Sparkle: "Pull a penguin back, then let go!"
Sparkle talks only when: the first fish school appears ("Jump near the shiny fish!"), the egg hatches, after ~8 s with
nothing touched. Pepa says the orders and thank-yous; chicks only peep.

**What it teaches, by doing:** penguins live in Peru, on a dry desert coast; the ocean there is cold and full of fish;
penguins "fly" underwater with their wings and dive to catch fish; near and far, a little and a lot (she controls the
pull); counting fish per chick. Tap-to-hear facts: "Peru has penguins!", "The ocean here is cold and full of fish!",
"Penguins fly underwater with their wings!", "These birds have white mustaches!" (Inca tern).

**Payoff (builds while she plays):** three fluffy chicks grow rounder; at the end they waddle to the edge, and Kaylee
launches each one for its very first tiny swim, the whole family porpoising together in a line. Picture for the journal.

**Replay:** the penguin queue and fish-school positions are shuffled; the third chick has a different tuft each time.

**Numbers:** about 20-30 launches (each one pull-and-release) plus pokeables, about 30-40 touches in 2-3 minutes; 2
lines before the first touch.

**Camera and art:** straight-on side view with the water cut away so she sees above and below the surface (like a
fish-tank side view): rocky ledge left, the sea right, the burrow in the rocks under the ledge. Layers: pale desert sky,
far dry hills with the Candelabra, mid rocky island, near ledge and burrow, water surface band, underwater band (drawn
in code: light rays, bubbles), foreground rocks. Puppets: Pepa, Lobo; penguin divers and chicks as Buddy sprites with a
crouch and a dive pose.

**Screens:** wide stage about 1600 × 1000, tall about 1000 × 1400 (portrait shows more underwater depth: deeper
schools). The ledge, the burrow and the nearest school stay inside the safe zone on every device.

**Tech:** DOM + `useGameLoop` for the arc and the underwater loop (simple ballistic arc, no physics engine); pull vector
from `usePointerDrag`. Riskiest piece to prototype: the pull feel and the landing-spot preview at iPhone sizes. Tap
alternative: tapping a school launches the front penguin straight at it.

---

### 3. Coco's Canyon Glide 🦅 (Colca Canyon: condors, soaring on warm air)

**One-line pitch:** Coco's chick Pluma is scared to fly; Kaylee flies Coco through the canyon to show her how condors
soar, and Pluma follows, until she glides on her own.

**The toy (core verb): steer Coco through the sky.** She grabs Coco and he follows her finger with big slow banks,
wings wide, wingtip feathers spread like fingers. The twist that makes it a condor and not a boat: **Coco hardly flaps.**
Out in plain air he slowly sinks. In **warm air** (painted swirls of shimmer rising off sunny rocks, with leaves, dust
and a butterfly spiralling up), he circles up fast. Steer into a swirl and he soars; leave it and he glides down.
- How it feels: heavy and graceful. Wide turns, a whoosh as he banks, a joyful rise inside a swirl.
- Why it's fun with no goal: catching a lift and shooting up the canyon wall is a thrill, and sinking slowly isn't a
  failure, just a gentle glide. Greybox test: a dark V shape following the finger with lag; orange columns lift it.

**How the verb deepens (same verb, three times):**
1. **Morning lift.** The sun reaches into the canyon and warms the rocks; swirls start rising one by one (real: condors
   wait for the morning sun to warm the air before they fly). Just fly, ride swirls up, swoop down to the river.
2. **Follow the leader.** Pluma jumps off the ledge and flaps after Coco, copying where he goes, a bit wobbly. Kaylee
   leads her to three places: the waterfall, a ledge with other condors, and the Cruz del Condor lookout where tiny
   tourists cheer. To get higher places, she has to use a swirl. If she flies too fast, Pluma calls "Wait for me!" and
   Coco slows down.
3. **Up and over.** The last part is high: a ridge only reachable by linking two swirls, and the sun moves so a swirl
   fades and a new one appears on the other wall (warm air is where the sun is). At the top, Pluma lets go of Coco's
   lead and glides alone; Kaylee can then steer either of them.

**Her choices:** where to fly, which swirl to ride, the order of the three places.

**Pokeables:** a viscacha (fluffy rabbit-like rodent) on a rock that sits up and twitches its ears, terraced fields
far below, the river (glints), a cactus with a bird, the tourists at the lookout (wave and point), clouds (Coco flies
through and comes out damp, sneezing), a cliff swallow nest, the other condors (they bow).

**Silly moments instead of failure:** fly into a cloud and Coco sneezes; dive straight down and he pulls up with a
big "Whoooosh!"; fly in circles and Pluma gets dizzy; land Coco on the tourists' lookout and he poses for photos.

**Story frame (2 lines):** Coco: "My chick Pluma is scared to fly." Sparkle: "Grab Coco and show her how!"
Sparkle talks only when: the first swirl appears ("Fly into the warm air!"), Pluma joins, the high ridge, after ~8 s
with nothing touched.

**What it teaches, by doing:** Andean condors are some of the biggest flying birds, with wings wider than a grown-up is
tall; they soar on rising warm air and hardly flap (she feels the sink and the lift); the sun warms the air (swirls
appear where the sun shines); Colca is one of the deepest canyons in the world. Tap-to-hear facts: "Condors hardly
flap their wings!", "Condor wings are wider than a grown-up is tall!", "This canyon is super deep!"

**Payoff (builds while she plays):** Pluma goes from shaky flapping to a confident glide beside her dad, and the other
condors join in a big circle over the canyon. Picture for the journal: Coco and Pluma wingtip to wingtip.

**Replay:** swirls appear in different spots; the three places in her own order.

**Numbers:** about 20-30 drags (each grab is a touch) plus pokeables, about 25-35 touches in 2-3 minutes.

**Camera and art:** straight-on side view looking across the canyon. A world about 3 screens tall and 2 wide that the
camera follows. Layers: sky and far volcanoes (slowest), far canyon wall with terraces, mid canyon wall with ledges
and the lookout, near rocks, foreground cactus. The swirls are part of the art: heat shimmer over sunny rocks, plus
code-driven leaves and dust in the flat style. Puppets: Coco (articulated wings, spread wingtip feathers), Pluma.

**Screens:** wide stage about 1600 × 1000 visible window, tall about 1000 × 1400; Coco and the next swirl always in
the safe zone.

**Tech:** DOM + `useGameLoop` (camera x/y, parallax transforms, Coco as a spring toward the finger with a sink rate and
a lift inside swirls). Riskiest piece to prototype: the sink-and-lift feel. Sinking must feel calm, never like falling.

---

### 4. Rosa's Rainy River 🌧️ (Amazon rainforest: rain, the flooding forest, pink river dolphins)

**One-line pitch:** it's the dry season and Rosa can't reach her friends in the forest; Kaylee makes it rain until the
river floods the forest, and Rosa swims between the trees to visit everyone.

**The toy (core verb): grab a rain cloud and squeeze it.** She drags a fat grey cloud across the sky and holds her
finger on it (or wiggles it) to make it rain right there. Rain drops hit what's below and everything reacts: leaves
bounce, frogs pop up and sing, flowers open, the river rises a little with each shower.
- How it feels: a squishy cloud that gets darker and fatter when she holds it, then lighter as it rains; a little
  thunder rumble when she squeezes a lot.
- Why it's fun with no goal: making rain where you want it is magic, and the forest is full of things that answer the
  rain. Greybox test: a grey blob that drops blue dots on green and brown shapes; a blue band that rises.

**How the verb deepens (same verb, three times):**
1. **Rain on the forest.** Rain on plants and they grow, rain on a frog and it croaks, rain on leafcutter ants and they
   hold their leaves up like umbrellas (real ants carry leaves; the umbrella is the joke), rain on a sloth and it
   slowly opens one eye. A drying puddle by the river fills.
2. **Fill the river.** Rain over the river and it rises step by step. Each step lets Rosa reach a friend: first the
   capybara family (they float off the bank and swim), then the low branch where the sloth dips her toes, then the
   monkeys' tree. Rosa swims up to each and they say hi. The water climbs the tree trunks: real, the Amazon rises many
   meters in the rainy season and pink dolphins swim through the flooded forest.
3. **Giant lily lagoon.** A dry lagoon behind the trees. Fill it and giant water lilies unfold, big enough to sit on
   (real: Amazon water lilies). Friends hop onto the lily pads (a frog, a monkey, the capybara baby, Sparkle). Then
   Sparkle pushes the cloud aside, the sun comes out, and a rainbow appears over the water while Rosa does her biggest
   jump.

**Side verb:** none. Rosa swims by herself; she's the reward for the rain.

**Her choices:** where to rain, how much, which friend's spot to fill first (the river steps can go any order once
the first is done), who sits on which lily pad (drag friends onto the pads).

**Pokeables:** Rosa (tap the water near her: she spouts and giggles), macaws (squawk, swap perches), a toucan, poison
dart frogs (tiny, bright, they hop), the sloth (in slow motion, a very long "hiii"), capybaras (chew, sit on each
other), butterflies (swirl), a canoe on the bank (bobs once the water arrives), fruits that fall and fish nibble them
(real: fish eat fruit in the flooded forest).

**Silly moments instead of failure:** rain on Sparkle and she shakes like a dog; rain on the sleeping sloth and she
yawns for five seconds; rain on the macaws and they fluff up into feather balls; over-rain and the frog surfs.

**Story frame (2 lines):** Rosa: "Hola! I want to visit my forest friends!" Sparkle: "Squeeze the cloud to make rain!"
Sparkle talks only when: the river can be filled ("Make it rain on the river!"), the lagoon, the rainbow, after ~8 s.

**What it teaches, by doing:** the rainforest gets lots of rain (she makes it); in the rainy season the river rises
into the forest and dolphins swim among the trees (she floods it); pink river dolphins live in rivers, not the sea;
more than half of Peru is rainforest. Tap-to-hear facts: "This dolphin lives in a river!", "The river grows into the
forest!", "Half of Peru is rainforest!", "Some fish eat fruit!"

**Payoff (builds while she plays):** a dry riverbank becomes a shining flooded forest with friends on giant lily pads,
a rainbow, and Rosa jumping. Picture for the journal.

**Replay:** which friends appear in the lily lagoon is shuffled; the rain is hers.

**Numbers:** about 25-35 touches (each cloud grab/squeeze, each lily friend, pokeables) in 2-3 minutes.

**Camera and art:** straight-on side view with the river cut away so the water level is visible on the tree trunks.
Layers: sky with clouds, far canopy, mid tree trunks (the water climbs them), near bank with plants and animals, water
(code-drawn surface and rain in the flat style), foreground leaves. Puppets: Rosa (bendy body and tail, flexible neck:
real botos can turn their heads). Sloth, capybaras, monkeys, frogs as Buddy sprites.

**Screens:** wide stage about 1600 × 1000, tall about 1000 × 1400; the cloud's sky band and the river band both inside
the safe zone (portrait has more forest height and a taller flood).

**Tech:** DOM + `useGameLoop`: a water level value; rain drops as a small pooled particle set; hit tests on the things
below the cloud. Riskiest piece to prototype: the rain-hold feel and particle cost on an older iPad.

---

### 5. Tika's Mountain Terraces 🦙 (Machu Picchu: the Inca, stone walls, terraces, llamas)

**One-line pitch:** a storm knocked down the terrace walls where Tika the llama and her friends graze at Machu
Picchu; Kaylee fits the big stones back like a puzzle and builds steps up the mountain, until the llamas can climb all
the way to the top for the view.

**The toy (core verb): fit stones into a wall.** Big stones with chunky Inca shapes (some with corners, a famous
12-cornered one) sit in a pile. She drags one, it wobbles in her hand, and near a gap of the same shape it gets pulled
in and lands with a satisfying *clonk*, dust puff and a little shake. A stone that doesn't fit slides out with a
funny *bonk* and rolls back to the pile (it's not wrong, just a different gap).
- How it feels: heavy, chunky, with a magnetic snap. The finished wall shimmers.
- Why it's fun with no goal: snapping big pieces together and watching animals use what you built. Greybox test:
  grey polygons dragged into matching holes with `PlayArea`/`Piece` snapping.

**How the verb deepens (same verb, three times):**
1. **Fix the wall.** 3 big stones fill gaps in the lowest terrace wall, each gap a clearly different shape. Tika hops
   up and munches the grass on the finished terrace.
2. **Build the steps.** Each terrace higher needs 4-5 stones, smaller and closer in shape (a corner, a 12-corner
   stone). Each finished terrace grows something: potatoes in many colors (real: Peru has thousands of kinds of
   potatoes), then corn, then flowers. Tika's llama friends hop up one terrace at a time.
3. **The top.** At the top the clouds are thick (real: Machu Picchu is often wrapped in morning clouds). The last
   wall has stones on both sides that she can pick from, and when it clicks, the sun comes out and the clouds roll back
   to show the whole city and Huayna Picchu. Then the journal photo: Tika steps into the picture with a big grin (the
   famous llama photobomb). Kaylee can take as many photos as she likes, and Tika poses differently each time.

**Side verb:** none (the photo is a tap).

**Her choices:** which stone she tries, what grows on which terrace (potato, corn or flower seed bags), which llama
goes up first, how many photos.

**Pokeables:** llamas (hum, chew, one spits a tiny grass ball at another: silly and real), a shy spectacled bear that
peeks out of the cloud forest edge when she taps the bushes (a rare surprise; real, they live in the cloud forests
around Machu Picchu), an Andean cock-of-the-rock (Peru's national bird, bright orange, bobs and squawks), a
hummingbird, a stone doorway (a breeze whistles through), potatoes (pop up and wiggle), a viscacha, clouds (puff).

**Silly moments instead of failure:** wrong stone bonks and rolls away with a boing; drop a stone on a llama's
terrace and the llama hops on it like a stage; Tika eats a flower she just planted and looks innocent; tap Tika three
times and she does a little dance.

**Story frame (2 lines):** Tika: "Oh no! Our grass steps fell down!" Sparkle: "Fit the stones back in, Kaylee!"
Sparkle talks only when: the first higher terrace starts ("Build the next step!"), the seeds appear, the top, the
photo, after ~8 s (and after two bonks in a row, the right stone glows).

**What it teaches, by doing:** the Inca built Machu Picchu long ago, high on a mountain; they fitted stones together
so well they needed no glue (she fits them); they built terraces, steps of flat ground, to grow food on steep mountains
(she builds them, and things grow); Peru has thousands of potatoes; llamas live there. Tap-to-hear facts: "The Inca
built Machu Picchu long ago!", "The stones fit together like a puzzle!", "Peru has thousands of kinds of potatoes!",
"Llamas can carry things up the mountain!"

**Payoff (builds while she plays):** a broken hillside becomes green terraces full of potatoes, corn and flowers, with
llamas on every step; the clouds roll back to show Machu Picchu; Tika's photobomb is the journal picture.

**Replay:** stone shapes and seed choices are reshuffled; Tika's photo poses are random.

**Numbers:** about 15-18 stones, plus seeds, photos and pokeables, about 25-35 touches in 2-3 minutes.

**Camera and art:** straight-on side view of the mountainside as a stage: terraces stack upward. The camera climbs as
she builds (wall 1, then up). Layers: sky and clouds, far peaks and Huayna Picchu, the city (hidden by clouds until the
end), mid terraces (built from code-placed stone sprites so the walls she builds are the art), near grass and bushes,
foreground flowers. Puppets: Tika (hop, munch, photobomb grin); other llamas as Buddy sprites.

**Screens:** wide stage about 1500 × 1000, tall about 1000 × 1400; the current wall and the stone pile always in the
safe zone; the reveal uses the full screen.

**Tech:** SDK `PlayArea` / `Piece` / `Target` (snapping, hint pulse, magnetic pull) with custom stone shapes;
`useGameLoop` only for the camera climb and the cloud roll. Riskiest piece: shapes that are distinct enough for a
5-year-old but still look like Inca stonework; prototype the shape set in greybox first.

---

## Finale: Luna's Thank-You Balloon 🎈 (route `party`, aria-label "Party")

**One-line pitch:** with the journal full, Luna and Sparkle fly the balloon at sunset from the coast over the
mountains to the rainforest, and Kaylee drops a thank-you present to every friend in their own home.

**The toy (core verb): drop a gift from the basket.** She drags a present out of the basket and lets go; a little
parachute opens and it drifts down, swinging, pushed a bit by the wind. A friend below waddles, flies or swims to catch
it, opens it and wears it.
- Greybox test: a box with a half-circle parachute falling with sway toward moving targets.

**How the verb deepens:** the balloon drifts on its own past each habitat (layered side-scroll, east from the sea):
1. **Coast:** the penguins and Lobo, a big easy target on the beach.
2. **Canyon and Machu Picchu:** Coco flies up and catches his gift in mid-air; Tika and the llamas on the terraces.
3. **Rainforest at dusk:** drop through gaps in the canopy; Rosa jumps out of the river to catch hers.
Gifts she picks for each friend from the basket: party hats, flower crowns, a scarf, sunglasses, a pompom.

**Payoff:** every friend waves wearing their gift; night falls, lanterns rise from the forest, the balloon's ribbons
turn red-white-red (Peru's flag), and Luna closes the journal: "Gracias, Kaylee!" Sparkle: "Gracias means thank you!"
Then `onWin()` once; the shell shows the trophy (Peru Explorer).

**Numbers:** about 10-14 drops plus pokeables, about 1.5-2 minutes. Luna: "Five discoveries, Kaylee!" Sparkle: "Drop
a present for each friend!" Trophy lines: "Kaylee, you did it! You won the Peru Explorer trophy!" / "Kaylee, Peru
Explorer! From Peru."

## Stickers and stamps

| Activity id | Stamp + sticker | Sticker fact (Sparkle) |
|---|---|---|
| `alpaca` | alpaca | "Alpaca sticker! Alpacas have soft, warm fleece!" |
| `penguins` | Humboldt penguin | "Penguin sticker! Penguins live in Peru too!" |
| `condor` | Andean condor | "Condor sticker! Condors soar on warm air!" |
| `river` | pink river dolphin | "Pink dolphin sticker! These dolphins live in rivers!" |
| `machu-picchu` | llama | "Llama sticker! Llamas can carry things up mountains!" |

Each activity saves its stamp the moment it's finished, then shows `StampEarned`. Replay never duplicates rewards.

## Facts page (passport, tap to hear, Sparkle)

| Button | Line |
|---|---|
| Location | "Peru is in South America!" |
| Three worlds | "Peru has a coast, mountains, and rainforest!" |
| Hello | "Hola means hello in Spanish!" |
| Languages | "People in Peru also speak Quechua and Aymara!" |
| Penguins | "Peru has penguins on its desert coast!" |
| Alpacas | "Alpacas live high in the mountains!" |
| Machu Picchu | "The Inca built Machu Picchu long ago!" |
| Potatoes | "Peru has thousands of kinds of potatoes!" |
| Flag | "Peru's flag is red, white, red!" |
| National bird | "Peru's bird is bright orange!" (cock-of-the-rock) |

Optional Quechua word, if the voice can say it well in audition: *añay* ("thank you" in Cusco Quechua) from Tika.
Drop it if the clip sounds wrong.

## Extras (no stamps; build after the five activities)

- Coloring pages (`bg-color-*`): Luna in her pompom hat, Pepa and chicks, Coco and Pluma, Rosa in the flooded forest.
- Picture puzzles: Machu Picchu with llamas, the penguin cliff.
- Videos (Theater), optional, if Dad wants them: real Humboldt penguins, condors at Colca, pink river dolphins. Pick
  child-safe clips by hand.

## Implementation notes

- Folder `src/world/places/peru/`, ids `alpaca`, `penguins`, `condor`, `river`, `machu-picchu`, finale `party`.
  `PlaceMeta`: id `peru`, name `Peru`, emoji 🦙, friend Luna the alpaca, trophy title "Peru Explorer". Pin on Peru on
  the world map (check it visually).
- Shared edit: add `peru` to `src/world/kit/Flag.tsx` (a plain red-white-red vertical tricolor, no coat of arms). PR #63
  already drew it, so reuse that.
- Reusable from closed PR #63 (`origin/neb636/peru-cozy-andes`): the Luna puppet and reference (to be redrawn as the
  alpaca rig with fleece puffs), the hub skeleton, the flag, the cover. The Cozy Andes activity itself is replaced.
- `lines.ts` holds every phrase tagged by speaker; `node scripts/world-voice-lines.mjs && node
  scripts/generate-voice.mjs` makes the clips.
- Every activity adds itself to `qa-screens.mjs`, `qa-motion.mjs` (a scenario for its core verb) and `qa-pacing.mjs`
  (the shared scripts, as Italy did), not Peru-local copies.
- No new packages. Phaser isn't needed: every activity has only a handful of moving things plus small particle sets.
- Smoke test: the finale button is a real button with the label `Party`; dev hooks for stamp-all and win still work.

## Art list (`art/source/world/peru/`, style per `art/STYLE.md`, generated with Codex)

Camera: every play scene is a straight-on eye-level side view ("straight-on eye-level side view, no top-down, no 3/4,
no perspective tilt" in every prompt); the hub is a separate cartographic map. No text in images. Scenes as layers.

- `cover.png` (Sparkle and Luna in the balloon over the Andes), `bg-hub-map.png`.
- Reference portraits (one each, for puppets): Luna, Paco, Abuela Killa, Pepa, Lobo, Coco, Pluma, Rosa, Tika.
- Andes meadow layers; coast layers (desert sky, Candelabra hill, rocky island, ledge with burrow); canyon layers (tall
  walls, ledges, lookout, waterfall); Amazon layers (canopy, trunks, bank, lagoon); Machu Picchu layers (peaks, city,
  mountainside); finale sunset sky layers.
- Sprites: chicks, divers, Inca tern, crab, pelican, tour boat, viscacha, sloth, capybaras, monkeys, macaws, frogs,
  giant lily pads, llamas, spectacled bear, cock-of-the-rock, stones (or SVG), seed bags, cactus, basket.
- Run `npm run art -- world`, the contact sheet, and `node scripts/qa-art.mjs` (penguin and llama legs and the condor's
  wing feathers are likely white-hole spots).

## Build order and gates (one activity per PR)

Same gates as every country (`ACTIVITY-TEMPLATE.md`), and Dad's staged visual approvals:

1. **Hub + Luna's Fluffy Day** first. It sets up Luna (the friend in every activity) and the hub. Greybox: the puff
   alpaca, brush and clippers. **Stop: Dad plays it on the iPad.**
2. Then one activity per PR, each starting with a greybox Dad plays before any art: Penguin Cliff (riskiest feel: the
   pull and splash), Canyon Glide, Rainy River, Mountain Terraces.
3. The finale in its own PR once all five exist. Until then the balloon says "Our expedition opens soon!" and the
   country doesn't award its trophy.

For each activity, at each gate: art and puppets next to their references, then the full loop with voices, then
layout-qa (Haiku) and playtest-qa (Opus) against the fun check in `docs/play-design.md`.

## Sources to check facts against

- Humboldt penguins, sea lions and Inca terns at the Ballestas Islands and Paracas: peru.travel, Paracas National Reserve.
- Condors and morning thermals at Colca Canyon: [peru.travel](https://www.peru.travel/experiences/visiting-colca-canyon-and-spotting-condors).
- Pink river dolphins and the flooded forest at Pacaya-Samiria: [peru.travel](https://www.peru.travel/stories/pacaya-samiria-all-you-have-to-know-about-this-peruvian-amazon-paradise).
- Machu Picchu: [UNESCO](https://whc.unesco.org/en/list/274). Languages: [peru.travel](https://www.peru.travel/yourperfectperu/about-peru/language).
- Flag: three vertical red-white-red bands ([El Peruano](https://busquedas.elperuano.pe/dispositivo/NL/2363369-4)).
- Cochineal dye, alpaca colors, potato varieties (International Potato Center, Lima): verify the exact wording of each
  fact line before recording.
