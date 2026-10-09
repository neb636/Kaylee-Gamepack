# Italy: "Lupa Sings at the Opera" (plan)

Status: 2026-09-28, the boot-map hub and activity 1 (the Pizzeria in Naples) are built. 2026-10-07: the Olive Grove and
the Trevi Fountain are built too (every scene in one eye-level side-view camera; see "One camera per scene" below).
Later on 2026-10-07: the Colosseum (Cesare puppet; the trapdoors are a cutaway of the tunnels under the floor, seen
from the side) is built too. Venice and Etna still say "coming soon". Decisions from Dad: build the Pizzeria in one go (no approval gates), the 1889 storybook shows real
people (Queen Margherita and Raffaele Esposito) in the flat style, and toppings stay veggie + olives (no salami). Folder will be `src/world/places/italy/`. There's no Italy pin in
`COMING_SOON` yet, so add a new one: on `bg-world-map` the boot sits at about **x 48.5, y 31** (just south-west of
the pink castle). Check it on the iPad. `kit/Flag.tsx` needs an `italy` flag (three vertical stripes: green, white,
red). It's easy to draw, and we never generate flags.

**2026-10-08: the rebuild.** The first builds of Venice, Snow on a Volcano and the opera (PR #46) followed this plan
but weren't fun: one-off mechanics, quiz-like choices, lots of talk, layouts that broke on iPhone. From now on each
activity is re-planned with `ACTIVITY-TEMPLATE.md` (read `docs/play-design.md` first) and rebuilt **one per session and
PR**, toy first: a greybox of the core verb that Dad plays on the iPad before any art. Venice is re-planned below
(Sago Mini Boats style). The other activities keep their first descriptions until their own session re-plans them;
treat those as a list of ideas and facts, not a script. Suggested order: Venice, Snow on a Volcano, the opera finale,
then whichever built activity Kaylee likes least.

## The story in one breath

Lupa, an Italian wolf cub, lives in Rome. Every summer there's a big **opera night** in a 2,000-year-old Roman arena
in Verona, and Lupa wants to sing in it more than anything, but all she can do is howl. Each friend Kaylee helps comes
back with a **real Italian instrument** (the mandolin from Naples, the tambourine from Puglia, the Roman horn...)
and joins Lupa's little band. At the Trevi Fountain Lupa makes her wish: "I wish I could sing!" At the finale Kaylee
**conducts** the band with a magic wand, Lupa's howl turns into a beautiful high note, the whole arena shouts
**"Brava, Kaylee!"**, and jets paint Italy's flag across the sky.

The payoff grows on the hub map: a little stage at the bottom where one more friend sits down with their instrument
after every stamp (China's dragon gets longer the same way). The more she plays, the bigger the band.

Why this frame: the words for loud and soft that musicians all over the world use are **Italian** (*forte* and
*piano*). The piano, the violin and opera all come from Italy. "Brava!" is what Italian audiences really shout for a
girl. And a howling wolf who wants to sing is a story a 5-year-old gets right away.

## Not a clone of Australia, Egypt or China

| Already used | Where | Italy does instead |
|---|---|---|
| Tap N times (hop, pull, count) | Outback, Nile | **Flick up** to toss and spin pizza dough into the air |
| Rub to reveal / flood-fill coloring | Sphinx, Postcard | **Paint to cover**: swirl the sauce ladle until the whole base is red (a coverage meter) |
| Recipe in order / multi-step kitchen | Koshari, Dumpling House | Pizzeria: **place toppings anywhere** (`StickerBoard`), **halves** ("olives on this half"), **turn** the pizza in the wood oven, **cut it into halves and quarters** (first fractions) |
| Circle / push / back-and-forth gestures | Dumpling House | **Comb** olive branches downward; **pour** oil up to a line (full, half full) |
| Stack by size / patterns | Pyramid, Great Wall | **Fit arches to gaps** so an aqueduct slopes downhill, then watch real water flow |
| Hide-and-seek in a scene | Reef, Passage | **Roman numeral trapdoors**: "Open door III!" and a friend pops up from under the Colosseum floor |
| Throttle / swipe to move | Bullet Train, Bamboo | **Drive a water taxi**: grab the gondola, steer it, and deliver friends to the **left / right** |
| Free drawing | Magic Brush | **Mirror painting**: paint half a Carnival mask and the other half paints itself (symmetry) |
| Four climates on a train | Bullet Train | **Higher = colder** on one volcano: lead a donkey up Mount Etna from the lemon trees to the snow |
| Party guests arrive / drag lights / drive a dragon | Party, Light Show, Parade | **Conduct**: big wand swings make the band play *forte* (loud), small ones play *piano* (soft) |
| Passport stamp / red chop seal | StampEarned | Stamp styled as a **gold Roman coin** |

## Friends (cast.json)

Everyone speaks English with a light, warm Italian accent and says the Italian words correctly. No cartoon
"mamma mia" accent (at most one "Mamma mia!" from Bruno, when the oven roars). Sparkle stays the guide who gives
the instructions.

| Speaker | Who | Voice idea | Puppet or Buddy | Instrument for the band |
|---|---|---|---|---|
| `lupa` | **Lupa**, an Italian (Apennine) wolf cub girl, ~5. Brave, dramatic, bursts into howls when she's excited, dreams of opera | coral +3 | **Puppet** (main): ears and fluffy tail on `spring()`s, *howl* (head tips back, mouth rounds, tail puffs), *pounce*, *wag*, *bow* | her voice (the singer) |
| `bruno` | **Zio Bruno**, a Marsican brown bear (Italy's own rare bear, from Abruzzo). The pizzaiolo, big and jolly, flour on his nose, famous dough spinner | onyx -2 | **Puppet**: arms that toss and catch dough, belly laugh bounce, chef hat on a spring | mandolin (Naples) |
| `spina` | **Spina**, a crested porcupine (Italy is one of the only places in Europe with porcupines). Bouncy, a bit clumsy: olives get stuck on her quills | nova +4 | **Puppet**: quills puff up and rattle, olives stick to them, *shake* action | tambourine (the *pizzica* dance of Puglia) |
| `cesare` | **Cesare**, a big, slow, proud cat from the ruins of Rome (Rome has a real cat home inside ancient ruins). Wears a leafy crown and thinks he's the emperor. Secretly sweet | fable -2 | Buddy (puppet if time: tail flick, slow blink) | a Roman horn (fanfare) |
| `civetta` | **Professoressa Civetta**, a little owl scientist with round glasses and a telescope, a Venice water-taxi passenger. Curious, says "Let's find out!" | sage 0 | **Puppet**: **head swivel** (owls really turn their heads way around), blinking, wing flaps | passenger in Venice |
| `gino` | **Gino**, a Venetian pigeon gondolier in a striped shirt and straw hat. Sings while he rows (real gondoliers do) | ash +2 | Buddy | accordion (made in Castelfidardo, Italy) |
| `nino` | **Nino**, a little Sicilian donkey. Sleepy, strong, loves lemons | echo +2 | Buddy (puppet if time: ears that droop in the heat, perk up in the cold) | the piano (invented in Italy) |
| customers | **Signora Bufala** (a water buffalo who brings the mozzarella), Lupa, Spina, Gino. The Queen for the 1889 story (see open questions) | ballad -1, lupa, spina, gino | Buddies at the counter | |

Pronunciation: write the Italian the way it sounds in `lines.ts` ("Chow!", "GRAHT-see-eh!", "bwon-JOR-no!", "Oo-no,
doo-eh, treh!", "BRAH-vah!") and show the real spelling on screen for Dad (*Ciao! Grazie! Buongiorno! Uno, due,
tre!*). Check the transcription flags from `generate-voice.mjs` and listen to every Italian clip on the iPad. Audition first:
`node scripts/voice-audition.mjs lupa coral nova shimmer`.

## Hub: the boot map

- **Italy is shaped like a boot**, kicking a ball (Sicily). That's the first thing she learns. Intro: the balloon
  lands, the boot gives a little **kick** and Sicily bounces like a ball (tap the toe to do it again, every time).
- Style: sunny, pastel "summer postcard" Italy. Terracotta roofs, the colorful pastel houses of Cinque Terre, blue sea
  on three sides, the snowy Alps across the top, Venice's canals in the north-east, Rome in the middle,
  Vesuvius by Naples, the cone-roofed **trulli** houses of Puglia on the heel, Etna on Sicily.
- The 6 spots are little **Roman arches**. Unvisited arches have a curtain; finished ones open and the friend peeks out.
  The Pizzeria's arch in Naples is bigger, with a pizza icon.
- The **band stage** runs along the bottom: an empty stage with Lupa alone at first, then one friend and instrument per stamp.
- Ambient life: a Vespa zips along a road and toots, a gondola glides through Venice, Vesuvius puffs a tiny cloud,
  dolphins jump in the sea, sailboats bob.
- Intro (under 6 s): Lupa: "Chow, Kaylee! I'm Lupa!" / "Chow means hello! Help me sing at the opera?"

## The six activities (any order; 1.5-3 min of play each with hands busy, the Pizzeria about 3-4 min in three short services; each gets richer as it goes)

### 1. Pizzeria in Naples 🍕 (the big one: pizza history, the Margherita, the flag)

The showpiece, longer and more polished like China's Dumpling House: three **services** she can stop between
(`useSaved('italy-pizzeria-service')`, so she carries on where she left off). `setProgress` counts pizzas served.

**It's OK to be a cute take on the famous pizza games** (Papa's Pizzeria, Good Pizza Great Pizza): customers at a
counter with **picture order tickets** clipped to a rail, and a row of **station tabs** along the bottom (🧾 Order ·
🫓 Dough · 🍅 Toppings · 🔥 Oven · 🔪 Cut) that light up as the pizza moves along. Instead of a star score, the customer
gives **three hearts**, always, plus a happy dance when it's exactly right.

**Why Naples:** pizza as we know it comes from Naples. Neapolitan pizza is baked in a **wood-fired oven so hot it cooks in
about 90 seconds**, and the art of the Naples pizza maker (dough spinning included) is on UNESCO's list of the world's
special traditions. The mozzarella comes from **water buffalo** that live near Naples. Tomatoes grow in the sunshine
by Mount Vesuvius, and they first came to Italy from America.

**The kitchen steps (each a new finger move):**
1. **Toss the dough**: *flick up* on the dough ball. It flies up **spinning** and comes down bigger (whoosh, flop).
   Tap to catch it, or let it land softly on the flour (no drops, ever). Three tosses make a big round base. Bruno
   spins his too and shows off.
2. **Sauce swirl**: press the ladle in the middle and swirl outward; red paints wherever the ladle goes. A small
   tomato meter fills up; at about 85% covered it's done ("Bellissimo!").
3. **Toppings** with `StickerBoard` (the pizza is the surface, tray on the side): tear-off mozzarella, basil leaves,
   olives (from Spina's grove if she's been there), mushrooms, peppers, cherry tomatoes. Each one says its name when
   she picks it up. The ticket shows what's wanted: a count ("4 olives!") or later **a half** (a pizza picture with only one side colored).
4. **The oven**: drag the long **wooden peel** into the oven's mouth. The fire roars. The side facing the flames puffs
   and turns golden first, so she **taps the peel to turn** the pizza a quarter at a time (real pizzaioli turn it).
   Four turns and it's done: bubbly crust, melty cheese, the pizza's little face smiles (the pizza doesn't need a
   face, but the finished one gets a happy sparkle).
5. **Cut**: drag the pizza wheel straight across. One line = **2 halves**, two lines = **4 quarters**. Lines snap to
   the nearest good cut, so a wobbly finger still makes fair slices.
6. **Serve**: slide the pizza onto the counter; the customer eats a slice (cheese stretch!), and gives their line and hearts.

**Service 1: the Margherita story (1889), told like an old storybook.**
Bruno: "My great-great-grandpa's friend made the most famous pizza ever!" The page turns to old Naples in sepia colors:
a **queen named Margherita** came to visit, and the pizza maker Raffaele Esposito wanted to make her something special.
Kaylee makes it: dough, sauce (red), mozzarella (white), basil (green). When it comes out of the oven, the pizza
**lifts up and turns into Italy's flag**, stripe by stripe: green, white, red. The Queen: "Buonissima!" (so tasty), and
the storybook fills with color. Bruno: "So we named it Pizza Margherita!"
- Honest history note for Dad: this is the famous story (Pizzeria Brandi in Naples still tells it). Historians think
  pizzas with those toppings existed before 1889. The game says "the story says..."

**Service 2: the lunch rush (counting and halves).** Two tickets on the rail at once.
- Signora Bufala drops off a fresh basket of mozzarella ("from my family's milk!") and orders "**five** olives, please".
- Gino orders **half mushrooms, half olives**. The ticket shows it, and a dotted line appears down the middle of
  the pizza. A topping on the wrong half slides gently to the right half, and Sparkle says "Mushrooms go on *this* half!"
- Gino wants it cut in **halves** ("one for me, one for my wife!"). Spina wants hers in **quarters** (4 pieces: "One
  for each paw!").

**Service 3: Kaylee's own pizza (free design, and a funny catch).**
Bruno: "Now make a pizza just for YOU, Chef Kaylee!" Free choice: she can make a **pink** sauce (beet pizza exists!),
build a face or a heart out of toppings, and it's saved to show up at the finale picnic. Meanwhile **Cesare the cat**
tiptoes in and swipes a piece of mozzarella; tap him and he puts it back with a guilty slow blink (a small, optional running gag).

**Payoff.** Bruno spins a giant dough over his head in a big finish, hands her a tiny chef hat (it stays on
Sparkle), and brings his **mandolin** to Lupa's band. Stamp + sticker: **Marsican brown bear**.

**Real things it teaches:** pizza comes from Naples; the Margherita story and the flag colors; mozzarella comes from
milk (even buffalo milk); tomatoes love sunshine; halves and quarters (first fractions); counting toppings.
Language: *buonissimo* (yummy), *grazie* (thank you), *prego* (you're welcome), *uno, due, tre*.

**Fun fact for Dad (and a Sparkle line):** in Italy, *peperoni* means **peppers**. Order a "pepperoni pizza" in
Naples and you get bell peppers! (The spicy salami is called *salame piccante*.)

**Tech notes:** flick = pointer velocity upward past a threshold (`usePointerDrag`); dough scale + spin with motion.
Sauce = canvas mask painted with a round brush and a coarse coverage grid (like `ColoringPage`'s fill check,
but it's brushing, not tapping). Toppings = `StickerBoard` + `countByKind`, plus a "which half" check by angle from
the center. Oven browning = four quarter overlays that fade toward golden, depending on which side faces the fire. Cut =
drag line snapped to multiples of 45°, drawn as an SVG groove. Components: `activities/pizzeria/{Pizzeria, Counter,
Dough, Sauce, Toppings, Oven, Cutter, Storybook, services}.tsx`.

### 2. The Olive Grove 🫒 (Puglia, the boot's heel: olives, olive oil, sunny weather)

- **Story**: Spina: "The olives are ready! Help me pick them for the olive oil!"
- **Scene**: twisty, very old olive trees, red soil, white cone-roofed **trulli** houses (they look like gnome houses),
  big green nets on the ground under the tree (farmers really catch olives this way).
- **Play**:
  1. **Comb the branches**: drag a little hand-rake *down* along a branch and olives rain into the net
     (pitter-patter notes). Some bonk onto Spina and **stick to her quills**; tap Spina and she shakes them off into
     the basket. About 3 branches.
  2. **Green to black**: olives start green and turn purple, then black, as they ripen in the sun. She lines up
     three olives from youngest to ripest (drag into three little cups: green → purple → black). Then Spina tries one
     straight off the tree: "Bleh! Bitter!" (true: fresh olives are too bitter to eat until they're soaked).
  3. **The olive mill** (*frantoio*): drop the olives into the hopper, the big stone wheel rolls and squishes them
     (auto, satisfying crunch). Golden-green oil comes out into a jug.
  4. **Pour to the line**: drag the jug's handle down to tilt it; oil pours while she holds. Bottle 1: "Fill it
     **all the way**!" (it stops by itself at the top, so it never spills). Bottle 2: "Fill it **halfway**." A dotted
     line shows the middle. If she goes past it, Spina giggles and sips a little off the top ("Just a taste!").
- **Payoff**: bread with oil for everyone (*bruschetta*): Spina crunches, the old tree's leaves shimmer, and Spina
  brings her **tambourine** to the band. Tapping the tambourine plays a quick *pizzica* rhythm.
- **Weather taught here**: "Olive trees love Italy's **hot, dry, sunny summers** and don't need much rain." The sun
  in the corner is tap-to-hear.
- **Real facts**: some olive trees in Italy are **more than a thousand years old**; it takes lots and lots of olives to
  make one bottle of oil (on screen: 10 olives drop in for every bottle); olive oil goes on almost everything in Italy.
- **Sticker**: crested porcupine.
- New tech: directional drag along a path (the rake follows the branch's curve), pour = hold-to-flow with a fill level
  and a "halfway" target.

### 3. The Trevi Fountain ⛲ (Rome: ancient Roman aqueducts, a wish)

- **Story**: Lupa: "Oh no! The Trevi Fountain is dry! Where did the water go?"
- **Real legend, made the heart of it**: long ago, a **young girl showed thirsty Roman soldiers where to find a spring**,
  and the Romans built an **aqueduct** (a water bridge) to carry that water all the way to Rome. It still fills the
  Trevi Fountain today, about 2,000 years later. The girl is carved on the fountain. Today *Kaylee* is the girl.
- **Play**:
  1. **Find the spring**: tap the hillside and follow the gurgle (three taps: the sound gets louder, then a spring
     bubbles up).
  2. **Build the aqueduct**: the water channel has to go **downhill all the way**. There are gaps over a valley; she
     drags arches in: a **tall** arch where the valley is deep and a **short** one near the hill. The wrong height
     wobbles, the channel tilts the wrong way, and a drip rolls *backward* (Sparkle: "Water only flows downhill!"),
     then the right arch glows. Three gaps, then four with two heights close together.
  3. **Water on!** Water runs along the whole channel (she can follow it with her finger for splashes) into the city,
     and the fountain bursts to life: horses, shells, a huge splash.
  4. **Toss a coin**: turn around (Sparkle turns her back to the fountain) and **swipe back over the shoulder**. The
     coin arcs up and plops in. Legend: toss a coin and you'll come back to Rome. Lupa tosses one too and makes her
     wish out loud: "I wish I could **sing**!"
- **Payoff**: a wishing star flies from the fountain to the band stage and waits above Lupa for the finale.
- **Real facts**: the Romans built aqueducts, stone roads and cities about 2,000 years ago; coins in the Trevi Fountain
  are collected and given to people who need help; Romans spoke Latin, and Italian grew from it.
- **Sticker**: Italian wolf (Lupa), with the gentle founding legend as its fact: "A long time ago, a kind mama wolf
  took care of twin baby boys, Romulus and Remus. The story says they grew up and built Rome!"
- New tech: height-matched slot targets with a tilt preview; a flowing-water SVG path (dash animation) that goes
  along the channel.

### 4. The Colosseum 🏛️ (Rome: ancient history, Roman numerals, sunny weather)

- **Story**: Cesare: "I am Cesare, Emperor of the Colosseum! Tonight: a SURPRISE show!"
- **Real, kid-friendly history**: the Colosseum held 50,000 people. Under the floor were **tunnels and wooden
  elevators** that lifted surprises up through **trapdoors**. And sailors pulled ropes to open a giant **sun-shade**
  over the crowd on hot days. (No gladiators. It's "big shows long ago.")
- **Play**:
  1. **It's hot!** The crowd fans itself (Rome is **hot and sunny in summer**). Pull three rope handles *down* one at a
     time and the striped sun-shade slides across; the crowd cheers "Ahh, shade!"
  2. **Roman numerals**: the trapdoors are numbered like the Romans wrote them: **I, II, III**. Cesare calls out
     "Door **II**!" She taps the right door, cranks it (a short drag down), and a friend pops up doing a trick (Spina
     juggles olives, Gino spins, a tortoise bows very slowly). Wrong door: the door rattles, Cesare's tail flicks,
     and Sparkle counts the lines together ("Two lines, two!") while the right door glows.
     Round 2 (harder): **IV** and **V** ("V is five! And look: Kaylee, you're **V**!"). Her age appears on a banner.
  3. **Grand finale**: all the trapdoors open at once and the crowd does a stadium wave (swipe across the stands
     to start the wave).
- **Payoff**: Cesare, very moved, gives a slow proud bow and brings a **Roman horn** to the band (tap: a silly
  fanfare).
- **Real facts**: the Colosseum is almost 2,000 years old; Romans wrote numbers with lines and letters (I, II, III,
  V, X); some Roman roads are still used today.
- **Sticker**: Roman cat.
- New tech: rope pull (vertical drag with resistance + snap), numeral-labeled `Target`s, an elevator that rises from
  below the floor mask, and a stadium-wave swipe.

### 5. Venice: Gino's Water Taxi 🛶 (a city on the water, left and right, Carnival masks)

Rewritten 2026-10-08 after the first build missed (see "What went wrong" in `docs/play-design.md`). Model: **Sago Mini
Boats** (grab the boat and go, stop to meet friends, silly boats) and **Toca Boca** (a little world where everything
reacts and nothing is wrong). Uses `ACTIVITY-TEMPLATE.md`.

**One-line pitch:** Gino the pigeon runs Venice's pinkest water taxi; Kaylee drives it up and down the canal, picking
up friends and taking them home, until the whole canal is lit up for the Carnevale fireworks.

**The toy (core verb): grab the gondola and drive it.** She puts her finger on the gondola and pulls: it surges after
her finger with a little water lag, leaves a foamy wake, bobs and tilts, and slows down softly when she lets go.
Pull right and the canal scrolls right; pull left and the boat turns around (a happy little spin) and goes left. Pull it
down a bit and it rides close to the front edge of the water; up a bit and it rides by the houses (two "lanes", so she
can steer around things). Gino rows faster the faster she pulls, and sings when they're going fast.
- How it feels: a bathtub toy. Heavy enough to drift, light enough to bounce off a post with a *boing* and a wobble.
- Why it's fun with no goal: pushing a boat through water and watching the wake and the splashes is fun on its own;
  the canal is full of things to bump into and poke. Greybox test: a brown rectangle on a blue band, posts and boxes for
  houses, a wake made of circles. If dragging that around isn't fun for 30 seconds, tune the feel before anything else.

**How the verb deepens (same verb, three times):**
1. **Cruise (just the toy).** No goal for the first moments: Gino says "Grab my gondola!" and she drives. Mooring posts
   to boing off, pigeons on the posts that scatter, a duck family that follows the boat if she goes slowly. After she's
   driven a bit (or ~15 s), the first friend waves from a doorstep.
2. **Water taxi (deliveries, left and right by driving).** Friends wait on doorsteps along the canal. She steers close
   to a doorstep and they hop in (Lupa, Spina, Cesare, a nonna pigeon with shopping). Each says where they want to go:
   "To the pink house, please!" Sparkle adds **"It's to the LEFT!"** and a left hand glows at the left edge of the
   screen (the hand on the same side as the house). She drives there; when the boat comes near the right doorstep the
   friend hops off with a thank-you and a little gift. If she goes the other way, nothing is wrong: the friend points
   and giggles "Other way!", the hand pulses, and there's more canal to enjoy on the way back. 3-4 rides: first
   the house is on screen, then just off screen, then she hears only "left" or "right" (the house is far away).
   Left and right are the screen's sides, which are also *her* left and right while she holds the iPad, so it's real
   left/right, not the boat's.
3. **Acqua alta (the water rises).** A gentle "bloop bloop": high tide comes in (real: Venice's *acqua alta*). The
   water level climbs, so the bridges get **lower**. Now when a low bridge comes she taps Sparkle (or Gino) to duck; if
   she doesn't, Gino's hat bonks off and floats behind them, and she can drive back to scoop it up (silly, never a
   failure). The pigeons in the square stand in the water in tiny rain boots, and people cross on raised wooden
   walkways (real *passerelle*). Last ride of the tide: take Gino to the mask shop.

**Side verb (one): the mirror mask.** At the mask shop for **Carnevale**, she paints the left half of a mask with her
finger (big brush, 5 colors, glitter) and the right half paints itself like a mirror; then she presses gems on, and each
gets a twin. Short and free: no target pattern, a check button when she likes it. Sparkle wears it at the finale.

**Her choices:** which boat at the start (the real black gondola, a pink swan gondola, a bathtub with a rubber duck,
a pizza-slice boat: silly, Sago-style, and a different one next time); which friend to pick up first (two wave at
once); where to drive between rides; her mask colors and gems.

**Pokeables (all react, none are the answer):** shutters that open (a cat stretches, a nonna shakes out a tablecloth,
a baby pigeon waves), laundry lines that flap, a bell tower that bongs, the duck family (quack and dive), pigeons
(scatter and come back), the **water ambulance** that zooms by (tap: siren and wave, "even ambulances are boats!"),
a **vaporetto** water bus (tap: it toots back), a fire boat that sprays a rainbow arc, the winged lion statue
(tap: a tiny roar), and splashing the water itself.

**Silly moments instead of failure:** bump a post: boing and Gino's eyes spin; go the wrong way: the friend points and
laughs; skip the duck: hat overboard; drive in circles: Gino gets dizzy and sings off-key; drive really fast: big
spray and a "Wheee!".

**Story frame (≤ 2 lines):** Gino: "Ciao, Kaylee! In Venice, the streets are water!" / "Grab my gondola!"
Sparkle talks only when: the first friend waves, a destination is given ("It's to the LEFT!"), the tide starts, the
first low bridge appears, she hasn't moved for ~8 s ("Pull the boat!"), and the mask shop. Friends do the rest in their
own voices with short lines ("Grazie!", "Other way!", "Wheee!").

**What it teaches, by doing:** Venice is a city on water where boats are the cars (she *is* the taxi); left and right
(she drives that way); high water and why bridges matter (she ducks); symmetry (the mirror mask). Tap-to-hear facts
(stamp screen, passport): Venice is built on 118 little islands with more than 400 bridges; there are no cars, so
ambulances, fire trucks and buses are boats; gondolas are black and rowed with one oar; gondoliers sing.

**Payoff (builds while she plays):** each friend she drops off hangs a lantern on the line over the canal, and the
canal fills with light as it gets toward evening; after the mask, it's night: fireworks over the lagoon reflect in
the water, every friend she drove waves from a window, and Gino brings his **accordion** to Lupa's band.

**Replay:** pick a different boat; the friends, their houses and their gifts are shuffled each time; her mask is saved.

**Numbers:** about 30-40 touches in 2-3 minutes (drives count as touches; the duck taps and pokeables add more), nearly
all of them driving or poking, only the destination is a "question", and she answers it by driving. 2 lines before
the first touch.

**Camera and art:** straight-on side view (theater stage), like the other Italy scenes. A canal world about 5 screens
wide that scrolls both ways, built from layers that move at different speeds:
- sky with drifting clouds (slowest), far bell towers and domes (slow), the row of canal houses (the canal's speed),
  mooring posts and a near walkway edge (faster), and the water (drawn in code: moving wave lines, wake and splashes).
- **The houses are separate sprites**, about 8 different facades (pink, butter, lavender, peach... one clearly *the*
  pink house, a mask shop with a striped awning), laid out in code so the street never repeats or mirrors. Shutters,
  laundry and window friends are their own small sprites on top of the facades.
- Bridges (3 heights) and the Rialto as foreground sprites the boat passes under; boats (gondola variants, vaporetto,
  ambulance, fire boat) as sprites. No emoji in the scene; the left and right hands are UI chips drawn in the same style.
- Puppets: **Gino becomes a puppet** (rowing arms, hat on a spring that can pop off, a dizzy face, a singing beak),
  Sparkle rides on the cushion (`SparklePuppet`, ducks with a squash). The friends who ride are their puppets from the
  other activities, sitting in the boat.

**Screens:** the logical stage is the canal band: water plus the ground floor and first floor of the houses must always
be in view; the extra height on tall screens shows more sky and rooftops (portrait iPad gets the full houses and bell
towers), the extra width shows more canal. iPhone landscape shows the water band and the boat bigger, with rooftops cut;
the boat, the doorsteps and the bridges always fit under the top bar.

**Tech:** DOM + `useGameLoop` (a camera x, parallax layers as transforms, the boat as a spring toward her finger),
because the puppets ride in the boat and only a handful of things move at once. Phaser isn't needed. Riskiest piece to
prototype first: the boat-drag feel (lag, drift, the turnaround spin, bouncing off posts) at iPad and iPhone sizes,
with a 60 fps camera in Safari. The mirror mask reuses the first build's `MaskShop` idea (strokes reflected across the
center line).

**Gates:** (1) greybox: drive the box boat along a box canal with posts and one doorstep friend; Dad plays it.
(2) Art: the house sprites, layers, boats, Gino's puppet. (3) The rides, the tide, the mask, voices, QA.

### 6. Snow on a Volcano 🌋🍋 (Sicily: weather and altitude, lemon granita)

- **Story**: Nino: "It's sooo hot on the beach! Let's get snow from the top of Mount Etna!"
- **Real history**: long ago, before freezers, Sicilians **carried snow down from Mount Etna** on donkeys and mules,
  kept it in stone snow-houses, and made icy treats with it. That's how *granita* started.
- **Play**:
  1. **Climb**: drag Nino along the zig-zag trail up the volcano (he follows her finger). The big **thermometer**
     in the corner drops as they go up: lemon trees and beach (🌞 *Hot!*) → chestnut forest (*cooler*) → black lava rocks
     and snow (*Brr, cold!*). Nino's ears droop in the heat, then he shivers and gets a scarf. "The higher you go, the
     **colder** it gets!"
  2. **Pack the snow**: swipe snow into Nino's baskets and count 1 to 5. Etna puffs a friendly little smoke cloud, and Sparkle says
     "Etna is a volcano! Its snow and soil help things grow."
  3. **Zoom down** (tap and wheee) to the hot beach, where three friends are melting: a Mediterranean monk seal
     fanning herself, a sunbather tortoise, Lupa panting.
  4. **Make granita**: pile snow into cups and **squeeze a lemon** over it (press and hold on the lemon, it squishes,
     juice drips; lemons from Sicily are famous). Serve each friend. Harder: "Two scoops for the seal!"
- **Payoff**: everyone cools down with happy brain-freeze faces, and Nino brings the **piano** to the band (a donkey
  who carries a piano up a volcano is strong enough to carry it to Verona).
- **Weather taught here**: Italy is **snowy in the mountains** and **hot and sunny by the sea**, sometimes on the same
  day; the north (the Alps) has cold snowy winters, the south has long hot summers.
- **Real facts**: Etna is the tallest volcano in Europe, and it's active (it puffs smoke); Sicily grows lemons,
  oranges and pistachios; Italy has sea on three sides.
- **Sticker**: Sicilian donkey.
- New tech: path-follow drag (the character trails the finger along a spline), altitude-linked background crossfades
  and a thermometer, press-and-hold squeeze.

## Finale: Opera Night at the Arena (route `party`, aria-label "Party")

1. Dusk at the **Arena di Verona**, a real Roman arena almost 2,000 years old where operas are still sung on summer
   nights. People really light **little candles** in the stands as it gets dark: she taps the stands and candles
   flicker on everywhere.
2. The band she built is on stage: Bruno (mandolin), Spina (tambourine), Cesare (horn), Gino
   (accordion), Nino (piano). Sparkle wears the Venice mask and the chef hat. Lupa is in the middle, shy.
3. **Kaylee conducts** with a sparkly wand (the conductor's stick):
   - Swing the wand **big** → the band plays **forte** (loud), everyone bounces big.
   - Swing it **small** → **piano** (soft), they sway gently. Sparkle: "*Piano* means soft in Italian! *Forte* means
     loud!"
   - Swing fast or slow and the music speeds up or slows down (the loop's tempo follows her strokes).
   - Point at one friend to give them a solo.
4. **Lupa's moment**: the wishing star from the Trevi Fountain floats down, Kaylee taps it, and Lupa's howl turns into a
   gorgeous high opera note. The crowd leaps up: "**Brava, Kaylee! Brava, Lupa!**" Roses fly onto the stage (tap to catch).
5. **The flag in the sky**: Italy's real air show team, the **Frecce Tricolori** ("tricolor arrows"), zooms over and
   paints **green, white and red** smoke across the sky. Then the flag waves. Sparkle: "Italy's flag is green, white
   and red, just like a pizza Margherita!"
6. Her own pizza from the Pizzeria comes out for the cast picnic, plus gelato for everyone. Lupa hugs her, then
   `onWin()` starts the trophy ceremony. "Grazie, Kaylee! Ciao for now!"

## Facts page (passport, tap to hear)

| Icon | Label | Line (short, Sparkle unless noted) |
|---|---|---|
| 👋 | Ciao! | "In Italy, people say chow! It means hello AND goodbye!" |
| ☀️ | Buongiorno! | "Bwon-JOR-no means good morning!" |
| 💖 | Grazie! | "GRAHT-see-eh means thank you!" |
| 🔢 | Uno, due, tre | "One, two, three in Italian: oo-no, doo-eh, treh!" |
| 👢 | The boot | "Italy is shaped like a boot, kicking a ball!" |
| 🌦️ | Weather | "Italy has hot, sunny summers, and snowy mountains up north!" |
| 🍕 | Pizza | "Pizza comes from Naples, in Italy!" |
| 🇮🇹 | Margherita | "Pizza Margherita is red, white and green, like Italy's flag!" |
| 🫒 | Olives | "Some olive trees in Italy are more than a thousand years old!" |
| 🏛️ | Romans | "Long ago, the Romans built roads, arenas and water bridges!" |
| Ⅴ | Numbers | "Romans wrote five like this: V!" |
| 🐺 | Rome's wolf | "The story says a kind mama wolf took care of the twins who built Rome!" |
| 🛶 | Venice | "In Venice, the streets are water! People ride in boats!" |
| 🌋 | Volcanoes | "Italy has volcanoes! Etna is the tallest one in Europe!" |
| 🎻 | Music | "The piano and the violin were first made in Italy!" |
| 🍨 | Gelato | "Gelato is Italian ice cream! Yum!" |
| 🫙 | Pantheon | "The Pantheon in Rome has a big hole in its roof. When it rains, rain falls inside!" |
| 🚩 | Flag | "Italy's flag has three stripes: green, white and red!" |

## Things you didn't list, now in the plan

- **The boot shape** (and Sicily as the ball), the most memorable fact about Italy for a 5-year-old.
- **Opera, *piano* and *forte*, "Brava!"**, and Italian instruments: mandolin, accordion, piano, violin. That's the whole story frame.
- **Romulus, Remus and the she-wolf** (gently), which is why the friend is a wolf cub.
- **Roman numerals** (I-V, and she's V), the **Colosseum's secret elevators and sun-shade**.
- **Aqueducts** and water flowing downhill, the **Trevi Fountain** legend of the girl who found the spring, the coin toss.
- **Venice**: a city on water, boat ambulances, gondoliers who sing, **Carnevale** masks (symmetry).
- **Mount Etna snow → granita**, and "higher is colder" (weather).
- **Water buffalo mozzarella**, tomatoes from America, UNESCO pizza spinning, the 90-second oven, *peperoni* = peppers.
- **Trulli** cone houses, **Cinque Terre** pastel houses, **Frecce Tricolori** painting the flag in the sky, candles at
  the Verona Arena, the **Pantheon's** hole in the roof.
- Italian animals: Apennine wolf, Marsican brown bear, crested porcupine, little owl, water buffalo, Mediterranean
  monk seal, Sicilian donkey.
- **Math woven in**: counting toppings, halves and quarters, full / half full, tall and short arches, Roman numerals,
  first-to-land predictions. Also **left/right**, **symmetry** and **loud/soft**.

## Backlog / swap-ins (not in the first build)

- **Gelato cart** (Florence): pull the scoop through the tub so a curl grows, stack cones to order (flavors from fruit:
  lemon, strawberry, pistachio). Could replace the granita half of Etna if that's too food-heavy.
- **Pasta shapes**: many are named after things (*farfalle* = butterflies, *conchiglie* = shells, *ruote* = wheels):
  sort them into what they look like, then a spaghetti twirl.
- **Leonardo da Vinci's workshop** (Florence): finish his flying machine and test-fly it.
- **Pinocchio** (an Italian story): the nose grows on silly fibs, as a gentle honest/silly game.
- **Truffle puppy** (a Lagotto Romagnolo, an Italian dog breed that sniffs out truffles): a warm/cold sniffing hunt.
- **Roman mosaics** (Pompeii's dog mosaic): fill a picture with tiny tiles by Roman-numeral color codes.
  Could be the coloring/craft extra.
- **La Befana**, the kind witch who brings sweets on January 6 (seasonal special).
- **Ibex in the Dolomites**, cable cars, cowbells.

## Coloring pages (`bg-color-*`)

Lupa howling at the moon · Bruno spinning pizza dough · the Colosseum · a gondola
under a Venice bridge · a Carnival mask · the Trevi Fountain.

## Picture puzzles (`meta.puzzles`, `scene-puzzle-*`)

The Colosseum at sunset · Venice's Grand Canal with gondolas · the Amalfi / Cinque Terre pastel houses by the sea.

## Videos (Theater)

Pick real, kid-safe YouTube clips when building (IDs TBD, don't guess them): a Naples pizzaiolo spinning dough and the
wood-fired oven (after Pizzeria), an olive harvest with nets (after Olive Grove), the Trevi Fountain (after Trevi),
the Colosseum from above (after Colosseum), gondolas in Venice (after Venice), Etna puffing (after Snow on a
Volcano), the Frecce Tricolori air show, and an overview of Italy.

## Art list (`art/source/world/italy/`, style per `art/STYLE.md`, generated with Codex)

- `scene-italy-map.png` (the boot, landmarks as tiny icons, no text), `bg-pizzeria-counter`, `bg-pizzeria-oven`,
  `bg-naples-1889` (storybook sepia version), `bg-olive-grove` (trulli), `bg-olive-mill`, `bg-rome-aqueduct` (wide),
  `bg-trevi`, `bg-colosseum` (from above, trapdoors in the floor), `bg-venice-canal` (tall/wide scroll),
  `bg-mask-shop`, `bg-etna` (tall: beach at the bottom, snow at the top), `bg-sicily-beach`, `bg-verona-arena-night`.
- Character references for puppets: `lupa.png`, `bruno.png`, `spina.png`, `civetta.png` (then `cesare`, `nino` if
  they become puppets).
- Buddies and props: signora-bufala, gino, cesare, nino, monk seal, tortoise, duck, the Queen (storybook), toppings
  (mozzarella, basil, olive, mushroom, pepper, cherry tomato), pizza peel, pizza wheel, dough ball, olive rake, olive
  jug and bottles, arches (tall/short), coins, trapdoors, gondola, mask blank, gems and
  feathers, snow basket, granita cup, lemon, the five instruments, candles, roses.
- The pizza itself (base, sauce, browning, slices) is **SVG/canvas in code**, not a picture, because it changes as she
  makes it.
- **No flags** (use `kit/Flag` `italy`) and **no text, letters or numbers in images**: Roman numerals on the trapdoors
  are HTML text on top.

## Build order (staged, with a stop for Dad's approval at each gate, like China)

1. **Art direction**: a style key image for the boot map and the Pizzeria, and reference variants for Lupa and
   Bruno. **Stop: Dad picks.**
2. **Static puppets**: Lupa and Bruno in SVG next to their references (no animation yet). **Stop: Dad approves the looks.**
3. Folder skeleton (meta with the new pin, Place, lines, cast, art.ts, `italy` flag in `kit/Flag.tsx`), hub map with the
   boot kick and the empty band stage, StoryBeat intro, finale stub labeled `Party`.
4. Puppet animation (howl, pounce, wag; toss, catch, laugh) with filmstrip passes.
5. **Pizzeria first** (the showpiece): Service 1 end to end → `playtest-qa` → Services 2-3.
6. Then the rest, in the order that reuses the most tech: Olive Grove (pour, rake) → Trevi (arches, water) → Colosseum
   (numerals, ropes) → Venice (drive the boat, mirror) → Etna (path follow, thermometer).
7. Finale: candles, conducting (stroke amplitude → volume, stroke rate → tempo), Lupa's note, Frecce Tricolori, `onWin()`.
8. `node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs`, then listen to every Italian word.
9. `npm run check`, then `qa-screens`, `qa-motion`, `qa-pacing` and the `playtest-qa` agent; fix and repeat.

## Gotchas to respect (from Australia, Egypt and China)

- **One camera per scene.** Every background, prop, puppet and SVG in a scene uses the same straight-on, eye-level side
  view; things stand on the ground band. Mixing a top-down object into a front-view scene (the first Pizzeria, the first
  Trevi attempt) looks wrong. Put this rule in every art prompt.

- Smoke test: finale route `party` with aria-label exactly **"Party"**; at least **2 real `<button>`s** in each activity
  about 800 ms after the story is skipped.
- Many quick drags (toppings, arches, snow): use `PlayArea`/`StickerBoard`/plain pointer events, not motion
  `drag` that unmounts on drop (WebKit dead-drag bug).
- The flick, sauce swirl, rake, oar and conducting gestures need `touch-action: none` and must not trigger Safari's
  back-swipe near the left edge (keep the gesture areas away from the edge).
- Music in the finale: the band loop has to be synthesized or pre-recorded stems (no live TTS). Keep it short and
  cheerful; volume and tempo change without clicks.
- Talk before the first touch under ~6 s; tapping anywhere skips story.
- Respectful portrayal: real food, places and customs; no mafia/gangster jokes, no cartoon accent, no "mamma mia"
  spam. The Colosseum is "big shows long ago", with no fighting.

## Open questions for Dad

1. **Six activities, including a 3-4 minute Pizzeria.** Keep this scope for the remaining rebuilds.
2. **The 1889 storybook**: draw Queen Margherita and the pizza maker as **people** in the flat style (true to history,
   and the only people in the country), or as animals like everyone else (e.g., a royal swan queen)?
3. **Finale**: **opera night in Verona** (planned: conducting, *piano/forte*, Lupa's wish) or a **Venice Carnival
   gondola parade** (masks, fireworks on the water)? The opera frame ties the band and Lupa's story together.
4. **Pizza toppings**: keep it veggie + olives (easy to draw, plus the *peperoni* joke), or add salami for realism?
5. Is **left/right** in Venice OK at her level? If it's too hard, the canal signs become **colors** ("follow the pink
   house") and left/right becomes the hint. (The 2026-10-08 Venice rewrite does both: the house is the target and
   "left"/"right" is the screen side she drives toward, with a glowing hand on that side.)
