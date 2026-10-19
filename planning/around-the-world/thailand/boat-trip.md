# Thailand: Captain Kaylee's Boat Trip (plan)

Written 2026-10-18. The first family trip and Thailand's first activity (it takes the place of "a longtail boat in
Krabi" from Dad's list of four). Built in 3D in the house's look (toon bands, ink outlines, blob shadows), like the rest of Thailand.
Read with `../thailand.md` (the family and the house), `../ACTIVITY-TEMPLATE.md` and `docs/play-design.md`.

**One-line pitch:** Mommy, Daddy and Kaylee go on a trip, just the three of them. Kaylee packs her own suitcase, rides
to the airport in Aunty Sri's car, plays in her window seat while the plane flies down Thailand's "elephant trunk", and
then gets her own longtail boat to drive around Phang Nga Bay: a village on stilts with a floating football field, a cave so low the unicorns' horns
bonk the roof, a secret lagoon inside an island, and the Nail Island (James Bond Island), where the family takes the
photo Agong asked for. Back home it goes on Agong's wall, and even the big cousins look up from their phones.

> **Dad's changes after playing greybox 2 (2026-10-19), built on PR #100.** They replace what this plan says below
> where the two disagree:
> - **No elephant map as the way in** (interesting, but too hard for her). Mommy asks instead: "Kaylee, are you ready to
>   go on a trip?" with two big picture buttons, 👍🧳 **Yes** and ✋⏳ **Not yet** (`trip/legs/Ask.tsx`). In the house
>   she asks a few seconds after Kaylee first comes upstairs each visit, and whenever Kaylee taps Mommy; yes opens the
>   trip straight on packing, not yet just closes the card. The trip's first section (`invite`) is the same question in
>   her room; there, not yet goes back to the house. The map stays on her wall as a thing to tap (it swings).
> - **Packing shows her what to do:** a suitcase card (top right) with three empty slots that fill with what she packs,
>   the things she can pack hop now and then until three are in, a 👆 finger points at one when she's idle (at a sun
>   thing after Mommy's hint), then at the suitcase, Mommy says "Tap your things to pack them!" and at three "All
>   packed? Tap the suitcase to close it!", and a big ✅🧳 button (bottom right) closes it like tapping the suitcase.
> - **Aunty Sri drives a white electric van** (`trip/vehicles/van.ts`): it hums up quickly at the goodbye, stops past
>   the family so nobody is hidden, the side door slides open, everyone hops in (or after ~7 s by themselves), and it
>   glides away.
> - **No car ride:** the van leaving is the whole trip to the airport (the `car` section and `trip/legs/car.ts` are
>   gone; the boarding pass goes from the goodbye straight to the airport).

## The shape of it

```
 Agong's house          the trip kit (reusable)                          Phang Nga Bay (this trip)            home
 ┌─────────────┐   ┌──────────────┐  ┌──────────┐  ┌──────────────┐   ┌──────────────────────────────────┐  ┌────────────┐
 │ elephant map│ → │ Aunty Sri's  │→ │ airport  │→ │ window seat  │ → │ pier → bay → village / hong      │→ │ Agong's    │
 │ pack the    │   │ car (ride)   │  │ (x-ray)  │  │ takeoff→land │   │ → Nail Island photo → sunset     │  │ photo wall │
 │ suitcase    │   └──────────────┘  └──────────┘  └──────────────┘   └──────────────────────────────────┘  └────────────┘
 └─────────────┘     on the way there she rides and plays          in the bay she drives
```

One idea holds it together: **on the way there the grown-ups drive, and every ride is a toy; in the bay she's the
captain.** (Dad's picks, 2026-10-18: Aunty Sri drives them to the airport, and Kaylee rides in a window seat, Toca
style.) In Aunty Sri's car and on the plane her hands play with what's around her (the seatbelt, the window, the tray,
the snacks) while the ride moves on by itself, so those legs are short and can't stall. At the pier Daddy hands her the
tiller: the longtail is the first thing she drives, with one finger, the way she walks Kaylee around the house (tap a
spot and she goes there, hold your finger down and she follows it).

## What it borrows (and from where)

| From | What she loves there | Here |
|---|---|---|
| Sago Mini Boats | grab the boat and go, stop to meet friends | her finger drives the longtail; stops she picks herself |
| Toca Boca (Toca Life: Vacation and World) | a world of toys: pack a bag, go to the airport, play in the plane, nothing is wrong | the suitcase (pack anything, even a cousin), the x-ray belt, the window seat's tray and snacks, silly reactions everywhere |
| Roblox vehicle games and obbies | speed, jumps, doing it your own way | VROOM, wake jumps, doughnuts, soft bonks instead of crashes |
| Roblox "find them all" games | collecting things hidden around a map | 9 animal stickers to spot in the bay |
| Roblox avatars and emotes | her character looks the way she chose | what she packs, she wears; pose buttons for the photo, and Mommy and Daddy copy her |
| Adopt Me / Toca houses | your stuff stays in your house | her trip photo hangs on Agong's wall for good |

Not a clone of Venice's water taxi: that's a 2D side view on a canal with two lanes and deliveries. This is a 3D chase
camera on open water among towers of rock, free driving, stops in any order, a boat swap for the cave, and photos.

## Why it's bigger than other activities, and what we cut

Dad said Thailand can be bigger when it adds to the experience. The trip adds three things no other country has:
leaving her real (game) home with her real family, choices that come with her (what she packs is what she wears on the
boat), and a payoff that goes back home (the photo on Agong's wall). Everything else is cut.

| Leg | Sections | First play | Touches | Talk before 1st touch | Her hands do |
|---|---|---|---|---|---|
| Start: the elephant map | `invite` | ~10 s | 1-2 | 1 line | tap the map, tap the boat pin |
| Pack the suitcase | `pack` | 45-75 s | 8-15 | 1 line | toss things in, sit on it to close it |
| Goodbye | `goodbye` | 10-20 s | 1-4 | 1 line | hug whoever she wants (optional), walk out |
| Aunty Sri's car | `car` | 30-45 s | 6-12 | 1 line | seatbelt, window, wave, beep, radio |
| Airport | `airport` | 20-30 s | 3-6 | 0 | bag on the belt, see the x-ray, up the stairs |
| Window seat | `takeoff` `fly` `land` | 60-80 s | 10-20 | 1 line | seatbelt, window shade, tray, snacks, the seat-back map |
| **The bay** | `pier` ... `sunset` | **4-6 min** | **60-100** | 2 lines | drive the longtail |
| Home | `home` | 20-40 s | 2-5 | 1 line | give Agong the photo |
| **Total** | | **~8-11 min** | **~95-165** | | |

How it stays short and never boring:
- **Every travel leg has a hard cap.** Aunty Sri drives and the pilot flies whatever Kaylee does: the car reaches the
  airport in about 40 s and the plane lands after about 70 s, so a ride never waits on her and never runs past its cap.
  Her toys in the car and the cabin play along while it moves. Nothing here can be failed or got stuck in.
- **Resume, don't restart.** The trip saves after each leg (`useSaved('thailand-boat-trip')`). If she stops after the
  flight, the map's pin starts her at the pier next time.
- **Replays go straight to the fun.** After the first full trip, the boat pin on the map opens a boarding pass with two
  big icons: 🧳 (the whole trip again) and 🚤 (straight to the pier, with what she packed last time). On a replay the car
  ride and the flight are shorter (about 25 s and 40 s).
- **Cut on purpose:** check-in desk, security line, waiting at the gate, choosing seats, the drive from the airport to
  the pier (a 3-second cut), a hotel, lunch, souvenir shopping, the flight home (a 4-second picture over a pink sunset, tap
  skips). Each would be one more thing to sit through.
- **Playtest rule:** if on her second trip she asks to skip the car or the plane, shorten that leg again before
  adding anything new.

## The trip kit (reusable for every future trip and mini-game)

Lives in `src/world/places/thailand/trip/` (three.js stays inside the Thailand folder). A trip is **data**; the legs
are generic.

```ts
// activities/boat-trip/trip.ts (pure data)
export const BOAT_TRIP: TripDef = {
  id: 'boat-trip',
  who: ['ji', 'nick'],                       // who comes along with Kaylee (Dad: just the three of us)
  pin: { x: 0.29, y: 0.71, icon: 'boat' },   // where the pin sits on the elephant map (Phang Nga Bay)
  pack: { hint: 'sun', fits: 5 },            // what Mommy hints at, how many things fit before it bulges
  legs: [
    { kind: 'car', driver: 'sri', road: 'bangkok', to: 'airport' },   // Aunty Sri drives (Dad)
    { kind: 'airport' },
    { kind: 'fly', from: 'BKK', to: 'KBV', seat: 'window' },        // Krabi (Dad); Kaylee rides, the pilot flies
  ],
  arrive: 'pier',                            // the trip's own activity starts here
  souvenir: 'photo',                         // what goes home to Agong's wall
}
```

**The drive control** (`trip/drive.ts`, vehicle-agnostic; built in greybox 1 for the longtail and the canoe, and ready
for later things she drives, like a drive around the block):
- **Tap** a spot (the road ahead, the water, a thing) and the vehicle goes there by itself, the way she walks in the
  house. A ring marks the spot (the house's `TapMarker`, in water it's a splash ring).
- **Hold and drag** and the vehicle chases her finger: her finger is where it wants to be. Hold far ahead to go fast,
  near to go slow. Hold to one side and it keeps turning that way (boat doughnuts are allowed and fun). Drag behind
  it and it does a happy U-turn.
- **Let go** and it coasts, bobs and settles (no sudden stop).
- **Grab the boat** and drag works too: Dad chose both at once (2026-10-18), which is greybox 1's default. The
  grab-only switch (`?drive=grab`, the toggle in `?debug=1`) goes; the default speeds stay ("seems fine for now").
- **Tap the vehicle itself** for its special: the longtail goes VROOM, the canoe gets a big paddle stroke.
- Every vehicle has a feel profile (top speed, turn rate, lag, bounce, how it leans) and **rails**: the longtail is held
  only by the bay's soft edges, the canoe to the tunnel's line.
- Bumping anything is a soft *boing*: the vehicle squashes, bounces back and wobbles. No damage, no crash, ever.

**Vehicles** (`trip/vehicles/*.ts`, toy models in the house's style, each with seats where the family sit in their
existing `sit` pose): Aunty Sri's car, the plane (outside for the boarding stairs, inside a cabin with a window seat),
the longtail boat and the yellow sea canoe (both built in greybox 1).
Later trips add a tuk-tuk, a songthaew (the pickup-truck bus), a river boat, a train.

**Legs** (`trip/legs/`, each a section that reads the `TripDef`): `invite`, `pack`, `goodbye`, `car`, `airport`,
`fly` (`takeoff`, `fly`, `land`), `home`. Between legs a **boarding pass** card slides up, a hole is punched for
the leg she just finished (*ka-chunk*), and it slides away. That's 1.5 s, and it hides loading the next scene.

**Future trips and mini-games this unlocks** (ideas only; each is its own plan and PR):
- More pins on the elephant map: Chiang Mai (fly *up* to the elephant's forehead; the mountains are cooler), Ayutthaya
  (drive, then a river boat past old temples), a Krabi beach day, Songkran in Chiang Mai.
- **Drive around the block** from the house: the pink taxi parked on the street becomes a little free-drive toy.
- **Free flight:** later the plane can be Thailand's travel map itself: fly over the 3D elephant-shaped country and land
  at any pin.

## Starting the trip: the elephant map and the suitcase

**The elephant map** is a new thing in Kaylee's room: a big paper map of Thailand taped on the wall above her suitcase,
next to her drawings. The outline is the real one (drawn from the Natural Earth outline into a canvas texture, never
generated: Sol got Peru's shape wrong), and Kaylee has doodled on it in crayon: an eye and an ear, so Thailand is an
elephant's head and the long south is its trunk (Thai people often describe their country this way). A house pin shows Bangkok
(Agong's house); a little boat pin bobs on the trunk at Phang Nga Bay. Future trips add pins; there are never locked or
grey pins.

How she finds it: once the trip exists, the map glows softly and the boat pin bobs. Mommy's "again" lines include
"Look at the map, Kaylee!" and Sparkle's upstairs hint after ~12 s with nothing touched becomes "Tap the map! A trip
is waiting!"

`invite` (≤ 2 lines, one tap): she taps the map, Kaylee hops over and looks up, the camera moves close until the map
fills the screen. Mommy: **"Let's go on a boat trip! Just you, me and Daddy!"** She taps the boat pin. It pops, the
suitcase lid springs open, and the camera drops to the suitcase on the mattress. The route switches to the activity
(`#/world/thailand/boat-trip/pack`), which mounts the house again already in that close-up, so there's no visible jump.

### Pack the suitcase 🧳 (her room: what you need in hot, sunny weather)

**The toy:** toss things into the suitcase. Tap anything in her room and it hops into the open suitcase in a big arc
(*boing, flump*); drag it there if she likes. Tap something inside and it hops back out. Each lands with a squash and the
suitcase lid flaps.
- How it feels: a toy box. Things land in a heap and stick up out of the suitcase, and it bulges more with each one.
- Greybox test: boxes in her room, the suitcase as a box with a lid that flaps.

**How the verb deepens:** (1) toss anything in, nothing is wrong; (2) Mommy's one hint, **"It's hot and sunny at the
sea!"**, and the sun things (sun hat, sunglasses, sunscreen) glint once: she chooses whether to pack them;
(3) **close it**: past five things it's too full and the lid won't shut, so she **sits on it**: tap the suitcase (or
Kaylee) and she hops on it, *squash, squash, squash, click!* (People really do this.) Three hops. It doesn't matter what's in it.

**Her choices:** the whole point. Sun hat, sunglasses, floaties, sunscreen, swimsuit, rubber duck, her teddy, a bucket
and spade, Daddy's camera, and the silly things: her pillow, the fan, a mango from the kitchen basket.
**Silly moments:** pack **Gan** (asleep on the mattress) and he pops out of the lid still asleep, "Five more minutes...",
and flops back on the mattress. Pack the fan and it whirs inside the suitcase, blowing the lid open. Pack the pillow and
Mommy yawns.
**No wrong answer:** at the end Mommy tucks in the sunscreen anyway ("Mommy always packs sunscreen!"); if she packed no
hat, Mommy's spare sun hat comes too.

**What carries into the trip (`packed`):** what she packs is what she gets. The sun hat and sunglasses go on her
avatar for the rest of the trip, the floaties go on her arms in the boat, the duck bobs on a string behind the longtail,
the teddy sits on Mommy's lap, the bucket comes off the boat at the Nail Island beach, the mango is Daddy's snack (the
monkey steals it, see the bay). The airport x-ray shows all of it. New avatar extras in `characters/animal.ts`:
`sunhat`, `sunglasses`, `floaties` (the rig already has `cap` and `glasses`, so it's the same kind of change).

### Goodbye 👋 (downstairs and the street)

Kaylee walks down with the suitcase bumping on every stair (*bonk, bonk, bonk*). The family who live here gather at the
shutter. She can hug anyone she taps (they hop together, as in the house); nobody has to be tapped. **Agong: "Bring Agong
a photo of the Nail Island!"** (the trip's goal, ≤ 3 s). Jum gives her a little bag of snacks. Gan, Ken and BB wave
without looking up from their phones, "Bye...", which pays off at home. **Aunty Sri's car** pulls up (she doesn't live
here: she came to drive them); Daddy loads the bags; Kaylee hops into the back seat by the window.

### Aunty Sri's car 🚗 (Bangkok: driving on the left, pink taxis, a temple)

Aunty Sri (the hornbill aunt) drives; Daddy sits in front with her, Mommy and Kaylee in the back, Kaylee by the window.
The camera looks into the car from the side with its roof off, like the house's dollhouse view, and Bangkok streams past
outside in layers (the near street fast, the shophouses slower, the skyline slow). The car always drives on by itself.

**The toy:** play in the back seat. Click the seatbelt (*click!*, Kaylee wiggles), tap the window and it slides down
(the wind blows her mane back; tap again and it goes up), and **wave at what goes by**: tap something outside and Kaylee
waves at it, and it answers.
**Deepens:** (1) away from Agong's house past the row of shophouses (Bird toots from his motorbike, the cat watches);
(2) the big road: tuk-tuks answer "tuk tuk!", a motorbike carrying a whole family and their dog waves back, a mango
sticky rice cart, a pink taxi beeps, the skytrain whooshes overhead; (3) the airport ramp, and the car stops at the
glowing drop-off.
**Pokeables:** Aunty Sri (tap: she beeps the horn, *beep beep!*, and laughs), the radio (tap: Thai pop music, everyone
bobs their heads; again: off), Jum's snack bag on the seat (Kaylee munches), Daddy (he turns round and makes a face),
Mommy (a cuddle), the garland swinging on the mirror, a golden temple roof outside (sacred: it never wobbles; a soft bell
and Sparkle's fact "Wat means temple!").
**Silly:** window down at full speed and Kaylee's mane blows into Mommy's face. Radio on, then a bump, and the music skips.
**What it teaches, by seeing:** in Thailand the steering wheel is on the right (Aunty Sri sits on the right) and cars
drive on the left; Bangkok's taxis are pink.
**Talk:** Aunty Sri: **"Seatbelts on! Let's go to the airport!"** At the drop-off she hugs them goodbye: "Have fun,
Kaylee!"

### Airport 🛫 (one moment worth having)

The suitcase goes on the belt (drag it or tap it) and slides into the x-ray. The screen beside it shows what's inside in
glowing blue outlines: everything she packed, drawn as simple toy shapes. If she packed Gan or the fan, it's on the
screen (a sleeping fox outline; a spinning fan). The officer laughs and stamps her boarding pass. Through the window the
plane waits; she taps its door and the family hop up the stairs. No check-in, no gate.

### The window seat ✈️ (Thailand is shaped like an elephant's head)

Kaylee rides in the window seat, Mommy in the middle and Daddy on the aisle; the pilot flies (Dad's pick, 2026-10-18:
play with the cabin like Toca's airport, not pilot Kaylee). The camera looks at their row from the aisle side, with the
round window beside Kaylee; what's outside the window is its own little scene.

**The toy:** the window seat. Click the seatbelt, slide the window shade up and down, fold the tray down, press the call
button, and watch the screen on the seat in front.
**Deepens:** (1) **takeoff:** seatbelt *click*, the plane rolls faster and faster (the window streaks), and everyone
presses back into their seats and goes up: *wheee!* (2) **up in the sky:** fold the tray down and press the call button:
*ding*, juice and a snack arrive; bumpy air makes the juice slosh. Shade up: fat toon clouds go by, a V of storks, and
**Sparkle's hot-air balloon** floats past the window with Sparkle waving (her cameo; it's the balloon from the world
map). The seat-back screen shows the map: the little plane goes down Thailand's elephant trunk. Then the clouds part, the
camera leans out through the window, and all of Thailand is below: the elephant head, its ear and the long trunk.
Sparkle: **"Thailand looks like an elephant's head!"** (3) **landing:** "Seatbelts on!", the sea and the first rock
islands come up in the window, *bump, bump, roll*, and everyone cheers and claps.
**Pokeables:** the shade, the tray, the call button, the reading light (on, off), the seat-back screen (tap: the map,
then cartoons), Daddy (he's asleep, mouth open: tap and he snorts awake), Mommy (she shares her snack), the teddy if
she packed it.
**Silly:** call button again and again: more and more snacks pile up on the tray. Shade down and the reading light on:
"Night night!", and Kaylee pretends to snore.
**Lands at:** Krabi (Dad confirmed, 2026-10-18). A 3-second cut with a Thai-roofed arrivals arch and a songthaew drive
is all that sits between the runway and the pier.

## The bay: Phang Nga Bay by longtail boat 🚤 (the main event)

**One-line pitch:** Agong wants a photo of the Nail Island; Captain Kaylee drives the family's longtail boat through
Phang Nga Bay to get it, stopping wherever she likes on the way.

**The toy (core verb): drive the longtail.** Kaylee stands at the back holding the long tiller (that's how real
longtails are steered: the engine and its long propeller pole swing together). Her finger on the water is where the boat
wants to go: it surges after it with a little lag, leans into turns, throws spray and leaves a foamy wake. The long tail
throws a rooster tail of spray when it goes fast; it *putt-putt-putts* slowly and *RRRAAAH*s fast. Tap the boat for a
**VROOM**: two seconds of speed, the bow lifts, Mommy holds her hat. Let go and the boat coasts and bobs.
- How it feels: a bathtub toy that's big and fast. It's heavy enough to drift through turns, bouncy when it hops over a
  wake, and it *boing*s off rocks.
- Why it's fun with no goal: going fast on water, making spray, doing doughnuts and jumping wakes, with huge rock towers
  overhead and something to poke on every island. Greybox test: a box boat on a flat green plane among grey columns,
  a wake made of white quads. If driving that box isn't fun for 30 seconds on the iPad, fix the feel before anything else.

**How the verb deepens (same verb, three ways):**
1. **Open water (just the toy).** Between the pier and the first stops: wide water, a few rock islands to circle and
   bonk, a big tour boat whose wake makes ramps (the longtail hops and lands with a splash; Mommy: "Whoa!"), needlefish
   skipping across the surface, a sea eagle that swoops down and snatches a fish. Then Daddy points at two places at
   once: **"Where to, captain? The village or the cave?"** A golden glow floats over each. She picks by driving there.
2. **Tight places (careful driving).** *Koh Panyee*, the village on stilts: the boat slows by itself in the village
   (real boats do), and she steers between the stilt houses, under laundry, past a cat on a fishing boat and squid
   drying on racks. *The cave*: the longtail is too big, so the family climbs into a little **yellow sea canoe** (real: the
   hidden lagoons are reached by canoe) that she steers the same way, slow and drifty, Daddy paddling.
3. **The twist: the low cave and the secret room.** Inside the cave it's dark and dripping, bats squeak, and every
   sound echoes. The roof comes lower and lower. Real paddlers lie flat in the canoe to fit, and so must the family:
   she taps them to lie back. If she doesn't, **Daddy's horn bonks the roof**, *boink!*, a little dust sprinkles down,
   he says "My horn!" and laughs (the moment she'll show Dad). Then light, and they slide out into a **hong**: a lagoon
   open to the sky inside the island, ringed by cliffs and mangroves, completely still. Fiddler crabs wave their big
   claw at her (tap: they wave back), mudskippers hop on the mud, a monitor lizard swims past like a little crocodile, a
   kingfisher flashes blue.

**The finish: the Nail Island.** After both stops (or straight away if she drives there first; it's always there, glowing
softly), the bay opens up: Khao Phing Kan's two leaning cliffs with their split, a little beach, and **Ko Tapu**, the
nail-shaped rock standing alone in the water. A ring of red-and-white buoys keeps boats back. She can circle it as much as
she likes. The buoys bump her softly back ("Boats stay back so the Nail Island keeps standing!"), which is the real
reason (it's protected from erosion). She drives onto the glowing beach spot; the family hop off.

**The photo (the payoff moment).** Daddy holds up the camera with Ko Tapu behind them: **"Everybody, pose!"** Four big
pose buttons (UI chips): wave 👋, cheer 🙌, heart 🫶, silly 🤪. She taps one, Kaylee strikes it, and Mommy and Daddy copy
her. "One, two, three, cheese!" The flash goes, and the photo prints out of the camera and drops into her **trip
album** with a satisfying *thwap*. She can take as many as she wants with different poses (each is a real render of
the scene: her hat, her sunglasses, her ribbons, the duck). If she packed the bucket, Kaylee digs a little sandcastle
on the beach while she poses.

**The sunset ride (payoff, ~20 s, optional).** The sky turns pink and gold, the rock towers glow, and they ride back
toward the pier. Out here, only at sunset, a **finless porpoise** surfaces next to the boat (a real, rare visitor to
the bay: the secret sighting). At the pier: the boarding pass gets its last punch, and then home.

**Side verb (one): tie the ribbons** at the pier (`pier`, ~20-30 s). The longtail waits at the pier, bobbing. Real Thai
boats wear colorful ribbons and a flower garland on the bow, for the boat's spirit (Mae Ya Nang) and good luck. Three
ribbon colors from a basket (pink, butter, mint, sky, lavender, hotpink) and a jasmine garland: tap a color and it
flutters onto the bow. Then Daddy steps in (the boat tips: *whoa-oa-oa!*), Mommy, and Kaylee hops to the tiller.
Sparkle: **"Put your finger on the water to drive!"** The first time she drives off, Daddy: **"Pai!"** (Thai for
"let's go!", Dad's pick).

**Her choices:** her ribbons; which stop first (village or cave), or skipping straight to the Nail Island; where to
drive in between; which pose and how many photos; at home, which photo goes on Agong's wall.

**Pokeables (every island has something):** rocks with tidal notches (bonk: a crab scuttles out), the sea eagle,
needlefish, a floating coconut (bump it along like a ball), macaques on a rocky ledge (tap: they chatter and one does a
somersault), a fishing boat pulling up a net (the fisherman waves), the village cat, laundry that flaps, the football,
bats in the cave (tap: they squeak and swirl), dripping stalactites (*plink*, and the echo answers), fiddler crabs,
mudskippers, the monitor lizard, the kingfisher, the duck on its string, Mommy (selfie!), Daddy (points at something
new), Kaylee (giggle and a little dance on the stern).

**Silly moments instead of failure:** bonk a rock and Daddy's sunglasses fly off and float; drive over them and they're
back on his face, upside down. Doughnuts make everyone dizzy and the duck swings round on its string. A **macaque
jumps in and steals Daddy's mango** (or his banana if she didn't pack one), "Hey! My mango!" (they're looking, not
feeding: it just grabs it). Jump a wake really high and Mommy's hat blows off; drive back to scoop it up. Drive
straight at the stilt houses and the boat slows to a crawl by itself while a grandma waves her broom.

**The village (Koh Panyee).** About 200 years ago fishing families from Java built their homes on stilts over the
sea, and the kids, who had no land to play football on, built a **floating football field**. A ball rolls off the field
into the sea: she pushes it back with the boat (bumper-boat football), and the kids kick it into the goal: GOAL! The
kids shout **"Khob khun ka!"** (thank you, Dad's pick) and give her a football to keep, and it rides in the boat from
now on. They're simple villagers with cheers and that one line, in one shared kid voice.
The village's golden mosque dome is scenery and, like the house's sacred things, never wobbles. Photo spot: Daddy
snaps one with the kids cheering behind (automatic, it drops into the album).

**Story frame (≤ 2 lines before her hands are busy, at the pier):** Daddy: "Our longtail boat! Tie on ribbons for good
luck!" / Sparkle: "Put your finger on the water to drive!"
**When Sparkle talks during play:** a stop comes into view for the first time (one fact), the cave roof comes low
("Lie down! The roof is low!"), the hong ("Hong means room! A secret room inside the island!"), the Nail Island comes
into view, the photo, and after ~8 s with no driving ("Put your finger on the water!"). Mommy and Daddy react in their own
voices with short lines; most reactions are just sounds and animation.

**What it teaches, by doing:**
- Phang Nga Bay's rock islands rise straight out of the sea; the sea has nibbled a notch around the bottom of each
  (she bonks them and sees it).
- Ko Tapu means "nail island"; boats keep back to protect it (the buoys bump her back).
- A village can be built on stilts over the sea; the kids built a floating football field (she plays on it).
- Some places are reached only by small boats, lying down (she ducks the family); a hong is a secret room inside an
  island.
- Mangrove trees stand in the salty water on their roots; mudskippers are fish that walk on mud; fiddler crabs wave one
  big claw.
- Thai boats wear ribbons for good luck (she ties them on).
- Earlier legs: Thailand looks like an elephant's head (she sees it from the plane window, and the little plane goes
  down the trunk on the seat-back map); hot, sunny weather means a sun hat and sunscreen; in Thailand the steering wheel
  is on the right and cars drive on the left; Bangkok's taxis are pink.

**Tap-to-hear facts** (Sparkle; stamp screen and passport, never required): "Thailand looks like an elephant's head!",
"Thai boats wear ribbons for good luck!", "A longtail boat has a car engine on a long stick!", "This village is built on
stilts, over the sea!", "The kids here built a football field that floats!", "Hong means room!", "Mangrove trees stand
on their roots!", "A mudskipper is a fish that walks on mud!", "This crab waves its big claw!", "Ko Tapu means Nail
Island!", "Boats stay back so the Nail Island keeps standing!", "This porpoise has no fin on its back!", "In Thailand,
cars drive on the left!", "Wat means temple!", "Khob khun means thank you!", "Pai means let's go!"

**Payoff (builds while she plays):** the **trip album** (a small book icon in the corner that bounces when something lands in it)
fills with up to three automatic photos (the village, the hong, the Nail Island) plus her own pose photos, and an
**animal sticker** for every critter she drives close to (needlefish, sea eagle, macaque, cat, fiddler crab,
mudskipper, monitor lizard, kingfisher, and the porpoise at sunset): 9 to find, Roblox "find them all" style, but
nothing is ever missed for good. The boat fills up too: ribbons on the bow, the football, the duck, a coconut from the village.
Then it all goes home (below).

**Replay:** different ribbons; the stops in a different order; the stickers she hasn't found yet sparkle a little
more next time; pose photos are new every time; what she packs changes what she wears and what rides in the boat.

**Numbers:** about 60-100 touches in 4-6 minutes (each drive, VROOM, poke, pose), nearly all of them driving or poking; the
only "question" (where to?) she answers by driving. 2 lines before the first touch.

### Home 🏠 (the payoff goes back to the house)

The flight home is a 4-second picture (the plane over a pink sunset; tap skips). Aunty Sri's car brings them back to
Agong's house and the family come out. **She picks which photo is for Agong** (her photos fan out; tap one), then taps Agong:
he holds it up, "Beautiful! Thank you, Kaylee!", and walks in and hangs it on the wall by the old photos. Everyone gathers,
and **Gan, Ken and BB put their phones down for the first time**: "Whoa! Cool!" Then the stamp (`StampEarned`) and the sticker:
a waving **fiddler crab**.

From then on the photo hangs in the house, in a frame next to the old family photos (the `photos` thing downstairs): tap
it and it comes close and Mommy says "Our boat trip!". Later trips add frames beside it, so the wall becomes her trips.

## Sections and carried state

Activity `boat-trip`: `activities/boat-trip/sections.ts`. Every param has a default, so a bare link always works.

| # | Section | Name for Dad | Reads |
|---|---|---|---|
| 1 | `invite` | Mommy asks: ready for a trip? | |
| 2 | `pack` | Pack the suitcase | `packed` (pre-fills it) |
| 3 | `goodbye` | Goodbye at Agong's house, into Aunty Sri's van | `packed` |
| 4 | ~~`car`~~ | (cut 2026-10-19: the van leaving is the way to the airport) | |
| 5 | `airport` | The x-ray belt | `packed` |
| 6 | `takeoff` | Window seat: seatbelt and takeoff | `packed` |
| 7 | `fly` | Window seat: tray, snacks, the elephant below | `packed` |
| 8 | `land` | Landing in Krabi | |
| 9 | `pier` | Tie ribbons on the longtail | `packed`, `ribbons` |
| 10 | `bay` | Open water, where to? | `packed`, `ribbons`, `stops`, `found` |
| 11 | `village` | Koh Panyee, the floating football field | `packed`, `ribbons`, `found` |
| 12 | `cave` | Into the canoe, under the low roof | `packed`, `found` |
| 13 | `hong` | The secret lagoon | `packed`, `found` |
| 14 | `nail` | Nail Island and the photo | `packed`, `ribbons`, `stops`, `photos`, `found` |
| 15 | `sunset` | The ride back and the porpoise | `packed`, `ribbons`, `found` |
| 16 | `home` | Agong's photo wall, the stamp | `photos`, `found` |

Params:
- `packed`: what's in the suitcase (comma list). Default `sunhat,sunglasses,floaties,duck,teddy`. Example for the silly
  x-ray: `airport?packed=gan,fan,mango`. (Built: a bare `pack` link starts with an empty suitcase; later legs without
  the param use what she packed last time, then the default.)
- `ribbons`: three colors on the bow. Default `pink,butter,mint`.
- `stops`: stops already visited (`village`, `cave`). Default empty; `nail` reads it to set up the album.
- `photos`: which automatic photos exist (`village,hong,nail`). Default for `home`: `nail`.
- `found`: the animal stickers found so far. Default empty.

`home` without saved photos renders a fresh Nail Island photo first, so the link always works. The hub keeps its own
link for the result: `#/world/thailand/hub/downstairs?at=photos` shows the wall.

## Camera and screens

One camera per leg, chosen before modeling, the same rules as the house (`engine/camera.ts` frames a box in any screen
shape; the top bar's 104 px stay clear).
- **Her room and the street:** the house's own cameras (the `pack` close-up frames the suitcase and the things around it).
- **Car:** from the side with the roof off (the house's dollhouse look), framing the back seat and Kaylee's window;
  the street streams past in layers.
- **Plane:** from the aisle, framing the three seats and Kaylee's window; for the elephant view the camera leans out
  through the window and looks down (pitch ~55°) for 3 seconds, then comes back.
- **Bay:** chase camera behind and a little to the right of the boat (yaw lags the boat's heading by ~0.8 s so turns
  feel smooth, not dizzy), pitch ~24°, framing a box ahead of the boat so she sees where she's going. On a tall screen
  the same box leaves room above, and **that's where the rock towers soar**: portrait gets the most dramatic karsts. In
  the cave the box shrinks and the camera comes in close. At the Nail Island the photo uses a low, straight-on shot
  (pitch ~6°) with Ko Tapu centered behind the family.
- The **safe zone** on every device: in the bay, the boat, the water about 20 m ahead of it and the next stop's glow;
  in the car and the plane, Kaylee, her window and the things she plays with. The pose buttons and the album sit at the bottom edge, at least 88 px on iPad and 64 px on iPhone.
- iPhone landscape: the box shrinks a little (the boat is bigger on screen); nothing important sits in the top 104 px.

## The look in 3D (no generated pictures needed except the sticker)

Everything is modeled in code from the house's kit (`engine/geo.ts` parts, `toon()` materials, ink outlines, blob
shadows, the `PAL` palette), so it matches Agong's house exactly.
- **Water:** a flat jade-green toon surface in 2-3 bands, slow moving wave lines, foam rings where it meets rock, and
  gentle swells computed by one function that both the shader and the boat's bob use (so the boat sits on the water it
  shows).
- **Karsts (the iconic look):** procedural limestone towers: tall, lumpy, near-vertical columns with a dark **notch at
  the waterline**, vertical grey-lavender streaks, and bushy green jungle caps. Near islands are real geometry (merged,
  outlined); the far ones are flat silhouettes in 2-3 layers with soft fog, so the bay feels endless while moving.
  Hand-shaped specials: **Ko Tapu** (thin at the waterline, wider at the top, a tuft of green on top) and **Khao Phing
  Kan** (two cliffs leaning together with the split between them).
- **Koh Panyee:** rows of stilt houses with tin roofs in pastel colors, boardwalks, laundry lines, drying racks, the
  floating football field with two goals, the golden dome behind.
- **The cave and hong:** a bent tunnel through an island with stalactites and a glowing exit; the hong is a ring of cliffs
  open to the sky with mangrove trees standing on their roots around a mud bank.
- **Critters:** simple toon builds like the family animals (a crab, a mudskipper, a monitor lizard, a macaque, a sea
  eagle, a kingfisher, needlefish, the porpoise), all with blinking eyes.
- **Sky:** a pastel gradient, toon clouds, and the pink-gold sunset for the ride back.
- **Aunty Sri's car:** a little rounded family car (lavender, like her blouse, until Dad says what she really drives),
  steering wheel on the right. **The Bangkok road** outside: the house's shophouse builder repeated along the road
  (varied colors and signs, no mirrored copies), pink taxis and tuk-tuks, the skytrain on its pillars, a golden temple
  roof, then the airport.
- **The plane and the elephant map below:** a chubby pastel plane with an elephant on the tail (no airline branding),
  and inside it a short toy cabin: three seats, round windows, trays, a call button, seat-back screens. Thailand below
  is a flat toon terrain built from the real outline: green land, mountains in the north as bumps, the sea around it.
- **Only generated picture:** the fiddler crab sticker (`art/STYLE.md`, sprite on white), and later the passport facts'
  pictures if wanted.

## Characters and voices

The trip is **Mommy, Daddy and Kaylee**: their 3D characters and voices already exist (`ji`, `nick`; Kaylee doesn't
speak, she giggles and squeals as sounds). Sparkle guides from the corner as in the house (`activities/hub/Guide.tsx`,
a trip version of it). Agong, Jum, Gan, Ken and BB speak only at the goodbye and at home. **Aunty Sri** (cast already,
`sri`) drives them to the airport and brings them home. One new speaker: the **village kids** (one shared kid voice for
"Khob khun ka!" and cheers). The officer, the flight attendant and the other villagers are background figures with
sounds and animation, not voices.

New lines (in `lines.ts`, all short): about 6 for Mommy, 10 for Daddy (with "Pai!"), 3 for Agong, 3 for Aunty Sri, 1 each
for Jum, Gan, Ken, BB and the village kids, and about 27 for Sparkle (the hints and the 16 facts). That's roughly 55
clips. Talk before the first touch stays under 6 s
in every section; talk per touch well under 1.5 s.

## Tech plan

**Folders** (all inside `src/world/places/thailand/`):
```
trip/                     the reusable kit
  types.ts                TripDef, Leg (pure data, no three.js)
  drive.ts                the finger-leads controller + feel profiles (built, greybox 1)
  vehicles/               longtail.ts, canoe.ts (built), car.ts, plane.ts (toon models with seats; the plane's cabin)
  legs/                   Pack, Goodbye, Car, Airport, Fly, Home (+ their scenes), BoardingPass.tsx
  Flat.tsx                the no-WebGL storybook version
engine/                   View3D.tsx, water.ts, particles.ts (built, greybox 1), photo.ts
activities/boat-trip/
  sections.ts  trip.ts    the sections (loaded at startup, no three.js) and the TripDef
  BoatTrip.tsx            runs the legs in order, the album, resume
  bay/                    bay.ts (the scene and the driving), layout.ts (meters, pure data), scenery.ts, tour.ts,
                          tune.ts (built, greybox 1); later village.ts, cave.ts, nail.ts, Album.tsx, Poses.tsx
```
`Place.tsx` routes `boat-trip` to `BoatTrip`; `meta.ts` gets the activity (`id: 'boat-trip'`, icon 🚤, the crab
sticker). The hub gets the map pickable, the photo frame on the wall, and Mommy's and Sparkle's new map lines.

**The house in the trip:** `pack`, `goodbye` and `home` mount the existing `House` with a small plugin
(`trip/legs/house-plugin.ts`) that gets the scene, the pokes and the avatar and adds the packing and the photo wall.
`house.ts` (851 lines) stays the house; the trip's logic stays in the trip folder.

**The bay's layout** (top view, about 500 × 400 m; ~20-30 s of driving between stops at cruising speed):
```
   N   [Khao Phing Kan beach]  (Ko Tapu + buoys)              mangroves
                    ·                                     [cave island]──tunnel──▶ (hong)
          karsts         karsts          karsts
                          open water, wakes, needlefish
    [Koh Panyee: stilts + football field]          karsts
                                   [pier]  ← start                       S
```
The bay is ringed by big karsts and mangroves (natural walls) with a soft current that turns her back at the edges.
Far zones are hidden while she's elsewhere (draw calls stay low).

**Driving maths** (`trip/drive.ts`): a 2D heading and speed with a turn-rate limit, drag (lag) and a coast; the target is the
finger's ray hit on the ground or water plane (above the horizon: a point far ahead in that direction). Steps run on real
elapsed time in small substeps, not per frame (Peru's lesson: headless WebKit runs at 10-20 fps). Bounces are circle
colliders around islands and posts. The boat's bob and tilt come from the swell function at its bow and stern.

**Photos:** `engine/photo.ts` renders the scene from the photo camera into a small render target (512 × 384), copies it to a
canvas and saves a JPEG (~30-50 KB) with `useSaved` (at most 8 kept). The house loads the chosen one as the frame's
texture. Photos stay on the iPad only; nothing is uploaded, and no real family photos go in the (public) repo.

**Performance budget** (checked with the house's `?debug=1` panel on the real iPad): under ~200 draw calls and
~200k triangles in the bay, 60 fps; scene swaps behind the boarding pass card; each leg's scene in its own `Bag`
(disposed on leave); the next leg's scene built during the card.

**No WebGL2:** `trip/Flat.tsx`, a picture-book version: pack with big buttons, a tap per leg, the three stops as cards,
the photo as a drawn card. She can always finish and get the stamp, with no console errors.

**Tests and QA:**
- `tests/sections.spec.ts` and `npm run tap-around` cover every section automatically once `sections.ts` exists.
- `tests/thailand-boat.spec.ts` (greybox 1) drives the boat with real pointer input; the trip's spec plays every leg
  with real taps (the seatbelts, the window, the tray, the boat to each stop), checks the photo is saved and appears in
  the house at `hub/downstairs?at=photos`.
- `window.__thaiBoatQA()` (built): read-only state; the trip adds the leg, the album and what's in the car and cabin.
  No jump hooks; tests open section links.
- QA scripts: `qa-screens` routes for every section; `qa-motion` filmstrips for the boat (built: drive, VROOM,
  doughnut, the cave roof), the car (window down, wave), the cabin (takeoff press-back, the tray), the suitcase sit;
  `qa-pacing` for each section.
- Full QA (layout-qa, then playtest-qa) at the bay's art gate and at the full loop.

**Riskiest pieces, prototyped first:** (1) the boat's drive feel with a chase camera on the iPad: done in greybox 1
(Dad: both controls together, the default speed is fine); (2) the water and karsts at 60 fps in Safari (check
`?debug=1` on the iPad); (3) memory on the iPad when swapping scenes between legs.

## Build plan (one PR each; stop for Dad after each)

1. **Greybox: the boat toy.** Only `pier` (no ribbons yet), `bay`, `cave` and `nail` as shapes: flat water, grey columns, the
   box longtail with the real Mommy, Daddy and Kaylee sitting in it, the drive control, wake, spray, bonks, VROOM, a
   tunnel, Ko Tapu with buoys. `?debug=1` gets sliders for the feel (speed, turn, lag) and a toggle between "finger on
   the water" and "grab the boat". **Dad plays it on the iPad.** If driving isn't fun yet, change the toy.
   *Built 2026-10-18* (`activities/boat-trip/`, `trip/drive.ts`, `trip/vehicles/`). What playing it with a robot
   finger changed from the plan:
   - The hong is part of the `cave` section (no `hong` link yet); the canoe goes in at the cave's raft and comes back
     out the same way.
   - In the canoe, **Kaylee steers from the back** (that's where a canoe's captain sits) and Daddy paddles in front,
     so Daddy, the tallest, bonks first, then Mommy, then Kaylee. Whoever she lies down early stays down until the
     roof is high again.
   - The tunnel camera is **low behind the canoe**, as high as the roof over it allows, not from the side: from the
     side, "finger up the screen" stopped meaning "forward". In the tunnel her finger counts by where it is on the
     screen next to the canoe (above it = paddle on, below = back up).
   - A held finger within about 11° of straight ahead goes straight (the camera sits 12° to the right of the boat, and
     "up the screen" otherwise curved forever). Taps go exactly where she tapped, round Ko Tapu's buoys, the hong and
     the towers on their own.
   - The photo on the beach (the 📸 button) is a camera flash and a hop for now; the album and poses come in step 3.
   - `?drive=grab` opens it in the "grab the boat" control. Dad played it (2026-10-18): keep both controls together
     (the default), drop the grab-only switch; the default speed is fine.
2. **Greybox: the trip kit.** The elephant map in her room and the packing toy with box props; the goodbye; Aunty Sri's
   car as a ride-along toy (a box car with its roof off on a box Bangkok road: seatbelt, window, waving, the horn, the
   radio); the airport belt and x-ray; the window seat (a box cabin: seatbelt, shade, tray and snacks, the seat-back
   map, blob clouds and the flat Thailand outline outside); the boarding pass between legs; resume. **Dad plays it.**
   Does each leg feel short and worth having?
   *Built 2026-10-18* (`trip/legs/`, `trip/props.ts`, `trip/vehicles/car.ts` and `plane.ts`, `trip/outline.ts`,
   `trip/drawings.ts`; the house got plugin hooks). Text bubbles instead of voices (`trip/talk.ts`, they move to
   `lines.ts` at the voices gate). A play from the map to the pier with real taps took about 3 min 15 s: packing ~25 s,
   the walk downstairs ~8 s, the goodbye ~15 s, the car ~45 s, the airport ~16 s, the window seat ~70 s, and a 1.5 s
   boarding pass between legs. What building it changed from the plan:
   - **The way in:** the map is a thing in her room (`map`, the real outline drawn into a canvas, crayon eye and ear,
     a house pin on Bangkok and a bobbing boat pin on Phang Nga Bay). Tap it and she walks up and looks up, the house's
     camera moves in close, and the trip opens on that same close-up (`invite`). A bare `boat-trip` link starts there
     too. The house's own little suitcase makes way for the trip's big pink one.
   - **The house in the trip:** `invite`, `pack` and `goodbye` mount the real house with a plugin
     (`trip/legs/house-plugin.ts`): it sees every touch first, moves the family, takes the camera and adds its own tap
     targets. `house.ts` only got the hooks.
   - **Packing:** with fewer than three things in it, tapping the suitcase makes it gulp for more ("Pack some more!")
     instead of closing, so a first tap can't end the toy. Up to five things she hops on it once to close it; past five,
     three hops; a packed fan blows it open once more. **Gan stays in the suitcase**, still asleep ("Five more
     minutes..."), instead of flopping back out: the x-ray needs him, and he's missing from the goodbye. Tap him again
     and he flops back on the mattress. Drag works too (drop it on the suitcase, or out of it). Mommy's hint comes after
     two things (or 9 s). At the click Mommy tucks in sunscreen and, with no hat, her spare sun hat.
   - **The goodbye** is on the sidewalk by the open shutter, the family who live here on either side of it. Aunty Sri's
     car (lavender, roof on, Sri at the wheel on the right, facing the camera) pulls up after ~3 s. Tap the car or Aunty
     Sri and everyone hops in; after 13 s they get in anyway. Jum's snacks, the cousins' "Bye...", Agong's line are
     bubbles; hugs are the house's own.
   - **The car:** the camera looks in from the curb side, a little ahead and low, so Daddy (front) and Kaylee (back, by
     her window) sit side by side and the street across the road shows. From there Aunty Sri is behind Daddy, so the
     **horn is its own tap target** (the middle of the wheel). Nothing passes between the camera and Kaylee: the
     motorbikes (Uncle Bird alongside at the start, the family with their dog) squeeze past on the car's far side, and
     the cat and the mango cart are across the road. It waits for her seatbelt (Mommy clicks it after 4.5 s), drives
     40 s, then the drop-off. A speed bump halfway makes everyone hop (and the radio skip). The skytrain runs low so it
     shows over the car. Sparkle's "Wat means temple!" and "In Thailand, cars drive on the left!" are bubbles.
   - **The airport:** tap or drag the suitcase onto the belt; the camera follows it to the x-ray; the outlines appear one
     by one; the officer (a background lavender elephant, no voice) laughs and stamps; the glass doors slide open; tap
     the plane's door and they hop up the stairs.
   - **The window seat:** the camera is in the aisle a little in front of the row, so all three faces show; the row in
     front is cut low. The seat-back screen faces her, so tapping it moves the camera above her head (tap again:
     cartoons). Sparkle's balloon is the world map's own picture floating past. The view of all of Thailand is a cut
     behind a white flash, with no haze (24 s into `fly`). Takeoff: belt (or Mommy after 4.5 s), 6.5 s rolling, 7 s
     climbing; `fly` 44 s; `land` 13 s with the first rock islands rising past the window. Snacks arc in from the aisle
     (no flight attendant yet).
   - **Krabi:** the 3-second cut is the boarding pass with a songthaew driving across it.
   - **Resume:** the trip saves where the next leg starts (`goodbye`, `airport`, `takeoff`, `pier`). With a trip
     half done, saying yes to Mommy shows the boarding pass with two big icons, 🧳 a new trip or the next leg's icon to keep
     going (the replay shortcut's simple form).
   - **Tap targets:** where they overlap, the small toys get the finger before big things, and things before people;
     the 3D view is its own stacking layer, so its targets never cover the boarding pass, the bubbles or the 📸 button.
   - **Controls (PR #99):** the grab-only switch is gone; both together is the only way.
   - Not yet (later gates): Sparkle's "Tap the map!" hint upstairs, her sun hat and sunglasses on the avatar (step 4),
     the wind in her mane, Daddy's sleeping face, the flight attendant, the arrivals arch.
3. **The bay, built.** The longtail with its tiller, ribbons and long tail; karsts with notches; Koh Panyee and the
   football; the canoe, cave and hong; Khao Phing Kan and Ko Tapu; critters; poses and the album; voices for the bay.
   Full QA.
4. **The trip, built.** The elephant map in her room, the packing props and her new hat, sunglasses and floaties, the
   goodbye, Aunty Sri's car and the Bangkok road, the x-ray, the plane and its cabin, clouds, Sparkle's balloon and the
   elephant below, the landing.
5. **The full loop.** Home and the photo wall, the stamp and the sticker in `meta.ts`, replays (the 🚤 shortcut, shorter
   legs), the flat version, facts, QA with the fun check below. Dad plays the whole trip on the iPad.

## Fun check (filled in now, to be re-checked on the iPad)

- **Core verb:** drive the longtail with a finger. Fun with no goal? That's what greybox 1 tests.
- **Hands busy:** two lines at the pier, then driving; Sparkle only for new things or after 8 s. Travel legs are toys,
  not cutscenes.
- **Touches:** 60-100 in the bay alone, nearly all driving and poking.
- **Choices:** what she packs, her ribbons, which stop first, how she drives, her poses, which photo goes to Agong.
- **Pokeables:** at least five in every stop (listed above).
- **Grows:** open water, then tight places, then the low cave; the album and the boat fill up; the photo goes home.
- **Surprise:** Daddy's horn bonks the cave roof; Gan in the suitcase; the monkey takes Daddy's mango; the cousins look up.
- **Learning by doing:** pack for the sun, see the elephant from the plane window, keep back from Ko Tapu, duck to fit
  under the cave roof, play on the floating football field.
- **Replay:** what she packs changes the trip; 9 stickers to find; new poses; the 🚤 shortcut.

## Dad's answers (2026-10-18)

1. **To the airport:** Aunty Sri drove them. So Kaylee rides along (in the back by the window) and plays; she doesn't
   drive the car. Assumed: Sri brings them home too.
2. **Airport:** Krabi.
3. **In the bay:** Koh Panyee, a hong, and James Bond Island.
4. **The map:** in Kaylee's room above her suitcase.
5. **The plane:** she rides in a window seat and plays with the cabin (seatbelt, tray, snacks), like Toca's airport.
6. **Sticker:** the fiddler crab.
7. **Thai words:** both, "Khob khun ka" from the village kids and "Pai!" from Daddy.
8. **The controls (PR #99):** both together (finger on the water, and grab the boat); the default speed is fine.

### Still open
- **How did you get into the hong?** Your answer to 3 left out "a cave by canoe". Greybox 1 goes into the hong by
  canoe through a low cave (how Phang Nga's hongs are usually visited, lying flat). Did you go in by canoe like that, or
  another way (straight in by longtail, or by kayak through an opening)? Ask before building the bay (step 3); the
  greybox 2 trip kit doesn't depend on it.
- ~~**Aunty Sri's car:** what kind and color?~~ A white electric van (Dad, 2026-10-19).

## Sources to check facts against

Mostly travel and tour pages, so check anything new against a second source before it becomes a spoken fact.
- Ko Tapu ("nail island", about 20 m tall, boats kept back) and Khao Phing Kan:
  [Thai Holiday Guide](https://www.thaiholidayguide.com/attraction/ko-tapu-james-bond-island/),
  [Penang Travel Tips](https://www.penang-traveltips.com/thailand/phangnga-province/james-bond-island.htm)
- Koh Panyee (families from Java, houses on stilts, the floating football field): [Wikipedia: Ko Panyi](https://en.wikipedia.com/wiki/Ko_Panyi),
  [The Smart Local](https://thesmartlocal.com/thailand/koh-panyee-floating-football-pitch)
- Hongs (Thai for "room"; reached by canoe through low caves, lying flat):
  [Sand in My Suitcase](https://sandinmysuitcase.com/sea-canoeing-phang-nga-bay/)
- Mangroves and wildlife (mudskippers, fiddler crabs, monitor lizards, monkeys, finless porpoise):
  [Thai National Parks: Ao Phang Nga](https://www.thainationalparks.com/ao-phang-nga-national-park),
  [Geography Worlds](https://geographyworlds.com/blog/phang-nga-bay-guide/)
- Rock towers of a drowned karst plain, tidal notches:
  [Kiernan, University of Tasmania](https://figshare.utas.edu.au/articles/conference_contribution/The_coastal_tower_karst_of_Phang_Nga_Bay/23215307)
- Ribbons on longtail bows for Mae Ya Nang: [Wikipedia: Mae Yanang](https://en.wikipedia.org/wiki/Mae_Yanang)
- Thailand shaped like an elephant's head: [Britannica Kids](https://kids.britannica.com/kids/article/Thailand/345800)
