import { expect, test, type Page } from '@playwright/test'

async function start(page: Page) {
  await page.goto('./#/world/italy/pizzeria')
  await page.getByRole('button', { name: /let's play/i }).click()
}

// A story can finish naturally while the browser is locating its skip control.
async function skipIntro(page: Page) {
  const skip = page.getByRole('button', { name: 'Skip', exact: true })
  const order = page.getByRole('button', { name: 'Start the order', exact: true })
  for (let i = 0; i < 3; i++) {
    await skip.or(order).first().waitFor()
    if (await order.isVisible()) break
    await skip.tap()
  }
}

async function spreadSauce(page: Page) {
  const pizza = page.getByRole('button', { name: 'pizza to spread sauce on', exact: true })
  await expect(pizza).toBeVisible()
  const box = (await pizza.boundingBox())!
  for (let y = 0.25; y <= 0.76; y += 0.1) {
    await page.mouse.move(box.x + box.width * 0.22, box.y + box.height * y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.78, box.y + box.height * y, { steps: 16 })
    await page.mouse.up()
  }
}

async function topping(page: Page, kind: string, x = 0.5) {
  const tray = page.getByRole('img', { name: `${kind} in the tray`, exact: true })
  const from = (await tray.boundingBox())!
  const to = (await page.locator('[data-target="surface"]').boundingBox())!
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width * x, to.y + to.height / 2, { steps: 12 })
  // A raised z-index cannot escape a clipping tray or a lower stacking context.
  // Check the held ingredient actually paints above the pizza before releasing it.
  await expect.poll(() => page.evaluate(({ x, y }) =>
    document.elementFromPoint(x, y)?.closest('[data-piece]')?.getAttribute('aria-label'),
  { x: to.x + to.width * x, y: to.y + to.height / 2 })).toBe(`${kind} in the tray`)
  await page.mouse.up()
  await page.waitForTimeout(100)
}

async function bakeAndServe(page: Page, cuts = 0) {
  await page.getByRole('img', { name: 'pizza on the peel', exact: true }).tap()
  for (let i = 0; i < 3; i++) await tapOvenButton(page, 'Turn the pizza')
  await tapOvenButton(page, 'Take the pizza out')
  for (let i = 0; i < cuts; i++) await page.getByRole('button', { name: 'pizza to cut', exact: true }).tap()
  await page.getByRole('button', { name: 'Serve the pizza', exact: true }).tap()
}

// The oven buttons pulse continuously. Tap their visible center without waiting for animation to stop.
async function tapOvenButton(page: Page, name: string) {
  const button = page.getByRole('button', { name, exact: true })
  await expect(button).toBeVisible()
  await page.waitForTimeout(300)
  const box = (await button.boundingBox())!
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  await expect(button).toHaveCount(0)
}

test('each introduction plays automatically and can be skipped independently', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await start(page)
  await expect(page.getByRole('button', { name: 'Start the order', exact: true })).toBeVisible()
  const spoken = await page.evaluate(() => window.__kayleeSpeech?.map((line) => line.text))
  expect(spoken).toEqual(expect.arrayContaining([
    'Welcome to Naples! Pizza was born here!',
    'Benvenuta, Chef Kaylee!',
    'Long ago, a queen named Margherita came to Naples.',
    'For the Queen, I will make a special pizza!',
  ]))

  await page.reload()
  await page.getByRole('button', { name: /let's play/i }).click()
  await skipIntro(page)
  await expect(page.getByRole('button', { name: 'Start the order', exact: true })).toBeVisible()
})

for (const viewport of [{ width: 820, height: 1180 }, { width: 1180, height: 820 }]) {
  test(`all four pizzas can be served and earn a stamp (${viewport.width}×${viewport.height})`, async ({ page }) => {
    test.setTimeout(300_000) // Four complete orders include the real recorded dialogue.
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    await start(page)
    await page.getByRole('button', { name: 'Start the order', exact: true }).tap()
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'dough', exact: true }).tap()
      await page.waitForTimeout(1000)
    }
    await spreadSauce(page)
    await expect(page.getByRole('img', { name: 'mozzarella in the tray', exact: true })).toBeVisible()
    await page.screenshot({ path: `/tmp/italy-toppings-${viewport.width}.png` })
    for (const kind of ['mozzarella', 'basil']) for (let i = 0; i < 3; i++) await topping(page, kind)
    await bakeAndServe(page)
    await page.getByRole('button', { name: 'Next customers', exact: true }).tap()

    // Leaving between services keeps the lunch rush unlocked.
    await page.reload()
    await page.getByRole('button', { name: /let's play/i }).click()
    await page.getByRole('button', { name: 'Start the order', exact: true }).tap()
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'dough', exact: true }).tap()
      await page.waitForTimeout(1000)
    }
    await spreadSauce(page)
    await expect(page.getByRole('img', { name: 'olive in the tray', exact: true })).toBeVisible()
    await expect(page.locator('[data-target="surface"] img[src*="mozzarella-piece"]')).toHaveCount(7)
    for (let i = 0; i < 5; i++) await topping(page, 'olive')
    await bakeAndServe(page, 1)
    await page.getByRole('button', { name: 'Start the order', exact: true }).tap()
    await expect(page.getByRole('img', { name: 'mushroom in the tray', exact: true })).toBeVisible()
    for (let i = 0; i < 3; i++) await topping(page, 'mushroom', 0.3)
    for (let i = 0; i < 3; i++) await topping(page, 'olive', 0.7)
    await bakeAndServe(page, 2)
    await page.getByRole('button', { name: 'Next customers', exact: true }).tap()

    await page.getByRole('button', { name: 'Start the order', exact: true }).tap()
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'dough', exact: true }).tap()
      await page.waitForTimeout(1000)
    }
    await page.getByRole('button', { name: 'pink sauce', exact: true }).tap()
    await spreadSauce(page)
    await expect(page.getByRole('img', { name: 'basil in the tray', exact: true })).toBeVisible()
    await page.screenshot({ path: `/tmp/italy-own-${viewport.width}.png` })
    // All six choices must be visible without scrolling, with full-size finger targets.
    const work = (await page.locator('[data-pizza-worktop]').boundingBox())!
    for (const kind of ['mozzarella', 'basil', 'olive', 'mushroom', 'pepper', 'tomato']) {
      const tray = (await page.getByRole('img', { name: `${kind} in the tray`, exact: true }).boundingBox())!
      expect(tray.width).toBeGreaterThanOrEqual(88)
      expect(tray.height).toBeGreaterThanOrEqual(88)
      expect(tray.x).toBeGreaterThanOrEqual(work.x)
      expect(tray.y).toBeGreaterThanOrEqual(work.y)
      expect(tray.x + tray.width).toBeLessThanOrEqual(work.x + work.width)
      expect(tray.y + tray.height).toBeLessThanOrEqual(work.y + work.height)
    }
    for (let i = 0; i < 3; i++) await topping(page, 'basil')
    await page.getByRole('button', { name: 'My pizza is done', exact: true }).tap()
    await page.getByRole('img', { name: 'pizza on the peel', exact: true }).tap()
    for (let i = 0; i < 3; i++) await tapOvenButton(page, 'Turn the pizza')
    await tapOvenButton(page, 'Take the pizza out')
    await page.getByRole('button', { name: 'pizza to cut', exact: true }).tap()
    await page.getByRole('button', { name: 'Done cutting', exact: true }).tap()
    await page.getByRole('button', { name: 'Serve the pizza', exact: true }).tap()
    await page.getByRole('button', { name: 'Get my stamp', exact: true }).tap()
    await expect(page.getByRole('img', { name: 'Marsican brown bear', exact: true })).toBeVisible()
    await page.screenshot({ path: `/tmp/italy-stamp-${viewport.width}.png` })
    expect(errors).toEqual([])
  })
}

test('painted sauce stays visible when the iPad rotates', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await start(page)
  await skipIntro(page)
  await page.getByRole('button', { name: 'Start the order', exact: true }).tap()
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'dough', exact: true }).tap()
    await page.waitForTimeout(1000)
  }
  const sauce = page.getByRole('button', { name: 'pizza to spread sauce on', exact: true })
  await expect(sauce).toBeVisible()
  const box = (await sauce.boundingBox())!
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  const coverage = () => sauce.locator('canvas').evaluate((element) => {
    const canvas = element as HTMLCanvasElement
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
    let painted = 0
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) painted++
    return painted / (canvas.width * canvas.height)
  })
  const before = await coverage()
  expect(before).toBeGreaterThan(0.01)
  await page.setViewportSize({ width: 1180, height: 820 })
  await expect.poll(coverage).toBeGreaterThan(before * 0.9)
  await page.setViewportSize({ width: 820, height: 1180 })
  await expect.poll(coverage).toBeGreaterThan(before * 0.9)
})
