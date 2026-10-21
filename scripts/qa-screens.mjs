// Screenshots every Around the World screen (plus home and the puppet lab) at iPad and iPhone sizes for visual QA.
//
//   npm run build && node scripts/qa-screens.mjs [--chromium] [--only=iphone-landscape,ipad-portrait] [--routes=home,world-map]
//                                                 [--parallel=3] [--max-minutes=20]
// Viewports run side by side (--parallel, default 3) and the run stops starting new screens after --max-minutes
// (default 20), listing what it skipped in errors.txt, so a sweep can never eat an hour. Then `npm run qa:sheets`.
//
// WebKit by default (the iPad runs Safari), touch + mobile emulation, rendered at 2x and saved at 1x (CSS pixels).
// Writes qa-output/<browser>-<viewport>/<nn>-<screen>.png and qa-output/errors.txt (console errors, overflow, failed steps).
// A failed step never stops the run: it is listed in errors.txt and the screenshot is taken anyway.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { browserName, device, flag, launch, openApp, out, pad, serve, skip, VIEWPORTS as ALL_VIEWPORTS } from './qa-lib.mjs'

export const VIEWPORTS = ALL_VIEWPORTS.filter((v) => !flag('only') || flag('only').split(',').includes(v.name))
const PORT = 4179

// Each screen: how to get there from a fresh start. `page.goto` keeps localStorage between screens.
// Kaylee's boat trip photo on Agong's wall, as if she had finished a trip (a drawn stand-in: pink sky, the nail, three
// friends), for the photo wall's screens. Runs in the page.
function seedWall() {
  const c = document.createElement('canvas')
  c.width = 320
  c.height = 240
  const g = c.getContext('2d')
  const sky = g.createLinearGradient(0, 0, 0, 240)
  sky.addColorStop(0, '#A98FE8')
  sky.addColorStop(0.6, '#FF9DC0')
  sky.addColorStop(1, '#5FC7B4')
  g.fillStyle = sky
  g.fillRect(0, 0, 320, 240)
  g.fillStyle = '#8A7FA8'
  g.fillRect(150, 60, 26, 130)
  g.fillStyle = '#FF8FB8'
  for (const x of [90, 220, 250]) {
    g.beginPath()
    g.arc(x, 180, 22, 0, 7)
    g.fill()
  }
  localStorage.setItem('kaylee-gamepack:/:saved:thailand-photo-wall', JSON.stringify([{ trip: 'boat-trip', src: c.toDataURL('image/jpeg', 0.8), at: '2026-10-20' }]))
}

// The racing slide: climb the steps (taps), then scoot (`taps` a second) until `until(window.__thaiMallQA())`, then
// wait `after` ms. Stops on its own after 25 s.
async function raceTo(page, until, taps = 0, after = 0) {
  const t0 = Date.now()
  while (Date.now() - t0 < 25000) {
    const q = await page.evaluate(() => window.__thaiMallQA?.() ?? {})
    if (until(q)) break
    if (q.phase === 'climb') await page.locator('[data-anchor="steps"]').click({ force: true }).catch(() => {})
    else if (q.phase === 'race' && taps && q.kaylee) await page.mouse.click(...q.kaylee)
    await page.waitForTimeout(q.phase === 'race' && taps ? 1000 / taps : q.phase === 'climb' ? 420 : 60)
  }
  await page.waitForTimeout(after)
}

const SCREENS = [
  { name: 'home', hash: '#/' },
  { name: 'world-map', hash: '#/world' },
  {
    name: 'world-map-continent',
    hash: '#/world',
    act: async (p) => {
      await p.getByRole('button', { name: 'africa' }).click({ force: true })
      await p.waitForTimeout(600)
    },
  },
  { name: 'passport-empty', hash: '#/world/passport', reset: true },
  { name: 'coloring-shelf', hash: '#/world/coloring' },
  {
    name: 'coloring-page',
    hash: '#/world/coloring/australia-koala',
    act: async (p) => {
      await p.waitForTimeout(800)
      const c = p.getByLabel('coloring page')
      const box = await c.boundingBox()
      if (box) for (const [fx, fy] of [[0.5, 0.5], [0.2, 0.2], [0.8, 0.3]]) await c.click({ force: true, position: { x: box.width * fx, y: box.height * fy } })
    },
  },
  { name: 'puppet-lab', hash: '#/world/puppets', wait: 1200 },
  { name: 'australia-intro', hash: '#/world/australia', reset: true, wait: 300 },
  { name: 'australia-hub', hash: '#/world/australia', act: skip },
  { name: 'outback-story', hash: '#/world/australia/outback/story', wait: 250 },
  {
    name: 'outback-pack', hash: '#/world/australia/outback/pack',
    act: async (p) => { await p.getByRole('button', { name: 'hat' }).click({ force: true }); await p.waitForTimeout(400) },
  },
  {
    name: 'outback-hop', hash: '#/world/australia/outback/water',
    act: async (p) => { await p.getByRole('button', { name: 'Hop' }).click({ force: true }); await p.waitForTimeout(700) },
  },
  { name: 'outback-mama', hash: '#/world/australia/outback/mama', wait: 2800 },
  { name: 'forest-feed', hash: '#/world/australia/forest/feed-2' },
  { name: 'forest-feed-four', hash: '#/world/australia/forest/feed-4' },
  { name: 'forest-sleep', hash: '#/world/australia/forest/sleep' },
  { name: 'reef-find', hash: '#/world/australia/reef/turtle' },
  { name: 'reef-octopus', hash: '#/world/australia/reef/octopus' },
  { name: 'stars-sky', hash: '#/world/australia/stars/sky' },
  { name: 'stars-flag', hash: '#/world/australia/stars/flag', wait: 4500 },
  { name: 'stars-quiz', hash: '#/world/australia/stars/quiz' },
  { name: 'croc-story', hash: '#/world/australia/croc/story', wait: 250 },
  { name: 'croc-hatch', hash: '#/world/australia/croc/hatch' },
  {
    name: 'croc-ride', hash: '#/world/australia/croc/ride',
    act: async (p) => { await p.getByRole('button', { name: 'baby crocodile' }).first().click({ force: true }); await p.waitForTimeout(700) },
  },
  { name: 'croc-swim', hash: '#/world/australia/croc/swim', wait: 700 },
  { name: 'croc-snap', hash: '#/world/australia/croc/snap', wait: 1800 },
  {
    name: 'postcard-color', hash: '#/world/australia/postcard/color',
    act: async (p) => {
      await p.waitForTimeout(600)
      const c = p.getByLabel('coloring page')
      const box = await c.boundingBox()
      if (box) for (const [fx, fy] of [[0.15, 0.2], [0.5, 0.5], [0.9, 0.9], [0.1, 0.9], [0.6, 0.1], [0.35, 0.65]]) await c.click({ force: true, position: { x: box.width * fx, y: box.height * fy } })
      await p.waitForTimeout(500)
    },
  },
  { name: 'postcard-send', hash: '#/world/australia/postcard/send', wait: 250 },
  {
    name: 'stamp-earned', hash: '#/world/australia/stars/quiz',
    act: async (p) => {
      await p.getByRole('button', { name: 'australia flag' }).click({ force: true })
      await p.waitForTimeout(2000)
    },
  },
  { name: 'australia-hub-stamps', hash: '#/world/australia', stampAll: true },
  { name: 'theater-world', hash: '#/world/theater', wait: 1200 },
  {
    name: 'theater-poster',
    hash: '#/world/theater',
    act: async (p) => {
      await p.getByRole('button', { name: /^Watch / }).first().click()
      await p.waitForTimeout(1400)
    },
  },
  {
    name: 'theater-full',
    hash: '#/world/theater',
    act: async (p) => {
      await p.getByRole('button', { name: /^Watch / }).first().click()
      await p.waitForTimeout(600)
      await p.evaluate(() => window.__kayleeTheaterFull?.())
      await p.waitForTimeout(800)
    },
  },
  { name: 'theater-australia', hash: '#/world/australia/theater', wait: 1200 },
  {
    name: 'video-break',
    hash: '#/world/australia/forest/feed-2',
    act: async (p) => {
      await p.evaluate(() => window.__kayleeWorld?.finish?.())
      await p.waitForTimeout(1200)
      await p.getByRole('button', { name: 'Back to the map' }).first().click()
      await p.waitForTimeout(1400)
    },
  },
  { name: 'party', hash: '#/world/australia/party/pat?stamps=all&danced=mama,koko,shelly,kooky,chompy' },
  { name: 'china-intro', hash: '#/world/china', reset: true, wait: 300 },
  { name: 'china-hub', hash: '#/world/china', act: skip },
  // China: open the exact section instead of replaying earlier rounds.
  { name: 'dumplings-arrive', hash: '#/world/china/dumplings/arrive', reset: true, wait: 400 },
  { name: 'dumplings-oldtown', hash: '#/world/china/dumplings/walk', reset: true },
  { name: 'dumplings-kitchen', hash: '#/world/china/dumplings/k1', reset: true, wait: 2200 },
  { name: 'dumplings-kitchen3', hash: '#/world/china/dumplings/k3?at=make&baskets=baobao:pink-green-yellow', reset: true, wait: 1500 },
  { name: 'dumplings-dining2', hash: '#/world/china/dumplings/d2', reset: true, wait: 1500 },
  { name: 'bamboo-story', hash: '#/world/china/bamboo/story', reset: true, wait: 400 },
  { name: 'bamboo-round1', hash: '#/world/china/bamboo/r1', reset: true },
  {
    name: 'bamboo-grown',
    hash: '#/world/china/bamboo/r1',
    reset: true,
    act: async (p) => {
      await p.getByRole('button', { name: 'bamboo shoot' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(900)
      await p.getByRole('button', { name: 'bamboo shoot' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(900)
    },
  },
  { name: 'wall-story', hash: '#/world/china/wall/story', reset: true, wait: 400 },
  { name: 'wall-gap1', hash: '#/world/china/wall/brick', reset: true },
  {
    name: 'wall-gap1-wrong',
    hash: '#/world/china/wall/brick',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.getByRole('button', { name: 'gold brick' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(700)
    },
  },
  { name: 'hotpot-story', hash: '#/world/china/hotpot/story', reset: true, wait: 400 },
  { name: 'hotpot-play', hash: '#/world/china/hotpot/noodles-drop', reset: true, wait: 1800 },
  { name: 'brush-story', hash: '#/world/china/brush/story', reset: true, wait: 400 },
  { name: 'brush-play', hash: '#/world/china/brush/ren', reset: true, wait: 1800 },
  { name: 'race-story', hash: '#/world/china/race/story', reset: true, wait: 400 },
  { name: 'race-play', hash: '#/world/china/race/board', reset: true, wait: 1800 },
  { name: 'train-story', hash: '#/world/china/train/story', reset: true, wait: 400 },
  { name: 'train-play', hash: '#/world/china/train/harbin', reset: true, wait: 1800 },
  { name: 'china-parade', hash: '#/world/china/party/drive?stamps=all', stampAll: 'china', wait: 2500 },
  { name: 'china-hub-done', hash: '#/world/china', stampAll: 'china', act: skip },
  { name: 'passport-full', hash: '#/world/passport', stampAll: true },
  {
    name: 'win-ceremony',
    hash: '#/world/australia',
    stampAll: true,
    act: async (p) => {
      await p.evaluate(() => window.__kaylee?.win())
      await p.waitForTimeout(1500)
    },
  },
  // Egypt: open the exact section instead of replaying earlier rounds.
  { name: 'egypt-intro', hash: '#/world/egypt', reset: true, wait: 300 },
  { name: 'egypt-hub', hash: '#/world/egypt', act: skip },
  { name: 'pyramid-story', hash: '#/world/egypt/pyramid/story', wait: 250 },
  { name: 'pyramid-build', hash: '#/world/egypt/pyramid/row-2', wait: 1200 },
  { name: 'passage-maze', hash: '#/world/egypt/passage/maze-1' },
  { name: 'sphinx-sand', hash: '#/world/egypt/sphinx/face' },
  { name: 'sphinx-rubbed', hash: '#/world/egypt/sphinx/paws' },
  { name: 'nile-sail', hash: '#/world/egypt/nile/sail-1', wait: 2500 },
  { name: 'scribe-stamps', hash: '#/world/egypt/scribe/k' },
  {
    name: 'market-koshari',
    hash: '#/world/egypt/market/koshari',
    act: async (p) => {
      await p.waitForTimeout(3500)
      for (const f of ['rice', 'lentils']) {
        await p.getByRole('button', { name: f, exact: true }).click({ force: true, timeout: 1500 }).catch(() => {})
        await p.waitForTimeout(500)
      }
    },
  },
  { name: 'egypt-hub-stamps', hash: '#/world/egypt', stampAll: 'egypt' },
  { name: 'light-show', hash: '#/world/egypt/party/wake-1?stamps=all', stampAll: 'egypt' },
  { name: 'italy-intro', hash: '#/world/italy', reset: true, wait: 300 },
  { name: 'italy-hub', hash: '#/world/italy', act: skip },
  { name: 'pizzeria-story', hash: '#/world/italy/pizzeria', reset: true, wait: 400 },
  { name: 'pizzeria-play', hash: '#/world/italy/pizzeria', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'olives-story', hash: '#/world/italy/olives', reset: true, wait: 400 },
  { name: 'olives-play', hash: '#/world/italy/olives', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'trevi-story', hash: '#/world/italy/trevi', reset: true, wait: 400 },
  { name: 'trevi-play', hash: '#/world/italy/trevi', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'colosseum-story', hash: '#/world/italy/colosseum', reset: true, wait: 400 },
  { name: 'colosseum-play', hash: '#/world/italy/colosseum', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'venice-story', hash: '#/world/italy/venice', reset: true, wait: 400 },
  { name: 'venice-pick', hash: '#/world/italy/venice', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(900) } },
  // Venice moments, opened by section link (#/world/sections): driving, a friend riding with the LEFT/RIGHT "go this
  // way" bubble, Gino's trip to the mask shop, the mirror mask, the night finale.
  ...['cruise', 'ride-1', 'trip', 'mask', 'finale'].map((to) => ({
    name: `venice-${to}`,
    hash: `#/world/italy/venice/${to}`,
    reset: true,
    wait: to === 'trip' ? 6000 : to === 'finale' ? 2500 : 1500,
  })),
  { name: 'etna-story', hash: '#/world/italy/etna', reset: true, wait: 400 },
  { name: 'etna-play', hash: '#/world/italy/etna', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  // Etna moments, opened by section link: the lemon grove, the chestnut forest and stream, the cold (snow falling, the
  // scarf on its trail post), the snow drifts, the full cart going down, the granita stand and the piano payoff.
  ...['grove', 'forest', 'cold', 'snow', 'full', 'granita', 'payoff'].map((to) => ({
    name: `etna-${to}`,
    hash: `#/world/italy/etna/${to}`,
    reset: true,
    wait: to === 'payoff' ? 2500 : 1500,
  })),
  { name: 'italy-hub-stamps', hash: '#/world/italy', stampAll: 'italy' },
  { name: 'italy-opera', hash: '#/world/italy/party', stampAll: 'italy', act: async (p) => { await skip(p); await p.waitForTimeout(2500) } },
  // Opera moments, opened by section link: the owl, the solos, the wishing star, Lupa's high note, the jets' sky and
  // the picnic.
  ...['owl', 'solo', 'star', 'high', 'sky', 'picnic'].map((to) => ({
    name: `opera-${to}`,
    hash: `#/world/italy/party/${to}?stamps=all`,
    wait: to === 'star' ? 2600 : 1200,
  })),
  // The Pizzeria's later pizzas, straight from a link instead of three pizzas of play.
  ...['bufala?at=toppings', 'gino?at=cut', 'own?at=sauce&sauce=pink', 'own?at=oven', 'payoff'].map((to) => ({
    name: `pizzeria-${to.replace(/[?&=]+/g, '-')}`,
    hash: `#/world/italy/pizzeria/${to}`,
    reset: true,
    wait: 1500,
  })),
  { name: 'peru-intro', hash: '#/world/peru', reset: true, wait: 300 },
  { name: 'peru-hub', hash: '#/world/peru', act: skip },
  { name: 'alpaca-story', hash: '#/world/peru/alpaca/story', reset: true, wait: 400 },
  { name: 'alpaca-play', hash: '#/world/peru/alpaca/brush', reset: true, wait: 1800 },
  // Luna's Fluffy Day moments, opened through section URLs: the clippers, the family's turn,
  // the yarn and the cactus, the hats tray, the journal photo.
  ...['clip', 'family', 'yarn', 'hats', 'photo'].map((to) => ({
    name: `alpaca-${to}`,
    hash: `#/world/peru/alpaca/${to}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'family' ? 2400 : 1500)
    },
  })),
  { name: 'terraces-story', hash: '#/world/peru/machu-picchu/story', reset: true, wait: 400 },
  { name: 'terraces-play', hash: '#/world/peru/machu-picchu/wall-1', reset: true, wait: 1800 },
  // Tika's Mountain Terraces, opened through section URLs: the second and third walls, the
  // last wall in the clouds, and the photobomb at the top.
  ...[1, 2, 3, 'photo'].map((to) => ({
    name: `terraces-${to === 'photo' ? 'photo' : `wall${to}`}`,
    hash: `#/world/peru/machu-picchu/${to === 'photo' ? 'photo' : `wall-${to + 1}`}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(1500)
    },
  })),
  { name: 'penguins-story', hash: '#/world/peru/penguins/story', reset: true, wait: 400 },
  { name: 'penguins-play', hash: '#/world/peru/penguins/splash', reset: true, wait: 1500 },
  // Pepa's Penguin Cliff moments, opened through section URLs: the fish schools, feeding the
  // chicks, the twist (third chick, swell, pelican), the chicks' first swim, the family parade.
  ...['fish', 'feed', 'twist', 'swim', 'parade'].map((to) => ({
    name: `penguins-${to}`,
    hash: `#/world/peru/penguins/${to}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'parade' ? 3200 : to === 'twist' ? 2400 : 1800)
    },
  })),
  { name: 'condor-story', hash: '#/world/peru/condor/story', reset: true, wait: 400 },
  { name: 'condor-start', hash: '#/world/peru/condor/start', reset: true, wait: 1500 },
  // Coco's Canyon Glide moments, opened through section URLs: leading Pluma to the places,
  // the sun on the other wall (the ridge), Pluma flying by herself, the condor circle at the end.
  ...['follow', 'ridge', 'solo', 'finale'].map((to) => ({
    name: `condor-${to}`,
    hash: `#/world/peru/condor/${to}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'finale' ? 1200 : 3000)
    },
  })),
  { name: 'river-story', hash: '#/world/peru/river/story', reset: true, wait: 400 },
  { name: 'river-play', hash: '#/world/peru/river/forest', reset: true, wait: 1800 },
  // Rosa's Rainy River moments, opened through section URLs: raining on the river, the river
  // view once it's filled, the lagoon, the lily pads with the friends, the rainbow.
  {
    name: 'river-rain',
    hash: '#/world/peru/river/forest',
    reset: true,
    act: async (p) => {
      await p.evaluate(() => window.__peruRiverQA?.rain(0.5, 12))
      await p.waitForTimeout(3500)
    },
  },
  ...['river', 'lagoon', 'pads', 'rainbow'].map((to) => ({
    name: `river-${to === 'river' ? 'full' : to}`,
    hash: `#/world/peru/river/${to}${to === 'river' ? '?river=1' : ''}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'rainbow' ? 2600 : 3200)
    },
  })),
  { name: 'peru-hub-stamps', hash: '#/world/peru', stampAll: 'peru' },
  { name: 'peru-balloon-soon', hash: '#/world/peru/party/soon', stampAll: 'peru', wait: 800 },
  // Thailand: Agong's house in 3D (the arrival mid-ride, each spot, a few things in use), the flat house without WebGL,
  // and the party card.
  { name: 'thailand-arrive', hash: '#/world/thailand/hub/arrive', reset: true, wait: 1400 },
  ...['street', 'downstairs', 'downstairs?at=table', 'downstairs?at=desk', 'downstairs?at=altar', 'downstairs?at=photos', 'upstairs', 'upstairs?at=mattress', 'upstairs?at=couch', 'upstairs?at=bathroom-door'].map((to) => ({
    name: `thailand-${to.replace('?at=', '-')}`,
    hash: `#/world/thailand/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // The family photo (everyone, then a few alone on the turntable, in the three-quarter view it rests on first).
  { name: 'thailand-family', hash: '#/world/thailand/hub/family', reset: true, wait: 1800 },
  ...['kaylee', 'agong', 'ja', 'sri'].map((who) => ({ name: `thailand-family-${who}`, hash: `#/world/thailand/hub/family?who=${who}`, reset: true, wait: 1500 })),
  { name: 'thailand-flat', hash: '#/world/thailand/hub/downstairs?gl=off', reset: true, wait: 600 },
  { name: 'thailand-party-soon', hash: '#/world/thailand/party/soon', stampAll: 'thailand', wait: 800 },
  // HarborLand's hall (greybox): just in by Mommy's bench, out of the vet's door (Harbor Town), out of the racing
  // slide (the lanes, the crocodile), going in at the cafe (the door open, the camera in close), Mommy's "Pizza time?"
  // card after four stickers, and the flat version.
  { name: 'mall-hall', hash: '#/world/thailand/mall-trip/hall', reset: true, wait: 3500 },
  { name: 'mall-hall-town', hash: '#/world/thailand/mall-trip/hall?from=vet&games=vet', reset: true, wait: 3500 },
  { name: 'mall-hall-lanes', hash: '#/world/thailand/mall-trip/hall?from=race', reset: true, wait: 3500 },
  { name: 'mall-hall-going-in', hash: '#/world/thailand/mall-trip/hall?from=vet', reset: true, wait: 2500, act: async (p) => {
    await p.locator('[data-anchor="door:cafe"]').click({ force: true })
    await p.waitForTimeout(2600)
  } },
  { name: 'mall-hall-hungry', hash: '#/world/thailand/mall-trip/hungry?games=vet,cafe,race,pool', reset: true, wait: 4500 },
  { name: 'mall-hall-flat', hash: '#/world/thailand/mall-trip/hall?games=vet&gl=off', reset: true, wait: 900 },
  // HarborLand's Big Frame: each place she can start (through the tunnel, the ball pit, the three levels, the mats in
  // front), a sock band with stickers, and the flat version.
  ...['in', 'pit', 'l1', 'l2', 'top', 'out'].map((at) => ({ name: `mall-frame-${at}`, hash: `#/world/thailand/mall-trip/frame?at=${at}`, reset: true, wait: 3500 })),
  { name: 'mall-frame-stickers', hash: '#/world/thailand/mall-trip/frame?socks=mint&games=vet,cafe,frame', reset: true, wait: 3500 },
  { name: 'mall-frame-flat', hash: '#/world/thailand/mall-trip/frame?gl=off', reset: true, wait: 900 },
  // The Vet Clinic (greybox): each patient on the table (the earlier ones on the waiting room's bench), the 👇 hint
  // after a while, a tool at work (soap on the muddy pony), the end (all three on the bench, the 🛝) and the flat version.
  ...['puppy', 'pony', 'elephant'].map((p) => ({ name: `vet-${p}`, hash: `#/world/thailand/mall-trip/vet?patient=${p}`, reset: true, wait: 4200 })),
  { name: 'vet-hint', hash: '#/world/thailand/mall-trip/vet', reset: true, wait: 9500 },
  {
    name: 'vet-soap',
    hash: '#/world/thailand/mall-trip/vet?patient=pony',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'exam', null, { timeout: 20000 }).catch(() => {})
      const q = await p.evaluate(() => window.__thaiMallQA())
      const [zx, zy] = [q.zones.belly[0], q.zones.belly[1] + q.liftPx]
      await p.mouse.move(...q.tools.soap)
      await p.mouse.down()
      await p.mouse.move(zx, zy, { steps: 10 })
      for (let i = 0; i < 30; i++) await p.mouse.move(zx + Math.cos(i * 0.9) * 26, zy + Math.sin(i * 0.9) * 16 - (i % 10) * 4, { steps: 2 })
      await p.mouse.up()
      await p.waitForTimeout(700)
    },
  },
  {
    name: 'vet-done',
    hash: '#/world/thailand/mall-trip/vet?patient=elephant',
    reset: true,
    act: async (p) => {
      // Taps do a short go each: medicine, tissue, soap, (the sneeze), the shower.
      await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'exam', null, { timeout: 20000 }).catch(() => {})
      const tool = { medicine: 'spoon', tissue: 'tissue', soap: 'soap', rinse: 'shower' }
      for (let i = 0; i < 30; i++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        if (q.phase === 'done' || q.phase === 'leave') break
        if (tool[q.need] && !q.held) await p.locator(`[data-anchor="tool:${tool[q.need]}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(1900)
      }
      await p.waitForTimeout(4500)
    },
  },
  { name: 'vet-flat', hash: '#/world/thailand/mall-trip/vet?patient=pony&gl=off', reset: true, wait: 900 },
  // Cafe & Cake (greybox): each round (the earlier rounds' drinks on the shelf), the 👆 after a while, the splat (the
  // lid left off), the jar tipped over the cup and pouring, and the flat version.
  ...[1, 2, 3].map((n) => ({ name: `cafe-${n}`, hash: `#/world/thailand/mall-trip/cafe?round=${n}`, reset: true, wait: 3200 })),
  { name: 'cafe-hint', hash: '#/world/thailand/mall-trip/cafe', reset: true, wait: 9500 },
  {
    name: 'cafe-splat',
    hash: '#/world/thailand/mall-trip/cafe',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'cafe', null, { timeout: 20000 }).catch(() => {})
      for (const id of ['item:watermelon', 'item:mango', 'button']) {
        await p.locator(`[data-anchor="${id}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(700)
      }
      await p.waitForTimeout(300)
    },
  },
  {
    name: 'cafe-pour',
    hash: '#/world/thailand/mall-trip/cafe?round=2',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'cafe', null, { timeout: 20000 }).catch(() => {})
      for (const id of ['item:strawberry', 'item:banana', 'button']) {
        await p.locator(`[data-anchor="${id}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(700)
      }
      await p.waitForTimeout(1800)
      const q = await p.evaluate(() => window.__thaiMallQA())
      await p.mouse.move(...q.jarAt)
      await p.mouse.down()
      await p.mouse.move(...q.pourAt[0], { steps: 16 })
      await p.waitForTimeout(800)
    },
  },
  { name: 'cafe-flat', hash: '#/world/thailand/mall-trip/cafe?round=3&gl=off', reset: true, wait: 900 },
  // The Racing Slide (greybox): each round at the bottom of the steps (the others sitting at the top), the 👆 on the
  // steps after a while, the countdown, a race at a bump (round 2: the ring closing on her, gold), the spinning rings
  // (round 3), the pit after a win (the ribbon, Daddy head first), and the flat version.
  ...[1, 2, 3].map((n) => ({ name: `mall-race-${n}`, hash: `#/world/thailand/mall-trip/race?round=${n}`, reset: true, wait: 3000 })),
  { name: 'mall-race-hint', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 9500 },
  { name: 'mall-race-count', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.count === 2) },
  { name: 'mall-race-bump', hash: '#/world/thailand/mall-trip/race?round=2', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.phase === 'race' && q.window && q.crest >= 1) },
  { name: 'mall-race-rings', hash: '#/world/thailand/mall-trip/race?round=3', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.phase === 'race' && q.u > 0.45, 3) },
  { name: 'mall-race-pit', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.ribbons >= 1, 3, 1500) },
  { name: 'mall-race-flat', hash: '#/world/thailand/mall-trip/race?round=2&gl=off', reset: true, wait: 900 },
  // The Pizza Company (greybox): the menu, the table at the start, a slice pulled out with the cheese stretching (held
  // over Daddy's plate), the last two for Agong's box, the box closed, and the flat version.
  { name: 'pizza-menu', hash: '#/world/thailand/mall-trip/menu', reset: true, wait: 3500 },
  { name: 'pizza-share', hash: '#/world/thailand/mall-trip/share?pizza=cheese', reset: true, wait: 3500 },
  {
    name: 'pizza-stretch',
    hash: '#/world/thailand/mall-trip/share?pizza=cheese',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().pan?.length, null, { timeout: 20000 }).catch(() => {})
      const q = await p.evaluate(() => window.__thaiMallQA())
      const [sx, sy] = q.pan[0]
      const [px, py] = q.plates.nick
      await p.mouse.move(sx, sy)
      await p.mouse.down()
      await p.mouse.move(sx + (px - sx) * 0.6, sy + (py - sy) * 0.6 - 60, { steps: 16 })
      await p.waitForTimeout(400)
    },
  },
  { name: 'pizza-agong', hash: '#/world/thailand/mall-trip/share?pizza=hawaiian&shared=6', reset: true, wait: 3500 },
  { name: 'pizza-done', hash: '#/world/thailand/mall-trip/share?pizza=seafood&shared=8', reset: true, wait: 3500 },
  { name: 'pizza-flat', hash: '#/world/thailand/mall-trip/share?shared=4&gl=off', reset: true, wait: 900 },
  // The boat trip: every section (the trip kit's legs, then the bay), a full suitcase, the x-ray showing what she
  // packed, the seat-back screen, the boarding pass between legs, the beach after landing (the photo), and the flat
  // version.
  // (The house's shaders compile on the first one: it waits a little longer.)
  ...['invite', 'pack', 'goodbye', 'airport', 'takeoff', 'fly', 'land', 'pier', 'bay', 'village', 'cave', 'hong', 'nail', 'sunset'].map((to) => ({ name: `boat-trip-${to}`, hash: `#/world/thailand/boat-trip/${to}`, reset: true, wait: to === 'invite' ? 3800 : to === 'bay' ? 4600 : to === 'hong' ? 4000 : 2200 })),
  // The bay's moments: three ribbons tied at the pier (the garland glowing), the goal and the football in the boat,
  // the Nail Island pose photo, a deep link's album open (photos and stickers), and the family on the pier at sunset.
  {
    name: 'boat-trip-ribbons',
    hash: '#/world/thailand/boat-trip/pier',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1800)
      for (const c of ['pink', 'sky', 'hotpink']) {
        await p.locator(`[data-anchor="ribbon:${c}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(900)
      }
      await p.waitForTimeout(600)
    },
  },
  {
    name: 'boat-trip-goal',
    hash: '#/world/thailand/boat-trip/village',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 12; i++) {
        if (await p.evaluate(() => window.__thaiBoatQA?.().ball !== 'loose')) break
        await p.locator('[data-anchor="ball"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(1800)
      }
      await p.waitForFunction(() => window.__thaiBoatQA?.().ball === 'done', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(2500)
    },
  },
  {
    name: 'boat-trip-pose',
    hash: '#/world/thailand/boat-trip/nail?packed=bucket,duck,mango',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="glow:beach"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'beach', null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(800)
      await p.getByRole('button', { name: 'Cheer pose' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(2300)
    },
  },
  {
    name: 'boat-trip-album',
    hash: '#/world/thailand/boat-trip/nail?stops=village,cave&photos=village,hong&found=crab,eagle,needlefish',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(3000)
      await p.getByRole('button', { name: 'Trip album' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  {
    name: 'boat-trip-docked',
    hash: '#/world/thailand/boat-trip/sunset',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 4; i++) {
        if (await p.evaluate(() => window.__thaiBoatQA?.().phase === 'docked')) break
        await p.locator('[data-anchor="glow:pier"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(9000)
      }
      await p.getByRole('button', { name: 'Close album' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
  {
    // The real way home: dock at the pier, tap ✈️🏠, and on to Agong's door (the button must be gone by then).
    name: 'boat-trip-home-route',
    hash: '#/world/thailand/boat-trip/sunset',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 4; i++) {
        if (await p.evaluate(() => window.__thaiBoatQA?.().phase === 'docked')) break
        await p.locator('[data-anchor="glow:pier"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(9000)
      }
      await p.getByRole('button', { name: 'Fly home' }).click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 60000 }).catch(() => {})
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.waitForTimeout(3400)
    },
  },
  // Mommy asks on her own a few seconds after Kaylee comes upstairs; Aunty Sri's van once it has pulled up.
  { name: 'thailand-mommy-asks', hash: '#/world/thailand/hub/upstairs', reset: true, wait: 6500 },
  { name: 'boat-trip-van', hash: '#/world/thailand/boat-trip/goodbye', reset: true, wait: 5000 },
  { name: 'boat-trip-pack-full', hash: '#/world/thailand/boat-trip/pack?packed=sunhat,sunglasses,floaties,duck,teddy,gan', reset: true, wait: 2200 },
  {
    name: 'boat-trip-xray',
    hash: '#/world/thailand/boat-trip/airport?packed=gan,fan,mango,teddy',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="suitcase"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().shown === 4, null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(600)
    },
  },
  {
    name: 'boat-trip-screen',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="screen"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
  {
    name: 'boat-trip-pass',
    hash: '#/world/thailand/boat-trip/goodbye',
    reset: true,
    act: async (p) => {
      await p.locator('[data-anchor="trip:van"]').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {})
      await p.locator('[data-anchor="trip:van"]').click({ force: true }).catch(() => {})
      await p.waitForSelector('[aria-label="Boarding pass"]', { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(700)
    },
  },
  // The boat race (race/): the grid and the countdown, racing with a finger on the water (the HUD, an item in the
  // slot), the last lap's finish, the podium and the trophy, and the bay's rainbow gate with the trophy in the bow after.
  { name: 'boat-race-grid', hash: '#/world/thailand/boat-trip/race', reset: true, wait: 7000 },
  {
    name: 'boat-race-racing',
    hash: '#/world/thailand/boat-trip/race',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'race', null, { timeout: 40000 }).catch(() => {})
      const vp = p.viewportSize()
      await p.mouse.move(vp.width * 0.55, vp.height * 0.45)
      await p.mouse.down()
      await p.waitForTimeout(6000)
      await p.mouse.up()
    },
  },
  {
    name: 'boat-race-finish',
    hash: '#/world/thailand/boat-trip/race?lap=3',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'finish', null, { timeout: 90000 }).catch(() => {})
      await p.waitForTimeout(600)
    },
  },
  { name: 'boat-race-podium', hash: '#/world/thailand/boat-trip/podium', reset: true, wait: 6500 },
  { name: 'boat-race-gate', hash: '#/world/thailand/boat-trip/bay?stops=race', reset: true, wait: 4600 },
  {
    name: 'boat-trip-beach',
    hash: '#/world/thailand/boat-trip/nail',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="glow:beach"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'beach', null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  // The trip's moments (step 4): her things going on at the click, the doors onto the plane, the flight
  // attendant's trolley, night night, the view of all of Thailand, and Krabi's songthaew.
  {
    name: 'boat-trip-put-on',
    hash: '#/world/thailand/boat-trip/pack?packed=sunhat,sunglasses,floaties',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="trip:suitcase"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().wearing?.length >= 3, null, { timeout: 15000 }).catch(() => {})
      await p.waitForTimeout(600)
    },
  },
  {
    name: 'boat-trip-doors',
    hash: '#/world/thailand/boat-trip/airport?packed=sunhat,sunglasses,floaties',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="suitcase"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'doors', null, { timeout: 30000 }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  {
    name: 'boat-trip-attendant',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 3; i++) await p.locator('[data-anchor="call"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().snacks >= 2, null, { timeout: 15000 }).catch(() => {})
      await p.waitForTimeout(400)
    },
  },
  {
    name: 'boat-trip-night',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="window"]').click({ force: true }).catch(() => {})
      await p.locator('[data-anchor="light"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(1600)
    },
  },
  {
    name: 'boat-trip-elephant',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().view === 'elephant', null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
  {
    name: 'boat-trip-krabi',
    hash: '#/world/thailand/boat-trip/land',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().krabi === true, null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(1400)
    },
  },
  { name: 'boat-trip-flat', hash: '#/world/thailand/boat-trip/bay?gl=off', reset: true, wait: 600 },
  // Home (step 5): the photos fanned out for Agong, everyone gathered round her photo on the wall, the stamp with the
  // trip's facts, the photo wall in the house (and close up), a replay's boarding pass (🧳 or 🚤), and the picture book.
  {
    name: 'boat-trip-home-pick',
    hash: '#/world/thailand/boat-trip/home?photos=village,hong,nail&found=crab,eagle',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 90000 }).catch(() => {})
      await p.waitForTimeout(800)
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.waitForTimeout(3400)
    },
  },
  {
    name: 'boat-trip-home-wall',
    hash: '#/world/thailand/boat-trip/home',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 90000 }).catch(() => {})
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.getByRole('button', { name: /^Photo: / }).first().click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="family:agong"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'home', null, { timeout: 60000 }).catch(() => {})
    },
  },
  {
    // While the big cousins glow on their phones (all three must be on screen to be tapped).
    name: 'boat-trip-home-gather',
    hash: '#/world/thailand/boat-trip/home',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 90000 }).catch(() => {})
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.getByRole('button', { name: /^Photo: / }).first().click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="family:agong"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'gather', null, { timeout: 60000 }).catch(() => {})
      await p.waitForTimeout(3000)
    },
  },
  {
    name: 'boat-trip-stamp',
    hash: '#/world/thailand/boat-trip/invite',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.evaluate(() => window.__kayleeWorld?.finish?.())
      await p.waitForTimeout(1800)
    },
  },
  { name: 'thailand-photo-wall', hash: '#/world/thailand/hub/downstairs?at=photos', reset: true, seed: seedWall, wait: 2500 },
  {
    name: 'thailand-photo-wall-close',
    hash: '#/world/thailand/hub/downstairs?at=photos',
    reset: true,
    seed: seedWall,
    act: async (p) => {
      await p.waitForTimeout(2500)
      await p.locator('[data-anchor="trip:wall:boat-trip"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  {
    name: 'boat-trip-replay',
    hash: '#/world/thailand/boat-trip/invite?replay=1',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(3800)
      await p.getByRole('button', { name: 'Yes', exact: true }).dispatchEvent('click').catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
  ...['pack', 'goodbye', 'bay', 'nail', 'home'].map((to) => ({ name: `boat-trip-book-${to}`, hash: `#/world/thailand/boat-trip/${to}?gl=off`, reset: true, wait: 900 })),
// --routes=venice,pizzeria-own: exact screen names, or an activity id for all of its screens (venice-*).
].filter((s) => !flag('routes') || flag('routes').split(',').some((r) => s.name === r || s.name.startsWith(`${r}-`)))

const { base, stop } = await serve(PORT)
const errors = []
try {
  mkdirSync(out, { recursive: true })
  // Only clear this browser's screenshot folders (qa-output also holds motion/, pacing.md, voice samples...).
  for (const name of readdirSync(out)) if (name.startsWith(`${browserName}-`)) rmSync(path.join(out, name), { recursive: true, force: true })
  const browser = await launch()
  const deadline = Date.now() + Number(flag('max-minutes') ?? 20) * 60_000
  const runViewport = async (vp) => {
    const dir = path.join(out, `${browserName}-${vp.name}`)
    mkdirSync(dir, { recursive: true })
    const context = await device(browser, vp)
    const page = await context.newPage()
    let current = ''
    page.on('console', (m) => m.type() === 'error' && !/youtube/i.test(`${m.text()} ${m.location().url}`) && errors.push(`${vp.name} ${current}: ${m.text()}`))
    page.on('pageerror', (e) => !/youtube/i.test(e.message) && errors.push(`${vp.name} ${current}: ${e.message}`))
    await openApp(page, base)
    for (const [i, s] of SCREENS.entries()) {
      current = s.name
      if (Date.now() > deadline) {
        errors.push(`${vp.name} ${s.name}: skipped, --max-minutes reached (rerun with --routes/--only for the rest)`)
        continue
      }
      try {
        if (s.reset) await page.evaluate(() => localStorage.clear())
        if (s.seed) await page.evaluate(s.seed)
        if (s.stampAll) {
          await page.goto(`${base}#/world/${s.stampAll === true ? 'australia' : s.stampAll}`)
          await page.waitForTimeout(400)
          await skip(page)
          await page.evaluate(() => window.__kayleeWorld?.stampAll())
        }
        await page.goto(`${base}#/blank`)
        await page.goto(`${base}${s.hash}`)
        // Going to the same address again reloads the app: tap through the splash if it came back.
        await page.getByRole('button', { name: /let's play/i }).click({ timeout: 700 }).catch(() => {})
        await page.waitForTimeout(s.wait ?? 900)
        if (s.act) await s.act(page)
      } catch (e) {
        errors.push(`${vp.name} ${s.name}: step failed: ${e.message.split('\n')[0]}`)
      }
      const file = path.join(dir, `${pad(i)}-${s.name}.png`)
      await page.screenshot({ path: file, scale: 'css' }).catch((e) => errors.push(`${vp.name} ${s.name}: screenshot failed: ${e.message.split('\n')[0]}`))
      // Overflow check: anything wider/taller than the screen that would scroll or clip?
      const overflow = await page
        .evaluate(() => {
          const el = document.scrollingElement
          return el.scrollWidth > innerWidth + 1 || el.scrollHeight > innerHeight + 1 ? `${el.scrollWidth}x${el.scrollHeight}` : null
        })
        .catch(() => null)
      if (overflow) errors.push(`${vp.name} ${s.name}: page overflows the screen (${overflow})`)
    }
    await context.close()
    console.log(`${browserName}-${vp.name}: ${SCREENS.length} screens`)
  }
  const queue = [...VIEWPORTS]
  await Promise.all(Array.from({ length: Math.min(Number(flag('parallel') ?? 3), queue.length) }, async () => {
    for (let vp = queue.shift(); vp; vp = queue.shift()) await runViewport(vp)
  }))
  await browser.close()
} finally {
  stop()
}
writeFileSync(path.join(out, 'errors.txt'), errors.join('\n') + '\n')
console.log(errors.length ? `${errors.length} problems, see qa-output/errors.txt` : 'No console errors or overflow.')
