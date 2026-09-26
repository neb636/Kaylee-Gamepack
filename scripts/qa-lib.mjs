// Shared helpers for the QA scripts (qa-screens, qa-motion, qa-pacing). Run `npm run build` first: they serve dist/.
// WebKit is the default because Kaylee's iPad runs Safari; pass --chromium to compare.
import { chromium, webkit } from '@playwright/test'
import { spawn } from 'node:child_process'
import path from 'node:path'

export const root = path.resolve(import.meta.dirname, '..')
export const out = path.join(root, 'qa-output')
export const args = process.argv.slice(2)
export const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
export const browserName = args.includes('--chromium') ? 'chromium' : 'webkit'
const browserType = browserName === 'chromium' ? chromium : webkit

export const VIEWPORTS = [
  { name: 'ipad-portrait', width: 820, height: 1180 },
  { name: 'ipad-landscape', width: 1180, height: 820 },
  { name: 'ipadpro-portrait', width: 1024, height: 1366 },
  { name: 'ipadpro-landscape', width: 1366, height: 1024 },
  { name: 'iphone-portrait', width: 390, height: 844 },
  { name: 'iphone-landscape', width: 844, height: 390 },
  { name: 'iphonemax-portrait', width: 430, height: 932 },
  { name: 'desktop', width: 1440, height: 900, desktop: true },
  { name: 'laptop', width: 1280, height: 720, desktop: true },
]

/** Serves dist/ with vite preview; returns { base, stop }. */
export async function serve(port) {
  const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' })
  const base = `http://localhost:${port}/`
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(base)).ok) return { base, stop: () => server.kill() }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  server.kill()
  throw new Error(`Server did not start at ${base}`)
}

export const launch = () => browserType.launch()

/** A touch-screen context like the real device (Chromium and WebKit both support isMobile); desktops get a mouse. */
export function device(browser, vp, extra = {}) {
  const touch = !vp.desktop
  return browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 2, ...extra })
}

/** Open the app and tap through the splash (the first tap unlocks audio on iPad). */
export async function openApp(page, base) {
  await page.goto(base)
  await page.getByRole('button', { name: /let's play/i }).click({ timeout: 5000 }).catch(() => {})
}

/** Tap the full-screen story overlay (StoryBeat) away if it is showing. */
export async function skip(page) {
  const b = page.getByRole('button', { name: 'Skip' })
  if (await b.isVisible().catch(() => false)) await b.click({ force: true }).catch(() => {})
  await page.waitForTimeout(700)
}

export const pad = (n) => String(n).padStart(2, '0')
