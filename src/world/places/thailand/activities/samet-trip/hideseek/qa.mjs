// Hide and seek's QA for Peekaboo, the green firefly (hideseek.ts; the story: planning/around-the-world/thailand/
// samet-story.md). Screens: each shot of the way-in film (the peek round the trunk, her close-up, Dad and your unicorn,
// Mom) and of the found film (the pop out, Dad cross-eyed with her on his nose, her on the horn), and Peekaboo in play
// (twinkling over Dad's hiding place once he has given himself away, tucked in beside your unicorn behind the chairs).
// Filmed: the way in to its end (round 1 starts), ⏭ held in the middle of it, the found film from its link to the
// island, ⏭ held in it, a whole turn to hide played into the found film, and a stuck seek (the twinkles, then the
// tree tapped). Not part of the app: Node runs it, Vite never sees it.

const LINK = '#/world/thailand/samet-trip/hideseek'
const qa = (page) => page.evaluate(() => window.__thaiSametQA?.())
const ready = (page) => page.waitForFunction(() => window.__thaiSametQA?.().section === 'hideseek', null, { timeout: 30000 })
/** Waits for a beat of the film that's on, then `ms` into it. */
const beat = (id, ms) => async (page) => {
  await page.waitForFunction((b) => window.__thaiSametQA?.().film?.beat === b, id, { timeout: 60000 })
  await page.waitForTimeout(ms)
}
/** The film has played to its end or been skipped (the found film then leaves for the island, whose readout has no
 *  `films`). */
const filmOver = (id) => (page) =>
  page.waitForFunction(
    (f) => {
      const q = window.__thaiSametQA?.()
      return !q || q.section !== 'hideseek' || q.films.done.includes(f) || q.films.skipped.includes(f)
    },
    id,
    { timeout: 120000 },
  )
/** Holds the film's ⏭ until it skips. */
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  await page.mouse.up()
}

export const screens = [
  // The way in: the light out on one side of the trunk (over their shoulders), her close-up on the other side, Dad
  // pointing back at the tree, Mom in her chair, "Then let's play too!".
  { name: 'thailand-samet-hide-story', hash: `${LINK}?round=story`, reset: true, act: beat('peek', 1500) },
  { name: 'thailand-samet-hide-story-close', hash: `${LINK}?round=story`, reset: true, act: beat('other', 1900) },
  { name: 'thailand-samet-hide-story-saw', hash: `${LINK}?round=story`, reset: true, act: beat('saw', 1600) },
  { name: 'thailand-samet-hide-story-mom', hash: `${LINK}?round=story`, reset: true, act: beat('playing', 1300) },
  { name: 'thailand-samet-hide-story-too', hash: `${LINK}?round=story`, reset: true, act: beat('too', 1500) },
  // Found: she pops out with Peekaboo, Dad cross-eyed with the firefly on his nose, Peekaboo round her horn.
  { name: 'thailand-samet-hide-found-pop', hash: `${LINK}?round=found`, reset: true, act: beat('pop', 1700) },
  { name: 'thailand-samet-hide-found-nose', hash: `${LINK}?round=found`, reset: true, act: beat('nose', 1700) },
  { name: 'thailand-samet-hide-found', hash: `${LINK}?round=found`, reset: true, act: beat('found', 1900) },
  // In play: stuck a while in round 1, Dad has peeked and Peekaboo twinkles over the tree he's behind; her turn,
  // crouched behind the chairs with Peekaboo a tiny glow beside her while Dad searches.
  {
    name: 'thailand-samet-hide-twinkle',
    hash: `${LINK}?round=1`,
    reset: true,
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiSametQA?.().helpLvl >= 1, null, { timeout: 40000 })
      await page.waitForTimeout(2500)
    },
  },
  {
    name: 'thailand-samet-hide-tucked',
    hash: `${LINK}?round=hide`,
    reset: true,
    wait: 2000,
    act: async (page) => {
      await page.locator('[data-anchor="hide:chairs"]').click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__thaiSametQA?.().peekaboo.tucked, null, { timeout: 20000 })
      await page.waitForTimeout(2500)
    },
  },
]

const open = (round, more = '') => async (page, base) => {
  await page.goto(`${base}${LINK}?round=${round}${more}`)
  await ready(page)
}

export const motion = [
  // The way in, watched to its end: then round 1 has started (the count), the address bar on round=1.
  {
    name: 'thailand-samet-hide-story',
    seconds: 22,
    setup: open('story'),
    act: async (page) => {
      await filmOver('story')(page)
      await page.waitForFunction(() => window.__thaiSametQA().round === '1' && location.hash.includes('round=1'), null, { timeout: 5000 })
      await page.waitForTimeout(2500)
    },
  },
  // ⏭ held in her close-up: the beach is as round 1 needs it (the photo, then the count).
  {
    name: 'thailand-samet-hide-story-skip',
    seconds: 8,
    setup: async (page, base) => {
      await open('story')(page, base)
      await beat('other', 1200)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(
        () => {
          const q = window.__thaiSametQA()
          return !q.film && q.round === '1' && q.films.skipped.includes('story') && (q.phase === 'intro' || q.phase === 'count')
        },
        null,
        { timeout: 5000 },
      )
      await page.waitForTimeout(4500)
    },
  },
  // The found film from its link, to the island (Peekaboo flies in there).
  {
    name: 'thailand-samet-hide-found',
    seconds: 14,
    setup: open('found'),
    act: async (page) => {
      await filmOver('found')(page)
      await page.waitForFunction(() => window.__thaiSametQA?.().section === 'island', null, { timeout: 30000 })
      await page.waitForTimeout(1500)
    },
  },
  // ⏭ held while she's on Dad's nose: straight to the island.
  {
    name: 'thailand-samet-hide-found-skip',
    seconds: 6,
    setup: async (page, base) => {
      await open('found')(page, base)
      await beat('nose', 900)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(() => window.__thaiSametQA?.().section === 'island', null, { timeout: 30000 })
      await page.waitForTimeout(1500)
    },
  },
  // Her turn played for real: she hides behind the chairs (Peekaboo tucks in), Dad searches the wrong places and gives
  // up, and the found film takes over from wherever they are.
  {
    name: 'thailand-samet-hide-found-live',
    seconds: 16,
    setup: async (page, base) => {
      await open('hide')(page, base)
      await page.waitForTimeout(1500)
      await page.locator('[data-anchor="hide:chairs"]').click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'giveup', null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiSametQA?.().section === 'island', null, { timeout: 40000 })
      await page.waitForTimeout(1000)
    },
  },
  // The whole stop, robot-played from its way in: the film watched, all seven of Dad's hides found (a moment to look,
  // then a tap where he is), her turn behind the umbrella, Dad gives up, the found film, the island. Filmed: its end.
  {
    name: 'thailand-samet-hide-whole',
    seconds: 16,
    setup: async (page, base) => {
      await open('story')(page, base)
      await filmOver('story')(page)
      let last = ''
      const t0 = Date.now()
      while (Date.now() - t0 < 180000) {
        const s = await qa(page)
        if (s?.round === 'hide') break
        if (s?.phase === 'seek' && `${s.round}:${s.hide}` !== last) {
          last = `${s.round}:${s.hide}`
          await page.waitForTimeout(1200)
          await page.locator(`[data-anchor="hide:${s.hide}"]`).click({ force: true, timeout: 2000 }).catch(() => {})
        }
        await page.waitForTimeout(300)
      }
      const s = await qa(page)
      if (s?.round !== 'hide' || s.finds !== 7) throw new Error(`hide and seek: wanted her turn after 7 finds, got round ${s?.round}, ${s?.finds} finds`)
      await page.waitForTimeout(1500)
      await page.locator('[data-anchor="hide:umbrella"]').click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'giveup', null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiSametQA?.().section === 'island', null, { timeout: 40000 })
      const hash = await page.evaluate(() => location.hash)
      if (!/flags=[^&]*hideseek/.test(hash)) throw new Error(`hide and seek: the island opened without Peekaboo (${hash})`)
      await page.waitForTimeout(1000)
    },
  },
  // Stuck in round 1: Peekaboo peeks out of Dad's place, he gives himself away and she stays out over him; then the
  // tree is tapped and he's found.
  {
    name: 'thailand-samet-hide-twinkle',
    seconds: 16,
    setup: async (page, base) => {
      await open('1')(page, base)
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'seek', null, { timeout: 30000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiSametQA().helpLvl >= 1, null, { timeout: 30000 })
      await page.waitForTimeout(3000)
      await page.locator('[data-anchor="hide:tree"]').click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__thaiSametQA().finds >= 1, null, { timeout: 15000 })
      await page.waitForTimeout(2500)
    },
  },
]
