import { expect, test } from '@playwright/test'

const trips = [
  { country: 'australia', activity: 'outback', next: 'Gum Tree Forest', nextId: 'forest' },
  { country: 'china', activity: 'bamboo', next: 'The Great Wall', nextId: 'wall' },
  { country: 'egypt', activity: 'pyramid', next: 'Secret Passage', nextId: 'passage' },
  { country: 'italy', activity: 'olives', next: 'Trevi Fountain', nextId: 'trevi' },
]

for (const trip of trips) {
  test(`${trip.country}: leaving an unfinished video clears it before the next activity`, async ({ page }) => {
    // Keep playback deterministic and independent of YouTube availability.
    await page.addInitScript(() => {
      const observed = window as unknown as { YT: unknown; __destroyedVideos: number }
      observed.__destroyedVideos = 0
      observed.YT = {
        Player: class {
          constructor(private host: HTMLElement, private options: { events: {
            onReady: (event: { target: unknown }) => void
            onStateChange: (event: { data: number }) => void
          } }) {
            host.dataset.testVideo = 'ready'
            setTimeout(() => options.events.onReady({ target: this }), 0)
          }
          playVideo() {
            this.host.dataset.testVideo = 'playing'
            this.options.events.onStateChange({ data: 1 })
          }
          getDuration() { return 120 }
          getCurrentTime() { return 1 }
          destroy() {
            observed.__destroyedVideos++
            this.host.remove()
          }
        },
      }
    })

    await page.goto(`./#/world/${trip.country}/${trip.activity}`)
    await page.getByRole('button', { name: /let's play/i }).click()
    await expect(page.getByRole('button', { name: 'Back to the map', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Skip', exact: true }).click({ timeout: 1000 }).catch(() => {})
    await expect.poll(() => page.evaluate(() => !!window.__kayleeWorld?.finish)).toBe(true)
    await page.evaluate(() => window.__kayleeWorld?.finish?.())
    // The stamp's large button offers the video; the top-bar button exits immediately.
    await expect(page.getByRole('button', { name: 'Back to the map', exact: true })).toHaveCount(2)
    await page.getByRole('button', { name: 'Back to the map', exact: true }).first().click()
    await page.getByRole('button', { name: 'Play the video', exact: true }).click()
    await expect(page.locator('[data-test-video="playing"]')).toBeAttached()

    await page.getByRole('button', { name: 'Back to the map', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#/world/${trip.country}$`))
    const next = page.getByRole('button', { name: trip.next, exact: true })
    await expect(next).toBeInViewport()
    await expect.poll(async () => (await next.boundingBox())?.width ?? 0).toBeGreaterThan(60)
    // Map pins bounce continuously, so they never satisfy Playwright's stability check.
    await next.click({ force: true })
    await expect(page).toHaveURL(new RegExp(`#/world/${trip.country}/${trip.nextId}$`))
    await expect(page.getByRole('button', { name: 'Skip the video', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Play the video', exact: true })).toHaveCount(0)
    await expect(page.locator('[data-test-video]')).toHaveCount(0)
    expect(await page.evaluate(() => (window as unknown as { __destroyedVideos: number }).__destroyedVideos)).toBe(1)

    // Reopening the original activity must also start fresh, without its old stamp/video.
    await page.getByRole('button', { name: 'Back to the map', exact: true }).click()
    await expect(page.getByRole('button', { name: 'World map', exact: true })).toBeVisible()
    await page.evaluate((activity) => { location.hash += `/${activity}` }, trip.activity)
    await expect(page.getByRole('button', { name: 'Back to the map', exact: true })).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Skip the video', exact: true })).toHaveCount(0)
  })
}
