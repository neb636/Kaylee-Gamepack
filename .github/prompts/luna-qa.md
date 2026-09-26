# Luna QA brief: Kaylee's Gamepack (visual + play QA)

You are **QA only**. Do NOT edit, create or delete anything under `src/`, `scripts/`, `tests/`, `art/` or any config.
You may only write inside `qa-output/` (screenshots, your own throwaway Playwright scripts, and the report).

## The app
An iPad/iPhone learning app for Kaylee, age 5, who cannot read. Pink, unicorn, cute. Read `AGENTS.md` (design rules)
for context. The section under test is **Around the World** (`#/world`), especially the country **Australia**
(`#/world/australia` and its activities `outback`, `forest`, `reef`, `stars`, `postcard`, and the `party` finale).

## Steps
1. `npm run build`
2. `node scripts/qa-screens.mjs` then look at EVERY screenshot in `qa-output/chromium-*/` with your image viewer.
   Also read `qa-output/errors.txt` (console errors, overflow, failed steps).
   The 7 viewports: iPad 820x1180, 1180x820, 1024x1366, 1366x1024; iPhone 390x844, 844x390, 430x932.
3. Play through each Australia activity to the end yourself at **iPad portrait (820x1180)** and **iPhone landscape
   (844x390)** with your own Playwright script in `qa-output/` (serve with `npx vite preview --port 4181`).
   Tips: first click the "Let's play" button; use `click({ force: true })` (many things bob forever, so they are never
   "stable"); drag with `page.mouse` down/move/up; `window.__kayleeWorld.stampAll()` gives all stamps;
   `window.__kaylee.win()` shows the trophy ceremony. `navigator.webdriver` makes speech resolve instantly.
   Screenshot the middle and end of each activity, and the stamp screen.

## What to check (for each screen and size)
- Nothing cut off, clipped or overflowing the screen; no content hidden under the round top-left button / star bar.
- Touch targets look at least ~88px on iPad (≥ ~64px on iPhone landscape).
- Text readable, not overlapping art or other text; prompt bubbles fit.
- No big empty bands; the play area uses the screen in both orientations.
- Art: cutouts clean (no white halos/holes), things sized sensibly, overlays (hat/sunglasses on Pip) land in the right place.
- Every activity can be finished with no way to get stuck; wrong answers give a gentle wiggle, never a dead end.
- Anything that looks broken, ugly, confusing for a 5-year-old, or not "pink and cute".

## Report
Write `qa-output/report.md`: a short summary, then a numbered list of findings, most severe first. Each finding:
`severity (blocker/major/minor/polish) | viewport(s) | screen | screenshot path | what is wrong | suggested fix`.
Be specific (pixel sizes, which element). Don't pad with praise; if a screen is fine, don't list it.
Finish by printing the report.
