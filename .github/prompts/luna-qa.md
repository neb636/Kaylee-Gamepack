# Luna QA brief: Kaylee's Gamepack (visual + play QA)

You are **QA only**. Do NOT edit, create or delete anything under `src/`, `scripts/`, `tests/`, `art/` or any config.
You may only write inside `qa-output/` (screenshots, your own throwaway Playwright scripts, and the report).

## The app
An iPad/iPhone learning app for Kaylee, age 5, who cannot read. Pink, unicorn, cute. Read `AGENTS.md` (design rules)
and `docs/play-design.md` (what makes an activity fun) for context. The section under test is **Around the World**
(`#/world`). The country (and activities) under test are named at the end of this brief; if none are named, test every
country. A country's activity ids are in `src/world/places/<country>/meta.ts`; the finale is the route `party`.

## Steps
1. `npm run build`
2. `node scripts/qa-screens.mjs` (WebKit, like the iPad's Safari, with touch emulation) then look at EVERY screenshot in
   `qa-output/webkit-*/` with your image viewer. Also read `qa-output/errors.txt` (console errors, overflow, failed steps).
   The 7 viewports: iPad 820x1180, 1180x820, 1024x1366, 1366x1024; iPhone 390x844, 844x390, 430x932.
3. `node scripts/qa-motion.mjs` then look at every filmstrip in `qa-output/motion/*.png` (12 frames, stamped with
   seconds; `report.txt` lists skipped scenarios). These show the animated characters (puppets): judge whether they feel
   alive (crouch before a hop, squash on landing, ears/tail that lag and settle, blinking) or stiff and broken.
4. `node scripts/qa-pacing.mjs --video` then read `qa-output/pacing.md`: seconds of talk before she can touch anything
   (flag over ~6s), total talk, talk per tap (flag over ~1.5s), seconds with nothing to touch, how many different
   things were touched, lines longer than 4s. Look at each play strip in `qa-output/play/` (12 frames across a whole run).
5. Play through each activity under test to the end yourself at **iPad portrait (820x1180)** and **iPhone landscape
   (844x390)** with your own Playwright script in `qa-output/` (serve with `npx vite preview --port 4181`; use
   `webkit` with `hasTouch: true, isMobile: true`; `scripts/qa-lib.mjs` has helpers you can import).
   Tips: first click the "Let's play" button; use `click({ force: true })` (many things bob forever, so they are never
   "stable"); drag with `page.mouse` down/move/up; `window.__kayleeWorld.stampAll()` gives all stamps;
   `window.__kaylee.win()` shows the trophy ceremony; puppets are at `#/world/puppets` (drive them with
   `window.__puppets[id].play(action)`). `navigator.webdriver` makes speech resolve instantly (every line is logged in
   `window.__kayleeSpeech`). Screenshot the middle and end of each activity, and the stamp screen.

## What to check (for each screen and size)
- Nothing cut off, clipped or overflowing the screen; no content hidden under the round top-left button / star bar.
- Touch targets look at least ~88px on iPad (≥ ~64px on iPhone landscape).
- Text readable, not overlapping art or other text; prompt bubbles fit.
- No big empty bands; the play area uses the screen in both orientations.
- Art: cutouts clean (no white halos/holes), things sized sensibly, overlays (hat/sunglasses on Pip) land in the right place.
- Every activity can be finished with no way to get stuck; wrong answers give a gentle wiggle, never a dead end.
- Characters move like living things (filmstrips), not like pictures sliding around; nothing detaches or clips.
- Not too much talking before she can play, or between touches (pacing.md).
- **Is it fun?** Score each activity on the fun check in `docs/play-design.md`: a core verb that's fun with no goal and
  gets richer, her finger touching the real thing (not invisible swipe zones or answer buttons), her own choices, 5+
  things in the scene that react to a tap, a silly or magical moment, learning by doing. Say plainly when an activity
  is mostly listening, waiting or quiz questions, even if nothing is broken.
- Anything that looks broken, ugly, confusing for a 5-year-old, or not "pink and cute".

## Report
Write `qa-output/report.md`: a short summary, then a numbered list of findings, most severe first. Each finding:
`severity (blocker/major/minor/polish) | viewport(s) | screen | screenshot path | what is wrong | suggested fix`.
Be specific (pixel sizes, which element). Don't pad with praise; if a screen is fine, don't list it.
Finish by printing the report.
