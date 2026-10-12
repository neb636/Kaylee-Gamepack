# Thailand (plan)

Thailand is a special country: Kaylee's family lives there and visits often. Each place on the map will be one the
family loves, and later **every family member becomes an animal friend** (Dad will describe them). Until then there is
no invented country friend. Sparkle guides, the hub's family album waits with empty windows, and the activities use
placeholder grown-ups (Daddy at the cafe is a placeholder for his family character).

Built one activity per PR, through the gates in `ACTIVITY-TEMPLATE.md`. First: **Baan Chang Cafe** (Krabi Town).

## Hub

A map of Thailand drawn in SVG from the real outline (Natural Earth 1:50m, `mapData.ts`), with its neighbours in pale
green. Pins sit on the real places; Baan Chang is in Krabi on the Andaman coast.

**Pokeables:**
- The Andaman Sea ripples.
- The northern mountains hop.
- Bangkok's little temple roof bounces.
- Sparkle giggles.
- Album windows say "soon".

The finale (route `party`) is a "coming soon" screen until there are more places.

## 1. Baan Chang Cafe 🐘 (Krabi: elephants, Thailand's national animal; *chang* = elephant, *baan* = house)

> **Gate 1 (greybox), 2026-10-11:** placeholder shapes, Sparkle's voice only. Art reference for gate 2: Dad's photos.
> - The cafe has yellow beanbags, round wooden tables and a thatched roof with fans and rattan lamps, with jungle behind.
> - The elephant yard has red dirt, a metal rail fence, palms and a shed. A stone platform holds the basket of food.

**One-line pitch:** Kaylee and Sparkle stop at the elephant cafe. They make Daddy's iced coffee and Kaylee's chocolate
milk, then go downstairs and feed the hungry elephants.

**The toy (core verb): hold food out to a trunk.** She pulls a food off the tray and holds it out. Every trunk close
enough snakes after her finger: a chain of segments with lag, solved with FABRIK. The first tip to touch the food curls
round it, swings it up to the mouth and munches. The ears flap and the belly gets a little rounder.
- How it feels: alive and a bit greedy. Wave the food and the trunk chases it like a snake. Hold it between two
  elephants and both trunks reach.
- Why it's fun with no goal: feeding a giant animal from your hand.
- Greybox test: grey ellipses with a tapered chain trunk, and colored food shapes.
- Tap alternative: tapping a food glides it to the elephant that wants it.

**How the verb deepens (same verb, three times):**
1. **Bananas.** Any elephant, any banana (6 feeds).
2. **Favorite foods.** A bubble over each elephant shows what it wants, sometimes with a count: Mama wants 3
   sugarcanes ("One! Two! Three!"), Baby a cucumber, Auntie a pineapple. If she offers the wrong snack, the elephant
   sniffs it and tosses it over its back, or passes it to the elephant who wanted it. Nothing is ever wrong.
3. **Watermelon and the sneaky baby.**
   - A whole watermelon is too big for Baby (it wobbles and drops it).
   - A grown-up stomps it open, and the slices land on the tray for Baby (3).
   - Auntie wants 2 corn.
   - Baby wanders along the fence. When Kaylee's hands are still for about 4 s, it sneaks its trunk into her chocolate
     milk and slurps ("Hey! That is your chocolate milk!").

**Side verb (the cafe, about a minute): grab and tilt to pour.** One verb for the coffee pot, the milk jug and the
chocolate bottle. A pot tips by itself as it comes over the glass, and tips further the closer it gets.
- Daddy's iced coffee: 3 ice cubes, coffee, milk (it swirls in), a straw. Then she carries it to Daddy.
- Her chocolate milk: milk, chocolate, then stir with the spoon (the color mixes), a straw color and whipped cream.
- Overfilling makes a fountain over the rim ("Whoa! Too full!").

**Her choices:**
- Straw color (pink, purple or yellow) and cream. They ride along to the yard on her glass.
- Which elephant to feed and which food.
- Whether to tap or hand-feed.

**Pokeables:**
- Cafe: ceiling fans (whoosh faster), the rattan lamp (swings), beanbags (squish), Daddy (sips).
- Yard: each elephant (ear flap and trumpet), the tokay gecko ("to-kay!"), a coconut (drops and bounces), the hay pile
  (puffs), a myna bird (flies a loop), Sparkle.

**Silly moments instead of failure:**
- The overfilled glass fountains.
- A wrong snack is tossed over the elephant's back.
- The watermelon is too big for Baby.
- Baby steals sips of her chocolate milk.

**Story frame (2 lines):** "Sawasdee, Kaylee! Welcome to Baan Chang!" / "First, coffee for Daddy!"

**Sparkle talks only at these moments:**
- each new step's prompt
- the 6th banana
- counting a 3-sugarcane order
- the first toss
- the watermelon
- the sneaky sip
- after 8 s with nothing touched

**What it teaches, by doing:**
- Elephants eat lots of different plants all day.
- A trunk is a nose and a hand (it sniffs, grabs and sprays).
- Grown-ups help babies (the stomp).
- Counting to 3.
- *Chang* means elephant, and Sawasdee means hello.

Tap-to-hear facts are on the passport. At gate 3: Thai counting 1-3 (*nueng, song, sam*) for Mama's sugarcane.

**Payoff:** bellies grow round, then all three elephants raise their trunks and spray water in turns under a rainbow
before the stamp.

**Replay:** gate 3 can shuffle the favorites (which elephant wants what, and how many) and her drink choices.

**Numbers (greybox):**
- Cafe: about 15 touches.
- Yard: 6 bananas, 5+ favorites, 1-2 watermelon tries, 3 slices and 2 corn, about 20 touches.
- Plus pokeables: about 40 touches in about 3 minutes.
- 2 lines before the first touch.

**Camera and art (gate 2):** straight-on, eye-level side view; the terrace sits above the yard, so going downstairs is
a vertical camera pan.
- Cafe layers: jungle, thatched roof with fans and lamps, the terrace with beanbags and tables, the counter in front.
- Yard layers: palms and the shed, red dirt, the rail fence, the stone platform with the food tray.
- Puppets: an elephant rig (body, ears, tail and the chain trunk drawn as one tapered shape) shared by Mama, Auntie and
  Baby. Daddy is drawn when Dad describes his family character.

**Screens:**
- Wide stage 1600 × 1000, tall 1000 × 1400, both under the prompt row.
- In both, the glass, the tools, the trunks' reach and the tray stay inside the stage.
- iPhone landscape works but scales the stage to about 0.3, so the tray foods come out about 48px. Gate 2 should add a
  short-landscape stage, or zoom on the counter and the tray, to reach 64px.

**Sections and carried state** (`activities/baan-chang/sections.ts`):

| Section | Name | Params |
|---|---|---|
| `arrive` | Arrive at Baan Chang | |
| `coffee` | Daddy's iced coffee | |
| `cocoa` | Kaylee's chocolate milk | |
| `downstairs` | Down to the elephants | straw, cream |
| `bananas` | Banana time | straw, cream |
| `favorites` | Favorite foods | straw, cream |
| `watermelon` | Watermelon and the sneaky baby | straw, cream |
| `shower` | Happy elephant shower | straw, cream |

Params:
- `straw`: `pink`, `purple` or `yellow`.
- `cream`: `yes` or `no`.

**Tech:** DOM and SVG with `useGameLoop`, writing to refs.
- `trunk.ts` is the FABRIK chain.
- `feel.ts` holds every tuning number.
- Stirring is measured in `onPointerMove`, not per frame.
- Dragging uses plain pointer events with pointer capture on the scene.
