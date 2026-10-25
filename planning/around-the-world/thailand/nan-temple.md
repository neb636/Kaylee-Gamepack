# Thailand: Wat Phumin, the lantern and the whispering lovers (plan)

Written 2026-10-25, before the greybox (step 5 of `nan-trip.md`). It firms up what the trip plan's "### 1. Wat Phumin"
leaves thin: the hall in meters, the camera, the rounds and the numbers. Read it with `nan-trip.md` ("What's really
there" about Wat Phumin), `../ACTIVITY-TEMPLATE.md` and `docs/play-design.md`. Code: `activities/nan-trip/temple/`
(`layout.ts` holds every number below).

### Wat Phumin 🛕 (`temple`: the wai, shoes off, an old painted temple, four Buddhas for four directions)

**One-line pitch:** the old hall's paintings are asleep in the dark; Kaylee's lantern wakes them up, finds the
whispering lovers, and lights the four golden Buddhas.

**The toy (core verb): her finger is the lantern's glow on the wall.** Kaylee holds a glowing paper lantern on a string
(like a balloon); held anywhere on the hall, her finger is where the lantern floats, a hand's width off the wall, and
she trots along under it holding the string. Where its pool of light falls, the mural wakes up.
- How it feels: the lantern swings after her finger on a soft spring and sways when it stops; the glow is a warm pool on
  the painting (the 3D hall around it lights up too, a point light); a sleeping scene fills with light over half a
  second, then wakes with a little chime (a note higher for each one) and sparkles, and stays awake and moving.
- Why it's fun with no goal: a dark room and a torch, and every painting moves when you find it.
  Greybox test: the hall in the house's toon look, murals as code-drawn flat paintings with simple animation.

**Turning round (the slow orbit):** the camera stands in front of one mural panel at a time (the walls are the stage).
Her lantern near the left or right edge of the screen for a moment turns the view to the next panel round the hall: it
glides round the Buddhas, clockwise or back. No arrows, no buttons.

**How the verb deepens (3 rounds, same verb):**
1. **Light anything** (`round=1`): 13 little scenes on 8 panels. 8 awake and round 1 is done (a run of bells).
2. **Find the whispering lovers** (`round=2`): a whisper comes from somewhere in the hall, louder as the lantern gets
   closer (and pink hearts leak from the spot when it's near). Lit, the shy painted couple giggle and hop away as a
   heart that flies off to the next spot; three spots, the last one their home on the west wall (where the real
   painting is). There, he whispers into her ear, she blushes and hearts float up out of the wall.
3. **The four Buddhas** (`round=3`): the camera turns to the golden Buddha facing the east door; the door behind opens
   and the light floods in. Her lantern on the Buddha: it glows, Kaylee does a **wai** on the mat, the candle on the
   altar lights and the bell rings. Then the next door (south, west, north), the camera gliding round the Buddhas each
   time. Sacred things glow and ring; they never wobble.

**Payoff:** after the fourth bell every scene wakes at once, round the hall, the light turns gold (gold motes drifting)
and the camera rises to see the whole hall. Then the family lines up under the whispering lovers, Mommy holds up her
phone (it glows), a tap and the flash: the photo hangs on the wall under the lovers. The end card: 🔁 again, 🚙 back
on the road (the valley road, to the mushroom farm).

**Arriving (part of round 1, a few taps):** outside the east door, at the foot of the naga stairs. Three pairs of shoes
lie in front of the family (Kaylee's pink ones, Daddy's, Mommy's): each tap pops the next pair onto the shoe rack (the
lesson: shoes off). All three: the east door opens, the family hops up the stairs between the two nagas and walks in;
inside the hall dims and the lantern lights up over Kaylee's head. About 3 taps, 8 seconds.

**Her choices:** which wall to light, which way to turn, which scene to wake, the order she finds things.

**Pokeables (things that react and aren't the answer):** outside: the two nagas (they blink, sacred guardians: no
wobble), the pigeons (flutter up and land elsewhere), the bell on its post (bong), the lovers' statues on the lawn
(they lean together, a whisper and a heart), the shoe rack. Inside: every awake scene (the painted elephant trumpets
and flaps its ears; the boat race: its boats race off along the river painted at the foot of every panel, across the
whole hall; the bird trees send their birds flying along the walls; the people wave), Daddy (sits on the floor by the
mural: he hops and laughs), Mommy (on her mat by the east Buddha: she waves), the pigeons that came inside, the four
altar bells (ring), the Buddhas (glow, a soft bell), the doors (light through the cracks).

**Silly moments:** light Daddy and a painted Daddy (a green unicorn in Tai Lue dress) appears in that panel, waving,
and stays there; light the same awake scene three times and its people (and its elephant, its birds) dance, with notes.

**Story frame:** none yet (greybox: no voices, no Sparkle lines). Later: one Sparkle line for each round ("Shoes off for
the temple!", "Let's wake the paintings!", "Listen... who's whispering?", "Four golden Buddhas, one for each door").

**What it teaches, by doing:** shoes off before you go in (she takes them off herself); the wai (Kaylee does one at
each Buddha); four Buddhas facing four doors (the camera goes round to each); the whispering lovers are Nan's famous
painting; the old paintings show everyday life in Nan long ago (boats, elephants, buffalo, a market, music).

**Numbers:** arriving 3 taps; round 1 about 8-12 touches (8 scenes, two or three turns); round 2 about 5-9 (three
finds); round 3 about 4-6 (four Buddhas) and the photo 1. **About 20-30 touches, nearly all lighting, ~2.5-3 min.**
0 spoken lines in the greybox.

## The hall in meters (`layout.ts`)

```
                 north door (z = -7.4)
                   ┌──────┐
                   │ arm  │ 3.6 m wide, 2.4 m deep
   NW  P7 ─────────┘      └───────── P0  NE         corner panels: 3.2 m long, the mural band 2.4 m tall
   P6 │                                  │ P1        (y 0.9 to 3.3), on the inner corners of the cross
 ─────┘          the Buddhas             └─────
 west door        (2.4 m dais,              east door (x = 7.4): the way in, up the naga stairs
 ─────┐          four back to back)      ┌─────
   P5 │   (lovers' home on P5)           │ P2
   SW  P4 ─────────┐      ┌───────── P3  SE
                   │ arm  │
                   └──────┘
                 south door
```

- Origin at the middle of the hall, floor at y = 0 (the hall stands on a white plinth 1 m above the courtyard).
  x east, z south. The central square is 10 m (half `C` = 5), each arm 3.6 m wide (half `A` = 1.8) and 2.4 m deep, so the
  doors are at 7.4 m. Inside walls 4.4 m tall, a red dado up to 0.9 m, the mural band 0.9 to 3.3 m, a red ceiling.
- **8 mural panels**, two on each inner corner, numbered clockwise from the north wall's east half: P0 NE (north wall),
  P1 NE (east wall), P2 SE (east wall), P3 SE (south wall), P4 SW (south wall), P5 SW (west wall), P6 NW (west wall),
  P7 NW (north wall). Each is a 512 x 384 canvas (160 px a meter) on a plane, unlit (its own darkness and glow).
- **Scenes** (13, plus the lovers): P0 a boat race on the river, the elephant with a parasol; P1 a stilt house (a cat in
  the window, smoke), a bird tree; P2 dancers; P3 a market lady with her carrying pole, a fisherman and jumping fish;
  P4 more racing boats, a buffalo and its farmer; P5 musicians (a khaen and a drum); P6 an elephant procession, a bird
  tree; P7 children with a kite. A river runs along the foot of every panel (the boats race along it).
- **The lovers' spots:** P2 (first), P7, then home on P5 (upper half of each panel, above the family's heads).
- **The Buddhas:** a two-step dais 2.4 m square, four seated golden Buddhas back to back, each 0.55 m out from the middle
  and facing a door, head top at about 2.4 m. In front of each, 2.3 m out: a red altar table with a candle, a lotus vase
  and a small bell; 3.0 m out a mat where Kaylee does her wai. Mommy sits on a mat beside the east one.
- **Outside the east door:** five steps down to the courtyard (y = -1) between two green-gold nagas whose heads rear up
  at the bottom (x = 9.7); the shoe rack, the bell post, the lovers' statues on the lawn, pigeons.

## Camera

- **Arriving:** outside, looking west at the east porch from the courtyard, a little from the right: the stairs, the
  nagas, the shoes and the rack fill the screen in portrait and landscape.
- **The walls:** one station per panel. The camera faces the panel square-on and frames a box 3.5 m wide and 2.9 m tall
  round it (the band and Kaylee), with a 46° lens; the fit picks the distance, about 3.1 m in landscape and 5.5 m in
  portrait, which keeps it clear of the Buddhas. Changing station glides the camera round the hall (its yaw unwrapped,
  so it never spins the long way). A little sway keeps it alive.
- **Each Buddha:** from its arm, looking at it past Kaylee's mat (the door behind the camera).
- **The gold hall:** from high in the south-east corner, looking across the whole hall.
- **The photo:** the lovers' home panel, the family in front of it.

## Sections and state

`#/world/thailand/nan-trip/temple?round=1|2|3` (the shared `round` param). A bare link is round 1 from the arrival.
`round=2` starts inside at P1 with 8 scenes awake and the lovers asleep at their first spot; `round=3` with the lovers
found too, at the east Buddha. The rest of round 3 (the gold hall, the photo) follows on in the same section.
QA reads `window.__thaiNanQA()` (`game: 'temple'`): the phase, round, station, every scene's state and screen point,
the lovers, the Buddhas, the lantern, the shoes.

## What's built

**The greybox (2026-10-25):** everything above, in shapes and code-drawn murals, no voices (details and deviations in
`nan-trip.md`, "Step 5"). Files: `layout.ts` (the numbers), `hall.ts` (the 3D hall, the courtyard, the lantern, the
pigeons), `murals.ts` (the painted panels, their darkness and travellers), `temple3d.ts` (the play), `sounds.ts`,
`Temple.tsx` (the screen, the photo's flash, the end card).

**Next:** Dad's iPad test of the greybox. Then the look (mural art painted in our style on layered canvases or
textures, the Tai Lue lovers, carved gold on the hall, proper nagas) and the voices: one Sparkle line a round, the family's
reactions, the lovers' murmur, the facts (four Buddhas, the lovers, shoes off, the wai).
