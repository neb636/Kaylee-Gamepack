# 🧊 The Poles: North and South

Built: all five activities and the finale are in the game · New place (3D + 2D) · updated 2026-10-28

Sparkle's balloon flies to the top of the world and the bottom. Up north, **Pola the polar bear cub** lives on ice floating on the sea; down south, **Pebble the penguin chick** lives on a giant land made of ice. They are pen pals who can never meet, because polar bears only live in the north and penguins only live in the south. Kaylee hops floes, belly-slides, huddles in a blizzard and cracks icebergs off a glacier, and learns the difference by playing in both. At the very end, Sparkle's **Polar Quiz** checks what she learned, and she answers by doing: dragging Pola to his pole, spinning the globe to the bottom.

**Next:** The user plays the whole Poles on the iPad: [the globe](#/world/poles), spin to a pole and tap a picture; then listen to the friends' voices (Pola, Mama Bear, Pebble, Papa, Terry) and say what to change. Handy links: [Ice Floe Hop](#/world/poles/floe/story), [Penguin Slide](#/world/poles/slide/story), [Iceberg Maker](#/world/poles/iceberg/pick), [Snow Coats](#/world/poles/coats/fox), [Emperor Huddle](#/world/poles/huddle/small), [the finale](#/world/poles/party/fly?stamps=all). Still open: the friends' names (recorded as Pola, Pebble and Terry, so a new name means re-recording), one map pin or two, Santa or not, an Inuktitut hello.

- one place, a globe that flips: 2 poles
- 2 north · 2 south · 1 both: 5 + finale
- globe, floes, slide, icebergs · coats, huddle: 4 in 3D · 2 in 2D
- each activity: 1.5-3 min
- touches each: 20-40
- to meet and poke: ~25 animals

Related: [Activity template](ACTIVITY-TEMPLATE.md), [Play design](../../docs/play-design.md), [Australia (the 2D reference)](../../src/world/places/australia/meta.ts)

## 💡 The idea

One big lesson, taught by doing: the two poles are both icy and cold, but they are opposites.

> **🌍 The one thing she should leave knowing**
>
> **The North Pole is frozen ocean. The South Pole is a frozen land.** Polar bears live up north, penguins live down south, and they never meet. When it's summer at one pole, it's winter at the other.

### North vs South at a glance (the facts the game is built on)

|  | 🐻‍❄️ North Pole (the Arctic) | 🐧 South Pole (Antarctica) |
|---|---|---|
| What's under the ice | **Ocean.** The ice floats on the sea, a few meters thick | **Land.** A whole continent, with ice on top up to about 4 km thick |
| Signature animal | Polar bear | Penguins |
| Land animals | Yes: Arctic fox, Arctic hare, reindeer, musk ox, lemmings | None that live there all year (just birds, seals and bugs-sized critters) |
| People | Yes: Inuit and other Arctic peoples have lived there for thousands of years | Nobody lives there for good: only scientists at research stations |
| Who owns it | Countries around it (Canada, Greenland, Norway, Russia, USA...) | No one: countries agreed to share it for science and peace |
| How cold | Very cold | Even colder: the coldest place on Earth (about −89 °C measured) |
| Icebergs | Taller, pointy ones, mostly from Greenland's glaciers | Huge flat ones (tabletop icebergs) from the ice shelves |
| Seasons | Summer in June, July | Summer in December, January (opposite!) |
| Day and night | About 6 months of daylight, then about 6 months of dark | The same, but at the opposite time of year |

### The shape of it

Arrive: 🎈 Balloon lands (on the globe hub) → 🌍 Spin the globe (3D · top = north, bottom = south)

North: 🐻‍❄️ Ice Floe Hop (3D) → 🦊 Snow Coats (2D)

South: 🐧 Penguin Slide (3D) → 🥚 Emperor Huddle (2D)

Both: 🧊 Iceberg Maker (3D · she picks which pole)

Finale: 🐦 Pole to Pole (3D · the Arctic tern carries a gift) → ❓ Polar Quiz (3D · answer by doing, on the globe) → 🏆 Polar Explorer trophy

> **🔀 Any order, as Kaylee asked**
>
> All five activities are open from the start. Each earns a stamp and a sticker right away. All five stamps unlock the finale.

## 🧊 3D and 2D: what uses which

A hybrid: the globe and the icy sea in 3D like Thailand, two activities flat like Australia.

> **📐 The rule**
>
> **3D when the lesson is about shape and space:** a round world, ice that floats, a slope down to the sea, the part of an iceberg hidden under the water. **2D when it's about a surface or a crowd:** rubbing a coat white, white animals vanishing into white snow, lots of round bodies squishing together.

### In 3D (the Thailand look: toon bands, ink outlines, blob shadows)

- 🌍 **The globe hub**: A real ball she spins with her finger. The sun she drags is the light, so day and night draw themselves, and tilting the Earth makes the opposite seasons real instead of faked.
- 🐻‍❄️ **Ice Floe Hop**: Floes that dip under Pola's weight, tip at the edge and drift on a real sea, with more than one path across. The water already exists (Thailand's boat trip), and “dip under the ice” is just a camera move.
- 🐧 **Penguin Slide**: The Nan drive's steering (the user tuned it in the feel lab, PR #209) on an icy slope, then the same steering underwater. Bumps, two runs and the dive come straight from the drive and the boat race.
- 🧊 **Iceberg Maker**: Shares the floes' sea and bobbing. A berg that rolls over, and the camera sinking under the waterline to show the hidden 9 parts out of 10, read best in 3D. **The one that could go either way:** if we want a cheaper activity, this one goes 2D.
- 🐦 **Pole to Pole (finale)**: **Changed:** Terry flies down over the same globe while it turns underneath, past the pins of the countries she has visited. “Opposite ends of the world” becomes something she sees, and nobody has to draw Italy, Egypt and Peru again for a side-scroller.
- ❓ **Polar Quiz**: Already on the hub's globe: she drops Pola on the top, spins the bottom to face her, taps a pole to dip under the ice.

### In 2D (puppets and painted scenes, like Australia)

- 🦊 **Snow Coats**: Rubbing a coat white with `perfect-freehand` is a mask on a flat puppet; on a 3D model it means painting into textures, which is harder and looks worse. White animals vanishing into the snow is also a flat-picture trick.
- 🥚 **Emperor Huddle**: Squishing a crowd of round penguins is 2D physics: cheap and solid in Phaser. In 3D it would be the same circle packing with more work.

> **🐧 The catch: friends in both**
>
> Pebble slides in 3D and hatches in the 2D huddle, and Pola shows up on the 2D postcards. Each friend gets a 3D character **and** a 2D puppet that must look like the same animal. 3D comes first; then the character lab's PNG export is the reference picture the 2D puppet is drawn to match (the way puppets already match their references).

> **🦄 Kaylee herself stays out**
>
> She doesn't walk around the ice as the unicorn: these activities are about the animals, and her model and wardrobe would have to leave Thailand's locked folder too. Easy to add later if the user wants it.

## 🐾 The friends

- 🐻‍❄️ **Pola, the polar bear cub (north)** (name: the user picks): Fluffy, a bit clumsy, a great swimmer. Lives with Mama Bear on the sea ice. Wants to know what a penguin is: she's never seen one.
- 🐧 **Pebble, the emperor penguin chick (south)** (name: the user picks): Grey fluff, black-and-white face, waddles everywhere. Lives in the big emperor colony. Has never seen a polar bear.
- 🐦 **Terry the Arctic tern (the go-between)** (real fact): The only friend who visits both: Arctic terns fly from the north to the south and back every year, the longest trip of any animal. Carries Pola's and Pebble's postcards. Stars in the finale.

> **💌 The story hook**
>
> Pola and Pebble are pen pals who can never meet. Each stamp Kaylee earns adds a picture to their postcards (a floe, a white fox, a slide, a hatched egg, an iceberg). In the finale Terry carries the full postcard pole to pole.

## 🌍 The hub: the globe and the sun · 3D

The hub is a toy, not a menu. It teaches the poles' biggest idea before any activity.

> **Core verb: spin the globe**
>
> Her finger grabs the big globe and spins it up and down. Spin to the top and the scene becomes the **Arctic** (sea, floating ice, Pola waving). Spin to the bottom and it's **Antarctica** (a white land, mountains, penguins). The activity spots sit on each side. In 3D: a toon-shaded ball, the sun is the light, and the Earth's tilt is real, so drag the sun and the seasons follow.

### How it deepens

1. **Spin it**
   Top, bottom, top. The scene swaps with a whoosh. Pola and Pebble wave when their side arrives.
2. **Drag the sun**
   A little sun hangs beside the globe. She drags it up or down: the pole it shines on gets **summer and daylight** (the ice shrinks a bit, flowers on the Arctic tundra); the other pole goes **dark** (stars, northern or southern lights). She *makes* the opposite seasons.
3. **The lost penguin**
   Sometimes a penguin (or a polar bear) is drifting on a little iceberg in the middle of the ocean. She drags it to its home pole. On the wrong pole it gets a silly reaction (the penguin looks around: “Where is everybody?”), never an “oops”.

### Pokeables in the hub

- 🐋 **a whale spouts in the ocean between**
- 🌌 **lights ripple in the dark sky**
- 🚩 **the North Pole marker wobbles**
- 🏠 **a science station's door opens, a scientist waves**
- ❄️ **snowflakes burst when tapped**
- 🦭 **a seal pops out of a hole**

## 🐻‍❄️ 1. Ice Floe Hop (north) · 3D

The North Pole is frozen sea: the ice floats.

**One-line pitch:** Pola wants to get back to Mama Bear across the floating sea ice; Kaylee flings Pola from floe to floe.

> **Core verb: fling Pola onto the next floe**
>
> Grab Pola, pull back and let go: he crouches, leaps, and lands with a thump. The floe dips under his weight, bobs and rocks. Fun with no goal: the floes wobble and splash differently each landing. Greybox (3D, already in the toon look): a white ball on flat grey slabs on a blue sea. The fling's pull-back, power and arc are feel-lab knobs.

### How it deepens (same verb)

1. **Big, steady floes**
   Wide floes close together. Nothing to get wrong.
2. **Floes that drift**
   The floes slowly drift and turn, so she waits for the right moment or flings further. Little floes tip when he lands on the edge.
3. **Summer melt**
   It's summer: floes are smaller and further apart. She can also push floes together with her finger to make a bridge. Teaches that sea ice shrinks in summer and grows back in winter (gently, no doom).

### Her choices

- Which floe to jump to (there's always more than one path)
- Swim or jump: she can drop Pola in the water on purpose

### Pokeables

- 🦭 **ringed seal in a breathing hole: pops out, ducks back**
- 🦄 **narwhal tusk pokes up through a crack**
- 🦭 **walrus snorts, wiggles its whiskers**
- 🐳 **white belugas sing a squeaky song**
- 🦉 **snowy owl swivels its head**
- 🦭 **a fluffy white harp seal pup blinks**

### Silly moments (instead of failure)

- 💦 **Miss: Pola belly-flops, swims happily (polar bears are great swimmers), climbs out and shakes water onto the screen**
- 🛝 **Land on a tippy floe: he slides off the far side like a slide**

### What it teaches (by doing)

- The ice floats: floes bob and drift because there's sea underneath. Tap a crack and the camera dips under: just ocean, fish and a narwhal.
- Polar bears hunt from the sea ice and swim between floes.
- Tap-to-hear facts: polar bears have black skin under white fur; their fur keeps them warm; the North Pole has no land, only a sea of ice.

**Payoff:** Mama Bear on the big ice. Every floe he lands on leaves paw prints, so the path she made stays on screen. **Replay:** the floes are laid out differently; a different animal pops up. **Numbers:** ~25-35 flings, 2-3 min, 1 line before the first touch.

## 🦊 2. Snow Coats (north) · 2D

Arctic animals change color with the seasons, and many live on land up north.

**One-line pitch:** Winter is coming and the Arctic animals need their white coats to hide; Kaylee rubs snow over them, then sunshine to bring summer back.

> **Core verb: rub with her finger**
>
> She rubs over an animal and its coat changes where her finger goes (a brush stroke, `perfect-freehand`). Snow makes it white; in step 3 sunshine makes it brown. Fun with no goal: patchy half-white foxes are funny. Greybox: a brown shape that turns white under her finger.

### How it deepens (same verb)

1. **Paint the fox white**
   One Arctic fox, brown in late summer. Snow falls; she rubs and the fox goes white, and fluffier.
2. **Hide and seek**
   More animals: Arctic hare, ptarmigan (a bird), lemming. Once they're white, a polar bear wanders through sniffing, and the white ones vanish into the snow. A brown patch she missed? The bear sniffs, the fox giggles and runs (silly, not caught).
3. **Rub the summer back**
   Now she rubs sunshine: snow melts off the tundra in streaks, little flowers pop up, the coats turn brown again. The snowy owl and polar bear stay white all year (a tap-to-hear surprise).

### Her choices

- Which animal to paint first
- Leave one silly: a half-white hare stays like that until she finishes it

### Pokeables

- 🦌 **reindeer shakes its antlers**
- 🐂 **musk ox huffs, shaggy coat swings**
- 🐹 **a lemming pops out of the snow**
- 🌌 **the northern lights ripple in the sky**
- 🏔️ **a snowdrift puffs when tapped**

### What it teaches (by doing)

- Camouflage: white animals hide in the snow; she sees them vanish.
- Seasons up north: long dark winter, short summer when the snow melts and flowers grow.
- The Arctic has land animals around the frozen sea (Antarctica doesn't).
- Tap-to-hear: Inuit people have lived in the Arctic for thousands of years (check the wording with the user).

**Payoff:** a winter scene where she can only find the animals by their eyes and noses blinking. **Replay:** different animals in a different order. **Numbers:** ~25-40 rubs, 2 min, 1 line before the first touch.

## 🐧 3. Penguin Slide (south) · 3D

Antarctica is land: a giant mountain of ice that slopes down to the sea.

**One-line pitch:** Pebble's dad is going fishing; Kaylee steers him on his belly down the ice and into the sea to catch krill for Pebble.

> **Core verb: steer the sliding penguin**
>
> She holds the penguin and moves her finger left and right; he toboggans downhill on his belly (the slope does the forward part, like the Nan trip's driver). He bumps, spins and whooshes. Fun with no goal: sliding down a big icy hill. Greybox (3D): a black capsule on a white slope, steering read from the Nan drive's knobs.

### How it deepens (same verb)

1. **A gentle slope**
   Wide ice, a few Adélie penguins to slide past (they jump aside and squawk).
2. **Bumps and cracks**
   Snow bumps that pop him into the air, a crack to jump over, a choice of two runs down.
3. **Into the sea**
   He shoots off the edge and dives. Now she steers him underwater the same way, through swarms of pink krill (gulp!), past a leopard seal who only wants to play, then rockets back out onto the ice (penguins can't fly in the air, but they “fly” underwater).

### Her choices

- Which run down the hill
- Which krill swarm to chase
- Which way to leap out

### Pokeables

- 🦭 **Weddell seal sings a spacey trill**
- 🐘 **elephant seal burps**
- 🐦 **a skua flaps and squawks**
- 🐋 **a humpback spouts and waves a flipper**
- 🏠 **the research station's flag flaps, a scientist waves**
- 🐧 **gentoo and chinstrap penguins honk**

### Silly moments

- 🌀 **Bump an Adélie: they both spin like tops**
- ❄️ **Slide into a snowbank: only his feet stick out, wiggling**

### What it teaches (by doing)

- It's downhill all the way: Antarctica is high land covered in ice, sloping to the sea (unlike the flat floating ice up north).
- Penguins slide on their bellies to move fast, and swim like they're flying.
- Tap-to-hear: penguins eat krill and fish; no polar bears here, so the penguins aren't scared on the ice.

**Payoff:** his tummy fills with krill (a little meter that's his round belly), and Pebble gets fed at the end. **Replay:** different runs, different sea creatures. **Numbers:** ~20-35 steers, 2-3 min, 1 line before the first touch.

## 🥚 4. Emperor Huddle (south) · 2D

Winter in Antarctica: dark, windy and the coldest place on Earth.

**One-line pitch:** It's the long winter night and the emperor dads are keeping their eggs warm; Kaylee shuffles cold penguins into the warm middle of the huddle until Pebble's egg hatches.

> **Core verb: drag penguins into the huddle**
>
> She drags a shivering penguin from the windy edge into the middle. The huddle squishes to make room, everyone shuffles, and the one she moved warms up (stops shivering, pink cheeks). Fun with no goal: squishing a crowd of round penguins. Greybox: grey ovals that pack together.

### How it deepens (same verb)

1. **A small huddle**
   Five dads. The one on the edge shivers; she brings him in. Snow piles on the outside ones' backs.
2. **The wind turns**
   A blizzard; the wind swings around, so different penguins end up on the cold side. She keeps them moving in (the real huddle slowly rotates like this).
3. **Crack!**
   Pebble's egg on dad's feet hatches. In gusts she tucks the chick back under dad's belly flap (same drag). Then the sun peeks over the horizon for the first time in months: winter is ending.

### Her choices

- Who to bring in next
- Where in the huddle to put them

### Pokeables

- 🌌 **the southern lights (aurora australis) glow**
- ❄️ **a snow-covered penguin shakes it off**
- 🌙 **the moon over the dark ice**
- 🐧 **a dad sings his special call**
- 🌬️ **a gust of snow whooshes past**

### Silly moments

- 🤧 **Leave one out too long: he sneezes and a snowball pops off his beak, then waddles in himself**
- 🟰 **Squeeze too many in: one pops out the top like a cork**

### What it teaches (by doing)

- Huddling keeps penguins warm: she feels it by moving the cold ones in.
- Emperor dads hold the egg on their feet all winter, while the moms are away at sea.
- In winter at the South Pole the sun doesn't come up for months (it's dark the whole time).
- Tap-to-hear: Antarctica is the coldest, windiest place on Earth.

**Payoff:** the chick hatches and the first sunrise. **Replay:** a different penguin's egg, wind from a new side. **Numbers:** ~25-35 drags, 2-3 min, 1 line before the first touch.

## 🧊 5. Iceberg Maker (both poles) · 3D

Where icebergs come from, why most of one is hidden, and how north and south bergs differ.

**One-line pitch:** The glacier is full of cracks; Kaylee taps them open to break off icebergs, pushes them out to sea, and finds out what's under the water.

> **Core verb: tap the cracks to break off ice**
>
> She taps a crack in the front of the glacier: it creaks, the crack grows, and on the next tap a chunk tips over and **SPLASH** (a wave rolls across the screen). Fun with no goal: smashing ice into the sea. Greybox (3D): a white cliff of blocks with dark crack lines over a blue sea.

> **🔀 Her big choice first: which pole?**
>
> She picks the **north** glacier (Greenland: tall, pointy icebergs, Pola on the shore) or the **south** ice shelf (a flat white table, Pebble's colony on top). Both play the same; the bergs come out the shape of that pole. Playing both shows her the difference.

### How it deepens (same verb)

1. **Little bits**
   Small cracks: “bergy bits” and “growlers” plop in and bob.
2. **The giant one**
   A long crack across: several taps, a big groan, and a huge iceberg breaks off. It rolls, settles, and the camera dips under the water: **most of the iceberg is hidden underneath** (about 9 parts out of 10). She can push it down with her finger and it bobs back up.
3. **Send it sailing**
   Tap the iceberg to push it out to sea. Animals ride along (seals, penguins or a polar bear, depending on the pole). Tap its sides and it fizzes: air bubbles trapped for a very long time popping out (sailors call it “bergy seltzer”).

### Pokeables

- 💙 **a deep blue crack glows**
- 🫧 **bubbles fizz off the berg**
- 🦭 **a seal sunbathes on a growler**
- 🐋 **an orca swims under (orcas live at both poles)**
- 🐟 **fish dart away under the berg**

### Silly moments

- 🌊 **Big splash soaks the penguins (or Pola) on the shore; they shake off**
- 🙃 **A berg flips over: the bottom was blue and smooth**

### What it teaches (by doing)

- Icebergs break off glaciers and ice shelves (scientists call it “calving”).
- An iceberg is mostly under the water: she sees it and pushes it.
- Icebergs are made of snow squashed into ice over a very long time, so they are fresh water, not salty. Sea ice (Pola's floes) is frozen sea water. Different kinds of ice!
- North icebergs are tall and pointy; south ones are often flat like tables, and can be bigger than a whole city.
- Tap-to-hear: old ice looks blue because it is packed so tight.

**Payoff:** a little fleet of her icebergs sailing off with animals waving. **Replay:** the other pole, and different crack patterns. **Numbers:** ~25-40 taps and pushes, 2-3 min, 1 line before the first touch.

## 🐦 Finale: Pole to Pole · 3D

**One-line pitch:** Pola and Pebble finished their postcards (one picture from each stamp); Kaylee steers Terry the Arctic tern all the way from the North Pole to the South Pole to deliver them.

> **Core verb: steer the tern**
>
> Drag Terry left and right as he flies down over the big globe from the hub, which turns under him: the Arctic, then the ocean, past the pins of the countries she's visited (Italy, Egypt, Peru... whatever's on her map), getting warmer in the middle (the sea turns turquoise, a beach), then cold again and down to Antarctica. Catch fish on the way. The postcard gets delivered; Pebble shows Pola's picture of a polar bear to the colony (they gasp). Then Sparkle's **Polar Quiz** (below), then the trophy: **Polar Explorer**.

- Teaches: the poles are at opposite ends of the world, and it's warm in between (by flying through it).
- Real fact: Arctic terns fly pole to pole every year, the longest trip any animal makes.
- Numbers: ~20-30 touches, 1.5-2 min.

## ❓ The Polar Quiz (the very end) · 3D

The user's ask (2026-10-26): a quiz at the end to check what she learned. She can't read, so every question is spoken, and she answers by moving things on the globe, not by picking word cards.

> **How it plays**
>
> After the tern lands, Sparkle brings back the big globe from the hub. She asks one short question at a time (with a 🔊 to hear it again), and Kaylee answers with her finger on the globe or the animals. **6 questions**, picked from the pool below, so replays differ. Each right answer fills one star on her **Polar Explorer badge**; six stars and the trophy ceremony starts.

### The question pool (she answers by doing)

- 🐻‍❄️ **Where do polar bears live?**: Drag Pola onto the globe: **top** (north). He slides onto the sea ice and waves.
- 🐧 **Where do penguins live?**: Drag Pebble onto the globe: **bottom** (south). He waddles into the colony.
- 🧭 **Is the South Pole at the top or the bottom?**: Spin the globe so the South Pole faces her: **bottom**. A little flag pops up there. (Asked the other way too: “Where's the North Pole?” → top.)
- 🌊 **Which pole is ocean under the ice?**: Tap a pole: the camera dips under the ice. North shows water and fish (✓); south shows rock and land.
- 🧊 **Where is most of the iceberg?**: An iceberg floats in front of her: tap **above** or **under** the water. Under (✓): the water turns see-through and shows the big hidden part.
- ☀️ **It's summer at the North Pole. What is it at the South Pole?**: Sparkle puts the sun on the north. Kaylee taps the snowman (winter ✓) or the beach ball for the south. The south goes dark with stars.
- 🥶 **Which pole is the coldest?**: Tap the pole that's colder: **south** (✓). A thermometer there freezes solid with a funny crack.
- 🐦 **Who visits both poles?**: Three animals stand in a row (polar bear, penguin, Arctic tern): tap the **tern** (✓); it flies a loop round the globe.
- 🦭 **Who lives up north?**: Three animals on a floe: drag the one that belongs north (walrus, narwhal or Arctic fox) to the top. The other two are southern (penguin, Weddell seal).

### A wrong answer is never an “oops”

- 🐻‍❄️ **Polar bear dropped on the south: the penguins all jump back, Pola scratches his head, “Where's the sea ice?”, then the top of the globe glows and she tries again**
- 🐧 **Penguin dropped on the north: he shivers next to a walrus, the walrus snorts, the bottom glows**
- 🌀 **Spun to the wrong pole: the globe wobbles back like a top and the right half sparkles**

### Rules (from AGENTS.md)

- Every question is spoken, short (under ~3 s), with a 🔊 button and a short text line for the user.
- No failing, no score shown as a number, no timer: a miss gets a silly reaction, then the right place glows and she does it herself. The star still fills.
- Keep it name-free: “Wow, you know your poles!”
- It sits **after** all five stamps and the tern flight, so it never blocks an activity. Replays pick 6 new questions from the pool.
- It's a short end piece (~1-1.5 min), not the play: the activities stay toys, as `docs/play-design.md` asks.

**Numbers:** 6 questions, ~8-12 touches, 1-1.5 min, 1 spoken question each. **Payoff:** the six-star badge pins onto her passport page, then the trophy.

## 📊 The numbers

|  | Touches | Minutes (min) |
|---|---|---|
| 🌍 Globe hub | 5-15 | 0.5-1 |
| 🐻‍❄️ Ice Floe Hop | 25-35 | 2-3 |
| 🦊 Snow Coats | 25-40 | 1.5-2.5 |
| 🐧 Penguin Slide | 20-35 | 2-3 |
| 🥚 Emperor Huddle | 25-35 | 2-3 |
| 🧊 Iceberg Maker | 25-40 | 2-3 |
| 🐦 Pole to Pole | 20-30 | 1.5-2 |
| ❓ Polar Quiz | 8-12 | 1-1.5 |

## 🐾 Every animal, by pole

For pokeables, stickers, coloring pages and puzzles.

- 🐻‍❄️ **North (the Arctic)**: 
  - Polar bear
  - Arctic fox
  - Arctic hare
  - Lemming
  - Reindeer (caribou)
  - Musk ox
  - Walrus
  - Ringed seal
  - Harp seal (white fluffy pups)
  - Narwhal
  - Beluga whale
  - Snowy owl
  - Ptarmigan
  - Puffin
- 🐧 **South (Antarctica)**: 
  - Emperor penguin
  - Adélie penguin
  - Gentoo penguin
  - Chinstrap penguin
  - Weddell seal
  - Leopard seal
  - Elephant seal
  - Humpback whale
  - Krill (tiny, pink, everyone eats them)
  - Skua
  - Wandering albatross
- 🌍 **Both**: 
  - Arctic tern (flies between them)
  - Orca
  - Humpback and blue whales visit both oceans

### Stickers (one per stamp)

| Activity | Sticker | Fact on the sticker |
|---|---|---|
| 🐻‍❄️ Ice Floe Hop | polar bear | Polar bears have black skin under their white fur. |
| 🦊 Snow Coats | Arctic fox | Arctic foxes turn white in winter and brown in summer. |
| 🐧 Penguin Slide | Adélie penguin | Penguins slide on their tummies to go fast. |
| 🥚 Emperor Huddle | emperor chick | Emperor penguin dads keep the egg warm on their feet. |
| 🧊 Iceberg Maker | narwhal | Narwhals have a long tooth that grows out like a unicorn horn! |

> **🦄 Kaylee will love the narwhal**
>
> The “unicorn of the sea”. It could be a recurring cameo (in the floes, under the Greenland iceberg) and her bonus sticker.

## 📚 Facts, videos, coloring, puzzles

### Passport facts (tap to hear)

- 🌊 **Ocean or land**: The North Pole is a frozen ocean. The South Pole is on a frozen land called Antarctica.
- 🐻‍❄️ **Never meet**: Polar bears live in the north and penguins live in the south, so they never meet.
- 🥶 **Coldest**: Antarctica is the coldest, windiest place on Earth.
- ☀️ **Opposite seasons**: When it's summer at the North Pole, it's winter at the South Pole.
- 🌙 **Long nights**: At the poles the sun stays up for months in summer, and stays down for months in winter.
- 🧊 **Hidden ice**: Most of an iceberg is hidden under the water.
- 💧 **Fresh water**: Antarctica's ice holds most of the world's fresh water.
- 🔬 **Scientists**: Nobody lives in Antarctica for good, but scientists from lots of countries work there together.
- 👋 **Hello up north**: Inuit people live in the Arctic. (A hello word in Inuktitut: confirm the word and a recorded pronunciation before using it.)

### Theater videos (in `meta.videos`, 2026-10-27)

- 🐻‍❄️ [Polar bear cubs slip on the Arctic ice](https://www.youtube.com/watch?v=mIGpzhADMC4) (BBC Earth, 2 min), after Ice Floe Hop
- 🦊 [Animals that change colour when it snows](https://www.youtube.com/watch?v=5FnJ70WwCXw) (BBC, Life in Colour, 2.5 min), after Snow Coats. The user: preview it; the other animals in it aren't checked
- 🐧 [Emperor penguins speed-launch out of the water](https://www.youtube.com/watch?v=A9mbCNs47FI) (National Geographic, 3 min), after Penguin Slide
- 🥚 [Emperor penguins huddle for warmth](https://www.youtube.com/watch?v=OL7O5O7U4Gs) (Nature on PBS, 3 min), after Emperor Huddle
- 🧊 [A huge iceberg breaks off a Greenland glacier](https://www.youtube.com/watch?v=00_-JlbIftg) (National Geographic, 1 min), after Iceberg Maker
- 🦄 [Narwhals: the unicorns of the sea](https://www.youtube.com/watch?v=MXsZg1sQYvA) (Nat Geo Animals, 3 min), Theater only
- Backups, all embeddable:
  - Bears: `N8JD_P2J24g` (cubs' first steps), `-Kfl3385O44` (cubs sledging)
  - Fox: `X6G1RB3ELPg` (fox cubs leave the den, gentle, no coat change)
  - Penguins sliding on their bellies: `9dvipJ1vEyk` (20 s, no words)
  - Huddle: `Y_qyV0zdFcU` (Spy in the Huddle, the dads)
  - Iceberg: `hC3VTgIPoGU` (Chasing Ice, start at 0:30; talk over it)
  - Narwhals: `CJbmSsSxf_A` (SciShow Kids)

### Coloring pages and puzzles

- Coloring: Pola on a floe, Pebble and dad, a narwhal, the iceberg with its underwater half
- Puzzles: the emperor colony, the northern lights over the floes, a tabletop iceberg with penguins

## ❓ Open questions for the user

- **A quiz at the end?** **Yes** (user feedback, 2026-10-26): where polar bears live, is south on top or bottom, and so on. Added as the Polar Quiz after the tern flight, answered by doing on the globe.
- **One place, or two pins on the map?** OPEN: My pick: **one place, “The Poles”**, with the globe hub that flips, so the comparison is the toy. Its pin sits on Antarctica (the white strip at the bottom of the map), with a second small pin in the sea at the top that opens the same place on the north side (`?side=north`). Two separate places would mean two friends' worlds that never show the difference.
- **The friends' names?** OPEN: Placeholders: Pola (polar bear cub), Pebble (emperor chick), Terry (Arctic tern).
- **Santa at the North Pole?** OPEN: It's almost Christmas season and she's five. A wink could be fun (a tiny cabin with a red door far off on the ice in the hub, a sleigh bell when tapped) but it mixes make-believe into a real-facts place. Leave it out unless you want it.
- **2D or 3D?** OPEN: My pick: **both** (see [3D and 2D](#look)). The globe hub, the quiz, the tern flight, Ice Floe Hop, Penguin Slide and Iceberg Maker in 3D; Snow Coats and Emperor Huddle in 2D. Iceberg Maker could go 2D if we want it cheaper. Kaylee doesn't walk around as the unicorn here.
- **How much about melting ice?** OPEN: The plan shows summer melt gently (floes shrink, then grow back in winter) without climate worry. Say if you want more, or none.
- **What hello word?** OPEN: The Arctic has a people and languages; Antarctica has none. One Inuktitut greeting in the north, recorded properly, or skip the hello for this place.

## 🧱 Build plan

0. **This plan** [next]
   the user reads it and answers the open questions.
1. **Move the 3D engine out of Thailand** [done] · 2026-10-27 · PR #216
   Its own PR, before any Poles code: the engine and the generic chibi rig to a shared folder, so the Poles open without the family code. Thailand plays the same.
2. **Greybox: the globe hub** [done] · 2026-10-27 · PR #219
   Place folder, map pin, the 3D globe: spin it, drag the sun, day and night swap. Activities listed under `inTheWorks` (a “coming soon” card each).
2b. **Greybox: the lost penguin, and things to poke** [done] · 2026-10-27
   The hub's step 3: once the sun's been dragged, a penguin or a polar bear cub turns up adrift on a little iceberg in the warm middle of the world, and she carries it home to its pole. Plus the hub's pokeables: the North Pole marker, a seal in its hole, the science station, a whale, the lights, snowflakes.
3. **Greybox: Ice Floe Hop** [done] · 2026-10-27 · PR #225
   Pola on grey floes on a blue sea: grab him, pull back and let go. Floes dip, bob and tip; a miss is a belly-flop and a swim. Steady, drifting and summer floes on one course to Mama. The fling and the floes are feel-lab knobs.
4. **Greybox: Penguin Slide** [done] · 2026-10-27 · PR #229
   Pebble's papa belly-slides down an icy valley with the Nan drive's finger wheel: Adélies to dodge or bump, a snowbank to plunge into, bumps, two runs and a crack, then off the ice cliff and the same steering under the sea through the krill, home to feed Pebble. The steering, the slide and the swim are feel-lab knobs.
5. **Greybox: Iceberg Maker** [done] · 2026-10-27 · PR #235
   Pick a pole (two little bergs floating side by side). Tap the cracks in the ice cliff: they creak and creep round a chunk, it leans out, falls, SPLASH, a wave rings out and the bits bob. After five, the long crack: a groan, the giant drops, rocks and settles, and the camera sinks under the waterline to show the hidden part; her finger pushes it down and it pops back up. Then the camera turns round and she flicks her bergs out to sea, the friends riding the giant. The cracking and the floating are feel-lab knobs.
6. **Greybox: Snow Coats** [done] · 2026-10-27 · PR #239
   One Arctic fox, brown in late summer: snow falls and her finger rubs it white where it goes (perfect-freehand strokes as a mask on a flat shape), and it fluffs up. Then a hare, a ptarmigan and a lemming; a polar bear sniffs past and can't find the white ones (one with brown left giggles and runs). Dusk: only their eyes blink. Then her finger is sunshine: the snow melts in streaks, flowers pop up, coats go brown; the snowy owl stays white. The brush and the coats are feel-lab knobs.
7. **Greybox: Emperor Huddle** [done] · 2026-10-27 · PR #241
   Emperor dads with eggs on their feet on the night ice. Her finger lifts a shivering one off the windy edge and carries him into the middle: the huddle squishes to make room and he warms up (pink cheeks), and someone else ends up on the edge. Two more dads and a blizzard; the wind swings round and they all turn their backs to it. Pebble's papa, kept warm, hatches the egg; gusts blow Pebble across the ice and she carries the chick back to Papa's feet. Then the first sunrise. The drag and the warmth are feel-lab knobs.
8. **Art + characters: the friends** [done] · 2026-10-27
   Pola, Mama Bear, Pebble, Papa and Terry as 3D toys on the chibi rig (Terry with real wings), in the character lab, and Pola, Pebble and Terry as 2D puppets drawn to match them.
8b. **Art: the friends into each activity** [done] · 2026-10-28
   One activity per PR: the 3D friends replace the greybox shapes (Ice Floe Hop PR #257, Penguin Slide PR #258, Iceberg Maker came along), the Adélies on the rig, the 2D puppets and painted scenes for Snow Coats and the huddle, and the stickers (2026-10-28).
9. **Full loop: story, voices, facts** [done] · 2026-10-28
   One PR each, stacked (2026-10-28): **the way in** (stamps, the spots on the globe, Sparkle's corner, the friends' voices), then Ice Floe Hop, Iceberg Maker, Penguin Slide, the globe and the finale, Snow Coats and Emperor Huddle, each with its story, voices and hints, into the game.
10. **Finale: Pole to Pole + Polar Quiz** [done] · 2026-10-27 · PR #255
   Its own PR: the tern flight, then the quiz on the hub's globe, then the trophy. **Greybox built** (PR #255). **Voices and the toys in** (2026-10-28): Terry is the rig toy, he talks on the way, Sparkle speaks every question.

### What's built

### The 3D engine moves out of Thailand ([done] · 2026-10-27 · PR #216)

The engine, the chibi rig and the camera and feel labs now live outside the locked folder. Thailand plays the same.

- `src/world/engine3d/`: everything that was `places/thailand/engine/` (renderer, toon, outline, camera, loop, View3D, Anchors, water, particles, nav, ...).
- `src/world/engine3d/characters/`: the chibi rig (`animal.ts`), `face.ts`, and `look.ts` (the `Look` type, species, outfits, wearables). The family's own looks (`LOOKS`, the vet's patients, the coach) stay in `thailand/characters/looks.ts`, which re-exports the shared types.
- `src/world/labs/`: the camera lab (`?cam=1`), the feel lab (`?feel=1`) and their controls. They no longer ask for the family code outside Thailand. The character lab stays in Thailand (it shows the family).
- `TUNE` split: the look (light, bands, outlines, lens) stays in `engine3d/tune.ts`; the house camera and Kaylee's walk move to `thailand/tune.ts` (`THAI_TUNE`). The house's `?debug` panel edits and copies both.
- `scripts/check-heavy-imports.mjs` allows three in `engine3d/` and `labs/`, and fails if a startup file imports them.
- Checked with a locked build (`LOCK_CODE=test`): only Thailand's chunks are locked, and a probe import of `View3D` from outside Thailand landed in its own unlocked chunk.

### Greybox 1: the globe hub ([done] · 2026-10-27 · PR #219)

The Poles are a place now (a pin on Antarctica, nothing to stamp yet). Its home base is a toy globe in 3D: grab it and spin it, pull it down for the Arctic or up for Antarctica, then drag the sun up and down so summer and winter night swap between the poles.

- **Spin it:** the spot under her finger follows it (left and right: the Earth's own turn; up and down: which pole faces her). A flick keeps spinning and dies away; let go and it settles on the nearest view (the whole globe, the Arctic or Antarctica). Past straight down on a pole it stretches like a rubber band.
- **The Arctic:** a thin sheet of sea ice floating on the ocean, broken into floes at its edge that bob. **Antarctica:** a high dome of ice on land with the Transantarctic Mountains, the peninsula and a ring of sea ice. Pull one to the front and the camera moves in, the sky changes, a whoosh, and Pola (or Pebble) hops and waves.
- **Drag the sun:** once she has seen both poles and comes back to the middle, the sun pops out beside the globe (it glows until she drags it). The sun is the only light: the far side of the globe is night. It goes up and down the Earth's real tilt (23.4°): the pole it shines on gets daylight all the way round, its floes melt back and its snow line climbs; the other pole goes dark, with stars and the northern (or southern) lights. A happy note at each step of the way.
- Every tap does something: the globe squashes with a pop, Pola and Pebble hop and wave, the sun jiggles and sparkles. Left alone for 7 s the globe gives a little nudge.
- **Sections:** `hub/globe?side=middle|north|south` and `hub/sun?side=...&summer=middle|north|south`; the address bar follows her. The five activities and the finale each have one `soon` section (a “coming soon” card) until their greybox.
- **Feel knobs** (`?feel=1`): the globe's grip, coast, top flick speed, flick smoothing and reach, the pole view's tilt, settle speed, the rubber band past the pole, the idle spin; the sun's tilt, smoothing and how fast the seasons follow. The graph shows her finger, the tilt, the spin and the sun.
- **Files:** `places/poles/globe/` (`globe.ts` the world, `earth.ts` the painted map in the world map's colors and `ll()` for lat/lon, `material.ts` the day-and-night toon shader), `activities/hub/` (`Hub.tsx`, `sections.ts`), `Soon.tsx`, `meta.ts`, `lines.ts`. A `poles` emblem in `kit/Flag.tsx` stands in for a flag (the poles have none). Nothing imports from Thailand.
- **Voices:** only the passport line, its four facts and the five sticker facts are recorded (the place needs them); the globe itself is silent until the full loop. Short text lines at the bottom say what's on screen, for the user.

> **Changed from the plan**
>
> - A pole view tips the globe 28° toward her (a knob), not straight down on the pole, so Pola and Pebble stand up on the horizon instead of being seen from above.
> - Antarctica's view rolls the whole world half a turn once she lets go, so the south comes up to the top of the screen like the Arctic does, instead of Pebble hanging upside down under the globe. Flicking back up rolls it the right way round again.
> - Summer shows as the floes melting back and the snow line climbing; the tundra flowers come with the art.
> - One map pin, on Antarctica; the second pin at the top waits for the user's answer.
> - The lost penguin (the hub's third step) isn't in this greybox.

### Greybox 2: Ice Floe Hop ([done] · 2026-10-27 · PR #225)

Pola on grey floes on a blue sea, in the toon look: grab him, pull back and let go, and he leaps to the next floe. The floes dip, bob and lean under him; a miss is a happy belly-flop, a swim and a shake. One course in three stages, Mama Bear at the end.

- **The fling:** her finger on Pola, pull back: he crouches and looks at her finger, his floe presses down, and a dotted arc and a ring show where he will land (pink on ice, white on water). Let go: he turns, flies the arc and lands with a thump and a puff of snow. A landing just off a floe still lands on it (the landing help knob). A pull shorter than the dead zone is a tap: he giggles and hops.
- **The floes:** each is a spring. It sinks with his weight (little floes more, never under the water), leans toward where he stands, bobs after a landing and rides the swell. Poke a floe and it bobs. Every landing leaves paw prints.
- **Misses:** a belly-flop and a splash, then he paddles to the nearest floe (or the one she taps), climbs out and shakes, and water drops land on the screen. Tap the sea: a splash. The little tippy floes of the drift stage slide him off the far side when he lands near their edge.
- **One course, three stages** (`layout.ts`, data in meters): steady (6 rows of big floes close together, often two to a row, so there is a choice of path), drift (7 rows sliding side to side and turning, some little tippy ones), summer melt (6 rows of small floes further apart, plus loose bits off to the side; she pushes floes with her finger to make a bridge), then Mama's big ice. Each stage starts on a bigger floe that holds still.
- **Mama:** he scampers over, they both hop, confetti; a close shot of the hug, then the camera looks back over the floes. 🔁 lays the floes out a new way (`layout`).
- **Sections:** `floe/story|steady|drift|melt|mama`, all with `?layout=N`. A link starts Pola on that stage's first floe (Mama's link adds paw prints on the way there); the address bar follows him from stage to stage. The story shows Mama far across the water, then flies back to Pola (any touch skips it).
- **Feel knobs** (`?feel=1`): *Fling Pola*: full pull, dead zone, power (reach), power curve, arc height, lowest arc, hang time, landing help, crouch. *Floes and water*: dip, landing thump, tip, bob speed, bob damping, tippy edge, drift, swim speed, push grip. The graph shows her pull, the power, his height and his floe's dip.
- **Files:** `places/poles/activities/floe/`: `floe.ts` (the world), `layout.ts` (the course), `bear.ts` (Pola and Mama as greybox shapes), `FloeHop.tsx`, `sections.ts`. Still under `inTheWorks`. No voices (greybox): a short line at the bottom says what is on screen. QA: the screens, a motion scenario (`poles-floe-fling`) and pacing.

> **Changed from the plan**
>
> - While she pulls, a dotted arc and a ring show where he will land: at five, she needs to see where her pull sends him.
> - Pola looks at her finger while she pulls (so she sees his face), then turns and leaps.
> - The full pull is never more than 30% of the screen's short side, so an iPhone held sideways has room to pull back under him.
> - No pokeable animals yet (the seal, the narwhal, the walrus...) and no dip under the ice: they come with the art.
> - About 20 rows from Pola to Mama, so about 20 flings plus misses, a little under the plan's 25-35: the user's play will say if it wants more.

### Greybox 3: Penguin Slide ([done] · 2026-10-27 · PR #229)

Pebble's papa on his belly down an icy valley, in the toon look: her finger steers him with the Nan drive's wheel, the slope does the going. Bumps throw him in the air, the runs split round a rock, the ice ends at a cliff, and the same steering flies him through the krill under the sea. Home, he feeds Pebble.

- **The steering:** her finger goes down anywhere and the Nan drive's wheel appears under it (moved to `engine3d/SteerWheel.tsx`, the finger math to `engine3d/wheel.ts`; the Nan drive uses the same wheel). Push left or right and he slides that way for as long as she holds it, swerving toward a point ahead; let go and he drifts back to the middle of the valley (or of his run). Not steered yet, or for 8 s: the 👆 slides side to side.
- **The slope** (`course.ts`, data in meters, one height field for the mesh and the physics): an icy blue valley between snowbanks, with stripes and little flags streaming past. He follows the ice, and where it drops away faster than he can fall (a mound's top, the kicker's end, the lip) he flies: wings out, a boing, a thump and a puff of snow when he lands.
- **The gentle slope (`top`):** he flops onto his tummy and goes. Ten Adélies on the way: the wide-awake ones squawk and hop aside, the sleepy ones stay put, and if he hits one they both spin like tops. Steer hard up a snowbank and he plunges in head first, feet wiggling, then pops out. Three little rollers at the end are a taste of what's next.
- **Bumps and cracks (`bumps`):** snow mounds to hop off, a rock ridge (pink flags at its nose) splitting two runs: moguls on the left, a big kicker on the right. He bonks off the rock's side instead of going through. Then a lip and a crack right across: he always flies it (and if he ever drops in, a boing pops him out).
- **Under the sea (`dive`):** the ice ends at a cliff: off he goes, splash, and the camera follows him under (blue fog, the bright surface above, rocks below). The same wheel steers him through 16 pink krill swarms (later ones drift); a near one drifts into his beak (gulp, a rising note, his tummy grows and the 🦐 tummy in the corner fills pink). A leopard seal loops round him; bump it and you both spin. At the end he rockets up onto the colony's ice.
- **Feeding Pebble (`home`):** he slides in on his tummy, stands up, and feeds her one beakful at a time (at least 4, so she's never hungry); her tummy grows, then everyone hops, fanfare, confetti. 🔁 slides again from the top.
- **Sections:** `slide/top`, `slide/bumps?run=left|right` (the run he starts toward), `slide/dive`, `slide/home?krill=N`. The address bar follows him, with his krill.
- **Feel knobs** (`?feel=1`): *Steering*: the user's Nan numbers to start (slide speed, wheel size, dead middle, gentle small pushes, smoothing, aim ahead, aim closer when far off), plus sharpest swerve and back to the middle. *The slide*: top speed, gentle slope share, speeding up, gravity in the air, up the snowbank, stuck in the snow, when the Adélies hop aside. *Under the sea*: swim speed, slide speed, krill come to him, leap out. The graph shows her push, the steer, where she's steering to, where he is and his height in the air.
- **Files:** `places/poles/activities/slide/`: `slide.ts` (the world), `course.ts` (the course), `penguin.ts` (Papa, Pebble, the Adélies and the seal as greybox shapes), `PenguinSlide.tsx`, `sections.ts`. Still under `inTheWorks`. No voices (greybox). QA: the screens, a motion scenario (`poles-slide-steer`) and pacing.

> **🔀 Changed from the plan**
>
> - **Pebble's papa slides, not Pebble** (as the plan's pitch has it): emperor chicks can't swim yet. Pebble waits at the colony and gets fed.
> - The krill tummy is his own round tummy in 3D plus a 🦐 tummy in the corner that fills pink.
> - A snowbank plunge (head first, feet wiggling) is the silly moment for steering off the side.
> - No pokeable animals yet besides the Adélies, Pebble, the colony and the seal (the skua, the Weddell and elephant seals, the whale, the station): they come with the art. “Which way to leap out” isn't in yet: he always comes out onto the colony's ice.
> - About 1 min 45 s top to bottom (26 s gentle slope, 29 s bumps, 40 s under the sea, then home), steering the whole way.

### Greybox 4: Iceberg Maker ([done] · 2026-10-27 · PR #235)

She picks a pole, taps the cracks in its ice cliff to break off bits, cracks the giant one off and sees how much of it hides under the water, then flicks her icebergs out to sea. One verb (tap the crack) that grows from little bits to the giant, then the push.

- **The pick (`pick`):** two little bergs float side by side: Greenland's pointy one with Pola, Antarctica's flat one with three Adélies. Tap one: it bobs, its animals hop, the other drifts off, and her pole's cliff comes up. Both play the same; the bergs come out the shape of their pole (`ice.ts`).
- **The cliff:** a wall of ice columns across the screen (north: 8 m with a jagged top, a glacier rising to mountains behind, Pola on top; south: a flat 4.5 m shelf to the horizon, Adélies and emperors on top), a blue band of old ice at the waterline, a seal sunbathing on a growler in front.
- **Little bits (`bits`):** three cracks on the face at a time, each a dark jagged loop round a chunk, already started so she sees where to tap. A tap: a creak, the crack creeps on, the chunk shakes and leans out. The second tap: crack!, it tips off, tumbles, SPLASH, a white wave ring rolls out and everything floating rides it. It plunges, pops up and rolls onto its nearest side; a blue scar stays on the face, and a new crack opens a moment later. Floating bits: tap to poke them under (they fizz, “bergy seltzer”), or slide them about.
- **The giant one (`giant`):** after five bits the little cracks close and a long one opens over a whole section, with a groan. Five taps creep it round (each a groan, a shudder, a lean). It hangs on, groaning, then drops: a huge splash, a wave across the screen, the friends on the cliff top get soaked and shake it off (the Adélies spin like tops). It rocks and settles; the camera sinks under the waterline (blue fog, the surface see-through above) and there's the whole berg, the little white tip and the huge blue keel (about 9 parts out of 10), an orca looping underneath. Her finger pushes it down; let go and it shoots up past where it floats and bobs back. After three pushes (or 30 s) up we go.
- **Send them sailing (`sail`):** the camera turns round to look out to sea from the top of the cliff. The friends hop onto the giant (Pola up north, three Adélies down south). She flicks the bergs away from her, up the screen (a tap pushes one out a little too); past 22 m out they sail off on their own into a little fleet. The giant and three bits away: a fanfare, a look at the fleet with the friends waving, then 🔁 with the other pole's animal starts again at the other end of the world.
- **Feel knobs** (`?feel=1`): *Cracking the ice*: taps for a bit, taps for the giant, bits before the giant, cracks at once, new crack after, crack grows in, shake, lean per tap, fall, splash, wave speed. *Floating ice*: hidden share, bob speed, bob damping, plunge, rock speed, rock damping, push depth, push per finger, grip, glide drag, flick. The graph shows the crack, the giant's height, her push and the wave.
- **Pokes:** the friends (hop, chirp, honk), the seal (rolls and barks), the orca under the water (a barrel roll and a whistle), a blue scar (glows and chimes), the face (a puff of snow), the water (a splash and a little wave).
- **Built on** `engine3d/` (water, particles, camera, View3D) with Pola from Ice Floe Hop (`floe/bear.ts`) and the penguins and seal from Penguin Slide (`slide/penguin.ts`), all still greybox shapes. QA: `qa-screens` (every stretch at both poles), a `qa-motion` scenario (the giant cracked off, under the water, pushed down) and `qa-pacing`.
- Changed from the plan
  - The friends stand on the cliff top, not on a shore beside it, so they show in every screen shape and get soaked by the giant's splash.
  - Pushing out to sea is a flick (and a tap nudges), with the camera turned round to look out to sea from the cliff, so “away” is away from her, up the screen.
  - Bits float a bit higher than real ice (the *hidden share* knob, 0.88) so a little one still shows; the giant is built about 9 parts in 10 under.
- **Known small things:** the berg doesn't flip over to show its smooth blue bottom (a silly moment in the plan) yet; no fish under the berg yet; no voices (the full-loop gate).

### Greybox 5: Snow Coats ([done] · 2026-10-27 · PR #239)

Arctic animals change coats with the seasons, in 2D: her finger rubs snow over brown animals and their coats go white where it goes, the white ones vanish into the snow so the polar bear can't find them, then her finger rubs the summer back. One verb (rub) from one fox, to four animals and a bear, to the whole tundra.

- **The rub:** every stroke is a [perfect-freehand](https://github.com/steveruizok/perfect-freehand) outline added to the animal's mask, in the animal's own units, so the paint moves with it (a hop, a run, turning the iPad). The white coat is the same flat shape drawn over the brown one, showing only where her strokes are. A grid of cells under each coat counts how much is done; past *finishes itself at* (78%) the rest puffs on by itself, with a sparkle and a hop. A rising note at every fifth of a coat. Fluffy tufts grow along the outline wherever the coat is white. A tap on an animal is a giggle or a hop (and a little dot of snow).
- **Paint the fox (`fox`):** late-summer tundra (brown ground, grass tufts, a grey sky). Snow starts to fall, more and more; the ground slowly goes white by itself (*snow settles*, 35 s), and she can rub snow onto it too. The fox done: it hops, the ground goes all white, and hide and seek starts (`hide?painted=fox`).
- **Hide and seek (`hide`):** the white fox plus a brown hare, ptarmigan and lemming on the snow (two rows, so each is big enough to rub). As a coat gets whiter its outline fades into the snow; done, it's gone but for its eyes and nose. The address bar keeps `painted` up to date. When every animal is at least half white and she stops rubbing for 4 s (*bear comes after*), a polar bear walks in sniffing. At each animal he stops and sniffs: a white one isn't there (he looks round, a “?”); one with brown left giggles and runs to a free spot behind him (silly, never caught), and he comes back from the other side later. When he can't find any: dusk, the northern lights, only their eyes and noses blinking. The ☀️ button (or 14 s) brings the summer.
- **Rub the summer back (`summer`):** a blue sky and a sun (tap: it sparkles), everything white. Now her strokes melt: the snow comes off the ground in streaks showing the tundra, flowers pop up where it melted (*flowers*, 30% of patches), coats turn brown and their outlines come back. The snowy owl on its rock stays white: rub or tap it and it shakes its head, and the line says snowy owls and polar bears stay white all year. All four brown: the rest of the snow melts, flowers everywhere, fanfare, confetti, everyone hops; 🔁 starts again from the fox.
- **Pokes:** the animals (giggle or hop), the sky (a puff of snowflakes; at dusk the northern lights ripple), the sun, the owl, the bear (a huff).
- **Feel knobs** (`?feel=1`): *Rub the coat*: brush size, smoothing, streamline, thinning, point spacing, counts as painted. *Coats and hiding*: finishes itself at, fluff, snow settles, bear comes after, bear walk, sniff, flowers. The graph shows her finger's speed, the brush size, how done the last coat she touched is, and how snowy the ground is.
- **Screens:** a wide stage (1600 × 1000) and a tall one (1000 × 1500) that scale to fit; the extra edge is more sky and more snow. The ☀️ and 🔁 buttons wait in the sky's top corner, clear of the animals.
- **Files:** `places/poles/activities/coats/`: `SnowCoats.tsx` (the scene, the strokes, the bear), `animals.ts` (the placeholder shapes, the coat grids, the two stages), `sections.ts`. Loaded on its own (no three.js). Still under `inTheWorks`. No voices (greybox): a short line at the bottom says what is on screen. QA: the screens, a motion scenario (`poles-coats-rub`) and pacing.
- Changed from the plan
  - The bear comes when every animal is at least half white and she has paused, not only when all are done, so a missed brown patch gets found (the silly run).
  - The payoff is dusk with the northern lights: the white animals vanish into the snow, only eyes and noses blink.
  - The ground snow is rubbable too: snow onto the tundra in the fox section, melted off in streaks in the summer.
  - The snowy owl is in the summer; the bear only walks through hide and seek (the line about both staying white shows when she rubs the owl).
- **Known small things:** the feel lab lists every Poles activity's knobs, so *Rub the coat* is near the bottom of the panel. The lemming is small next to the brush, so it goes white in two or three strokes. No pokeable reindeer, musk ox or popping lemming yet (they come with the art). The same layout every time (the plan's replay with other animals isn't in yet).

### Greybox 6: Emperor Huddle ([done] · 2026-10-27 · PR #241)

Winter night in Antarctica, in 2D: her finger carries shivering emperor dads from the windy edge into the middle of the huddle, where they warm up, and moving one in pushes another out, so the huddle keeps turning like a real one. Then the wind swings round, Pebble's egg hatches on Papa's feet, gusts blow Pebble out and she tucks Pebble back, and the sun comes up for the first time in months. One verb (drag a penguin in) from five dads, to seven in a blizzard, to the chick.

- **The drag:** her finger on a penguin lifts him off the ice (feet paddling, flippers out) and he follows it (*follow her finger*); a held one shoves the others aside a little (*push while held*). Let go: he lands with a squash and the huddle squishes to make room (*squish*), everyone shuffles, and the warm ones shuffle back up to touch the huddle (*huddle together*). A tap without a drag: he sings his own call, or a snowy one shakes his snow off.
- **The huddle:** each penguin stands on a round footprint on the ice (depth squashed, `huddle.ts`); nearer ones are lower on the screen and a little bigger, sorted every frame. They turn their backs to the wind. A neighbour standing upwind, close enough (*shelter reach*), keeps him out of the wind and he warms up (*warm-up time*, 3 s); on the windy edge he cools (*cool-down time*, 15 s; faster alone or in the blizzard). Below *shivers below* (0.4) he shivers, his back goes blue and snow piles on his head and back. Warmed up from there, he hops, honks, gets pink cheeks and fills a dot. Moving one into the middle pushes another out to the edge, so there is always someone to rescue; the whole huddle slowly shuffles back to the middle of the ice (*back to the middle*).
- **A small huddle (`small`):** five dads, each with an egg on his feet, a light wind; one stands alone on the windy edge, shivering. Five rescued, and two more dads waddle in from the dark.
- **The wind turns (`blizzard`):** seven dads, a stronger wind; every 18 s (*wind turns every*) it swings round with a big whoosh, they all turn their backs to it, and the other side gets cold. The address bar follows it (`?wind=left|right`). Eight rescued.
- **Crack! (`hatch`):** the dad on the cold edge right then is Pebble's papa (his egg turns pink). Brought in and kept warm, the egg wobbles, cracks twice and hatches (*egg hatches after*, 5 s warm): Pebble on his feet, everyone hops. Then a gust blows Pebble off his feet and rolling across the ice; she carries the chick back to Papa's feet (the same drag) and Pebble tucks in (*tuck reach*). Three gusts (*gusts*, *gust after* 7 s). Left out 14 s, Papa waddles over and scoops Pebble up himself.
- **The first sunrise (`sunrise`):** the wind drops, Papa steps out to the front with Pebble, the sky turns peach and the sun peeks over the horizon; everyone turns to look, fanfare, confetti, then 🔁 plays again with the wind from the other side.
- **Silly, never “oops”:** frozen for 10 s (*sneeze after*), he sneezes a snowball and waddles in by himself, so she's never stuck. A hard shove right into another pops that one out of the top like a cork (*cork pop*: a careful drop goes about 0.2 in, a hard shove 0.4). Eight seconds with no touch: a 👆 carries the one who needs it toward the middle (or Pebble to Papa).
- **Pokes:** every penguin (his call, or a shake), Pebble (a chirp), the sky (the southern lights glow), the moon (it twinkles), the ice (a puff of snow).
- **Feel knobs** (`?feel=1`): *Drag a penguin*: follow her finger, lift, grab reach, push while held, squish, huddle together, back to the middle, cork pop. *Wind and warmth*: warm-up time, cool-down time, blizzard is colder, alone is colder, shivers below, shelter reach, warm-ups in the small huddle and the blizzard, wind turns every, sneeze after, egg hatches after, gusts, gust after, tuck reach. The graph shows her finger's speed, how far the held penguin lags behind it, the coldest penguin, the held one's warmth and the wind.
- **Screens:** a wide stage (1600 × 1000) and a tall one (1000 × 1500) that scale to fit; the extra edge is more sky and more ice. The 🔁 button waits in the sky's corner.
- **Files:** `places/poles/activities/huddle/`: `EmperorHuddle.tsx` (the scene, the drag, the packing, the wind), `huddle.ts` (the placeholder shapes, the two stages, the starting huddles), `sections.ts`. Loaded on its own (no three.js, no Phaser). Still under `inTheWorks`. No voices (greybox): a short line at the bottom says what is on screen. QA: the screens, a motion scenario (`poles-huddle-drag`) and pacing. A robot dragging in the coldest one each time played from the small huddle to the sunrise in about 2 minutes, no errors.

> **🔀 Changed from the plan**
>
> - **A small packing loop on SVG, not Phaser:** seven round penguins don't need a physics engine, and SVG keeps the ink outline (and the 2D puppets to come).
> - **Every dad has an egg** on his feet, as real emperor dads do. Pebble's papa is whoever is on the cold edge when the egg starts, so she has to bring him in.
> - **Rescues, not rounds:** the dots count cold dads she warms up (5, then 8). The huddle is never all warm at once, because someone is always on the windy edge.
> - The cold ones are too frozen to move by themselves (only the warm ones shuffle up), until one sneezes.
> - At sunrise Papa steps out to the front, so Pebble isn't hidden behind the other dads.
> - The sunrise is a section of its own, and `chick=hatched` starts at the gusts.

**Known small things:** tucked in the middle of the huddle, Pebble is behind the front row (true to life, but hard to see). No snow on Pebble. The moms coming back from the sea aren't in it. The plan's replay with another penguin's egg isn't in yet (🔁 swaps the wind's side). The southern lights glow all night instead of only when tapped.

### Hub greybox 2: the lost penguin, and things to poke ([done] · 2026-10-27)

The hub's third step: after she has dragged the sun, a lost penguin (or polar bear cub) turns up on a little iceberg in the warm middle of the world, fanning itself. She grabs it and carries it to the top or the bottom of the globe. The globe turns to show where it lands. Its own pole: it lands by Pebble (or Pola), they hop and wave, confetti. The wrong pole: it looks round, a pink “?” pops over its head, whoever lives there jumps back, then its own pole glows and it hops back onto its berg to be carried again. Never an “oops”. Then the next one, a bear after a penguin.

- **Carrying it:** her finger on the lost one lifts it off the berg (bigger, legs swinging) and it follows her finger in front of the globe; while she holds it, the globe turns back to the whole view so both poles are in sight. Let go over the top of the globe (the north), the bottom (the south) or in between (it splashes back onto its berg). A tap without a drag is a hop.
- **The berg** stands up toward the top of the screen instead of straight out of the sea, so from the middle view she sees the penguin from the side, not from above. It drifts and bobs with the globe's spin, and turns up in whichever warm sea is facing her. Left alone 6 s, the lost one waves.
- **Home:** each saved one stays on its pole (up to 3, then the oldest wanders off), so the colony and the bears grow as she plays.
- **Pokes:** the North Pole's striped marker wobbles and rings; a seal pops out of its breathing hole by Pola, looks round and barks (and pops up by itself now and then); the science station's door swings open and a scientist steps out and waves; a whale in the South Atlantic surfaces, spouts and slaps its tail (and does it by itself every ~10 s); a tap on the empty sky bursts snowflakes, and in a pole's winter night the lights flare up and ripple faster with a chime.
- **Sections:** `hub/lost?who=penguin|bear&summer=...`: the sun out and already dragged, the lost one adrift at once. The address bar switches to `lost` when the first one appears.
- **Files:** `globe/extras.ts` (the lost one and the pokes), hooked into `globe/globe.ts` (anchors, the carry, the sky tap, the lights' flare). QA: two `qa-screens` routes (`lost?who=penguin`, `lost?who=bear`) and a `qa-motion` scenario (`poles-lost`: the wrong pole, then home). No voices (the full-loop gate).
- **Known small things:**
  - The whale is seen from above (it's on the globe's face), so it reads as a blue blob with a spout until the art.
  - There are no animals adrift other than a penguin and a bear cub yet. A walrus or an Arctic fox to sort (the quiz's “who lives up north?”) could come later.

### Finale greybox: Pole to Pole and the Polar Quiz ([done] · 2026-10-27 · PR #255)

The finale end to end in placeholder shapes. Terry the Arctic tern flies Pola's postcard from the top of the world to the bottom while the globe turns under him, past the pins of the countries she has been to. Her finger steers him, and he gulps the fish he flies over. He lands at Pebble's colony and hands over the postcard; the penguins see Pola's picture and jump back. Then the camera pulls back to the whole globe for the Polar Quiz: six questions from a pool of eight, each answered by doing. Six stars, the Polar Explorer badge, then the trophy.

- **The flight** (`party/route.ts`): great circles from near the North Pole, through the countries she has visited (north to south, from the passport), down to the colony on Antarctica's coast. With no countries visited, it goes straight down the Atlantic. It takes about 80 s (*shortest flight*); a long way just flies faster.
- **Steering:** her finger anywhere and Terry heads for it, left or right, banking into the turn (*reach*, *steer smoothing*). A tap on him is a barrel roll.
- **Three legs** (the address bar follows: `fly?leg=north|warm|south`):
- Each leg adds something:
  - **The Arctic:** blue-lilac fish between the floes.
  - **The warm middle:** a peach sky, orange fish and clouds to puff through (a barrel roll and a giggle). The pins pop as he passes, with the country's name.
  - **The windy south:** a lavender sky, two pink fish at a time, and gusts with white streaks that push him sideways (*gusts*).
- Fish only leap in the sea (the painted map's land is masked out). The 🐟 counter fills, with a rising note for each fish.
- **The postcard** (`deliver`): he glides down in front of Pebble, the card goes up into Pebble's flippers, and the four penguins around her see the polar bear on it and jump back. Then everyone hops and the fanfare plays. A tap on Pebble, the penguins or Terry is a hop. About 7 s, then the quiz.
- **The quiz** (`quiz?q=<question>&stars=N`): the globe swings round to north-up; pieces stand on little floes in a row under it. Four kinds of answers:
  - **Drag** (`bear`, `penguin`): put Pola (or Pebble) on the globe. Let go over the top or the bottom.
  - **Spin** (`north`, `south`): spin the globe so that pole faces her. A flag pops up there. The wrong pole: the globe wobbles back like a top.
  - **Tap a pole** (`ocean`, `coldest`): the globe tips to show it. Ocean: fish leap round the north (right), or a rock pops up under Antarctica's ice (wrong). Coldest: a thermometer freezes solid with a crack (south, right), or shivers (north).
  - **Pick from the row** (`tern`: the bear, the penguin or Terry, who loops round the globe; `summer`: the sun rises over the north and the south goes dark, pick the snowman or the beach ball).
- **A miss:** a pink “?” and a silly bit, then the right thing glows (*look for the glow*) and she does it herself. Every question ends in a star. The six stars sit at the top; the address bar keeps `q` and `stars`.
- **The badge** (`badge`): six stars, confetti, then the shell's trophy (`onWin`) after 4.5 s or on 🏆.
- **Feel knobs** (`?feel=1`, *Fly Terry*): flying speed, shortest flight, reach, steer smoothing, catch width, fish every, gusts. The graph shows her finger against Terry, the gust and the fish.
- **Files:** `activities/party/` (`party.ts` the world, `route.ts`, `Finale.tsx`, `sections.ts`; `Party.sections.ts` and `Soon.tsx` are gone). The Earth's parts (the Arctic, Antarctica, Pola, Pebble) are now functions in `globe/globe.ts` (`buildNorth`, `buildSouth`, `makePola`, `makePebble`) that the hub and the finale share. QA: `qa-screens` (each leg, the postcard, a question of each kind, the badge), a `qa-motion` scenario (`poles-party-fly`) and `qa-pacing`.
- **Changed from the plan:** the iceberg question and “who lives up north” aren't in the pool yet (8 questions instead of 9; the iceberg one needs the water from Iceberg Maker). Terry flies over the passport's countries, not the world map's pins. The encouragement stays name-free (updated 2026-11-11).
- **Known small things:**
  - Over a big continent (Africa) there are no fish for a while, only clouds.
  - A wrong drop on the South Pole lands under the globe, where the “?” is hard to see.
  - The badge doesn't pin onto the passport page yet.

### Step 8a: the friends, in 3D and 2D ([done] · 2026-10-27)

The friends are characters now, not greybox shapes. In 3D they are toys on the same chibi rig as Thailand's family, in the character lab under **The Poles**; in 2D they are live puppets drawn from the lab's pictures, with the same colors. Nothing in the activities changes yet: each activity swaps its friends in its own PR.

- **Pola** (`polarbear`, a new species on the rig): a round, fluffy white cub with a tuft on top, little round ears set out to the sides (pink inside), fluffy cheeks, a long cream muzzle with a big black nose, cream paws and a happy open mouth. **Mama Bear** is the same, bigger and rounder, with lashes.
- **Pebble** (`penguin` with a new `cap` color): grey fluff all over with tufts sticking out round the middle, a black head with the heart-shaped white face, a tuft on top, a small black beak. **Papa** is an emperor: black head and back, white tummy and the gold patches beside his face (a penguin's `ear` color).
- **Terry** (`tern`, a new species): a white body and face, a black cap sweeping down the back of the head, a slim red-orange beak, short red legs and a forked white tail. The wings are long pointed pale grey wings with dark tips, hung on the arm pivots, so a wave or a cheer spreads them.
- **The 2D puppets** (`places/poles/puppets/`, at [#/world/puppets](#/world/puppets)): Pola (hop, wave, cheer, wiggle, *shake* the sea water off, and `wet` for drips after a belly-flop), Pebble (hop, flap, cheer, wiggle, waddle, and `cold` for the huddle: shivers, droopy eyes and pale cheeks), Terry (flap, hop, cheer, wiggle, bow, and `flying`: wings out and beating, feet tucked). They breathe, blink, watch her finger, and their mouths (beaks) open with their voices. `face.tsx` holds the shared eyes and outlines.
- **Files:** `places/poles/characters/looks.ts` (the five looks and `POLES_COLORS`, which the puppets read too), `engine3d/characters/animal.ts` and `look.ts` (the `polarbear` and `tern` species, `cap`, gold penguin patches; nobody in Thailand changes), `thailand/lab/catalog.ts` (The Poles group).
- **Not yet:** voices (the full loop; the lab says “no voice”), the friends in the activities, the painted 2D scenes, the stickers. Kaylee doesn't walk on the ice (as planned).

### Step 8b: Pola and Mama Bear into Ice Floe Hop ([done] · 2026-10-28)

The greybox bears are gone: Pola and Mama Bear on the floes are the toys from the character lab. Everything he did still plays on the rig's own pivots: the crouch as she pulls back, the stretch and flail in the air, the belly-flop, the paddling swim, the climb out and the shake, the hop when she's stuck, and the wave.

- `activities/floe/bear.ts` builds the rig from `POLES_LOOKS` (`buildAnimal`) and drives `body` (hop, squash, lean, shake), `head` (it lags the shake, tips up in a flail, tilts into a wave), `armL`/`armR` (hang, paddle, flail, wave) and the tail. Blinks and the mouth come from `FaceLife` (cast ids `pola` and `mama`, so they talk once they have voices).
- Sizes stay the greybox's so the fling, the camera and the tap targets don't change: Pola stands 1.2 m (0.9 m in the lab), Mama 1.8 m. Pola hides the rig's own shadow, since the world draws his on whatever is under him.
- **Iceberg Maker** used the same `Bear`, so its Pola on the cliff and on the giant berg is the rig toy too (0.8 m and 1.2 m).
- **Not yet:** voices, the painted look of the sea and the floes.

### Step 8b: Papa and Pebble into Penguin Slide ([done] · 2026-10-28)

Papa on his belly down the ice and Pebble waiting at home are the toys from the character lab now. Everything still plays on the rig: tipping onto his belly, flippers out like wings in the air, paddling in the sea, head first into a snowbank with his bottom wagging, spinning like a top, the hop, his tummy growing round with krill, and Pebble's waddle and hops as she's fed.

- `activities/slide/penguin.ts`: `emperor` and `chick` build the rig from `POLES_LOOKS` (`papa`, `pebble`) and drive its root (squash, hop, belly tilt, spin), `armL`/`armR` (the flippers), `body` (rounder when full; it wags in a snowbank, since the rig's feet have no pivot of their own) and `head` (up to see where he's going on his belly, up in a flail, a bob in a waddle). Blinks and the beak come from `FaceLife` (cast ids `papa`, `pebble`).
- `Penguin.beak()` finds the real beak on the rig, so krill stream into Papa's beak and hop into Pebble's wherever their heads are.
- Sizes stay the greybox's (Papa 1.44 m, Pebble 0.82 m). The rig's blob shadow stays flat on the snow when he tips over; Papa hides his, since the world draws one under him.
- **Came along:** the five emperors in the colony and Iceberg Maker's emperors use the same look as Papa (one `Penguin` class). The **Adélies** stay greybox: there's no Adélie look yet.
- **Not yet:** voices, an Adélie look, different faces for the colony's dads.

### Step 9, part 1: the way in ([done] · 2026-10-28)

Everything the activities need to go into the game, before any of them does: their spots on the globe, the stamp, the sticker and the video when one finishes, the finale once all five stamps are in, Sparkle in a corner to say what to do, and the friends' voices. Nothing changes for Kaylee yet: every activity is still in the works until its own PR says it's ready.

- **Spots on the globe** (`activities/hub/Hub.tsx` `Spots`): spin to a pole and its activities pop up as big round buttons (a column on the right on a wide screen, a row near the bottom on a tall one): the floes and the coats up north, the slide and the huddle down south, the icebergs on both. A done one has a dashed pink ring. Nothing shows from the middle, so she spins to find them. 🎉 opens the finale once every stamp is in.
- **The stamp** (`Place.tsx`): an activity calls `onDone` at its payoff: the stamp and the sticker (`kit/StampEarned`, 🌍 to go on), then its video from `meta.videos` (skippable), then back to the globe. The finale opens only with every stamp (or `?stamps=all`).
- **Each activity says when it's ready** (`activities/<id>/info.ts`: its name, icon, sticker, `READY` and which `POLE` its spot is on). `meta.ts` builds `activities` and `inTheWorks` from them, so each activity goes into the game in its own PR without touching the others.
- **Sparkle in a corner** (`src/world/kit/Guide.tsx`, shared): a small live Sparkle who says what to do with the line in a bubble, a hint after 8 s with nothing touched (then every 20 s, four at most), tap her to hear it again, and `once()` for a fact the first time she pokes something. For 3D worlds and full-screen 2D stages.
- **The friends' voices** (`cast.json`): Pola (a bouncy cub), Mama Bear (warm and calm), Pebble (a squeaky chick), Papa (a proud, gentle emperor dad) and Terry (a chirpy, fast-talking tern). No accents: nobody lives at the poles for good. `lines.ts` has a block per activity, and the trophy's lines are recorded.
- **QA scenarios per activity** (`activities/<id>/qa.mjs`): the screens, pacing runs and filmed moments moved next to each activity; the Poles' own `qa.mjs` keeps the hub and the finale.
- `art.ts` holds the stickers and the friend's portrait (still the world's globe until the sticker art).

### Step 9: Ice Floe Hop goes into the game ([done] · 2026-10-28)

Pola calls out to Mama across the sea ice, and Sparkle, in the corner, says what to do at each stretch (and again when she's stuck). Pola and Mama react in their own voices to the belly-flops, the tippy slides, the new ice and her taps. Home with Mama they cheer, then the stamp and the polar bear sticker. Ice Floe Hop has its spot on the globe's north side now.

- `activities/floe/FloeHop.tsx`: one Pola line, then Sparkle's instruction (5.1 s of talk before the first touch). Sparkle's corner (`kit/Guide`) has a hint for each stretch (steady, drift, melt) and replaces the greybox's text pill. The friends' reactions take turns from a list, at least 5 s apart. A fact the first time she pokes the ice (“This ice is floating on the sea!”) and the open water.
- Home: Mama's and Pola's lines, then “You got Pola home!”, then `onDone` (the stamp, the sticker, the video), after the lines or 9 s at most. 🔁 still plays again.
- `floe.ts`: new events `flop`, `slide`, `poke(pola | mama | floe | water)`.
- `L.floe` in `lines.ts`: 24 lines (13 Pola, 5 Mama, 6 Sparkle). Pola's lines use the name, not he or she.
- `info.ts`: `READY = true`. `qa.mjs`: the hug and the stamp as two screens.
- **Changed from the plan:** Mama's “Hop home to me, Pola!” is her first tap line instead of part of the opening, to keep the talk short. No pokeable seals, narwhals, walruses or belugas yet (the greybox never had them), so the facts hang on the ice and the water.
- **Known small things:** three Pola clips transcribe a little off (“Wheee! A slide!”, “Brr! Paddle paddle!”, “Hee hee!”): listen on the iPad. “Fling me again!” kept coming out as “Sing me again”, so it's “Again! Again!”.

### Step 9: Iceberg Maker goes into the game ([done] · 2026-10-28)

Iceberg Maker talks now, and its 🧊 spot shows on both sides of the globe. Sparkle, in a corner, says what to do at each stretch (and again when she's stuck), with a short fact the first time something comes up. Pola on the north glacier and Papa on the south ice shelf say hello and react in their own voices to the big moments. When her fleet sails off: the stamp, the narwhal sticker, then the iceberg video.

- **Sparkle (`kit/Guide`):** “Pick a pole: north or south?”, tap the cracks, the giant crack, “most of the iceberg hides under the water”, push it down, push them out to sea, and the goodbye. Each instruction is also her hint after 8 s with nothing touched. The greybox's text pill is gone.
- **Facts, once each:** calving at the first bit; tall and pointy (north) or flat like a table (south) at the second; nine parts out of ten under the water at the first push; fresh water, not salty, when they set sail; bergy seltzer at the first fizz; blue old ice at a tapped scar; the napping seal; orcas at both poles.
- **The friends:** a hello after the pick, a word on some bits (at most one every 4 s), a groan line when the giant lets go, a soaked line after its splash, wonder at the hidden part, “I'm riding the iceberg!” / “All aboard, everyone!”, a giggle when tapped, and the goodbye.
- **The stamp:** 5.5 s after the fleet has sailed (the goodbyes first), `onDone`. The 🔁 “other pole” button is gone: opening the activity again starts at the pick.
- `L.iceberg`: 38 lines (16 Sparkle, 11 Pola, 11 Papa). Pacing: no talk before the first touch (the pick line plays while she can already tap), about 0.7 s of talk per tap.
- **Files:** `activities/iceberg/iceberg.ts` (a new `moment` event: bit, groan, soak, push, ride, away, giantAway, fizz, blue, seal, orca, friends), `IcebergMaker.tsx` (who says what and how often), `info.ts` (`READY = true`), `qa.mjs` (the pacing run opens `/pick`).
- **Changed from the plan:** Papa speaks for the south (Pebble isn't on the shelf; the Adélies and emperors are).
- **Known small things:** Sparkle's corner covers a little of the cliff top in portrait (nothing tappable there). The pacing robot can't push or flick, so it never reaches the stamp; the drags are checked by the `poles-iceberg-giant` motion scenario.

### Step 9: Penguin Slide goes into the game, and the Adélies ([done] · 2026-10-28)

Penguin Slide is in the game. Pebble says “Papa, I'm so hungry!” and Papa goes off fishing. Sparkle in the corner says what to do on each stretch, and Papa talks when he flies off a bump, plunges into a snowbank, bumps an Adélie, meets the seal or gulps krill. When Pebble is fed she says thank you, and the stamp follows. The little penguins on the slope are Adélies on the rig now.

- `activities/slide/PenguinSlide.tsx`: a `StoryBeat` with the 2D Pebble (a fresh start or the `story` link; a tap skips), Papa held at the top of the slope (`World.held`) until it ends: 3.7 s of talk before the first touch. `kit/Guide` gives each stretch's instruction when it starts (with “Antarctica is one big hill of ice!” at the bumps and “Penguins fly under the water!” at the dive) and again when she's stuck. A fact the first time she pokes Papa, Pebble, the seal or an Adélie (a second Adélie: no polar bears here). Papa says at most two lines per kind of moment, at least 6 s apart, never over someone else. `onDone` 3.4 s after Pebble is fed. The text pill and 🔁 are gone (she replays from the globe).
- `slide.ts`: a `moment` event (go, air, bank, bump, seal, leap), a `poke` event, and `held`. `sections.ts`: a new `story` section (“Pebble is hungry”).
- `L.slide`: 26 lines (10 Sparkle, 13 Papa, 4 Pebble).
- **The Adélie** (`characters/looks.ts` `adelie`, in the character lab at [#/world/characters/adelie](#/world/characters/adelie)): black head and back, white tummy, and a new `eye-ring` extra on the rig (`engine3d/characters/look.ts`, `animal.ts`: white rings round the eyes; off for everyone else). `slide/penguin.ts` builds every penguin on the rig now, so Iceberg Maker's Adélies changed too.
- `info.ts`: `READY = true`. `qa.mjs`: story and stamp screens; the pacing run starts at `/slide/story`.
- **Changed from the plan:** the story has its own section. Pokeables are the ones the greybox had (Papa, Pebble, the leopard seal, the Adélies): no Weddell seal, skua, whale or station yet.
- **Known small things:** the transcription check flagged “Bumps! Pick a way down the hill!”, “Wheee!” and “Hee hee!” (they look like transcription quirks): listen on the iPad. The pacing robot can only tap, so it never reaches the stamp.

### Step 9: the globe hub talks ([done] · 2026-10-28)

Sparkle sits in a corner of the globe and says what to do: spin it, drag the sun, carry the lost one home, tap a picture to play. When Pola's and Pebble's sides come round they say hello in their own voices, and they're surprised when she puts the lost one on the wrong pole. The first time she pokes the North Pole, the seal, the station, the whale or the lights, she hears a fact.

- `activities/hub/Hub.tsx` drives `kit/Guide`; the text pill is gone. The welcome on the first visit, or “You got every stamp! Tap the party!” once every stamp is in. Hints after 8 s with nothing touched: spin, the sun, carry it home, or tap a picture. Summer lines once per side. A tap on Pola or Pebble: three lines each, in turn.
- `globe/globe.ts`: a `poke(id)` event (the pokes, the friends, `lightsNorth`/`lightsSouth`). Pola and Pebble on the globe, and the lost ones, are the rig toys (`makePola`, `makePebble`, `Critter.dress` with `FaceLife`, so the two friends' mouths move when they talk).
- The spots' row on a tall screen sits above Sparkle. Four more passport facts: the coldest place, hidden ice, fresh water, the scientists (`meta.facts`). Pacing: no talk before the first touch, 12.5 s of talk over 45 taps.
- **Changed from the plan:** no Inuktitut hello (not confirmed yet).
- **Known small things:** the rig toys don't darken in a pole's winter night (the globe has its own day and night shader). The lost penguin is the chick toy.

### Step 10: Pole to Pole and the Polar Quiz talk ([done] · 2026-10-28)

Terry is the toy tern now, flying flat with his wings out and folding them to stand when he lands. He talks on the way: setting off with Pola's postcard, the warm middle, the windy south, a cheer every six fish and hello to each country she's been to. He hands Pebble the card (“From Pola! Look, a polar bear!”), then Sparkle asks each quiz question, with a 🔊 to hear it again. A miss gets something silly, then “Look for the sparkle!”; the badge gets “Wow, you know your poles!”

- `party.ts`: `ternRig` with the `FLAT`/`UPRIGHT` poses, `flapWings` and Terry's `FaceLife` (`TERN_H` 0.07). The colony is four emperors with Papa's look, spread out so Pebble shows. The quiz's tern is the rig too.
- `Finale.tsx`: `kit/Guide` with a hint for each section, quiet during the postcard and the badge; a `SayButton` by the stars; only the country-name pill stays. Pola's and Pebble's misses are said by the friend (`FRIEND_MISS`). Sparkle's “Steer Terry with your finger!” comes before Terry's first line.
- **Changed from the plan:** the colony's dads are smaller than real life so Pebble stays the star.
- **Known small things:** the flight is seen from behind, so Terry is mostly his back and wings; he's small standing at the colony; the badge doesn't pin onto the passport yet.

### Art: the stickers and Pola's portrait ([done] · 2026-10-28)

Five stickers (a polar bear cub, an Arctic fox, an Adélie penguin, an emperor chick, a narwhal) and a waving Pola for the friend's picture, flat and cute in the app's style.

- `art/source/world/poles/sticker-*.png` and `friend-pola.png` (Codex) → `assets/*.webp`; `art.ts` points `stickers` and `friend` at them. qa-art: the cream fur and highlights are marked fine.
- **Known small things:** the Adélie sticker has no white eye ring, and the chick's face isn't heart-shaped.

### Steps 8b + 9: Snow Coats' art, and it goes into the game ([done] · 2026-10-28)

The animals in Snow Coats are puppets now and the tundra is painted. Her finger still rubs their summer coats white, and they look at her finger, swish their tails, blink, giggle and hop. Sparkle says one short line as each part starts, helps when she's stuck, and tells a fact the first time she pokes an animal. When every coat is brown again in the summer: the stamp and the fox sticker.

- **The animals** (`activities/coats/animals.ts`): the fox, hare, ptarmigan and lemming in a brown summer coat with a lighter belly and darker markings, all still rubbable, with the head and tail on their own pivots. On top whatever the season: big eyes with highlights (they blink and follow her finger), the nose, a mouth that opens to giggle, blush and pink inner ears, the hare's black ear tips, the ptarmigan's red comb and beak. The polar bear (Mama Bear's look) and the snowy owl use the same puppet; the owl shakes its head and looks round.
- `SnowCoats.tsx`: `AnimalEl` draws each pivot as silhouette, fluff, summer coat, the masked white coat, then the details. `poseRig` moves the head (toward her finger, lagging a hop, a nod on landing), the tail (a spring: it swishes, flies up in a hop, streams back in a run), the blinks and the mouth. While she rubs one it holds nearly still. Each animal has its own squeak.
- **The painted tundra** (`art.coats`, six Codex backdrops `bg-coats-sky-*` and `bg-coats-ground-*`): late summer for the fox, winter for hide and seek, summer for the melt. The winter hills fade in as the snow settles and out as she melts it; the painted snow ground still rubs on and off through the same mask.
- **Sparkle** (`kit/Guide`): one line as each part starts (it plays while she can already rub: no talk before the first touch), a hint after 8 s, the bear coming, an animal running off, the dusk. Facts the first time she pokes the fox, hare, ptarmigan, lemming, the bear or the ground (Arctic land animals), and camouflage when the bear first finds nobody. `L.coats`: 18 lines, all Sparkle.
- The summer all brown: the fanfare, “Brown coats for the summer!”, then `onDone` 4.5 s later. `info.ts`: `READY = true`. `qa.mjs`: the pacing run opens `/coats/fox`.
- **Changed from the plan:** no StoryBeat (one opening line while she rubs). The animals are puppets inside the scene's own SVG, not lab puppets in `#/world/puppets`, so their coats stay rubbable. The bear has no voice: he huffs and sniffs.
- **Known small things:** no reindeer, musk ox or popping lemming to poke yet. On iPhone landscape the far hills stretch about 2× sideways. Paint on a swishing tail can slide a little inside the tail. Two lines say the polar bear stays white (the owl line and the bear fact).

### Steps 8b + 9: Emperor Huddle, the art, and it goes into the game ([done] · 2026-10-28)

The huddle's grey ovals are live penguins now: emperor dads that shiver, go blue, get snowy and get pink cheeks when warm, each with an egg on his feet, and Pebble as the 2D chick. They stand on a painted Antarctic night under the moon and the southern lights. Papa and Pebble talk in their own voices, Sparkle says what to do from her corner, and the first sunrise earns the stamp.

- `puppets/Emperor.tsx`: the emperor dad, side view facing right, matched to the 3D `papa` look (black back and head, white tummy with a gold blush, gold patches, a slim beak with a peach stripe, shiny eyes). He breathes, blinks, watches her finger and opens his beak with Papa's voice; hop, sing, flap, waddle, shake. `cold` (bluer, droopy eyes), `snow` (lumps on his head and back), `egg` (cream, or Pebble's pink one that wobbles and cracks). In the puppet lab as `papa` and `papa-cold` ([#/world/puppets](#/world/puppets)).
- `embed` mode on `Emperor` and `Pebble`: drawn inside the huddle's own SVG. The huddle still moves them (position, squash, hop, lift, backs to the wind) and writes cold, snow, lift, flipper, beak and egg into each one every frame. The dad whose beak moves is the one talking.
- **The painted night** (`assets/bg-huddle-night.webp`, Codex), pinned to the stage's horizon and scaled to cover any screen. The moon, the southern lights, the stars, the blowing snow and the sun stay code-drawn on top; the dawn is a tint.
- **The full loop:** `kit/Guide` replaces the text pill. The cold dad says “Brrr! So cold!” first (about 5.5 s of talk before her hands are needed; she can grab a penguin from the first frame). Thank-yous in turn; the wind-turned line only the first two times (then the whoosh says it). Papa and Pebble talk at the egg, the hatch, each gust and tuck, and the sunrise; Sparkle: “You kept them all warm!”, then `onDone` 5 s after the sunrise cheer. Facts once each: the egg on the feet, coldest and windiest, no sun for months.
- `L.huddle`: 23 lines (13 Sparkle, 9 Papa, 4 Pebble). `huddle.ts` keeps only the stages, the starting huddles and the hit areas; the knobs and the packing didn't change. `info.ts`: `READY = true`.
- **Known small things:** in portrait the huddle and Pebble are small on the tall stage (the greybox's scale). The dawn tint washes the far ridges pale. The egg fact can play while she's dragging. Pebble's “Whoa! Papa, help!” transcribes as “wow”: listen. The puppet wasn't compared with a screenshot of the 3D Papa. Not checked on iPhone.

### QA: the whole Poles, and the fixes ([done] · 2026-10-28)

The first full QA of the Poles at all seven screen sizes, then the playtest. No blockers, no console errors, and no stamp waits on winning. The globe, Snow Coats, Penguin Slide and the huddle came out fun; Ice Floe Hop, Iceberg Maker and the finale OK. Fixed here: Sparkle nagging while a finger is playing, cheers cut off by the stamp, an early instruction in the huddle, and the finale's top row on iPhone.

- `kit/Guide`: a held, moving finger counts as playing and a friend talking counts as talk, so the stuck hint never repeats while she steers and never cuts a friend off. `afterTalk()` waits for the talking to stop: Ice Floe Hop's and the huddle's stamps wait for the cheers.
- The huddle's hatch no longer says “tuck Pebble back” before the gust. Penguin Slide says the instruction before the fact. The badge line drops her name (the trophy’s line is also name-free).
- The finale: the stars and the 🔊 sit below the top bar on iPhone landscape; the 🏆 button sits under the badge, clear of Sparkle's line.
- `scripts/qa-lib.mjs`: a leftover preview server from another checkout held the QA port, so the first sweep screenshotted another build. `serve()` now checks the page is our own build and moves to a free port.
- **Next from the playtest:** Ice Floe Hop and Iceberg Maker still have the greybox look (the floes, and a cliff that reads as a building): their look comes next, one PR each.
- **Known small things (from the playtest):** many clips run over 3 s; the hub's welcome bubble covers Pebble at the bottom of the globe; the finale flight shows Terry and the fish small; the huddle can leave her waiting a few seconds for the next cold dad; Mama Bear looks like a big Pola; a white bar on Snow Coats' ground; the huddle's dots are tiny; two quiz questions test facts she only heard.

## 🔗 Sections: tap to play

### Hub

1. `#/world/poles/hub/globe` Spin the globe
2. `#/world/poles/hub/globe?side=north` The globe (north side)
3. `#/world/poles/hub/globe?side=south` The globe (south side)
4. `#/world/poles/hub/sun` Drag the sun
5. `#/world/poles/hub/sun?summer=north` Summer up north
6. `#/world/poles/hub/sun?side=north&summer=south` The north's winter night
7. `#/world/poles/hub/lost?who=penguin` The lost penguin
8. `#/world/poles/hub/lost?who=bear` A lost polar bear cub

### Ice Floe Hop

1. `#/world/poles/floe/story` Pola is far from Mama
2. `#/world/poles/floe/steady` Big steady floes
3. `#/world/poles/floe/drift` Floes that drift
4. `#/world/poles/floe/melt` Summer melt (push the floes)
5. `#/world/poles/floe/mama` Back to Mama
6. `#/world/poles/floe/steady?layout=2` Another layout of the floes

### Snow Coats

1. `#/world/poles/coats/fox` Paint the fox
2. `#/world/poles/coats/hide?painted=fox` Hide and seek
3. `#/world/poles/coats/summer` Rub the summer back
4. `#/world/poles/coats/hide?painted=fox,hare,ptarmigan` Hide and seek, the lemming still brown

### Penguin Slide

1. `#/world/poles/slide/top` The gentle slope
2. `#/world/poles/slide/bumps?run=left` Bumps and cracks
3. `#/world/poles/slide/dive` Under the sea
4. `#/world/poles/slide/home?krill=12` Feeding Pebble

### Emperor Huddle

1. `#/world/poles/huddle/small` A small huddle
2. `#/world/poles/huddle/blizzard` The wind turns
3. `#/world/poles/huddle/hatch` Crack! Pebble's egg
4. `#/world/poles/huddle/sunrise` The first sunrise
5. `#/world/poles/huddle/hatch?chick=hatched` Pebble hatched: tuck Pebble back
6. `#/world/poles/huddle/small?wind=right` A small huddle, wind from the right

### Iceberg Maker

1. `#/world/poles/iceberg/pick` North or south?
2. `#/world/poles/iceberg/bits?pole=north` Little bits
3. `#/world/poles/iceberg/giant?pole=south` The giant one (under the water)
4. `#/world/poles/iceberg/sail?pole=south` Send them sailing
5. `#/world/poles/iceberg/bits?pole=south` Little bits at the South Pole
6. `#/world/poles/iceberg/giant?pole=north` The giant one up north

### Finale

1. `#/world/poles/party/fly?stamps=all` Pole to Pole
2. `#/world/poles/party/fly?stamps=all&leg=warm` The warm middle
3. `#/world/poles/party/fly?stamps=all&leg=south` The windy south
4. `#/world/poles/party/deliver?stamps=all` The postcard for Pebble
5. `#/world/poles/party/quiz?stamps=all&q=bear` Polar Quiz (first question)
6. `#/world/poles/party/quiz?stamps=all&q=south` Polar Quiz: spin to the South Pole
7. `#/world/poles/party/quiz?stamps=all&q=coldest&stars=5` Polar Quiz: the last question
8. `#/world/poles/party/badge?stamps=all` Badge and trophy

## 🛠️ Tech plan (for the builder)

```
src/world/engine3d/      # moved from places/thailand/engine/ (renderer, toon, outline, camera, loop, water, View3D, Anchors, ...)
  characters/          # the generic chibi rig + face from thailand/characters/animal.ts, face.ts (the family's looks stay in Thailand)
src/world/places/poles/
  meta.ts          # id 'poles', mapPos on Antarctica (~x 50, y 93), trophyTitle 'Polar Explorer'
  Place.tsx        # globe hub (3D) + activities + finale
  lines.ts, cast.json  # Pola, Pebble, Terry, Mama Bear, Pebble's dad
  globe/           # 3D: the globe, the sun light, the tilt; shared by the hub, the finale and the quiz
  characters/      # 3D: Pola, Pebble, Terry looks on the chibi rig (Terry gets a bird rig)
  activities/
    hub/       sections.ts  # 3D: spin, drag the sun, the lost penguin
    floe/      sections.ts  # 3D: fling + floe buoyancy on engine3d water, knobs for the fling
    coats/     sections.ts  # 2D: perfect-freehand strokes as a reveal mask on SVG puppets
    slide/     sections.ts  # 3D: the Nan drive's steering on a slope, then underwater
    huddle/    sections.ts  # 2D: circle packing in plain TypeScript on SVG (no Phaser)
    iceberg/   sections.ts  # 3D: crack state + buoyancy bob; camera sinks under the waterline
    party/     sections.ts  # 3D: the tern over the globe, then the quiz on it
  puppets/  pola.tsx, pebble.tsx, fox.tsx, index.ts   # 2D: for Snow Coats, the huddle and the postcards
```

### Notes

- **Move the engine first (its own PR).** `scripts/vite-lock.ts` encrypts every chunk holding code from `/src/world/places/thailand/`, so a Poles import of `thailand/engine` would lock the Poles behind the family code. The engine is self-contained (about 1,600 lines, imports only three and React): move it to `src/world/engine3d/`, plus the generic rig in `characters/animal.ts` and `face.ts` (its `WEARABLES`/`Look` imports need splitting from the family's looks, which stay locked). Nothing that describes the house leaves Thailand. Touches Thailand, so CI runs its tap-around.
- **Heavy imports:** `scripts/check-heavy-imports.mjs` only allows three inside `src/games/<id>/` or `src/world/places/<id>/`. Add `src/world/engine3d/` to the lazy folders, and keep it out of anything that loads at startup.
- **The labs:** the camera lab and the character lab live in `thailand/lab/` (the feel lab is already shared, `kit/knobs.ts`). Move the camera lab with the engine so `?cam=1` works on Poles links; put the Poles characters in a shared catalog so they show up at `#/world/characters/<id>`.
- **The rig:** the bipedal chibi rig fits Pola (a cub on his back legs or on all fours) and Pebble (flippers as arms). Terry needs wings: a small bird rig on the same root/body/head pivots, with the same face.
- **2D activities load no three.js:** Snow Coats and the huddle are lazy chunks that never import `engine3d`.
- **The map:** add `poles` to the map; `PlaceMeta.mapPos` is one point, so the second (north) pin needs a small change in `WorldMap.tsx` (an extra pin that routes to `#/world/poles?side=north`). The map art has no Arctic drawn: the north pin sits in the sea at the top, maybe on a small drawn ice cap.
- **Flag:** `PlaceMeta.flag` is required, but neither pole has a country flag. Make it optional, or use a simple snowflake badge in `Flag.tsx` (never generate a flag).
- **Greybox risks first:** the fling feel and floe bob (Ice Floe Hop, knobs from day one), the globe spin on a finger (grab the ball, not an invisible swipe zone), and the huddle packing (decide Phaser vs a simple circle-packing loop with `useGameLoop`). Decided (greybox 6): a simple circle-packing loop on SVG, no Phaser.
- **One camera per scene:** the 2D scenes (Snow Coats, the huddle) are straight-on side views. In 3D the camera frames a box (`engine3d/camera.ts`) in portrait and landscape; Iceberg Maker's underwater view is the same camera sinking below the waterline, not a cross-section drawing.
- **Distinct art:** sea ice (thin, flat, floating, cracks showing water) must not look like the Antarctic land ice (thick, rising to mountains), and snow drifts must not look like clouds (AGENTS.md).
- **Sections:** every activity gets its `sections.ts`, and the Jump to a game section page (`docs/game-sections.html`, generated) gets a Poles heading in the same PR.
- **Facts to check before recording:** the Inuktitut hello word; Antarctica's record low (−89.2 °C at Vostok, 1983); ice up to ~4.8 km thick; ~70% of the world's fresh water.
- **The quiz:** `party/quiz.ts` holds the question pool as data (id, spoken line, answer target). It reuses the hub globe component and the drag pieces; `?q=<id>` opens one question and `?stars=N` sets the badge. Every question line goes in `lines.ts`.
