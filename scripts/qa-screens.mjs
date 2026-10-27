// Screenshots every Around the World screen (plus the puppet lab) at iPad and iPhone sizes for visual QA.
//
//   npm run build && node scripts/qa-screens.mjs [--chromium] [--only=iphone-landscape,ipad-portrait] [--routes=world-map,passport]
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
const PORT = Number(flag('port')) || 4179 // --port=N when another checkout's preview has 4179

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
  { name: 'character-lab', hash: '#/world/characters/kaylee', wait: 2500 },
  { name: 'character-lab-lineup', hash: '#/world/characters/agong?lineup=agong,jum,kaylee,putter', wait: 2500 },
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
  // Thailand: the Thailand map (thailand-map.html: where she lands; the plane parked at Bangkok, flown to Krabi, home
  // with a stamp landing, every stamp in), then Agong's house in 3D (the arrival mid-ride, each spot, a few things in
  // use), and the party card.
  { name: 'thailand-map', hash: '#/world/thailand', reset: true, wait: 1500 },
  { name: 'thailand-map-krabi', hash: '#/world/thailand/hub/map?plane=krabi', reset: true, wait: 1200 },
  { name: 'thailand-map-home', hash: '#/world/thailand/hub/map?plane=krabi&fly=bangkok&stamp=boat-trip', stampAll: 'thailand', wait: 5200 },
  { name: 'thailand-arrive', hash: '#/world/thailand/hub/arrive', reset: true, wait: 1400 },
  ...['street', 'downstairs', 'downstairs?at=table', 'downstairs?at=desk', 'downstairs?at=altar', 'downstairs?at=photos', 'upstairs', 'upstairs?at=mattress', 'upstairs?at=couch', 'upstairs?at=bathroom-door'].map((to) => ({
    name: `thailand-${to.replace('?at=', '-')}`,
    hash: `#/world/thailand/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // Her wardrobe (wardrobe.html): the doors open, the hats drawer, the paint drawer, her room in a look, and the door with its 4 pictures.
  ...['wardrobe', 'wardrobe?drawer=head', 'wardrobe?drawer=paint&look=crown,hearts,fairy,tutu,sneakers,hair-pink', 'upstairs?look=cap,stars,cape,gown,fur-mint', 'wardrobe?drawer=outfit&look=bow,fairy,tutu&door=crown,hearts,tutu;bow,fairy,dress-mint;cap,stars,cape;overalls,boots,hair-pink,fur-sky'].map((to) => ({
    name: `thailand-${to.replace(/[?=&,;]/g, '-')}`.slice(0, 60),
    hash: `#/world/thailand/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // The family photo (everyone, then a few alone on the turntable, in the three-quarter view it rests on first).
  { name: 'thailand-family', hash: '#/world/thailand/hub/family', reset: true, wait: 1800 },
  ...['kaylee', 'agong', 'ja', 'sri'].map((who) => ({ name: `thailand-family-${who}`, hash: `#/world/thailand/hub/family?who=${who}`, reset: true, wait: 1500 })),
  { name: 'thailand-party-soon', hash: '#/world/thailand/party/soon', stampAll: 'thailand', wait: 800 },
  // The Poles: the globe hub (greybox 1) from the middle, each pole, the sun out with summer up north, and the north in
  // its winter night; Ice Floe Hop; then an activity's and the finale's "coming soon" cards.
  ...['globe', 'globe?side=north', 'globe?side=south', 'sun?summer=north', 'sun?side=north&summer=south', 'sun?side=south&summer=south'].map((to) => ({
    name: `poles-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // Ice Floe Hop (greybox 2): Mama far away, then each stage's first floe, and home with Mama (the hug, then the look back).
  ...['story', 'steady', 'drift', 'melt', 'mama'].map((to) => ({ name: `poles-floe-${to}`, hash: `#/world/poles/floe/${to}`, reset: true, wait: to === 'mama' ? 4200 : 1800 })),
  // Penguin Slide (greybox 3): each stretch from its link (home: the feeding, then the colony).
  ...['top', 'bumps?run=right', 'dive', 'home?krill=12'].map((to) => ({ name: `poles-slide-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/poles/slide/${to}`, reset: true, wait: to.startsWith('home') ? 5000 : 2500 })),
  // Iceberg Maker (greybox 4): the pick, then each stretch at both poles from its link (sail: the camera turned round,
  // looking out to sea from the cliff top).
  { name: 'poles-iceberg-pick', hash: '#/world/poles/iceberg/pick', reset: true, wait: 1800 },
  ...['bits', 'giant', 'sail'].flatMap((to) => ['north', 'south'].map((pole) => ({ name: `poles-iceberg-${to}-${pole}`, hash: `#/world/poles/iceberg/${to}?pole=${pole}`, reset: true, wait: to === 'sail' ? 3000 : 1800 }))),
  // Snow Coats (greybox 5, 2D): the brown fox in late summer, hide and seek (half painted), the summer.
  { name: 'poles-coats-fox', hash: '#/world/poles/coats/fox', reset: true, wait: 1500 },
  { name: 'poles-coats-hide', hash: '#/world/poles/coats/hide?painted=fox,hare', reset: true, wait: 1500 },
  { name: 'poles-coats-summer', hash: '#/world/poles/coats/summer', reset: true, wait: 1500 },
  { name: 'poles-huddle-small', hash: '#/world/poles/huddle/small', reset: true, wait: 1500 },
  { name: 'poles-huddle-blizzard', hash: '#/world/poles/huddle/blizzard?wind=right', reset: true, wait: 1500 },
  { name: 'poles-huddle-hatch', hash: '#/world/poles/huddle/hatch', reset: true, wait: 1500 },
  { name: 'poles-huddle-chick', hash: '#/world/poles/huddle/hatch?chick=hatched', reset: true, wait: 5000 },
  { name: 'poles-huddle-sunrise', hash: '#/world/poles/huddle/sunrise', reset: true, wait: 6000 },
  { name: 'poles-party-soon', hash: '#/world/poles/party/soon', wait: 800 },
  // Canada: the train map (greybox 1): the whole country first, then the train at each stop and on the way (the
  // prairies, just out of the Spiral Tunnel); then an activity's and the finale's "coming soon" cards.
  { name: 'canada-intro', hash: '#/world/canada', reset: true, wait: 900 },
  ...['msa', 'quebec', 'ottawa', 'prairies', 'banff', 'rockies', 'bc'].map((at) => ({ name: `canada-map-${at}`, hash: `#/world/canada/hub/map?at=${at}`, reset: true, wait: 2200 })),
  // Mountain Bike (greybox 2): the gondola, each stretch from its link (berms: both ways), the waterfall at the end.
  ...['gondola', 'green', 'berms?trail=green', 'berms?trail=blue', 'creek', 'falls'].map((to) => ({ name: `canada-bike-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/bike/${to}`, reset: true, wait: to === 'falls' ? 14000 : to === 'gondola' ? 4000 : 3500 })),
  // Sugar Snow (greybox 3, 2D): each part from its link (orders with the chipmunk fed; share: everyone's lollipop).
  ...['pour', 'shapes', 'orders?fed=chipmunk', 'share'].map((to) => ({ name: `canada-taffy-${to.replace(/[?=&,]/g, '-')}`, hash: `#/world/canada/taffy/${to}`, reset: true, wait: to === 'share' ? 2400 : 1500 })),
  { name: 'canada-party-soon', hash: '#/world/canada/party/soon', wait: 800 },
  // The mall day's trip loop (greybox): Mommy's card (🚤 / 🛝🍕), the day pass's choices on a replay, the goodbye with
  // the whole family and the Veloz (then everyone in it), ICONSIAM's glimpse, the lift going up, the counter with her
  // socks on, home (the car at Agong's door; the box given, the photo on the wall).
  { name: 'mall-loop-invite', hash: '#/world/thailand/mall-trip/invite', reset: true, wait: 4000 },
  { name: 'mall-loop-replay', hash: '#/world/thailand/mall-trip/invite?replay=1', reset: true, wait: 3500, act: async (p) => {
    await p.locator('button[aria-label="The mall"]').click({ force: true })
    await p.waitForTimeout(1200)
  } },
  { name: 'mall-loop-goodbye', hash: '#/world/thailand/mall-trip/goodbye', reset: true, wait: 4500 },
  { name: 'mall-loop-goodbye-car', hash: '#/world/thailand/mall-trip/goodbye', reset: true, wait: 3000, act: async (p) => {
    await p.locator('[data-anchor="trip:car"]').click({ force: true })
    await p.waitForTimeout(3200)
  } },
  { name: 'mall-loop-arrive', hash: '#/world/thailand/mall-trip/arrive', reset: true, wait: 2200 },
  { name: 'mall-loop-lift', hash: '#/world/thailand/mall-trip/arrive', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'lift', null, { timeout: 30000 }).catch(() => {})
    await p.locator('[data-anchor="lift-button"]').click({ force: true }).catch(() => {})
    await p.waitForTimeout(2600)
  } },
  { name: 'mall-loop-counter', hash: '#/world/thailand/mall-trip/arrive', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'lift', null, { timeout: 30000 }).catch(() => {})
    await p.locator('[data-anchor="lift-button"]').click({ force: true }).catch(() => {})
    await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'counter', null, { timeout: 30000 }).catch(() => {})
    await p.locator('[data-anchor="socks:mint"]').click({ force: true }).catch(() => {})
    await p.waitForTimeout(2600)
  } },
  { name: 'mall-loop-home', hash: '#/world/thailand/mall-trip/home?hair=k.r', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().trip === 'give', null, { timeout: 40000 }).catch(() => {})
    await p.waitForTimeout(600)
  } },
  { name: 'mall-loop-home-wall', hash: '#/world/thailand/mall-trip/home', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().trip === 'give', null, { timeout: 40000 }).catch(() => {})
    await p.locator('[data-anchor="family:agong"]').click({ force: true }).catch(() => {})
    await p.waitForFunction(() => window.__thaiMallQA?.().held === 'wall', null, { timeout: 60000 }).catch(() => {})
    await p.waitForTimeout(1200)
  } },
  // HarborLand's hall (greybox): just in by Mommy's bench, out of the vet's door (Harbor Town), out of the racing
  // slide (the lanes, the crocodile), going in at the cafe (the door open, the camera in close), Mommy's "Pizza time?"
  // card once every sticker is on her band, and the 🗺️ map of every mini game.
  { name: 'mall-hall', hash: '#/world/thailand/mall-trip/hall', reset: true, wait: 3500 },
  { name: 'mall-hall-map', hash: '#/world/thailand/mall-trip/hall?map=1&games=vet,cafe,race', reset: true, wait: 3500 },
  { name: 'mall-hall-town', hash: '#/world/thailand/mall-trip/hall?from=vet&games=vet', reset: true, wait: 3500 },
  { name: 'mall-hall-lanes', hash: '#/world/thailand/mall-trip/hall?from=race', reset: true, wait: 3500 },
  { name: 'mall-hall-little-land', hash: '#/world/thailand/mall-trip/hall?from=blocks&games=blocks', reset: true, wait: 3500 },
  { name: 'mall-hall-muay-thai', hash: '#/world/thailand/mall-trip/hall?from=boxing&games=boxing', reset: true, wait: 3500 },
  { name: 'mall-hall-mountain', hash: '#/world/thailand/mall-trip/hall?from=mountain&games=mountain', reset: true, wait: 3500 },
  { name: 'mall-hall-sky-pod', hash: '#/world/thailand/mall-trip/hall?from=skypod', reset: true, wait: 3500 },
  { name: 'mall-hall-going-in', hash: '#/world/thailand/mall-trip/hall?from=vet', reset: true, wait: 2500, act: async (p) => {
    await p.locator('[data-anchor="door:cafe"]').click({ force: true })
    await p.waitForTimeout(2600)
  } },
  { name: 'mall-hall-hungry', hash: '#/world/thailand/mall-trip/hungry?games=vet,cafe,race,pool', reset: true, wait: 4500 },
  // HarborLand's Big Frame: each place she can start (through the tunnel, the ball pit, the three levels, the mats in
  // front), a sock band with stickers.
  ...['in', 'pit', 'l1', 'l2', 'top', 'out'].map((at) => ({ name: `mall-frame-${at}`, hash: `#/world/thailand/mall-trip/frame?at=${at}`, reset: true, wait: 3500 })),
  { name: 'mall-frame-stickers', hash: '#/world/thailand/mall-trip/frame?socks=mint&games=vet,cafe,frame', reset: true, wait: 3500 },
  // The Vet Clinic (greybox): each patient on the table (the earlier ones on the waiting room's bench), the 👇 hint
  // after a while, a tool at work (soap on the muddy pony), the end (all three on the bench, the 🛝).
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
  // The Barber Salon (greybox): each round (round 3: a kid with a picture card, Daddy on the bench with his new look), a
  // long rainbow hairdo from a link, the grow tonic and the scissors at work, the 👆 after a while.
  ...[1, 2, 3].map((n) => ({ name: `barber-${n}`, hash: `#/world/thailand/mall-trip/barber?round=${n}&hair=k.roygbvproygbvproygbvproyg.s.1p5Y`, reset: true, wait: n === 3 ? 5200 : 3200 })),
  { name: 'barber-hint', hash: '#/world/thailand/mall-trip/barber', reset: true, wait: 9500 },
  {
    name: 'barber-grow-snip',
    hash: '#/world/thailand/mall-trip/barber',
    reset: true,
    wait: 3000,
    act: async (p) => {
      const drag = async (tool, pts) => {
        const q = await p.evaluate(() => window.__thaiMallQA())
        await p.mouse.move(...q.tools[tool])
        await p.mouse.down()
        for (const [x, y] of pts) await p.mouse.move(x, y + q.liftPx, { steps: 4 })
        await p.mouse.up()
      }
      const [hx, hy, r] = (await p.evaluate(() => window.__thaiMallQA())).head
      await drag('tonic', Array.from({ length: 30 }, (_, i) => [hx + Math.cos(i * 0.5) * r * 0.9, hy - r * 0.6 + Math.sin(i * 0.5) * r * 0.4]))
      await drag('scissors', [[hx - r * 1.8, hy], [hx + r * 1.8, hy]])
      await p.waitForTimeout(250)
    },
  },
  { name: 'barber-hall', hash: '#/world/thailand/mall-trip/hall?from=barber&hair=k.roygbvproygbvproygbvproyg.s', reset: true, wait: 3500 },
  // Cafe & Cake (greybox): each round (the earlier rounds' drinks on the shelf), the 👆 after a while, the splat (the
  // lid left off), the jar tipped over the cup and pouring.
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
  // The Racing Slide (greybox): each round at the bottom of the steps (the others sitting at the top), the 👆 on the
  // steps after a while, the countdown, a race at a bump (round 2: the ring closing on her, gold), the spinning rings
  // (round 3), the pit after a win (the ribbon, Daddy head first).
  ...[1, 2, 3].map((n) => ({ name: `mall-race-${n}`, hash: `#/world/thailand/mall-trip/race?round=${n}`, reset: true, wait: 3000 })),
  { name: 'mall-race-hint', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 9500 },
  { name: 'mall-race-count', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.count === 2) },
  { name: 'mall-race-bump', hash: '#/world/thailand/mall-trip/race?round=2', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.phase === 'race' && q.window && q.crest >= 1) },
  { name: 'mall-race-rings', hash: '#/world/thailand/mall-trip/race?round=3', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.phase === 'race' && q.u > 0.45, 3) },
  { name: 'mall-race-pit', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 2500, act: (p) => raceTo(p, (q) => q.ribbons >= 1, 3, 1500) },
  // Little Land (greybox): each round at the start (round 2: the chedi's outlines; the elephant's), the 👆 on the box
  // after a while, a brick in her hand over the stack (the outline where it will land), the stack glowing after six,
  // a tower past Daddy's ribbon (ah... ah...).
  ...[1, 2, 3].map((n) => ({ name: `blocks-${n}`, hash: `#/world/thailand/mall-trip/blocks?round=${n}`, reset: true, wait: 3000 })),
  { name: 'blocks-elephant', hash: '#/world/thailand/mall-trip/blocks?round=2&card=elephant', reset: true, wait: 3000 },
  { name: 'blocks-hint', hash: '#/world/thailand/mall-trip/blocks', reset: true, wait: 9500 },
  {
    name: 'blocks-drag',
    hash: '#/world/thailand/mall-trip/blocks',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'blocks', null, { timeout: 20000 }).catch(() => {})
      for (let i = 0; i < 3; i++) {
        await p.locator('[data-anchor="box"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(550)
      }
      const q = await p.evaluate(() => window.__thaiMallQA())
      const sp = q.spots.find((s) => s[1] > 0) ?? q.spots[0]
      await p.mouse.move(...q.box)
      await p.mouse.down()
      await p.mouse.move(sp[2] + 20, sp[3] + q.liftPx - 30, { steps: 16 })
      await p.waitForTimeout(400)
    },
  },
  ...[['blocks-glow', 1, 6, 600], ['blocks-tall', 3, 4, 900]].map(([name, round, taps, after]) => ({
    name,
    hash: `#/world/thailand/mall-trip/blocks?round=${round}`,
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'blocks', null, { timeout: 20000 }).catch(() => {})
      for (let i = 0; i < taps; i++) {
        await p.locator('[data-anchor="box"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(550)
      }
      await p.waitForTimeout(after)
    },
  })),
  // Muay Thai (greybox): each round at the start (1: the wai kru beside the coach; 2: the drum and the ring on the bag;
  // 3: Daddy's pad, the bag hooked back), the 👆 on her gloves after a while, a bow, a punch on the beat (the gold POW),
  // the big kick.
  ...[1, 2, 3].map((n) => ({ name: `boxing-${n}`, hash: `#/world/thailand/mall-trip/boxing?round=${n}`, reset: true, wait: 3000 })),
  { name: 'boxing-hint', hash: '#/world/thailand/mall-trip/boxing', reset: true, wait: 9500 },
  {
    name: 'boxing-bow',
    hash: '#/world/thailand/mall-trip/boxing',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 }).catch(() => {})
      await p.locator('[data-anchor="gloves"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(550)
    },
  },
  {
    name: 'boxing-pow',
    hash: '#/world/thailand/mall-trip/boxing?round=2',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 }).catch(() => {})
      await p.waitForFunction(() => window.__thaiMallQA().window && window.__thaiMallQA().toNext < 0.3, null, { timeout: 8000, polling: 20 }).catch(() => {})
      const q = await p.evaluate(() => window.__thaiMallQA())
      if (q.bag) await p.mouse.click(...q.bag)
      await p.waitForTimeout(160)
    },
  },
  {
    name: 'boxing-kick',
    hash: '#/world/thailand/mall-trip/boxing?round=3',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 }).catch(() => {})
      for (let i = 0; i < 40; i++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        if (q.phase === 'finale') break
        if (q.pad && !q.hopping) await p.mouse.click(...q.pad)
        await p.waitForTimeout(450)
      }
      await p.waitForTimeout(500)
    },
  },
  // The Golden Mountain (greybox): each round at the foot (round 2: the pinks glow among the silly ones; round 3: Daddy
  // at his foot), the 👆 on the next hold after a while, a pull held halfway by her finger, the top (the bell and the
  // slide's mouth glowing), the race halfway up. Where things are comes from window.__thaiMallQA.
  ...[1, 2, 3].map((n) => ({ name: `mountain-${n}`, hash: `#/world/thailand/mall-trip/mountain?round=${n}`, reset: true, wait: 3000 })),
  { name: 'mountain-hint', hash: '#/world/thailand/mall-trip/mountain', reset: true, wait: 9500 },
  {
    name: 'mountain-pull',
    hash: '#/world/thailand/mall-trip/mountain?round=2',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'mountain', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(1500)
      const q = await p.evaluate(() => window.__thaiMallQA())
      const r = q.reach.find((h) => h[2] === 1 && h.length > 3)
      if (!r) return
      await p.mouse.move(r[3], r[4])
      await p.mouse.down()
      await p.mouse.move(r[3], r[4] + q.pullPx * 0.5, { steps: 6 })
      await p.waitForTimeout(400)
    },
  },
  ...[['mountain-top', 1, 6], ['mountain-race', 3, 4]].map(([name, round, taps]) => ({
    name,
    hash: `#/world/thailand/mall-trip/mountain?round=${round}`,
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'mountain', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(1200)
      for (let i = 0; i < taps; i++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        const r = q.reach.find((h) => h[2] === 1)
        if (r) await p.locator(`[data-anchor="hold:${r[0]}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(800)
      }
      await p.waitForTimeout(900)
    },
  })),
  // The Sky Pod (greybox): each round at the start (round 2: the wall playing the pattern; round 3: Daddy's blue light
  // beside hers), a slap on a high pod (Kaylee in the air, her arm up), the finale's rainbow and the 🛝, the 👆 after a
  // while.
  ...[1, 2, 3].map((n) => ({ name: `skypod-${n}`, hash: `#/world/thailand/mall-trip/skypod?round=${n}`, reset: true, wait: n === 2 ? 1400 : 3000 })),
  {
    name: 'skypod-slap',
    hash: '#/world/thailand/mall-trip/skypod',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'skypod', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(1200)
      const q = await p.evaluate(() => window.__thaiMallQA())
      const top = q.pods.reduce((best, s, i) => (s && s[1] < q.pods[best][1] ? i : best), 0)
      await p.locator(`[data-anchor="pod:${top}"]`).click({ force: true }).catch(() => {})
      await p.waitForTimeout(420)
    },
  },
  {
    name: 'skypod-finale',
    hash: '#/world/thailand/mall-trip/skypod?round=3',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'skypod', null, { timeout: 20000 }).catch(() => {})
      for (let n = 0; n < 60; n++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        if (q.phase === 'finale' || q.phase === 'free') break
        const i = q.lights.indexOf('lit')
        if (i >= 0) await p.locator(`[data-anchor="pod:${i}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(450)
      }
      await p.waitForTimeout(1800)
    },
  },
  { name: 'skypod-hint', hash: '#/world/thailand/mall-trip/skypod', reset: true, wait: 9500 },
  // The Pizza Company (greybox): the menu, the table at the start, a slice pulled out with the cheese stretching (held
  // over Daddy's plate), the last two for Agong's box, the box closed.
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
  // The Nan road trip's mountain road (greybox): the Pajero setting off on each of the four roads, a few seconds in on
  // the sky road (the switchbacks, the first mirror).
  ...['city', 'valley', 'sky', 'three'].map((road) => ({ name: `nan-drive-${road}`, hash: `#/world/thailand/nan-trip/drive?road=${road}`, reset: true, wait: 3500 })),
  { name: 'nan-drive-sky-climb', hash: '#/world/thailand/nan-trip/drive?road=sky', reset: true, wait: 14000 },
  // Baan Huanam Mushroom Farm (greybox): the rack before any mist, every bag grown (round 2: pick them), round 3's pink
  // and gold bags, and the pizza with a colorful basket.
  { name: 'nan-mushrooms-1', hash: '#/world/thailand/nan-trip/mushrooms', reset: true, wait: 3500 },
  { name: 'nan-mushrooms-2', hash: '#/world/thailand/nan-trip/mushrooms?round=2', reset: true, wait: 3500 },
  { name: 'nan-mushrooms-3', hash: '#/world/thailand/nan-trip/mushrooms?round=3', reset: true, wait: 3500 },
  { name: 'nan-mushrooms-pizza', hash: '#/world/thailand/nan-trip/mushrooms?round=pizza&basket=grey5,pink3,gold2', reset: true, wait: 3500 },
  // The Nan Mountain Cup (greybox 1): the grid and the countdown, and racing a few seconds in (the race drives on by
  // itself, a bit slower, with no finger down).
  { name: 'nan-cup-grid', hash: '#/world/thailand/nan-trip/race', reset: true, wait: 4500 },
  { name: 'nan-cup-race', hash: '#/world/thailand/nan-trip/race?result=lose', reset: true, wait: 14000 },
  // Greybox 2: the Rice Steps (the terraces, the first puddles) and the Cloud Top Climb (a blossom shower), a few seconds
  // in. (In the cloud and the waterfall are qa-motion's nan-cloud and nan-splash.)
  { name: 'nan-cup-steps', hash: '#/world/thailand/nan-trip/race?track=steps', reset: true, wait: 14000 },
  { name: 'nan-cup-cloud', hash: '#/world/thailand/nan-trip/race?track=cloud', reset: true, wait: 14000 },
  // Greybox 3: the race ground's board (one race done, its medal), the podium both ways (gold; silver with the winner
  // glowing for her high five), the Cup ceremony (the scoreboard lit, the Cup floating beside her), and the Nan map with
  // the Cup's stamp on Nan town.
  { name: 'nan-cup-board', hash: '#/world/thailand/nan-trip/cup?cup=forest:1', reset: true, wait: 6000 },
  { name: 'nan-cup-gold', hash: '#/world/thailand/nan-trip/podium?track=forest&place=1', reset: true, wait: 6000 },
  { name: 'nan-cup-silver', hash: '#/world/thailand/nan-trip/podium?track=steps&place=2', reset: true, wait: 6000 },
  { name: 'nan-cup-win', hash: '#/world/thailand/nan-trip/cup-win', reset: true, wait: 12000 },
  { name: 'nan-cup-map', hash: '#/world/thailand/nan-trip/map?stops=mushrooms,cup&cup=1', reset: true, wait: 5000 },
  // (The look step: the rivals on the chibi rig in the character lab, front and back.)
  { name: 'nan-cup-rivals', hash: '#/world/characters/taeng?lineup=taeng,pao,moon', wait: 3000 },
  { name: 'nan-cup-rivals-back', hash: '#/world/characters/taeng?lineup=taeng,pao,moon&yaw=150', wait: 3000 },
  { name: 'nan-salt-1', hash: '#/world/thailand/nan-trip/salt', reset: true, wait: 3500 },
  { name: 'nan-salt-2', hash: '#/world/thailand/nan-trip/salt?round=2', reset: true, wait: 3500 },
  { name: 'nan-salt-3', hash: '#/world/thailand/nan-trip/salt?round=3', reset: true, wait: 3500 },
  // The Nan map (none done, then two stops done: the airport opens) and the 3 from above.
  { name: 'nan-map', hash: '#/world/thailand/nan-trip/map', reset: true, wait: 3500 },
  { name: 'nan-map-stops', hash: '#/world/thailand/nan-trip/map?stops=mushrooms,rice', reset: true, wait: 3500 },
  { name: 'nan-three', hash: '#/world/thailand/nan-trip/three', reset: true, wait: 4000 },
  // The Nan trip's loop (the trip kit's legs): Mommy's card with 🏔️🚙, packing with the mountain things, the goodbye,
  // the x-ray, the window seat, landing in Nan's green valley (it plays out to the Nan map), and coming home (the
  // flight, then Agong asks for his photo and the Nan photos fan out).
  ...['invite', 'pack', 'goodbye', 'airport', 'fly'].map((to) => ({ name: `nan-${to}`, hash: `#/world/thailand/nan-trip/${to}`, reset: true, wait: to === 'invite' ? 3800 : 2600 })),
  { name: 'nan-land', hash: '#/world/thailand/nan-trip/land', reset: true, wait: 5500 },
  { name: 'nan-home', hash: '#/world/thailand/nan-trip/home?photos=deck,three,pizza,salt', reset: true, wait: 16000 },
  // Kaylee's rice farm (greybox A): paddy A flooded and three dry, the planted rows growing (birds coming in), the golden
  // rice drained for the harvest, the bundles on the rack by the threshing basket, and the café's deck.
  ...['plant', 'grow', 'harvest', 'thresh', 'deck'].map((round) => ({ name: `nan-rice-${round}`, hash: `#/world/thailand/nan-trip/rice?round=${round}`, reset: true, wait: round === 'grow' ? 6000 : 3500 })),
  // The boat trip: every section (the trip kit's legs, then the bay), a full suitcase, the x-ray showing what she
  // packed, the seat-back screen, the boarding pass between legs, and the beach after landing (the photo).
  // (The house's shaders compile on the first one: it waits a little longer.)
  ...['invite', 'pack', 'goodbye', 'airport', 'takeoff', 'fly', 'land', 'chang', 'sign', 'drinks', 'boardwalk', 'feed', 'favorites', 'lamyai', 'splash', 'pier', 'bay', 'village', 'cave', 'hong', 'nail', 'sunset'].map((to) => ({ name: `boat-trip-${to}`, hash: `#/world/thailand/boat-trip/${to}`, reset: true, wait: to === 'invite' ? 3800 : to === 'bay' ? 4600 : to === 'hong' ? 4000 : 2200 })),
  // Krabi's signpost with Baan Chang open (the landing plays out first): the songthaew waits, the 🐘 and 🚤 boards glow.
  { name: 'boat-trip-fork', hash: '#/world/thailand/boat-trip/land', reset: true, wait: 22000 },
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
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'finish', null, { timeout: 150000 }).catch(() => {})
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
  // Home (step 5): the photos fanned out for Agong, everyone gathered round her photo on the wall, the stamp with the
  // trip's facts, the photo wall in the house (and close up), a replay's boarding pass (🧳 or 🚤).
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
