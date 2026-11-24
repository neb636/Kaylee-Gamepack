# Thailand: the family, in 3D

Thailand is the family's country, built in 3D with three.js. How it's built (the look, the engine, the hub, the trip
kit, the maps, the labs) is `docs/thailand-3d.md`. This file holds the family and the house, which only the user can
decide, and where each place lives now. The plans for everything already built (the trips, the maps, the wardrobe, the
game table, the house's gates) are in git history: `git log -- planning/around-the-world/thailand/`.

## The family (from the user)

The user decides the family: who each person is, which animal, who comes on a trip. Ask, don't invent. The code is
`characters/family.ts` (who, where they stand) and `characters/looks.ts` (how they look).

| Person | Who | Lives at Agong's | Animal (the user approved, 2026-10-17) |
|---|---|---|---|
| Kaylee | her | visiting | lilac unicorn, rainbow mane, gold horn, pink dress (nothing like Sparkle); a modelled vinyl toy |
| Ji | Mom | visiting | cream unicorn, long lavender-pink hair, peach sundress; a modelled vinyl toy |
| Nick | Dad | visiting | mint unicorn who looks a little like him: short light-brown hair, blue eyes, stubble, yellow tee, small smile |
| Agong (อากง) | Grandpa | yes | panda with round gold glasses, a moustache, a cream shirt and a cane |
| Jum | aunt | yes | chubby pink elephant, mint blouse |
| Joy | aunt | yes | fox with straight brown hair to the shoulders, parted in the middle, a big toothy smile, a white blouse with a pink lace collar |
| Bird | uncle | yes | water buffalo with curved horns, short spiky black hair, a black party shirt with orange and red flowers |
| Gan, Ken | Joy's sons, older | yes | fox cubs: Gan in a backwards cap and shorts, Ken in green round glasses; both glued to their phones |
| BB | Bird's daughter, older | yes | buffalo calf with pigtails and pink bows, pink dress; glued to her phone |
| Ja | aunt | no | penguin with a pink scarf |
| Sri | aunt | no | hornbill (a Thai bird), lavender blouse |
| Putto | Ja's son, Kaylee's age | no | penguin chick with a tuft, mint t-shirt |
| Putter | Ja's son, younger | no | tiny grey penguin with a blue bib |

Kids share their parent's animal, so Kaylee can see who belongs to whom. Each animal looks a little like the real
person (their hair, a face detail, the clothes they wear), from the user's photos, which stay outside this repo.
Kaylee and Mom are modelled vinyl toys (Tripo3D, `docs/3d-characters.md`); the rest are code-built chibi rigs,
to be modelled the same way one at a time. The character lab (`#/world/characters/<id>`) shows every one of them.

## Agong's house (the hub)

The family's real home, a Thai shophouse (ตึกแถว), 5 m wide and 17 m deep (the user's plan, 2026-10-17, and his
sketch of the stairs, 2026-10-20). `activities/hub/layout.ts` is the one source of truth in meters.

- **Street:** five pastel shophouses, Agong's in the middle with a roll-up shutter. Uncle Bird at his motorbike, Dad,
  flower pots, a spirit house on its pillar, a sleepy cat, the tuk-tuk that brought her.
- **Downstairs:** Agong's desk at the front right, where he sits; the long table with red plastic stools, old photos,
  the cabinet of treasures (a lucky cat on top), the fridge; U-turn stairs at the back left like the real ones (cream
  terrazzo treads, brick-red edges, red railings). In the back room: the family altar, the little earth-god shrine and
  the kitchen. Joy is by the cabinet, Jum in the kitchen.
- **Upstairs:** a small hallway (Ken) over a balcony that looks down into the shop, then glass doors into **Kaylee's
  room**: mattresses along the left wall, the couch (BB), her suitcase, her wardrobe, the game table and the pink
  unicorn bag on the right. Mom and Gan (asleep) are here.
- **The toy:** walk Kaylee around (tap, drag, or the Roblox-style stick); tap a thing and she uses it; tap someone and
  they hop and say hello in their own voice. Sacred things (the altar, the shrines, the spirit house) never wobble:
  they glow, a bell rings, she does a wai.
- **Sections:** `#/world/thailand/hub/<section>?at=<thing>`: `arrive`, `street`, `downstairs`, `upstairs`, `family`
  (`?who=<id>` for one alone), plus `map` and `bangkok` (`activities/hub/sections.ts`).

## Where each place lives

She lands on the Thailand map and taps a pin. Every trip starts and ends on a map, and its stamp lands on its pin.

| Place | What she does | Code |
|---|---|---|
| 🗺️ Thailand map | taps Bangkok, Krabi, Nan or Koh Samet | `activities/hub/map/` |
| 🏙️ Bangkok map | the house and ICONSIAM each have a pin (notes: `thailand/bangkok-map.md`) | `activities/hub/bangkok/` |
| 🏠 the house | walks around; her wardrobe and the game table in her room | `activities/hub/` |
| 🛍️ the mall day | ICONSIAM: HarborLand's mini games, The Pizza Company | `activities/mall-trip/` |
| 🚤 Krabi | the Krabi map, the longtail boat in Phang Nga Bay, Baan Chang's elephants | `activities/boat-trip/` |
| 🏔️ Nan | the Nan map, the mountain roads, mushrooms, Lung's rice farm, Pa Kluea's salt, the Nan Mountain Cup | `activities/nan-trip/` |
| 🏝️ Koh Samet | The Lost Fireflies: jet ski, sandcastle, snorkel, hide and seek, the fire show | `activities/samet-trip/` |

Small things QA found are in `thailand/known-issues.md`. What she plays decides what comes next (`docs/play-data.md`).
