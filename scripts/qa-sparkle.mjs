// Focused Safari visual review + canonical reference exports for the shared Sparkle.
// npm run build && npm run preview -- --port 4185 --strictPort
// node scripts/qa-sparkle.mjs [--base=http://127.0.0.1:4185/] [--only=ipad-landscape,iphone-portrait] [--export-reference]
// Images/filmstrips: qa-output/sparkle. Exports come from the live SDK puppet, never a second drawing.
import { mkdirSync, writeFileSync } from 'node:fs'
import { webkit } from '@playwright/test'
import sharp from 'sharp'
import { filmstrip, VIEWPORTS } from './qa-lib.mjs'

const base = process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? 'http://127.0.0.1:4185/'
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',')
const output = 'qa-output/sparkle'
mkdirSync(output, { recursive: true })
const browser = await webkit.launch()
const errors = []
const report = []
let filmedActions = false
try {
  for (const vp of VIEWPORTS.filter((v) => !v.desktop && (!only || only.includes(v.name)))) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: true, isMobile: true })
    const page = await context.newPage()
    page.on('pageerror', (e) => errors.push(`${vp.name}: ${e.message}`))
    await page.goto(base)
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${output}/${vp.name}-splash.png` })
    await page.getByRole('button', { name: /let's play/i }).click()
    for (const [name, route] of [
      ['home', ''], ['world', '#/world'], ['passport', '#/world/passport'],
      ['sparkle', '#/world/puppets/sparkle'], ['snorkel', '#/world/puppets/sparkle-snorkel'],
      ['australia', '#/world/australia/croc'], ['italy', '#/world/italy/pizzeria'],
      ['china', '#/world/china/dumplings'], ['egypt', '#/world/egypt/party'],
    ]) {
      await page.goto(`${base}${route}`)
      const start = page.getByRole('button', { name: /let's play/i })
      if (await start.isVisible()) await start.click()
      await page.waitForTimeout(700)
      await page.screenshot({ path: `${output}/${vp.name}-${name}.png` })
      report.push(`${vp.name} ${name}: ${await page.locator('[data-sparkle="puppet"]').count()} shared Sparkle(s)`)
    }
    if (vp.name === 'ipad-landscape') {
      filmedActions = true
      await page.goto(`${base}#/world/puppets/sparkle`)
      await page.waitForFunction(() => !!window.__puppets?.sparkle)
      const box = await page.locator('[data-sparkle="puppet"]').boundingBox()
      const clip = { x: Math.max(0, box.x - 100), y: 0, width: Math.min(vp.width - Math.max(0, box.x - 100), box.width + 200), height: vp.height }
      for (const action of ['wave', 'cheer', 'hop', 'nod', 'think', 'dance', 'wiggle']) {
        const frames = []
        for (let round = 0; round < 3; round++) {
          const t0 = Date.now()
          let done = false
          const playing = page.evaluate((a) => window.__puppets.sparkle.play(a), action).then(() => { done = true })
          while (!done) frames.push({ t: (Date.now() - t0) / 1000, buf: await page.screenshot({ clip, type: 'jpeg', quality: 85 }) })
          await playing
          await page.waitForTimeout(150)
        }
        await filmstrip(frames, `${output}/${action}-three-rounds.png`)
      }
      // Mirror and turn toward a friend, as the Italian scenes do. Same SVG and joints.
      await page.locator('[data-sparkle="puppet"]').evaluate((svg) => { svg.style.transform = 'scaleX(-1)' })
      await page.screenshot({ path: `${output}/mirrored.png` })
      if (process.argv.includes('--export-reference')) {
        await page.goto(`${base}#/playground`)
        await page.waitForTimeout(300)
        const drawings = await page.locator('[data-sparkle="puppet"]').evaluateAll((svgs) => svgs.slice(0, 3).map((svg) => {
          const copy = svg.cloneNode(true)
          copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
          copy.setAttribute('width', '1024'); copy.setAttribute('height', '1024')
          copy.setAttribute('viewBox', '60 -20 960 1040'); copy.removeAttribute('style')
          return new XMLSerializer().serializeToString(copy)
        }))
        if (drawings.length !== 3) throw new Error('Missing Mascot pose exports')
        for (const [i, pose] of ['wave', 'cheer', 'think'].entries()) {
          const png = await sharp(Buffer.from(drawings[i])).png().toBuffer()
          await sharp(png).toFile(`art/source/mascot/${pose}.png`)
          await sharp(png).resize(512).webp({ quality: 90 }).toFile(`src/assets/mascot/${pose}.webp`)
        }
      }
    }
    await context.close()
    console.log(`${vp.name}: reviewed ${report.filter((line) => line.startsWith(vp.name)).length} routes`)
  }
} finally {
  await browser.close()
}
writeFileSync(`${output}/report.txt`, `Safari Sparkle review\n${report.join('\n')}\nErrors: ${JSON.stringify(errors)}\n`)
if (errors.length) throw new Error(errors.join('\n'))
console.log(`Sparkle screenshots${filmedActions ? " and all seven actions (three rounds each)" : ""} saved to ${output}`)
