import { expect, test, type Page } from '@playwright/test'

// Deep links (src/world/kit/sections.ts): every section listed on #/world/sections must open straight into that
// section, and every activity must declare its sections, so PR links like #/world/italy/pizzeria/own always work.

/** Countries not migrated to sections yet (each one's PR removes it from this list). */
const PENDING = ['australia', 'china', 'egypt']

async function start(page: Page, hash: string) {
  await page.goto(`./${hash}`)
  await page.getByRole('button', { name: /let's play/i }).click()
}

async function listedSections(page: Page) {
  await start(page, '#/world/sections')
  await expect(page.getByRole('heading', { name: /Italy/ })).toBeVisible()
  const attrs = (name: string) => page.evaluate((n) => [...document.querySelectorAll(`a[${n}]`)].map((a) => a.getAttribute(n)!), name)
  return { activities: await attrs('data-activity'), sections: await attrs('data-section') }
}

test('every activity declares deep-linkable sections', async ({ page }) => {
  const { activities, sections } = await listedSections(page)
  const missing = activities.filter((a) => !PENDING.includes(a.split('/')[0]) && !sections.some((s) => s.startsWith(`${a}/`)))
  expect(missing, 'add a sections.ts next to each of these activities (see src/world/kit/sections.ts)').toEqual([])
})

test('every section link lands in its section', async ({ page }) => {
  test.setTimeout(10 * 60_000)
  const { sections: listed } = await listedSections(page)
  const failures: string[] = []
  let errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && !/youtube/i.test(`${m.text()} ${m.location().url}`) && errors.push(m.text()))
  for (const key of listed) {
    const [place, activity, section] = key.split('/')
    // A fresh document for every link: the splash, then straight into the section.
    await page.goto('about:blank')
    errors = []
    await start(page, `#/world/${place}/${activity}/${section}${activity === 'party' ? '?stamps=all' : ''}`)
    const landed = await page
      // The first section the activity enters must be the linked one (stories may finish by themselves right after).
      .waitForFunction((id) => window.__kayleeSectionLog?.[0]?.id === id, section, { timeout: 8000 })
      .then(() => true)
      .catch(() => false)
    if (!landed) failures.push(`${key}: landed in ${JSON.stringify(await page.evaluate(() => window.__kayleeSectionLog?.[0] ?? null))}`)
    if (errors.length) failures.push(`${key}: ${errors.join(' | ')}`)
  }
  expect(failures).toEqual([])
})
