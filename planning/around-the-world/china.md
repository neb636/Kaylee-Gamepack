# China: "Bao Bao's Dragon Parade" (plan)

Status (2026-09-28): **everything in this plan is built** in `src/world/places/china/`: the scroll map, all seven
activities (Dumpling House, Bamboo Forest, Great Wall, Hotpot Night, Magic Brush, Great Race, Bullet Train), the Dragon
Parade finale, 16 passport facts, 7 coloring pages, and 14 real videos (one after each activity, the rest in the Theater
and pinned as postcards on the scroll map). Still open: the questions for Dad at the bottom (her zodiac animal is
`KAYLEE_ZODIAC = 'ox'` in `activities/race/GreatRace.tsx`), and listening to the Mandarin clips on the iPad.

## The story in one breath

Bao Bao, a baby giant panda, is getting ready for **Chinese New Year** (Spring Festival). At midnight the village
has a **dragon dance parade**, but the paper dragon is just a head. Every friend Kaylee helps comes to hold up one
piece of the dragon's body. Seven stamps make a long dragon. Then Kaylee leads the parade under red lanterns and
lights the fireworks, and Bao Bao gives her a **red envelope** with her trophy inside.

The payoff grows on the hub map where she can see it: the dragon gets one segment longer (with a friend's legs under it) after
every activity. That is the "castle gets taller" of this country.

## Not a clone of Australia (or Egypt)

What the other countries already do, and what China does instead:

| Already used | Where | China does instead |
|---|---|---|
| Tap N times to hop / pull (counting taps) | Outback, Nile | Swipe **up** to grow bamboo; **drum on the beat**; **spin** a round table |
| Feed an animal N items | Koala, croc | Hotpot: cook food, wait until it's ready, then **serve** it by spinning the table to each guest |
| Hide-and-seek in a scene | Reef, Passage | **Scroll a long panorama** (the wall is too long for one screen) |
| Stack stones by size | Pyramid | **Patterns** (red, gold, red, gold, ?) to repair the Great Wall |
| Recipe in order | Koshari | **Ordinal numbers** (first, second, third) in the Zodiac race |
| Press-and-hold stamp matching | Scribe | **Brush painting** with a finger (perfect-freehand): a character turns into the thing it means |
| Rub sand to reveal | Sphinx | Water-brush writing that **fades** like the real park calligraphy |
| Party = guests arrive one by one | Party, Light show | She **drives** the dragon: drag the head and the body follows like a snake, then fireworks |
| Map with pins | Hub | Map painted like an **unrolling scroll**; spots are **red lanterns** that light up when done |
| Recipe = pick the next ingredient | Koshari | Dumpling House: every step is a **different finger move** (squish, stretch, chop, roll, circle to pleat), then steam, then serve to tables. Hotpot is a family meal (serve what each person asks for); the Dumpling House is working in a real kitchen (make it from scratch). |
| Passport stamps | StampEarned | Same component, but styled as a **red chop seal** (Chinese name seals are real) |

## Friends (cast.json)

All speak English with a light, warm Mandarin accent and say Chinese words correctly. Sparkle stays the guide who gives
instructions.

| Speaker | Who | Voice idea | Puppet or Buddy |
|---|---|---|---|
| `baobao` | Bao Bao, a baby giant panda girl (~4). Giggly, clumsy, always hungry, rolls instead of walking | nova +3 | **Puppet** (main): round ears, eye patches, arms that hug bamboo, munching jaw, a *roll* action (tumbles like a ball), *sneeze*, *climb* |
| `longlong` | Long Long, the paper dragon's head. Kind, bouncy, proud. Chinese dragons bring rain and luck, they don't breathe fire | onyx 0 or ash +1 | **Puppet**: jaw, springy whiskers and mane, blinking eyes. Body = chain of segments that follow the head |
| `houhou` | Hou Hou, a golden snub-nosed monkey. Cheeky, sorry for knocking bricks off the wall | ash +3 | **Puppet**: long tail on `spring()`, swinging arms, blue face |
| `hong` | Hong, a red panda. Shy, stands up on his back legs to look big when surprised (real behavior) | echo +4 | Puppet if time, else Buddy |
| `nainai` | Nai Nai (Grandma) Panda, hosts the hotpot. Warm, laughing | fable -1 | Buddy |
| `crane` | Lady Crane, red-crowned crane from ink paintings. Gentle, graceful | sage 0 | Buddy |
| `mouse` / `ox` | Zodiac racers: tiny squeaky rat, slow deep friendly ox (plus tiger, rabbit, dragon as Buddies) | shimmer +4 / ash -3 | Buddies |
| `tiger` | Amur tiger at the snowy train stop. Big, soft, a little shy of the cold (funny) | onyx -1 | Buddy |

Pronunciation: TTS may say Chinese words wrong. Write them the way they sound in `lines.ts` ("Nee how!", "Shyeh shyeh!",
"Ee, arr, san!") and show the real spelling (你好 nǐ hǎo) in the on-screen text for Dad. Check the transcription flags in
`generate-voice.mjs` and listen to every Mandarin clip on the iPad. Audition first:
`node scripts/voice-audition.mjs baobao nova shimmer coral`.

## Hub: the scroll map

- Opens by **unrolling a paper scroll** (a quick roll-open animation) showing China in a soft ink-and-pastel style:
  snowy northeast, the Great Wall zig-zagging across the north, the Gobi desert and camels in the northwest, the
  Himalayas in the southwest, bamboo mountains in Sichuan, pointy karst hills and the Li River near Guilin, a beach
  island (Hainan) in the south, Beijing and Shanghai on the east.
- The 7 spots are **red paper lanterns** (Shanghai's sits on the east coast by the sea and is a little bigger, with a steamer-basket icon). Unvisited lanterns sway, finished ones glow gold with the friend's face.
- The paper dragon lies along the bottom of the scroll: head only at first, one segment added per stamp (with that friend's legs peeking out).
- Ambient life: a kite drifts across, lanterns sway, cherry/plum blossom petals fall, a crane flies past now and then.
- Intro (under 6 s): Bao Bao: "Nee how, Kaylee! I'm Bao Bao!" / "Nee how means hello! Help me get ready for New Year?"

## The seven activities (any order; 1-6 take 45-90 s each, the Shanghai Dumpling House takes about 3-4 min in three short services; each gets harder as it goes)

### 1. Bamboo Forest 🎋 (Sichuan: pandas)
- **Story**: Bao Bao: "My tummy is rumbling! Pandas eat bamboo all day!"
- **Play**: bamboo shoots poke out of the ground. **Swipe up** on a shoot to grow it one segment ("whoosh-pop").
  Round 1: "Grow this one three tall." Round 2: two shoots, "Make the **tallest** bamboo!" / "Which one is
  **shorter**?" (measurement words: tall, taller, tallest, short).
- **Payoff**: Bao Bao climbs the tallest bamboo, it bends, and she **tumbles down rolling** into a pile of leaves,
  sits up, and munches (crunch sounds, jaw puppet). Tapping Bao Bao makes her roll.
- **Real facts**: bamboo is one of the fastest-growing plants in the world; pandas eat for about half the day; panda
  babies are born tiny, about as big as a stick of butter.
- **Sticker**: giant panda.
- New tech: a swipe-up gesture (`usePointerDrag`, direction + distance), segmented bamboo SVG that grows with a spring.

### 2. The Great Wall 🧱 (near Beijing)
- **Story**: Hou Hou: "Oops! I knocked bricks off the Great Wall!"
- **Play**: the wall is a **long panorama wider than the screen**; Kaylee drags the landscape sideways to follow
  Hou Hou along the wall (the wall is so long it can't fit, which is the lesson). At each gap, the bricks follow a
  **pattern** and she drags in the missing one: AB (red, gold, red, gold, ?), then ABB, then ABC. Wrong brick:
  wiggle, Hou Hou shakes his head, then the next brick in the pattern glows and Sparkle says the pattern out loud.
- **Payoff**: the last gap reaches a beacon tower. Tap it and a signal fire lights, **jumping tower to tower** along
  the wall into the mountains (soldiers really sent smoke signals this way).
- **Real facts**: the Great Wall winds over mountains like a sleeping dragon; it's thousands of miles long and very
  old; it was built to protect China.
- **Sticker**: golden snub-nosed monkey.
- New tech: horizontal pan (drag scrolls a wide container; stays calm on iPad, no inertia fights).

### 3. Hotpot Night 🍲 (Chongqing/Sichuan: food)
- **Story**: Nai Nai: "Hotpot time! Everybody cooks together!"
- **Play**: round family table with a **lazy Susan** and a bubbling **split pot**: red spicy side, white mild side.
  1. Drop food into the pot (tofu, noodles, mushrooms, dumplings, bok choy). It bobs and bubbles, then **sparkles
     when it's cooked** (a gentle few seconds, never burns).
  2. Scoop it out with big chopsticks (tap chopsticks, then tap the sparkly food; dragging works too).
  3. **Spin the lazy Susan** with a finger to bring the bowl to the friend who asked. Requests get harder:
     "Bao Bao wants noodles" → "Hong wants something green from the mild side" → "Nai Nai wants two dumplings".
- **Language**: each friend says "Shyeh shyeh!" (谢谢 thank you); Sparkle teaches it.
- **Real facts**: hotpot is shared from one pot in the middle; people eat with chopsticks; Sichuan spicy peppers make your
  lips tingle; round tables mean everyone can reach and nobody sits at the head.
- **Sticker**: red panda (Hong stands up on his back legs when the pot bubbles).
- New tech: rotational drag (angle from center, snaps to the nearest seat with a click), a "cook meter" per item.

### 4. The Magic Brush 🖌️ (Guilin: characters and ink painting)
- **Story**: based on the Chinese folk tale **Ma Liang and the Magic Paintbrush**, where everything he paints comes to
  life. Lady Crane: "This magic brush makes pictures come alive!"
- **Play**: on a stone by the Li River (people in Chinese parks really write with **water brushes** on stone, and the
  writing slowly fades), she traces a big Chinese character with her finger (glowing stroke guides, one stroke at a
  time). When it's finished, the character **morphs into the thing it means**:
  - 人 person → a little person waves; 山 mountain → the three strokes grow into the pointy Guilin hills
  - 日 sun → the sun rises; 木 tree → a tree grows, a bird lands
  - Harder: 大 big (a person stretching arms wide) → Bao Bao copies the pose; 月 moon → the moon rises for night.
- **Payoff**: the painted things stay in the scene and build a finished ink painting. The water writing fades (sparkles)
  and the scene stays. Last moment: her name appears, brushed in Chinese: 凯莉 (Kǎi lì) and stamped with a red chop.
- **Real facts**: Chinese isn't written with an alphabet; each character is a word or idea, and some started as pictures.
- **Sticker**: red-crowned crane.
- New tech: perfect-freehand strokes, hand-authored stroke paths for 6 simple characters (1-4 strokes each; we don't
  need a stroke-order database). Forgiving hit test (fat corridor, any direction OK).

### 5. The Great Race 🐭🐂 (Chinese zodiac)
- **Story**: the Jade Emperor held a race across a river to name the years. Tiny Mouse: "I'm small, but I'm clever!"
- **Play**: animals line up at the river. She helps each one across in the way that fits it:
  - Mouse can't swim, so **drag Mouse onto Ox's back**. Ox swims across (tap Ox to paddle, water splashes), and at the end Mouse
    jumps off first. Mouse wins!
  - Rabbit hops: drag **stepping stones** into the river (small stones for a small rabbit).
  - Dragon arrives late because it stopped to make rain for a thirsty village (tap the clouds to rain).
- Then the **winners' steps** (podium, no losers): "Who came **first**? Put Mouse on the first step." Round 1: first,
  second, third. Round 2: fourth and fifth, plus "Who came right after Ox?"
- **Payoff**: a zodiac wheel fills in with each animal. Then the reveal: "Kaylee, you were born in the **Year of the
  Ox**!" (see open questions) and "This year, 2026, is the Year of the Horse!" A horse gallops across.
- **Real facts**: there are 12 zodiac animals, one for each year; the cat overslept and missed the race (why there's no cat year).
- **Sticker**: ox (or whichever is her animal).
- New tech: ordinal podium targets, riding (one Piece attached to another).

### 6. Bullet Train 🚄 (climate: China is huge)
- **Story**: Bao Bao: "China is so big! Let's ride the super-fast train!"
- **Play**: push the **throttle lever** up and the bullet train zooms (landscape streams past, wind noise). It stops at
  very different places, and at each stop she gives Bao Bao what she needs:
  - **Harbin**, far north: snow and ice castles → mittens and a hat (an Amur tiger shivers until she gets a scarf too).
  - **Hainan**, far south: hot beach, palm trees, coconuts → sun hat and a swim ring.
  - **Gobi Desert**: sunny days, cold nights → water, then a blanket (Bactrian camel with two humps).
  - Harder: **the Himalayas**, the tallest mountains in the world → pick the thing that fits (a warm coat; a yak says hi).
- Wrong item → the train toots, Bao Bao giggles ("Mittens at the beach? Silly!"), and the right item glows.
- **Real facts**: China is so big that one part can be snowy while another is a hot beach on the same day; it has four
  seasons; China's fast trains are some of the fastest in the world.
- **Sticker**: Amur (Siberian) tiger.
- New tech: throttle lever (vertical drag with detents), parallax streaming background (`useGameLoop` + refs).
- Why this isn't a copy of Outback packing: Outback was one hot place; this contrasts four climates in one trip, and
  she drives.

### 7. Dumpling House in Shanghai 🥟 (the big one: city, chef, restaurant)

This one is **longer and more polished on purpose**: about 3-4 minutes, in three short "services" she can stop between
(progress saved with `useSaved`, so leaving and coming back continues where she was). It's the showpiece of China.

**Why Shanghai:** it's China's biggest city, and it's home to **xiaolongbao** (小笼包, "little basket buns"), the soup
dumplings in the reference picture. Its skyline has the **Oriental Pearl Tower, a tower with big pink balls** (made for
Kaylee), plus the twisty Shanghai Tower, the Bund riverfront, and the old town around **Yu Garden** with curved roofs, red
lanterns and a zig-zag bridge. Nanxiang, a town just outside Shanghai, is where xiaolongbao come from.

#### Look and feel: kawaii dumplings

Match the reference: soft **cream dough** (#F6E6D8, peach shading #F2CDB5 at the bottom), **warm brown outlines**
(#7A4A2E, rounded ends) instead of near-black, **pink blush** ovals (#F7B8B8), tiny dot or arc eyes, small smiles, pleats
drawn as a few curved brown lines at the top. Everything in this activity (kitchen props, steamers, customers) uses the
same softer brown line so the dumplings don't look pasted in. Write this palette into the art prompts for this
activity's pictures as an addition to `art/STYLE.md` (same flat style, warmer outline color).

**The dumplings are characters, built in SVG in code** (not generated pictures), because every dumpling changes as she
makes it and there are dozens on screen. One `Dumpling` component with these states:
`dough ball → flat wrapper → filled (lump in the middle) → pleated (eyes closed, sleepy) → steaming (wobbling, "ooh" mouth)
→ cooked (shiny highlight, eyes open, big smile, blush) → eaten (happy squeak, a little "puff" of steam)`.
Expressions like the reference picture: `happy` (open laughing mouth, arcs for eyes), `smile` (dot eyes), `content`
(closed arc eyes), `surprised`, `giggle`. Wrapper colors: classic cream, **pink** (beet), green (spinach), yellow (egg);
colored xiaolongbao really exist in Shanghai restaurants.

#### Cast for this activity

| Speaker | Who | Voice idea | Build |
|---|---|---|---|
| `doudou` | **Dou Dou**, a fluffy Pekingese puppy girl (Pekingese dogs come from China and look like little lions). Lives in Shanghai, speedy, loves food, a bit of a show-off about her city | coral +3 | **Puppet**: fluffy ear spring, plume tail spring, tongue, tiny apron later. She's the friend who meets Kaylee |
| `cheffu` | **Chef Fu** (福, "luck"), a big round jolly pig chef: tall white hat, curly mustache, flour on his snout. Famous across Shanghai. Flustered at first ("Aiyo!"), then proud and booming | ash -2 | **Puppet**: hat that wobbles on a spring, mustache that twitches, arms that knead and toss, a belly laugh bounce |
| `lulu` | **Lulu the otter**, Chef Fu's helper, home sick in bed. Only appears on a phone screen / at the finale ("Achoo! Thank you!") | shimmer +3 | Buddy |
| customers | **Grandpa Turtle** (slow, reading a newspaper, orders "just four, please"), **the Bunny Twins** (giggly, order matching colors), **Mrs. Goose** (fancy hat, very polite, the "important guest"), **Bao Bao** (surprise cameo, orders a LOT) | fable -2, nova +4 (both), sage 0, nova +3 | Buddies seated at round tables; Bao Bao reuses her puppet |

#### Story beats and play (three services)

**Arrival (under 6 s of talk, then hands busy).** Sparkle's balloon floats down onto **the Bund** at dusk: the river,
boats with lights, the pink-ball Pearl Tower across the water. Dou Dou bounds up:
Dou Dou: "Nong hao, Kaylee! That's hello in Shanghai!" / "Chef Fu needs help! His helper is sick!"
Tap Dou Dou (or anywhere) and she runs ahead. A quick **pan through old town**: curved roofs, lanterns, the zig-zag bridge
(tap the bridge and they zig-zag across; folk story: bridges zig-zag so bad luck can't follow you). The restaurant door
has a big steamer sign. Chef Fu bursts out covered in flour: "Aiyo! So many hungry customers, and no helper!"

**Service 1: Grandpa Turtle's first order (guided, one dumpling at a time, teaches every step).**
The order ticket is a picture: 4 cream dumplings. Each step is a different finger move, and each one is short:
1. **Knead**: push the dough ball with a finger; it squishes and springs back ("squish!"). Chef Fu counts the pushes with
   her ("Yi! Er! San!"). Three pushes and it turns smooth and shiny.
2. **Roll the snake and cut**: swipe the dough into a long snake, then **tap to chop** it into pieces (4 chops, 4 pieces;
   a real cleaver sound, no danger shown).
3. **Rolling pin**: drag the pin back and forth; the ball flattens into a round wrapper that grows with each pass.
4. **Filling**: tap the bowl to drop **one spoonful** in the middle. Too many taps → the filling blorps out the side, Chef
   Fu giggles, and she scoops it back. It never fails, and it teaches "just one".
5. **Pleat** (the signature move): **circle her finger around the dumpling**. Every lap pops pleats on with happy clicks
   and the top twists shut. The dumpling **closes its eyes and smiles**. Chef Fu: "Real chefs make eighteen folds!"
   (He's famous for it; she only has to circle.)
6. After the first dumpling she's shown, Chef Fu's hands speed up and make the rest (so it stays short), and she only
   pleats the other three. Counting: "One, two, three, four dumplings!"
7. **Into the steamer**: drag each dumpling onto the cabbage leaf in the bamboo basket (the leaf keeps them from
   sticking, which is real). Put on the lid.
8. **Steam**: the wok of water below starts to bubble; tap the flame knob. Science moment, spoken once: "The hot water
   turns into steam. Steam cooks the dumplings!" While it steams, she **pops the steam puffs** that float up (each pop
   plays a note; about 8 seconds) and the dumplings wobble inside the basket and peek out from under the lid.
9. **Lift the lid**: a big whoosh of steam. The dumplings are shiny and puffy, eyes open: "Ta-da!" (confetti burst).
10. **Serve**: carry the basket out to the **dining room** and drop it on Grandpa Turtle's table. He shows how to eat one
    (the soup inside is hot!): **nibble, sip the soup, then eat**, with a spoon and ginger. Grandpa Turtle: "Hao chi! Delicious!"

**Service 2: the lunch rush (she does more herself, colors and counting).**
The dining room fills up. Two tickets hang at once:
- The Bunny Twins: "Two **pink** and two **green**, please!" She picks the right colored dough from the dough bowls
  (pink, green, cream, yellow), then does roll → fill → pleat herself (knead and chop are skipped now, so it doesn't
  drag).
- She **stacks the steamer baskets**: one basket per order, stacked two high on the wok (real dim sum kitchens stack them).
  Top basket = Bunny Twins, bottom = Mrs. Goose; the tickets clip to the baskets so she can see which is which.
- Serve each basket to the right table; a wrong table gets a polite head shake ("Not mine, dear!") and the right
  customer's ticket bubble glows.
- **Tea tap** (real custom in southern China): when Dou Dou pours tea, tap the table twice with two fingers to say thank
  you. A tiny, optional, delightful moment.

**Service 3: the surprise big order (a little harder, and funny).**
The door jingles. It's **Bao Bao** with her tummy rumbling: "Five dumplings, please! No, SIX!" She makes a **six**-dumpling
basket in her favorite colors (free choice: this is the "decorate" moment), counting as each goes in. Meanwhile **Hou Hou the
monkey** (running gag from the Great Wall) sneaks a dumpling off the counter; she taps him and he puts it back
sheepishly. That's her one "catch" moment, and it's optional.

**Payoff.** The whole restaurant claps. Chef Fu gives her a **tiny chef hat** (it stays on Sparkle's head / in her saved
look, and appears in the finale) and a steamer of dumplings for the New Year parade: "Xie xie, Chef Kaylee!" Lulu waves from
the phone: "Achoo! Thank you, Kaylee!" Stamp + sticker.

#### The dining room (show people eating dim sum)

The dining room is where the "alive" budget goes: round tables with lazy Susans, red lanterns, a big window with the
Pearl Tower glowing pink outside. Customers eat for real: they slurp soup from spoons, blow on hot dumplings, and cheek-puff and
wiggle happily. A **dim sum cart** rolls between tables carrying other dim sum (each tap-to-hear with a one-line name):
har gow (shrimp dumplings), char siu bao (fluffy buns), egg tarts, sesame balls, spring rolls. Lanterns sway, steam
curls up from every table, and a "ding" plays when an order is served. Tapping any customer gets a reaction line.

#### Real things it teaches

- Shanghai is China's biggest city, by a river, with very tall towers (and one with pink balls).
- Xiaolongbao means "little basket buns"; they have soup inside, and there's a right way to eat them (nibble, sip, eat).
- Dim sum is lots of little dishes shared at the table, often with tea.
- Steam is hot water turning into a cloud, and it cooks food (early science: states of water).
- Sequencing (dough → wrapper → filling → pleat → steam → serve), counting to 6, matching color + count orders.
- Words: nong hao (Shanghai hello), hao chi (delicious), xie xie (thank you), yi er san.

#### Tech notes

- `Dumpling.tsx` SVG puppet with `state` + `face` props, pleats drawn as N curved paths revealed by the pleat gesture,
  squash on landing, wobble while steaming.
- Gestures: press-squish (pointerdown scale spring), swipe-to-stretch (horizontal drag length), tap-chop, back-and-forth
  drag (count direction reversals), **circular gesture** (accumulate angle around the dumpling's center; a lap =
  2π, forgiving radius), drag-to-target for dumplings and baskets (`PlayArea` + `Piece`, many quick drags).
- Steam particles: CSS/`useGameLoop` puffs, tappable. Stackable baskets as `Target`s with ticket clips.
- Scenes: `bg-shanghai-bund` (arrival), `bg-shanghai-oldtown` (wide pan, zig-zag bridge), `bg-dumpling-kitchen`,
  `bg-dumpling-dining` (window with the Pearl Tower). Customers are generated Buddies; Dou Dou and Chef Fu are puppets.
- Each service is its own component (`Service1`, `Service2`, `Service3`) under `activities/dumplings/`, with a shared
  `Kitchen` layout and `useSaved('china-dumplings-service')`. `setProgress` counts dumplings served across all three.
- Pacing target: less than 6 s of talk before her first touch, and no step longer than about 15 s. Run `qa-pacing` on this
  activity alone.
- Sticker: **Pekingese puppy** ("Pekingese dogs come from China and look like tiny lions!").

## Finale: the Dragon Parade (route `party`, aria-label "Party")

1. Night, red lanterns, the village street. Long Long's head plus all seven body segments, each carried by a friend she
   earned (Bao Bao, Hou Hou, Hong, Lady Crane, Mouse & Ox, the Tiger, Dou Dou & Chef Fu). Chef Fu hands out New Year
   dumplings along the route (families in northern China eat dumplings at New Year; they're shaped like gold for luck).
2. **She drives the dragon**: drag the head around a loop, and the segments follow the path like a real dragon dance
   (chain-follow, each segment trails the one before). Each friend pops a line as they pass ("Shyeh shyeh for the
   hotpot!").
3. Drum and gong beats: tap the big drum on the beat and the dragon dances (a short rhythm moment; every tap counts).
4. **Fireworks** (invented in China): tap the sky and fireworks bloom where her finger is (pink ones too).
5. The **flag** rises on a rope beside the stage: red with one big gold star and four small ones. Kept to one tap and a
   spoken line, because Australia already has a star-flag activity.
6. Bao Bao hands her a **red envelope** (hóngbāo). She taps it open and the shell's trophy ceremony starts (`onWin()`).
   "Sheen nyen kwy luh, Kaylee! Happy New Year!"

## Facts page (passport, tap to hear)

| Icon | Label | Line (short, Sparkle unless noted) |
|---|---|---|
| 👋 | Nǐ hǎo! | "In China, people say nee how! It means hello!" |
| 💖 | Xièxie! | "Shyeh shyeh means thank you!" |
| ✋ | 1, 2, 3 | "One, two, three in Chinese: ee, arr, san!" (optional: Chinese one-hand number signs, which are real and fun) |
| 🌦️ | Weather | "China is so big, it can snow in the north while it's beach weather in the south!" |
| 🧱 | Great Wall | "The Great Wall is super long and very old. It winds over the mountains like a dragon!" |
| 🐼 | Pandas | "Giant pandas live in bamboo forests in China. They eat bamboo almost all day!" |
| 🧧 | New Year | "At Chinese New Year, families eat together and give red envelopes!" |
| ❤️ | Red | "In China, red is the color of luck and happiness!" |
| 🐉 | Dragons | "Chinese dragons are kind! They bring rain and good luck." |
| 🥢 | Chopsticks | "People in China eat with chopsticks!" |
| 🪁 | Inventions | "Paper, kites and fireworks were first made in China!" |
| 🏙️ | Shanghai | "Shanghai is China's biggest city! One tower has big pink balls!" |
| 🥟 | Dumplings | "Xiaolongbao are little dumplings with soup inside! Nibble, sip, then eat!" |
| 😋 | Hǎo chī! | "Hao chi means delicious!" |
| 🚩 | Flag | "China's flag is red, with one big gold star and four little stars!" |
| 👨‍👩‍👧 | People | "More people live in China than almost anywhere in the world!" |

## Things you didn't list, now in the plan

- **Shanghai**: the Oriental Pearl Tower (pink balls!), the Bund, Yu Garden's zig-zag bridge, Shanghainese "nong hao",
  xiaolongbao from nearby Nanxiang, how to eat a soup dumpling, dim sum carts, the two-finger tea tap.

- **Chinese New Year + red envelopes + lucky red**: the whole story frame, and the hongbao holds the trophy.
- **Zodiac animals and the Great Race** folk tale, plus *her* zodiac animal (kids love "which animal am I?").
- **Chinese characters as pictures** (山 looks like a mountain) and the **Ma Liang magic paintbrush** folk tale.
- **Water-brush calligraphy** that fades, a real thing in Chinese parks.
- **Her name in Chinese** (凯莉) on a red **chop seal**, which becomes the stamp style.
- **Kind rain-bringing dragons** vs. fire-breathing ones, and the **dragon dance**.
- **Inventions**: fireworks, kites, paper (fireworks in the finale; kite drifts over the hub).
- **Bullet trains** and **how big China is**: snow in Harbin and a beach in Hainan at the same time (climate lesson).
- **Other animals** besides pandas: golden snub-nosed monkey, red panda, red-crowned crane, Amur tiger, Bactrian
  camel, yak.
- **Places** besides the Great Wall: Sichuan bamboo mountains, Guilin karst hills and the Li River, the Harbin Ice
  Festival, Gobi desert, Himalayas, Hainan beaches.
- **Table culture**: round tables with a lazy Susan, sharing from one pot, chopsticks.
- **Math woven in**: tall/taller/tallest (bamboo), patterns (wall), ordinal numbers (race), counting in Mandarin,
  matching requests (hotpot).
- **Moon Festival** (Mid-Autumn): mooncakes, lanterns and the Jade Rabbit on the moon. It was on 2026-09-25, two days
  ago, so it's timely if Dad wants to swap it in (see backlog).

## Backlog / swap-ins (not in the first build)

- **Moon Festival**: press mooncake dough into a mold (press and hold, pop it out with a pattern), cut it into 4 equal
  pieces to share (equal parts), light lanterns up to the moon where the Jade Rabbit lives. Could replace the Bullet
  Train or the Race.
- **Dragon Boat Race**: rhythm drumming to paddle, zongzi rice dumplings wrapped in bamboo leaves.
- **Paper cutting (jiǎnzhǐ)**: fold, snip, unfold a symmetric design (symmetry!), which could be the coloring/craft extra.
- **Tangram** animals (shapes) in a tea house; **tea picking** on terraced hills.
- **Kite festival** (Weifang): decorate a kite with `StickerBoard`, then fly it by pulling the string on each gust.
- **Silkworms**: egg → caterpillar (eats mulberry leaves) → cocoon → moth, then spin the silk thread (life cycle science).
- **Music**: guzheng/erhu notes, gong.

## Coloring pages (`bg-color-*`)

Bao Bao hugging bamboo · Chef Fu and a steamer of smiling dumplings · the Shanghai skyline · the Great Wall with a beacon tower · Long Long the dragon · a lantern + red envelope · her zodiac animal.

## Videos (Theater)

Pick real, kid-safe YouTube clips when building (IDs TBD, don't guess them): pandas at the Chengdu panda base
(after Bamboo), the Great Wall from above (after Wall), a Chinese New Year dragon/lion dance (after the finale or
Race), hotpot (after Hotpot), xiaolongbao being made and the Shanghai skyline (after the Dumpling House), a bullet train (after Train), an overview of China.

## Art list (`art/source/world/china/`, style per `art/STYLE.md`, generated with Codex)

- `scene-china-map.png` (scroll-style map, no text), `bg-bamboo`, `bg-great-wall-wide` (extra wide panorama),
  `bg-hotpot-table` (top-down-ish round table), `bg-li-river` (karst hills, stone slab in front), `bg-river-race`,
  `bg-train-harbin`, `bg-train-hainan`, `bg-train-gobi`, `bg-train-himalaya`, `bg-parade-night`.
- Character references for puppets: `baobao.png`, `longlong.png`, `houhou.png`, `hong.png`.
- Buddies and props: nai-nai, crane, mouse, ox, rabbit, tiger, horse, camel, yak, bullet train, lantern, red envelope,
  hotpot foods (tofu, noodles, bok choy, mushroom, dumpling), clothing items, stepping stones.
- Shanghai (activity 7): `bg-shanghai-bund`, `bg-shanghai-oldtown` (wide), `bg-dumpling-kitchen`, `bg-dumpling-dining`;
  references `doudou.png`, `cheffu.png`; Buddies grandpa-turtle, bunny-twins, mrs-goose, lulu; dim sum cart items
  (har gow, char siu bao, egg tart, sesame ball, spring roll), steamer basket, wok, rolling pin, cleaver, dough bowls.
  Kawaii brown-outline palette (see activity 7). Dumplings themselves are SVG in code.
- **No flags** (use `kit/Flag` `china`, which already exists) and **no Chinese characters in images**. Render 你好,
  凯莉 and the traced characters as HTML/SVG text. The iPad has PingFang SC; test that the glyphs show.

## Build order

1. Folder skeleton copied from the kit patterns (meta, Place, lines, cast, art.ts), hub scroll map, StoryBeat intro,
   finale stub with the `Party` label. Add the pin to meta and remove `china` from `COMING_SOON`.
2. Art batch 1 (map, Bao Bao ref, bamboo, wall) → `npm run art -- world` → contact sheet.
3. Bao Bao puppet (roll, climb, munch, sneeze, cheer) with screenshot + filmstrip passes. Long Long puppet + chain body.
4. **Shanghai Dumpling House first** (the showpiece gets the most polish time): `Dumpling` SVG + faces, Dou Dou and
   Chef Fu puppets, then Service 1 end to end, a playtest-qa pass, then Services 2-3 and the dining room life.
5. Then the others (most reusable tech first): Bamboo → Wall → Magic Brush → Hotpot → Race → Train.
6. Finale: dragon chain-follow, drum, fireworks, flag, red envelope → `onWin()`.
7. `node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs`, listen to the Mandarin clips.
8. `npm run check`, then `qa-screens`, `qa-motion`, `qa-pacing`, and the `playtest-qa` agent; fix and repeat.

## Gotchas to respect (from Australia/Egypt)

- Smoke test: finale route `party` with aria-label exactly **"Party"**; at least **2 real `<button>`s** per activity about 800 ms
  after the story is skipped.
- Many quick drags (bricks, food, stones): use `PlayArea`/plain pointer events, not motion `drag` that unmounts on
  drop (WebKit dead-drag bug).
- The panorama pan and lazy Susan spin need `touch-action: none` and must not fight Safari's back-swipe.
- Talk before first touch under ~6 s; tap anywhere skips story.
- Respectful portrayal: real clothing and customs, no caricature accents or stereotypes, no politics. Keep the flag line
  factual and simple.

## Open questions for Dad

0. Seven activities plus a 3-4 minute Dumpling House makes China the longest country so far (all in any order, so
   she can spread it over several days). OK, or trim one of 1-6 later if it feels long?

1. **Kaylee's birthday month.** Born in 2021 means **Ox** if on or after Feb 12, 2021, or **Rat** if before. The Race payoff
   says her animal.
2. OK to show her name as **凯莉 (Kǎilì)**? It's the common Chinese spelling for Kaylee/Kylie. Worth a quick check with a
   Mandarin speaker you know.
3. Keep **Bullet Train** (climate) or swap in the **Moon Festival** (timely, mooncakes, Jade Rabbit)? Climate is on
   your list, so the plan keeps the train.
4. Finale framing: **Chinese New Year dragon parade** (planned) vs. a Lantern Festival night. They're very similar; New Year
   fits the red envelope + trophy best.
