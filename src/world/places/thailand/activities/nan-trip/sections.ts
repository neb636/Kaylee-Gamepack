// The Nan road trip (plan: planning/around-the-world/thailand/nan-trip.html), as deep-linkable sections:
// #/world/thailand/nan-trip/<section>?stops=<done so far>&... The trip loop (step 7): Mommy asks where to (invite:
// 🚤, 🛝🍕 or 🏔️🚙), packing for the mountains (pack?packed=...), the goodbye and Aunty Sri's van (goodbye), the x-ray
// belt (airport), the window seat north to Nan (takeoff, fly, land), and home (home?photos=...: the flight home, Agong
// asks for his photo, she picks one for his wall, the stamp). Then, straight off the plane: the Nan map
// (map?stops=..., step 6), the trip's hub: a toy diorama where she picks the next stop (or drags the little Pajero
// there); the mountain road (drive?road=city|valley|sky|three&to=<stop>, step 1); Baan Huanam Mushroom Farm
// (mushrooms?round=1|2|3|pizza&basket=<what she picked>, step 2): mist the sawdust bags, pick into the basket (pink
// and gold in round 3), then top the mushroom pizza with her basket; Kaylee's rice farm under Stop Time Cafe
// (rice?round=plant|grow|harvest|thresh|deck, step 3): lead Kaylee through the paddies to plant them, shoo the birds
// while it grows, cut the golden rice, bang out the grains, then the pink milk and Mommy's photo on the deck; Bo Kluea's
// salt wells (salt?round=1|2|3, step 4): dip the bucket in the well and pour the brine into the big pan, feed the fire
// till it boils down, scrape the salt into her basket; and the 3 from above (three, step 6): the "number 3" road
// below, its bends popping one, two, three, then Mommy's photo with the 3 behind them and ✈️🏠. In the works (plan:
// thailand/nan-cup.html, greyboxes 1-2; only its link reaches it): the Nan Mountain Cup's kart race
// (race?track=forest|steps|cloud&result=win|lose), her pink kart against Grandma Taeng, Pao and Moon through the Mushroom
// Forest, down the Rice Steps or up into the cloud, won by a nose or (the one race she loses) lost by one. Loaded at startup: keep three.js out of this file.
import { defineSections } from '../../../../kit/sections'
import { ITEMS } from '../../trip/packing'
import { RESULTS } from './cup/rivals'
import { TRACK_IDS } from './cup/track'
import { ROAD_IDS, WEATHERS } from './drive/roads'
import { STOPS } from './map/layout'
import { ROUNDS as FARM_ROUNDS } from './mushrooms/layout'
import { ROUNDS as RICE_ROUNDS } from './rice/layout'

const NAN_SECTIONS = defineSections('thailand', 'nan-trip', {
  params: {
    packed: { default: 'raincoat,boots,teddy,umbrella', doc: `what's in her suitcase, a comma list of ${ITEMS.map((i) => i.id).join(', ')} (Mommy always tucks in the umbrella)` },
    photos: { default: '', doc: "the trip's photos to pick from at home, a comma list of deck (Stop Time Cafe), three (the 3 from the viewpoint), pizza (the mushroom farm) and salt (Bo Kluea). Empty: one for each stop done and the 3 (deck,three with none)" },
    replay: { default: '', doc: '1 = she has done the whole trip before: picking 🏔️🚙 offers 🧳 a new trip or 🗺️ straight to the Nan map, and the flight is shorter' },
    stops: { default: '', doc: `the stops done so far, in the order she did them: a comma list of ${STOPS.join(', ')}. They wear a stamp on the Nan map (the newest one lands when she comes back to it), the Pajero waits at the last one, and after two the airport opens (home, down the 3 road)` },
    road: { default: 'valley', values: ROAD_IDS, doc: 'which road the drive plays: city (through Nan town to its market, over the river), valley (the rice fields to the mushroom farm: chickens, a songthaew, a buffalo crossing), sky (up Doi Phu Kha: blind bends with round mirrors, into the cloud and out above it) or three (down the hairpins, counting the bends, then the 3 from the viewpoint)' },
    to: { default: '', doc: `where the drive is going (picked on the Nan map): ${STOPS.join(', ')} (its stop opens by itself at the end of the road) or map (back to the map: the city road). Empty: the end card` },
    weather: { default: '', values: WEATHERS, doc: "the drive's weather: rain (the wipers swish, the road shines, puddles splash), sun or cloud (grey, low cloud on the hills). Empty: rolled afresh for every drive, like the traffic and the animals" },
    round: { default: '1', values: [...new Set([...FARM_ROUNDS, ...RICE_ROUNDS])], doc: "the step of the stop on screen. The mushroom farm: 1 mist the sawdust bags until grey oyster mushrooms pop and swell, 2 pick them into the basket (keep spraying one and it grows giant), 3 new bags with pink and golden mushrooms, pizza top the mushroom pizza with her basket, bake it and share it. The rice farm (lead Kaylee with a finger; what she walks through changes behind her): plant the seedlings plip in behind her (paddy A is flooded, the other three are dry until she opens their gates), grow the rice grows from green to gold while she shoos the birds off it, harvest she cuts the golden rice into bundles (the water drained), thresh she swings each bundle from the drying rack and bangs it on the board, the grains spray into the basket, the straw onto the pile, then the steaming kratip of sticky rice, deck the sticky rice, the pink milk, Mommy's photo and the rice video on Stop Time Cafe's deck" },
    track: { default: 'forest', values: TRACK_IDS, doc: "the Nan Mountain Cup's track: forest (the Mushroom Forest, Moon's home track: bouncy mushrooms), steps (the Rice Steps Rally, Grandma Taeng's: puddles that splash and muddy the kart, a waterfall that washes it) or cloud (the Cloud Top Climb, Pao's: into the cloud with glowing lanterns, pink blossom showers for a burst of speed)" },
    result: { default: 'win', values: RESULTS, doc: "how the Cup's race ends: win (she crosses the line first, the home rival right beside her) or lose (the home rival edges past on the last stretch and wins by a nose; she's second, never last)" },
    basket: { default: '', doc: "the mushrooms in her basket, <color><count> pairs of grey, pink and gold, e.g. grey5,pink2,gold1. Empty: what she'd have by then (nothing in rounds 1 and 2, grey6 in round 3, grey4,pink2 at the pizza)" },
  },
  sections: [
    { id: 'invite', name: 'Mommy asks: where shall we go? (🚤, 🛝🍕 or 🏔️🚙)', params: ['replay'] },
    { id: 'pack', name: 'Pack for the mountains: the raincoat, the rain boots, the umbrella', params: ['packed'] },
    { id: 'goodbye', name: "Goodbye at Agong's house, into Aunty Sri's van", params: ['packed', 'replay'] },
    { id: 'airport', name: 'The airport: the suitcase on the x-ray belt', params: ['packed'] },
    { id: 'takeoff', name: 'The window seat: seatbelt on, take off', params: ['packed', 'replay'] },
    { id: 'fly', name: 'The window seat: the tray, snacks, Thailand below, north to Nan', params: ['packed', 'replay'] },
    { id: 'land', name: 'Landing in the green valley at Nan, then the Nan map', params: ['packed'] },
    { id: 'map', name: 'The Nan map: pick the next stop, or drag the little Pajero there', params: ['stops', 'packed'] },
    { id: 'drive', name: 'The mountain road: steer the silver Pajero', params: ['road', 'to', 'weather', 'stops', 'packed'] },
    { id: 'mushrooms', name: 'Baan Huanam Mushroom Farm: mist the bags, pick the mushrooms, top the pizza', params: ['round', 'basket', 'stops', 'packed'] },
    { id: 'rice', name: "Kaylee's rice farm: plant the paddies, shoo the birds, cut the rice, the café's deck", params: ['round', 'stops', 'packed'] },
    { id: 'salt', name: 'Bo Kluea salt wells: dip and pour the brine (round 1), feed the fire (2), scrape the salt into the basket (3)', params: ['round', 'stops', 'packed'] },
    { id: 'race', name: 'The Nan Mountain Cup (greybox): race the pink kart through the Mushroom Forest, down the Rice Steps or up into the cloud', params: ['track', 'result', 'stops', 'packed'] },
    { id: 'three', name: 'The "number 3" from the viewpoint: its bends pop one, two, three, the photo, then home', params: ['stops', 'packed'] },
    { id: 'home', name: "Home: the flight, Agong's photo, the frame on his wall, the stamp", params: ['packed', 'photos'] },
  ],
})
export default NAN_SECTIONS
export type NanSection = (typeof NAN_SECTIONS)['sections'][number]['id']
