// Pacing QA: how long Kaylee has to listen before she can touch something, and how much talking each activity has.
// (She got bored by long talk and forced waits, so this is measured, not guessed.)
//
//   npm run build && node scripts/qa-pacing.mjs [--chromium] [--only=outback,forest]
//
// Automated browsers skip audio, but every say() is logged in window.__kayleeSpeech with the clip's real length (ms,
// from voice-map.json), so the talk before the first touch is the sum of the lines spoken before anything tappable
// appears. It then auto-plays each activity like a child would (taps things, prefers glowing hints) to total the talk.
// It also reports the fun numbers from docs/play-design.md: talk per touch, seconds with nothing to touch, and how many
// different things she touched, and saves a play strip (12 frames across the whole run) per activity.
// Writes qa-output/pacing.md and qa-output/play/<id>.png; --video also records each run to qa-output/video/<id>.webm.
import { readdirSync, readFileSync, renameSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { args, browserName, device, filmstrip, flag, launch, openApp, out, root, serve, skip, VIEWPORTS } from './qa-lib.mjs'

const PORT = 4185
const TOO_MUCH_BEFORE_TOUCH = 6 // seconds
const LONG_LINE = 4 // seconds
const TALK_PER_TOUCH = 1.5 // seconds of talk per touch during play
const video = args.includes('--video')
const vp = VIEWPORTS[0] // iPad portrait

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

const SCENARIOS = [
  { name: 'world-map (first visit)', id: 'world', hash: '#/world', reset: true, play: false },
  { name: 'australia intro + map', id: 'intro', hash: '#/world/australia', reset: true, play: false },
  { name: 'outback', id: 'outback', hash: '#/world/australia/outback' },
  { name: 'forest', id: 'forest', hash: '#/world/australia/forest' },
  { name: 'reef', id: 'reef', hash: '#/world/australia/reef' },
  { name: 'stars', id: 'stars', hash: '#/world/australia/stars' },
  { name: 'croc', id: 'croc', hash: '#/world/australia/croc' },
  { name: 'postcard', id: 'postcard', hash: '#/world/australia/postcard' },
  { name: 'party (finale)', id: 'party', hash: '#/world/australia/party', stampAll: true },
  { name: 'china intro + map', id: 'china', hash: '#/world/china', reset: true, play: false },
  { name: 'china dumpling house', id: 'dumplings', hash: '#/world/china/dumplings', reset: true },
  { name: 'china great wall', id: 'wall', hash: '#/world/china/wall', reset: true },
  { name: 'china bamboo forest', id: 'bamboo', hash: '#/world/china/bamboo', reset: true },
  { name: 'china hotpot night', id: 'hotpot', hash: '#/world/china/hotpot', reset: true },
  { name: 'china magic brush', id: 'brush', hash: '#/world/china/brush', reset: true },
  { name: 'china great race', id: 'race', hash: '#/world/china/race', reset: true },
  { name: 'china bullet train', id: 'train', hash: '#/world/china/train', reset: true },
  { name: 'china dragon parade (finale)', id: 'parade', hash: '#/world/china/party', stampAll: 'china' },
  { name: 'egypt intro + map', id: 'egypt-intro', hash: '#/world/egypt', reset: true, play: false },
  { name: 'pyramid', id: 'pyramid', hash: '#/world/egypt/pyramid' },
  { name: 'passage', id: 'passage', hash: '#/world/egypt/passage' },
  { name: 'sphinx', id: 'sphinx', hash: '#/world/egypt/sphinx' },
  { name: 'nile', id: 'nile', hash: '#/world/egypt/nile' },
  { name: 'scribe', id: 'scribe', hash: '#/world/egypt/scribe' },
  { name: 'market', id: 'market', hash: '#/world/egypt/market' },
  { name: 'light show (finale)', id: 'show', hash: '#/world/egypt/party', stampAll: 'egypt' },
  { name: 'italy intro + map', id: 'italy', hash: '#/world/italy', reset: true, play: false },
  { name: 'italy pizzeria', id: 'pizzeria', hash: '#/world/italy/pizzeria', reset: true },
  { name: 'italy olive grove', id: 'olives', hash: '#/world/italy/olives', reset: true },
  { name: 'italy trevi fountain', id: 'trevi', hash: '#/world/italy/trevi', reset: true },
  { name: 'italy colosseum', id: 'colosseum', hash: '#/world/italy/colosseum', reset: true },
  { name: 'italy venice', id: 'venice', hash: '#/world/italy/venice', reset: true },
  { name: 'italy snow on a volcano', id: 'etna', hash: '#/world/italy/etna', reset: true },
  { name: 'italy opera (finale)', id: 'opera', hash: '#/world/italy/party', stampAll: 'italy' },
  { name: 'peru intro + map', id: 'peru', hash: '#/world/peru', reset: true, play: false },
  { name: "peru luna's fluffy day", id: 'alpaca', hash: '#/world/peru/alpaca', reset: true },
  { name: "peru tika's mountain terraces", id: 'machu-picchu', hash: '#/world/peru/machu-picchu', reset: true },
  { name: "peru pepa's penguin cliff", id: 'penguins', hash: '#/world/peru/penguins', reset: true },
  { name: "peru coco's canyon glide", id: 'condor', hash: '#/world/peru/condor', reset: true },
  { name: "peru rosa's rainy river", id: 'river', hash: '#/world/peru/river', reset: true },
  { name: 'thailand map (fly the plane)', id: 'thailand', hash: '#/world/thailand', reset: true },
  { name: "thailand agong's house (arrival)", id: 'thailand-house', hash: '#/world/thailand/hub/arrive', reset: true, play: false },
  { name: 'poles globe hub', id: 'poles', hash: '#/world/poles', reset: true },
  { name: 'poles ice floe hop', id: 'floe', hash: '#/world/poles/floe', reset: true },
  { name: 'canada train map', id: 'canada', hash: '#/world/canada', reset: true },
  // The trip there, one run per leg (each from its own section link).
  { name: "thailand: kaylee's wardrobe", id: 'wardrobe', hash: '#/world/thailand/hub/wardrobe?drawer=head', reset: true },
  { name: 'thailand trip: mommy asks', id: 'trip-invite', hash: '#/world/thailand/boat-trip/invite', reset: true },
  { name: 'thailand trip: packing', id: 'trip-pack', hash: '#/world/thailand/boat-trip/pack', reset: true },
  { name: "thailand trip: goodbye and aunty sri's van", id: 'trip-goodbye', hash: '#/world/thailand/boat-trip/goodbye', reset: true },
  { name: 'thailand trip: airport', id: 'trip-airport', hash: '#/world/thailand/boat-trip/airport', reset: true },
  { name: 'thailand trip: window seat, takeoff', id: 'trip-plane', hash: '#/world/thailand/boat-trip/takeoff', reset: true },
  { name: 'thailand trip: window seat, up in the sky', id: 'trip-fly', hash: '#/world/thailand/boat-trip/fly', reset: true },
  { name: 'thailand trip: landing and krabi', id: 'trip-land', hash: '#/world/thailand/boat-trip/land', reset: true },
  { name: 'thailand trip: landing and the signpost (baan chang open)', id: 'trip-fork', hash: '#/world/thailand/boat-trip/land', reset: true },
  { name: 'thailand baan chang: the songthaew to the entrance', id: 'chang-arrive', hash: '#/world/thailand/boat-trip/chang', reset: true, next: 'sign' },
  { name: 'thailand baan chang: the photo at the bamboo sign', id: 'chang-sign', hash: '#/world/thailand/boat-trip/sign', reset: true, next: 'drinks' },
  { name: 'thailand baan chang: her chocolate milk at the cafe', id: 'chang-drinks', hash: '#/world/thailand/boat-trip/drinks', reset: true, next: 'boardwalk' },
  { name: 'thailand baan chang: down the boardwalk', id: 'chang-boardwalk', hash: '#/world/thailand/boat-trip/boardwalk', reset: true, next: 'feed' },
  { name: 'thailand baan chang: feeding mali and khanom', id: 'chang-feed', hash: '#/world/thailand/boat-trip/feed', reset: true, next: 'favorites' },
  { name: 'thailand baan chang: favorites', id: 'chang-favorites', hash: '#/world/thailand/boat-trip/favorites', reset: true, next: 'lamyai' },
  { name: 'thailand baan chang: lamyai and the sneaky sips', id: 'chang-lamyai', hash: '#/world/thailand/boat-trip/lamyai', reset: true, next: 'splash' },
  { name: 'thailand baan chang: the splash', id: 'chang-splash', hash: '#/world/thailand/boat-trip/splash', reset: true, next: 'pier' },
  // The bay, one run per section (links with the section's path: a bare /boat-trip gets rewritten). It never "finishes"
  // (the trip goes on to the way home in a later gate), so talk per touch is total talk / taps by hand.
  { name: 'thailand bay: the pier and its ribbons', id: 'bay-pier', hash: '#/world/thailand/boat-trip/pier', reset: true },
  { name: 'thailand bay: open water, where to?', id: 'bay-open', hash: '#/world/thailand/boat-trip/bay', reset: true },
  { name: 'thailand bay: the village and the football', id: 'bay-village', hash: '#/world/thailand/boat-trip/village', reset: true },
  { name: 'thailand bay: the canoe under the low roof', id: 'bay-cave', hash: '#/world/thailand/boat-trip/cave', reset: true },
  { name: 'thailand bay: the hong', id: 'bay-hong', hash: '#/world/thailand/boat-trip/hong', reset: true },
  { name: 'thailand bay: the nail island and the photo', id: 'bay-nail', hash: '#/world/thailand/boat-trip/nail', reset: true },
  { name: 'thailand bay: the sunset ride back', id: 'bay-sunset', hash: '#/world/thailand/boat-trip/sunset', reset: true },
  { name: 'thailand bay: the boat race', id: 'bay-race', hash: '#/world/thailand/boat-trip/race', reset: true },
  { name: 'thailand bay: the race podium', id: 'bay-podium', hash: '#/world/thailand/boat-trip/podium', reset: true },
  // Home (step 5): a home link builds the bay first for its photos, then the flight home, the van, the photo for Agong.
  { name: 'thailand trip: home, the photo for agong', id: 'trip-home', hash: '#/world/thailand/boat-trip/home?photos=village,hong,nail&found=crab,eagle', reset: true },
  { name: 'thailand trip: a replay (🧳 or 🚤)', id: 'trip-replay', hash: '#/world/thailand/boat-trip/invite?replay=1', reset: true },
  // The mall day's trip loop (greybox, no voices yet: the words show in bubbles). Mommy's card, the goodbye (hugs, the
  // Veloz), ICONSIAM (the lift, the counter's toys, the gate), and home (the box for Agong, the photo on the wall).
  { name: 'thailand mall: mommy asks where to', id: 'mall-invite', hash: '#/world/thailand/mall-trip/invite', reset: true },
  { name: 'thailand mall: goodbye and the veloz', id: 'mall-goodbye', hash: '#/world/thailand/mall-trip/goodbye', reset: true },
  { name: 'thailand mall: iconsiam, the lift and the counter', id: 'mall-arrive', hash: '#/world/thailand/mall-trip/arrive', reset: true },
  { name: 'thailand mall: home, the box for agong', id: 'mall-home', hash: '#/world/thailand/mall-trip/home', reset: true },
  // HarborLand's hall (greybox, no voices): walking between the ways in; a tap on one goes into that mini game.
  { name: 'thailand mall: the hall', id: 'mall-hall', hash: '#/world/thailand/mall-trip/hall', reset: true },
  // HarborLand's Big Frame (greybox, no voices, and no end: a toy with no goal): climb up, slide down, the cannon.
  { name: 'thailand mall: the big frame', id: 'mall-frame', hash: '#/world/thailand/mall-trip/frame', reset: true },
  // The Vet Clinic (greybox, no voices): tapping a tool does a short go with it, so the auto-player can heal all three.
  { name: 'thailand mall: vet clinic', id: 'mall-vet', hash: '#/world/thailand/mall-trip/vet', reset: true },
  // The Barber Salon (greybox, no voices): a tap on a tool does a short go with it (a squirt, a trim, a comb, a bow), and
  // the mirror glows after enough of them.
  { name: 'thailand mall: barber salon', id: 'mall-barber', hash: '#/world/thailand/mall-trip/barber', reset: true },
  // Cafe & Cake (greybox, no voices): taps work too (a fruit hops in, the jar pours by itself, the straw serves).
  { name: 'thailand mall: cafe & cake', id: 'mall-cafe', hash: '#/world/thailand/mall-trip/cafe', reset: true },
  // The Racing Slide (greybox, no voices): taps climb the steps and scoot down (it never "finishes": round after round).
  { name: 'thailand mall: racing slide', id: 'mall-race', hash: '#/world/thailand/mall-trip/race', reset: true },
  // Little Land (greybox, no voices): a tap on the box hops the next brick to a good spot, a tap on the glowing stack
  // pushes it over, so the auto-player can play all three rounds.
  { name: 'thailand mall: little land', id: 'mall-blocks', hash: '#/world/thailand/mall-trip/blocks', reset: true },
  // Muay Thai (greybox, no voices): her glowing gloves for the wai kru, then a tap on the bag or the pad is a punch, so
  // the auto-player can play all three rounds (round 2 ends after 16 punches even off the beat).
  { name: 'thailand mall: muay thai', id: 'mall-boxing', hash: '#/world/thailand/mall-trip/boxing', reset: true },
  // The Golden Mountain (greybox, no voices): only the holds in reach have tap targets, and the bell and the slide's
  // mouth show at the top, so the auto-player climbs, rings and slides through all three rounds.
  { name: 'thailand mall: golden mountain', id: 'mall-mountain', hash: '#/world/thailand/mall-trip/mountain', reset: true },
  // The Sky Pod (greybox, no voices): a tap on a pod slaps it, so the auto-player plays the wall (its taps land on lit
  // pods only by chance, so it may not reach the finale: the scripted run in the plan does).
  { name: 'thailand mall: sky pod', id: 'mall-skypod', hash: '#/world/thailand/mall-trip/skypod', reset: true },
  // The Pizza Company (greybox, no voices): a tap on the pizza serves a slice (with its stretch) to the plate that's
  // behind, so the auto-player can share all eight and fill Agong's box.
  { name: 'thailand mall: pizza share', id: 'mall-pizza', hash: '#/world/thailand/mall-trip/share', reset: true },
  // The Nan road trip's mountain road (greybox, no voices): Mommy drives by herself to the end of the road, so the
  // auto-player's taps are pokes and steering; one run per road that deepens the verb.
  { name: 'thailand nan: the valley road', id: 'nan-valley', hash: '#/world/thailand/nan-trip/drive', reset: true },
  { name: 'thailand nan: the sky road', id: 'nan-sky', hash: '#/world/thailand/nan-trip/drive?road=sky', reset: true },
  { name: 'thailand nan: the 3 road', id: 'nan-three', hash: '#/world/thailand/nan-trip/drive?road=three', reset: true },
  // The mushroom farm (greybox, no voices): a tap on a bag is a puff of mist, a tap on a grown one picks it, a tap on
  // the basket or the pizza puts the next mushroom on, so the auto-player can play the rounds through to lunch.
  { name: 'thailand nan: the mushroom farm', id: 'nan-mushrooms', hash: '#/world/thailand/nan-trip/mushrooms', reset: true },
  { name: 'thailand nan: the mushroom pizza', id: 'nan-mushroom-pizza', hash: '#/world/thailand/nan-trip/mushrooms?round=pizza', reset: true },
  // Kaylee's rice farm (greybox A, no voices): a tap on the farm walks Kaylee there (planting, shooing or cutting what
  // she walks through), a tap on a gate floods its paddy. The auto-player can't hold a finger down, so it only gets
  // partway; the robot run that drags through every round is qa-motion's nan-plant and nan-shoo.
  { name: 'thailand nan: the rice farm', id: 'nan-rice', hash: '#/world/thailand/nan-trip/rice', reset: true },
  // Its threshing and the deck (greybox B): any tap bangs the next bundle, then the kratip on the deck and Mommy's photo.
  { name: 'thailand nan: threshing the rice', id: 'nan-rice-thresh', hash: '#/world/thailand/nan-trip/rice?round=thresh', reset: true },
  // Bo Kluea's salt wells: a tap on the pan (or the bucket) dips a bucketful and pours it, a tap on the woodpile throws a
  // log on, a tap on the pan in round 3 scrapes a stripe, so the auto-player can play it through to the bags.
  { name: 'thailand nan: the salt wells', id: 'nan-salt', hash: '#/world/thailand/nan-trip/salt', reset: true },
  // The rental desk, the Nan map and the 3 (greybox, step 6): a tap on the fob presses it, a tap on a bag puts it in the
  // boot, a tap on the seatbelt clicks it, so the auto-player can buckle up and drive off; on the map a tap on a place
  // drives the little Pajero there; the 3 from above plays by itself.
  { name: 'thailand nan: the rental desk', id: 'nan-rental', hash: '#/world/thailand/nan-trip/rental', reset: true },
  { name: 'thailand nan: the nan map', id: 'nan-map', hash: '#/world/thailand/nan-trip/map', reset: true },
  { name: 'thailand nan: the 3 from above', id: 'nan-three-view', hash: '#/world/thailand/nan-trip/three', reset: true },
  { name: "thailand house: the photo wall (agong's wall downstairs)", id: 'photo-wall', hash: '#/world/thailand/hub/downstairs?at=photos', reset: true, seed: seedWall },
].filter((s) => !flag('only') || flag('only').split(',').includes(s.id))

// Is there something (other than the story overlay, the top bar or a "hear it again" button) she can touch?
// Uses layout size (offsetWidth), not the transformed box, so things popping in from scale 0 count from their first frame.
function interactive() {
  if (document.querySelector('button[aria-label="Skip"]')) return []
  // Draggables have touch-action: none (see sdk Drag.tsx), so drag-only things count too.
  return [...document.querySelectorAll('button, [role="button"], canvas, [aria-label="coloring page"], [style*="touch-action: none"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const w = el.offsetWidth ?? r.width
      const h = el.offsetHeight ?? r.height
      return w > 20 && h > 20 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.disabled && el.getAttribute('aria-label') !== 'Hear it again' && r.top + r.height / 2 > 100 && r.top < innerHeight
    })
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, glow: !!el.closest('.world-glow'), label: el.getAttribute('aria-label') || el.tagName.toLowerCase(), w: r.width, h: r.height }
    })
}

// Runs in the page every animation frame from before navigation, so the first touchable moment is timed exactly.
function watchFirstTouch([target, source]) {
  window.__qaTouchAt = null
  const find = new Function(`return (${source})`)()
  const tick = () => {
    if (location.hash === target && find().length) window.__qaTouchAt = performance.now()
    else requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** The stamp screen or the trophy ceremony (not the top bar's own "Back to the map" button). */
const finishedScreen = () => [...document.querySelectorAll('button')].some((b) => /back to the map|my trophies/i.test(b.getAttribute('aria-label') ?? '') && b.getBoundingClientRect().top > 100)

const secs = (ms) => (ms / 1000).toFixed(1)
const results = []
mkdirSync(path.join(out, 'play'), { recursive: true })
if (video) mkdirSync(path.join(out, 'video'), { recursive: true })
const { base, stop } = await serve(PORT)
try {
  const browser = await launch()
  for (const s of SCENARIOS) {
    const context = await device(browser, vp, video ? { recordVideo: { dir: path.join(out, 'video'), size: { width: vp.width / 2, height: vp.height / 2 } } } : {})
    const page = await context.newPage()
    const r = { ...s, before: [], after: [], all: [], taps: 0, idleMs: 0, touched: new Set(), frames: [], finished: null, notes: [] }
    const p0 = Date.now()
    const snap = async () => r.frames.push({ t: (Date.now() - p0) / 1000, buf: await page.screenshot({ type: 'jpeg', quality: 70, scale: 'css' }) })
    try {
      await openApp(page, base)
      if (s.reset) await page.evaluate(() => localStorage.clear())
      if (s.seed) await page.evaluate(s.seed)
      if (s.stampAll) {
        await page.goto(`${base}#/world/${s.stampAll === true ? 'australia' : s.stampAll}`)
        await page.waitForTimeout(500)
        await skip(page)
        await page.evaluate(() => window.__kayleeWorld?.stampAll())
      }
      // An empty screen in the same page (hash routes keep the JS context, so the watcher survives navigation).
      await page.goto(`${base}#/world/puppets/__none__`)
      await page.waitForTimeout(300)
      await page.evaluate(() => (window.__kayleeSpeech = []))
      const t0 = await page.evaluate(() => performance.now())
      await page.evaluate(watchFirstTouch, [s.hash, interactive.toString()])
      await page.goto(`${base}${s.hash}`)
      // Story lines play out on their own (instantly in an automated browser); wait for the first touchable thing.
      await page.waitForFunction(() => window.__qaTouchAt != null, null, { timeout: 9000 }).catch(() => {})
      const tTouch = await page.evaluate(() => window.__qaTouchAt)
      await page.waitForTimeout(600)
      const log = await page.evaluate(() => window.__kayleeSpeech ?? [])
      if (tTouch === null) r.notes.push('nothing touchable appeared within 9s')
      // A prompt spoken as the play screen mounts is logged a few ms before its first frame is painted. Story lines
      // end at least ~280ms before the play screen appears (StoryBeat waits 250ms after the last line), so 200ms splits them.
      const cut = tTouch === null ? Infinity : tTouch - 200
      r.before = log.filter((l) => l.at >= t0 && l.at < cut)
      r.after = log.filter((l) => l.at >= cut).slice(0, 1)

      // Auto-play: tap like a child, preferring glowing hints, until the stamp screen shows (or give up).
      if (s.play !== false && tTouch !== null) {
        for (let tap = 0; tap < 45; tap++) {
          // Done when the stamp screen (activities) or the trophy ceremony (party) shows up, or (a section inside a
          // longer activity, `next`) when the address bar has moved on to the next section.
          if ((await page.evaluate(finishedScreen)) || (s.next && (await page.evaluate((n) => location.hash.includes(`/${n}`), s.next)))) {
            r.finished = true
            break
          }
          await skip(page).catch(() => {})
          const things = await page.evaluate(interactive)
          if (!things.length) {
            // Nothing to touch: she'd be waiting (story, an animation, a friend talking).
            await page.waitForTimeout(500)
            r.idleMs += 500
            continue
          }
          const glowing = things.filter((t) => t.glow)
          const canvases = things.filter((t) => t.label === 'coloring page' || t.label === 'canvas')
          // Coloring needs lots of taps on the picture; otherwise prefer glowing hints like she would.
          const pool = glowing.length ? glowing : canvases.length && Math.random() < 0.6 ? canvases : things
          const t = pool[Math.floor(Math.random() * pool.length)]
          // Coloring canvases: tap somewhere random inside.
          const x = t.label === 'coloring page' || t.label === 'canvas' ? t.x + (Math.random() - 0.5) * t.w * 0.8 : t.x
          const y = t.label === 'coloring page' || t.label === 'canvas' ? t.y + (Math.random() - 0.5) * t.h * 0.8 : t.y
          await page.mouse.click(x, y)
          r.taps++
          r.touched.add(t.label)
          await page.waitForTimeout(450)
          if (r.taps % 3 === 1) await snap()
        }
        await snap()
        if (r.finished === null) r.finished = false
        await page.waitForTimeout(800)
      }
      r.all = (await page.evaluate(() => window.__kayleeSpeech ?? [])).filter((l) => l.at >= t0)
    } catch (e) {
      r.notes.push(`failed: ${e.message.split('\n')[0]}`)
    }
    await context.close()
    if (r.frames.length >= 2) await filmstrip(r.frames, path.join(out, 'play', `${s.id}.png`)).catch(() => {})
    r.frames = []
    if (video) {
      const file = await page.video()?.path().catch(() => null)
      if (file) renameSync(file, path.join(out, 'video', `${s.id}.webm`))
    }
    const sum = (list) => list.reduce((a, l) => a + (l.ms || 0), 0)
    r.beforeMs = sum(r.before)
    r.totalMs = sum(r.all)
    r.missingMs = r.all.filter((l) => !l.ms).length
    // Only meaningful when the auto-player finished (it can't drag, so it gets stuck on drag-only steps).
    r.perTouch = r.finished && r.taps ? (r.totalMs - r.beforeMs) / 1000 / r.taps : null
    results.push(r)
    console.log(`${s.name}: ${secs(r.beforeMs)}s before first touch, ${secs(r.totalMs)}s total talk, ${r.taps} taps, ${r.perTouch?.toFixed(1) ?? '-'}s talk per tap, ${secs(r.idleMs)}s nothing to touch${r.finished === false ? ' (did not finish)' : ''}`)
  }
  await browser.close()
} finally {
  stop()
}

// Longest lines anywhere in the app (static, from every voice-map.json).
const maps = []
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && e.name !== 'voice' && e.name !== 'assets') walk(path.join(dir, e.name))
    else if (e.name === 'voice-map.json') maps.push(path.join(dir, e.name))
  }
}
walk(path.join(root, 'src'))
const long = []
let untimed = 0
for (const file of maps) {
  for (const entry of JSON.parse(readFileSync(file, 'utf8'))) {
    if (typeof entry === 'string' || !entry.ms) untimed++
    else if (entry.ms > LONG_LINE * 1000) long.push({ ...entry, where: path.relative(root, path.dirname(file)) })
  }
}
long.sort((a, b) => b.ms - a.ms)

const md = [
  `# Pacing report (${browserName}, ${vp.name})`,
  '',
  `Talk before first touch is the spoken time (real clip lengths) before anything tappable appears. Over ${TOO_MUCH_BEFORE_TOUCH}s is flagged ⚠️.`,
  'Total talk comes from an automatic child-like play-through (random taps, glowing hints first), so it includes hints for wrong taps.',
  `Talk per tap is the talk after the first touch divided by the taps it took to finish (over ${TALK_PER_TOUCH}s is flagged ⚠️: she listens more than she plays).`,
  'Nothing to touch is the time during play with no tappable thing on screen, waiting for animations (speech is instant here, so waiting on talk shows up in talk per tap instead).',
  'Different things is how many differently-labeled things the auto-player touched (low = one thing to do).',
  'Taps only: drags, swipes and holds are not exercised, so an activity that needs them won\'t finish here (talk per tap is then left out; judge it from the code and the play strip). Play strips: `qa-output/play/<id>.png`.',
  '',
  '| Screen | Talk before first touch | Lines before touch | Total talk | Taps | Talk per tap | Nothing to touch | Different things | Finished | Notes |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...results.map((r) => {
    const flagged = r.beforeMs > TOO_MUCH_BEFORE_TOUCH * 1000 ? ' ⚠️' : ''
    const finished = r.finished === null ? '-' : r.finished ? 'yes' : 'no'
    const notes = [...r.notes, r.missingMs ? `${r.missingMs} lines without a clip length` : ''].filter(Boolean).join('; ')
    const perTouch = r.perTouch === null ? '-' : `${r.perTouch.toFixed(1)}s${r.perTouch > TALK_PER_TOUCH ? ' ⚠️' : ''}`
    const idle = r.play === false ? '-' : `${secs(r.idleMs)}s`
    const kinds = r.play === false ? '-' : r.touched.size
    return `| ${r.name} | ${secs(r.beforeMs)}s${flagged} | ${r.before.length} | ${secs(r.totalMs)}s | ${r.taps} | ${perTouch} | ${idle} | ${kinds} | ${finished} | ${notes} |`
  }),
  '',
  '## What she hears before she can touch anything',
  '',
  ...results.flatMap((r) => [
    `**${r.name}**: ${r.before.length ? r.before.map((l) => `[${l.voice}] "${l.text}" (${secs(l.ms)}s)`).join(' → ') : '(nothing)'}${r.after[0] ? ` → then prompt [${r.after[0].voice}] "${r.after[0].text}" (${secs(r.after[0].ms)}s) while she can already play` : ''}`,
    '',
  ]),
  `## Lines longer than ${LONG_LINE}s (whole app)`,
  '',
  ...(long.length ? long.map((l) => `- ${secs(l.ms)}s [${l.voice}] "${l.text}" (${l.where})`) : ['None.']),
  untimed ? `\n${untimed} lines have no recorded length (old voice-map format): regenerate voices to time them.` : '',
  '',
]
mkdirSync(out, { recursive: true })
writeFileSync(path.join(out, 'pacing.md'), md.join('\n'))
console.log('Wrote qa-output/pacing.md')
