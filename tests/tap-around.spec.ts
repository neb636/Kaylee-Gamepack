import { expect, test, type Page } from '@playwright/test'
import { readdirSync } from 'node:fs'

// Tap-around smoke test (runs in WebKit, like Kaylee's iPad): every section of every activity, and the start of
// activities that don't have sections yet, is opened from its link (#/world/sections) and poked like a child would:
// taps on buttons and characters, a few drags, taps on empty spots. Any exception or console error fails it. It catches
// a shared change (a hook, the kit, the SDK) that works in one place but throws somewhere else.

/** Greybox activities have no voice clips yet (AGENTS.md build gates); generate-voice --check covers the finished ones. */
const IGNORE = /youtube|Missing voice clip/i
/** Every country folder, each its own test so they run in parallel (and spread over CI shards). */
const PLACES = readdirSync('src/world/places', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
/** Buttons that leave the activity (poking those would test the map instead). */
const LEAVE = /^(Back to the map|World map|Theater|Puzzle book|My trophies|Home|Play again)$/i
const POKES = 8

async function links(page: Page, place: string) {
  await page.goto('./#/world/sections')
  await page.getByRole('button', { name: /let's play/i }).click()
  await expect(page.getByRole('heading', { name: /Italy/ })).toBeVisible()
  return page.evaluate((place) => {
    const hrefs = (sel: string) => [...document.querySelectorAll<HTMLAnchorElement>(sel)].map((a) => a.getAttribute('href')!)
    const sectioned = new Set([...document.querySelectorAll('a[data-section]')].map((a) => a.getAttribute('data-section')!.split('/').slice(0, 2).join('/')))
    const starts = [...document.querySelectorAll<HTMLAnchorElement>(`a[data-activity^="${place}/"]`)].filter((a) => !sectioned.has(a.dataset.activity!)).map((a) => a.getAttribute('href')!)
    return [...hrefs(`a[data-section^="${place}/"]`), ...starts]
  }, place)
}

/** Taps, drags and empty-spot taps on whatever is on screen, like a curious five-year-old. */
async function poke(page: Page, seed: number) {
  const { width, height } = page.viewportSize()!
  let r = seed
  const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < POKES; i++) {
    const targets = await page.evaluate((leave) => {
      const out: { x: number; y: number }[] = []
      for (const el of document.querySelectorAll<HTMLElement>('button, [role="button"], [aria-label], [data-puppet]')) {
        const label = el.getAttribute('aria-label') ?? el.textContent?.trim() ?? ''
        if (new RegExp(leave, 'i').test(label)) continue
        const b = el.getBoundingClientRect()
        if (b.width < 8 || b.height < 8 || b.bottom < 0 || b.right < 0 || b.top > innerHeight || b.left > innerWidth) continue
        out.push({ x: b.left + b.width / 2, y: b.top + b.height / 2 })
      }
      return out
    }, LEAVE.source)
    const t = targets.length && rand() < 0.75 ? targets[Math.floor(rand() * targets.length)] : { x: width * (0.15 + rand() * 0.7), y: height * (0.25 + rand() * 0.65) }
    if (i % 3 === 2) {
      // A drag from the target toward somewhere else on the screen (pieces, boats, brushes, ropes...).
      await page.mouse.move(t.x, t.y)
      await page.mouse.down()
      await page.mouse.move(width * (0.2 + rand() * 0.6), height * (0.3 + rand() * 0.5), { steps: 8 })
      await page.mouse.up()
    } else {
      await page.mouse.click(t.x, t.y)
    }
    await page.waitForTimeout(250)
  }
}

// Countries are independent: run them side by side, and let CI's --shard split them across jobs.
test.describe.configure({ mode: 'parallel' })

for (const place of PLACES) {
  test(`tap around every section of ${place}`, async ({ page }) => {
    test.setTimeout(15 * 60_000)
    const failures: string[] = []
    let current = ''
    page.on('pageerror', (e) => !IGNORE.test(e.message) && failures.push(`${current}: ${e.message}`))
    page.on('console', (m) => m.type() === 'error' && !IGNORE.test(`${m.text()} ${m.location().url}`) && failures.push(`${current}: ${m.text()}`))
    const hrefs = await links(page, place)
    expect(hrefs.length).toBeGreaterThan(0)
    for (const [i, href] of hrefs.entries()) {
      current = href
      await page.goto('about:blank')
      await page.goto(`./${href}`)
      await page.getByRole('button', { name: /let's play/i }).click()
      await page.waitForTimeout(1200)
      await poke(page, i + 1)
      await page.waitForTimeout(400)
    }
    expect(failures).toEqual([])
  })
}
