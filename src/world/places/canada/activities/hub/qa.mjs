// The map of Canada (map/world.ts): its look in every screen shape, the team at the rink (none, three, all six), a new
// friend arriving, and a tap that closes in and opens a chapter. window.__canadaMapQA() has `targets` (each tap
// target's center and size on screen), `team`, `arriving`, `glowing`, `picked`, `moves` (`playing`, and `played`: every
// friend's move this visit, in order), `gus` (`n`: how many on the team when Gus said his line, 0 before; his `face`)
// and `hut` (she tapped the skate hut).
const ready = (page) => page.waitForFunction(() => window.__canadaMapQA?.().targets?.['go:party'], null, { timeout: 20000 })
const at = async (page, id) => (await page.evaluate(() => window.__canadaMapQA())).targets[id]
const qa = (page) => page.evaluate(() => window.__canadaMapQA())
/** Waits for `test(qa)` while the pointer drifts (a test browser slows a page that hears nothing for 30 s). */
async function until(page, test, ms, why) {
  const t0 = Date.now()
  let i = 0
  while (Date.now() - t0 < ms) {
    const q = await qa(page).catch(() => null)
    if (q && test(q)) return q
    await page.mouse.move(30 + (i % 4) * 2, 30 + (i++ % 3) * 2)
    await page.waitForTimeout(150)
  }
  throw new Error(`waited ${ms / 1000}s for ${why}: ${JSON.stringify(await qa(page).catch(() => null), (k, v) => (k === 'targets' || k === 'friends' || k === 'pins' ? undefined : v))}`)
}

/** Every friend, the team she comes home to and the Gus line that follows (by how many: 1..6). */
const ORDER = ['snowman', 'bike', 'campfire', 'canoe', 'bath', 'whales']
const arrival = (id) => {
  const i = ORDER.indexOf(id)
  return { team: i ? ORDER.slice(0, i).join(',') : 'none', n: i + 1 }
}

export const screens = [
  { name: 'canada-map', hash: '#/world/canada/hub/map', reset: true, wait: 4500 },
  { name: 'canada-map-team-none', hash: '#/world/canada/hub/map?team=none', reset: true, wait: 4500 },
  { name: 'canada-map-team-three', hash: '#/world/canada/hub/map?team=snowman,bike,canoe', reset: true, wait: 4500 },
  { name: 'canada-map-team-all', hash: '#/world/canada/hub/map?team=all', reset: true, wait: 9000 },
  { name: 'canada-map-arrival', hash: '#/world/canada/hub/map?team=snowman,bike&new=canoe', reset: true, wait: 8000 },
  { name: 'canada-map-book', hash: '#/world/canada/hub/book', reset: true, wait: 1500 },
  // A friend's move in the middle (the camera is on the rink), and the skate hut beside the canal.
  { name: 'canada-map-move-bath', hash: '#/world/canada/hub/map?team=snowman,bike,campfire,canoe&new=bath', reset: true, wait: 4200 },
  { name: 'canada-map-hut', hash: '#/world/canada/hub/map?team=snowman,bike,campfire,canoe', reset: true, wait: 4500 },
]

export const pacing = [{ name: 'canada map', id: 'canada', hash: '#/world/canada/hub/map', reset: true }]

export const motion = [
  // The way-in film, watched to the end (about 45 s). The pointer drifts a little now and then, touching nothing: a
  // test browser slows any page to a crawl after 30 s without a sign of life, which a film gives it none of.
  {
    name: 'canada-film-intro',
    seconds: 50,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/story/intro`)
      await page.waitForFunction(() => window.__canadaStoryQA?.()?.film, null, { timeout: 20000 })
    },
    act: async (page) => {
      for (let i = 0; i < 40; i++) {
        if (!(await page.evaluate(() => !!document.querySelector('[data-story-film="intro"]')))) break
        await page.mouse.move(40 + (i % 5) * 3, 200 + (i % 3) * 3)
        await page.waitForTimeout(1500)
      }
      // (The film is over: the map is next.)
      await page.waitForFunction(() => !document.querySelector('[data-story-film="intro"]') && !!window.__canadaMapQA, null, { timeout: 30000 })
      await page.waitForTimeout(1500)
    },
  },
  // Holding the skip button in the middle of the memory goes straight to the map.
  {
    name: 'canada-skip-intro',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/story/intro`)
      await page.waitForFunction(() => window.__canadaStoryQA?.()?.film?.beat === 'last', null, { timeout: 60000 })
    },
    act: async (page) => {
      const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(1100)
      await page.mouse.up()
      await page.waitForFunction(() => !document.querySelector('[data-story-film="intro"]') && !!window.__canadaMapQA, null, { timeout: 15000 })
      await page.waitForTimeout(1200)
    },
  },
  // A tap on Ollie's bay: the bay hops, the camera closes in, and Whale Watch opens.
  {
    name: 'canada-map-tap',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=snowman,bike`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      const t = await at(page, 'go:whales')
      if (t) await page.mouse.click(t.x, t.y)
      await page.waitForTimeout(3000)
    },
  },
  // Back from a chapter with a new friend: the camera starts on the rink, Lulu pops in, then the board.
  {
    name: 'canada-map-arrive',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=snowman,bike&new=canoe`)
    },
    act: async (page) => {
      await page.waitForTimeout(5500)
    },
  },
  // Back with each friend: they pop in at the rink and show their move, then Gus says his line for how many they are
  // now, the camera goes back to the board, and the map is hers again (the readout says the move played and which
  // Gus line was said).
  ...ORDER.map((id) => ({
    name: `canada-move-${id}`,
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=${arrival(id).team}&new=${id}`)
      await page.waitForFunction(() => window.__canadaMapQA, null, { timeout: 20000 })
    },
    act: async (page) => {
      const { n } = arrival(id)
      await until(page, (q) => q.moves.played.includes(id), 6000, `${id}'s move to start`)
      await until(page, (q) => !q.moves.playing.length, 5000, `${id}'s move to end`)
      await until(page, (q) => q.gus.n === n && q.gus.reacting, 5000, `Gus's line for ${n}`)
      await until(page, (q) => !q.arriving && q.targets['go:party'], 5000, 'the board to be hers again')
      await page.waitForTimeout(500)
    },
  })),
  // With the whole team home, a tap on each friend at the rink plays their move again (from the board: the camera
  // nudges in toward the rink and back).
  {
    name: 'canada-map-team-moves',
    seconds: 20,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=all`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      for (const id of ORDER) {
        const t = await at(page, `team:${id}`)
        if (!t) throw new Error(`no tap target for ${id} at the rink`)
        await page.mouse.click(t.x, t.y)
        await until(page, (q) => q.moves.played.includes(id), 1500, `${id}'s move after a tap`)
        await until(page, (q) => !q.moves.playing.length && !q.peek, 5000, `${id}'s move to end`)
      }
      const q = await qa(page)
      if (q.moves.played.join() !== ORDER.join()) throw new Error(`moves played: ${q.moves.played}`)
    },
  },
  // A fast double tap on a friend plays the move once; another tap after it ends plays it again.
  {
    name: 'canada-map-double-tap',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=all`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      const t = await at(page, 'team:bath')
      await page.mouse.click(t.x, t.y)
      await page.waitForTimeout(120)
      await page.mouse.click(t.x, t.y)
      await page.waitForTimeout(400)
      const q1 = await qa(page)
      if (q1.moves.played.length !== 1) throw new Error(`a double tap played ${q1.moves.played.length} moves`)
      await until(page, (q) => !q.moves.playing.length, 5000, 'the move to end')
      await page.waitForTimeout(500)
      const t2 = await at(page, 'team:bath')
      await page.mouse.click(t2.x, t2.y)
      await until(page, (q) => q.moves.played.length === 2, 1500, 'a second move after it ended')
    },
  },
  // An arrival link writes the team it made into the address bar (the newcomer too), so a reload keeps them.
  {
    name: 'canada-map-reload',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=snowman&new=bike`)
      await page.waitForFunction(() => window.__canadaMapQA, null, { timeout: 20000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => /team=snowman(%2C|,)bike/.test(location.hash) && !/new=/.test(location.hash), null, { timeout: 5000 })
      await page.reload()
      // (A reload starts the app again: past its splash.)
      await page.getByRole('button', { name: /let's play/i }).click({ timeout: 5000 }).catch(() => {})
      await ready(page)
      const q = await qa(page)
      if (!q.team.includes('bike') || q.arriving) throw new Error(`after a reload: team ${q.team}, arriving ${q.arriving} (${await page.evaluate(() => location.hash)})`)
      await page.waitForTimeout(2500)
    },
  },
  // A tap on the skate hut: it hops, its door opens, the camera closes in, and the Team Cabin opens.
  {
    name: 'canada-map-hut',
    seconds: 5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=snowman,bike,canoe`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      const t = await at(page, 'hut')
      if (!t || t.w < 64 || t.h < 64) throw new Error(`the hut's target: ${JSON.stringify(t)}`)
      await page.mouse.click(t.x, t.y)
      await page.waitForFunction(() => location.hash.startsWith('#/world/canada/cabin'), null, { timeout: 5000 })
      await page.waitForTimeout(1200)
    },
  },
  // The rink before the team is whole (Maple: not yet; the places still to do bounce), then the geese, the owl, the bison and the orca.
  {
    name: 'canada-map-pokes',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=bike,campfire`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      for (const id of ['go:party', 'poke:owl', 'poke:bison', 'poke:orca']) {
        const t = await at(page, id)
        if (t) await page.mouse.click(t.x, t.y)
        await page.waitForTimeout(1600)
      }
    },
  },
]
