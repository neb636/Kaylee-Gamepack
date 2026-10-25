// Shared helpers for the QA scripts (qa-screens, qa-motion, qa-pacing). Run `npm run build` first: they serve dist/.
// WebKit is the default because Kaylee's iPad runs Safari; pass --chromium to compare.
import { chromium, webkit } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'

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

const SLOTS = 2
const lockDir = (slot) => path.join(tmpdir(), `kaylee-gamepack-qa-${slot}.lock`)
const alive = (pid) => {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return e.code === 'EPERM'
  }
}

/**
 * At most SLOTS QA runs at a time on this machine, across every worktree and agent: WebKit is CPU-heavy, so more
 * parallel runs time each other out. Waits for a free slot; a slot left by a dead process is taken over.
 * Returns { slot, release }; the slot number offsets the port so two runs of the same script don't clash.
 */
async function acquireSlot() {
  let told = false
  for (;;) {
    let holder = null
    for (let slot = 0; slot < SLOTS; slot++) {
      const dir = lockDir(slot)
      try {
        mkdirSync(dir)
        writeFileSync(path.join(dir, 'info'), JSON.stringify({ pid: process.pid, cwd: root, script: path.basename(process.argv[1] ?? '') }))
        const release = () => rmSync(dir, { recursive: true, force: true })
        process.once('exit', release)
        for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, () => process.exit(1))
        return { slot, release }
      } catch (e) {
        if (e.code !== 'EEXIST') throw e
      }
      try {
        holder = JSON.parse(readFileSync(path.join(dir, 'info'), 'utf8'))
      } catch {
        continue // its owner is still writing the info
      }
      if (!alive(holder.pid)) {
        rmSync(dir, { recursive: true, force: true })
        slot-- // try this slot again
      }
    }
    if (!told) console.log(`QA is busy (${SLOTS} runs at once${holder ? `, e.g. ${holder.script} in ${holder.cwd}` : ''}); waiting for a free slot...`)
    told = true
    await new Promise((r) => setTimeout(r, 2000))
  }
}

/** Takes a QA slot, then serves dist/ with vite preview; returns { base, stop } (stop also frees the slot). */
export async function serve(basePort) {
  const { slot, release } = await acquireSlot()
  const port = basePort + slot * 100
  const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' })
  const stop = () => {
    server.kill()
    release()
  }
  const base = `http://localhost:${port}/`
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(base)).ok) return { base, stop }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  stop()
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

/** 12 frames ([{ t, buf }], evenly picked) in a 4x3 grid, each stamped with its time in seconds, saved as a PNG. */
export async function filmstrip(frames, file) {
  const picks = Array.from({ length: 12 }, (_, i) => frames[Math.round((i * (frames.length - 1)) / 11)])
  const w = 320
  const meta = await sharp(picks[0].buf).metadata()
  const h = Math.round((meta.height / meta.width) * w)
  const tiles = await Promise.all(
    picks.map(async ({ t, buf }) => {
      const label = Buffer.from(`<svg width="${w}" height="${h}"><rect x="4" y="4" width="62" height="24" rx="8" fill="rgba(0,0,0,.55)"/><text x="12" y="22" font-family="sans-serif" font-size="16" fill="#fff">${t.toFixed(2)}s</text></svg>`)
      return sharp(buf).resize(w, h).composite([{ input: label }]).png().toBuffer()
    }),
  )
  await sharp({ create: { width: 4 * w + 12, height: 3 * h + 8, channels: 3, background: '#fff' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % 4) * (w + 4), top: Math.floor(i / 4) * (h + 4) })))
    .png()
    .toFile(file)
}
