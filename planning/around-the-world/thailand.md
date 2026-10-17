# Thailand (plan): Kaylee's family, in 3D

Thailand is the family's country. It is built in **3D with three.js** (Dad liked it in his robot game
`~/repos/new-start`), but it keeps the app's flat pastel look: toon shading in a few flat bands with lavender
shadows, dark ink outlines like the 2D art, soft round shadows, no post-processing. iPad Safari first; desktop and
iPhone must work.

The home base is **Agong's house** (Grandpa, Thai อากง, "a-gong"), a Thai shophouse (ตึกแถว *tuek thaeo*, "row
building"). Kaylee walks around it as a unicorn that looks nothing like Sparkle. Every family member becomes an animal
character, picked by Dad from a lineup. The places the family loves become activities later, one per PR.

The 2D start (PR #86: a map hub and a Baan Chang Cafe greybox) is parked. Its cafe toy (pouring drinks, trunks that
follow her finger) comes back later as a 3D activity reached from the house.

## The family (from Dad)

| Person | Who | Lives at Agong's | Animal (Dad approved, 2026-10-17) |
|---|---|---|---|
| Kaylee | her | visiting | lilac unicorn, rainbow mane, gold horn, pink dress (nothing like Sparkle) |
| Ji | Mom | visiting | cream unicorn, long lavender-pink hair, peach sundress |
| Nick | Dad | visiting | mint unicorn, short sky-lavender mane, yellow polo, big grin |
| Agong (อากง) | Grandpa | yes | panda with round gold glasses, a moustache, a cream shirt and a cane |
| Jum | aunt | yes | peach bunny with long floppy ears, mint blouse |
| Joy | aunt | yes | fox, lavender blouse |
| Bert | uncle | yes | water buffalo with curved horns, peach t-shirt |
| Gun, Khane | Joy's sons, older | yes | fox cubs: Gun in a backwards cap and shorts, Khane in green round glasses |
| Bibi | Bert's daughter, older | yes | buffalo calf with pigtails and pink bows, pink dress |
| Ja | aunt | no | penguin with a pink scarf |
| Sri | aunt | no | hornbill (a Thai bird), lavender blouse |
| Pato | Ja's son, Kaylee's age | no | penguin chick with a tuft, mint t-shirt |
| Putter | Ja's son, younger | no | tiny grey penguin with a blue bib |

**Lineup:** `thailand/lineup.webp`. Dad approved my picks: column A everywhere (kids share their parent's animal, so
Kaylee can see who belongs to whom) and Kaylee's option A. They are built in 3D from `characters/looks.ts` by
`characters/animal.ts`, and the "family photo" spot (`#/world/thailand/hub/family`, `?who=<id>` for one alone on a
turntable) shows them all.

Open questions for Dad: "Khane" or "Kane"? Does Sparkle keep guiding here (2D, in the prompt bubble as everywhere
else), or does a family member (Mom, Agong) give the instructions? What is each person like (for their voices)?
Where do the stairs really go, and which end does the mattress row run to?

## Agong's house (the hub)

Camera: a follow camera from the front-right, looking into the house like a dollhouse with its front, its right wall
and its ceiling cut away. Inside it frames a box around Kaylee (`engine/tune.ts`). On the street it is low and
straight-on.

- **Street:** a row of five pastel shophouses, Agong's in the middle with a roll-up shutter, a sign board, a balcony
  with an air-conditioner box, and wires with birds. On the sidewalk: Uncle Bert at his motorbike, Daddy, flower
  pots, a spirit house on its pillar, a sleepy cat, and the tuk-tuk that brought her.
- **Downstairs:** the long table on the left with red plastic stools and Agong at the end. The family altar is at the
  back with ancestor photos, lanterns, candles and incense, plus a little earth-god shrine. A cabinet of treasures (a
  lucky cat waving on top, little elephants, porcelain jars, a toy tuk-tuk), old photos and a clock on the left wall,
  a fan, the fridge, a shoe rack, a doormat, and the stairs up along the right wall. Jum and Joy are here.
- **Upstairs (Kaylee's room):** mattresses on the floor along the left wall, all the way to the end of the room. The
  couch is on the right (Bibi sits there), with Kaylee's suitcase, a wardrobe, a fan, her drawings on the wall, and
  the balcony doors. Mommy, Gun (asleep on the mattress) and Khane are here.

**The toy (core verb): walk Kaylee around.** Tap the floor and she hop-trots there around the furniture, running on
long trips. Hold and drag and she follows your finger. Tap a thing and it reacts at once, then she walks over and uses
it: sits at the table or on the motorbike, flops on the couch, peeks in the cabinet or the fridge. The mattress makes
her bounce higher with each tap until she flops down. Tap someone in the family and they hop and babble; she runs up
and they hop together. Sacred things (the altar, the shrines, the spirit house) never wobble: their candles glow, a
curl of incense rises, a soft bell rings, and she does a wai.

**Sections** (`activities/hub/sections.ts`; the hub's own deep links, `#/world/thailand/hub/<section>?at=<thing>`):
`arrive` (the tuk-tuk ride), `street`, `downstairs`, `upstairs`, `family` (the family photo). `at` starts her already
using a thing, e.g. `downstairs?at=table` or `upstairs?at=mattress`; `who` shows one person alone, e.g.
`family?who=agong`.

## Gates (one PR each; stop for Dad after each)

1. **Greybox house + lineup.** The 3D engine, the house built from simple shapes in the final toon look, walking,
   using things, placeholder family with name pills, no voices. Dad checks the feel on the iPad and picks the animals.
   *Done 2026-10-17.*
2. **The family, static.** One toy-animal builder (`characters/animal.ts`) and the 14 characters from Dad's picks
   (`characters/looks.ts`), in the house and in the "family photo" spot. Each is a chibi rig (body, head, arms and
   tail on their own pivots) ready for gate 3. *Built 2026-10-17.*
3. **Alive + voices.** Idle breathing, blinking and looking at her; walking; sitting; waving; a mouth that moves with
   `speechLevel(voice)`. A voice per person in `cast.json` (Dad describes them), greetings with Thai words
   (Sawasdee ka/krub).
4. **House art + the hub loop.** Real props and textures: patterned cement tiles, old family photos made from the
   characters, a gecko on the wall that chirps "tukkae". Ambient street life, the arrival story, a few prompts, the
   doors to the activities, and the finale stub (the family feast at the table).
5. **Activities,** one per PR, through `ACTIVITY-TEMPLATE.md` (Baan Chang Cafe first, in 3D).

## Tech notes

- `engine/` holds generic 3D: one shared renderer (we make the WebGL2 context ourselves, so no console error without
  one), the frame loop (60 fps cap; 30 when nothing moves; 30/4 in test browsers), toon materials, screen-space
  ink outlines, a box-fitting follow camera, a walk grid with A*, and the tap marker.
- `activities/hub/layout.ts` is the one source of truth in meters (pure data): the build, the walk grids, the tap
  targets and the flat fallback all read it.
- The tap targets are DOM buttons placed over the 3D things every frame (`Anchors.tsx`), at least 64 px. They give
  VoiceOver, tap-around and QA real buttons to find.
- `?debug=1` shows a tuning panel (camera, light bands, outlines, walk), `?gl=off` the flat house, and `?fps=N`
  overrides the frame-rate cap.
- `window.__thaiHouseQA()` is read-only state for tests. There are no jump hooks: tests open section links.
