# QA: what the robots check, and what only Kaylee can

The robots make sure the user and Kaylee never meet a broken, confusing or talky build, so nobody spends their few minutes
on something a script could have caught. **Passing QA means it works, not that it's fun.** Fun is Kaylee's playtest
(check-in 3 in `AGENTS.md`). Lip sync and sound can't be heard by automated browsers either: the user hears them on the iPad.

## Every change, however small

1. `npm run verify` must pass (heavy imports, file names that differ only in case, the README directory, typecheck,
   build; about 2 minutes). Its voice-clip check fails while new lines have no clips: without a key that's expected.
   Push, and the PR records them for you: its preview workflow's voices job uses the `OPENAI_API_KEY` repository secret, commits the clips to your branch and re-runs CI.
2. Look at what you changed: open its section link, or screenshot it
   (`node scripts/qa-screens.mjs --only=ipad-portrait,ipad-landscape --routes=<activity id>`). Shared code
   (`src/world/kit`, `src/sdk`, `src/shell`): also two or three screens that use it.
3. **Don't run `npm run test` or `npm run check` locally.** CI runs the Playwright specs on the PR. If CI is red, read
   `gh run view --log-failed`, check whether the same spec fails on `main`, then fix only that spec.
   `npm run test:changed` runs just what your branch affects (opt-in).
4. New toys get no bespoke e2e spec: `tests/sections.spec.ts` finds every section by itself. A bespoke spec is for a
   non-visual contract only (voice plays, GPU memory, a deep link lands). Walkthroughs are tagged `@behavior` and run
   nightly (`npm run test:behavior`).

## A toy, before each check-in

Run the robots on the toy's own routes, read their numbers, and fix what they find before the user sees anything:

After `npm run build`; WebKit, because the iPad runs Safari (`npx playwright install webkit` once):
- `node scripts/qa-screens.mjs`: every screen at 4 iPad + 3 iPhone sizes with touch emulation (`qa-output/webkit-*/`).
- `node scripts/qa-motion.mjs`: filmstrips + gifs of character actions and play moments (`qa-output/motion/`). Still
  screenshots can't show whether something feels alive; filmstrips can.
- `node scripts/qa-art.mjs`: white patches left inside sprite cutouts (`qa-output/art/`). Every hole is a major finding.
- `node scripts/qa-pacing.mjs`: seconds of talk before her first touch and in total, from the real clip lengths, plus
  the fun numbers: talk per touch, seconds with nothing to touch, how many different things she touched, and a play
  strip (12 frames across a whole auto-played run, `qa-output/play/`). `--video` also records each run
  (`qa-output/video/`). Keep talk before the first touch under ~6 seconds and talk per touch under ~1.5 s.
- **The scenarios live with the country, not in the scripts:** `src/world/places/<id>/qa.mjs` exports `screens`,
  `pacing` and `motion` (a new activity can keep its own in `activities/<id>/qa.mjs`; helpers like `vp`, `skip`,
  `tapAnchor` and `seedWall` come from `scripts/qa-lib.mjs`). An activity with none still gets a screenshot per section
  and a plain pacing run, but every new activity adds a motion scenario for its core verb and the screens and runs that
  need a finger. A screen QA never looked at is a screen nobody checked.

Then, before check-ins 3 (Kaylee plays it) and 4 (ship), the **`fresh-eyes` agent** reviews it: it hasn't seen the work
being made, so it doesn't grade its own homework. It looks at the reel's frames, the contact sheets, the pacing numbers
and the table read's flags against `docs/play-design.md` and the design rules, and writes at most ten ranked findings to
`qa-output/fresh-eyes.md`. Fix the blockers. Anything the user must know goes on the review page as one line; small things go
in the country's `known-issues.md`.

## Time budget (a session should take about an hour, not ten)

- Never poll with `until ! pgrep ...; sleep` loops. Start long jobs with `run_in_background` and wait for the completion notice.
- Anything that may take over 5 minutes goes in the background; never run a foreground command near the 10-minute timeout.
- The QA scripts take one of 2 machine-wide slots (`scripts/qa-lib.mjs`, `kaylee-gamepack-qa-<n>.lock` in the temp
  dir) when they start their preview server, so agents in different worktrees queue instead of piling on CPU. The
  second slot serves on port +100. A script that prints "QA is busy" is waiting its turn: let it wait.
- One heavy job at a time: the fresh-eyes agent, timed robot play, reels and builds fight for CPU, and a rebuild changes
  `dist/` under them.
- Iterate with `npm run dev` and `npm run typecheck`; `npm run build` only before QA or the final `verify`.
- The main thread looks at no more than ~3 images itself. Look at contact sheets (`npm run qa:sheets`) and reel
  frames, and hand anything bigger to the `fresh-eyes` agent.
- Fix-up rounds re-screenshot only the changed screens (`--routes`, `--only`); never a second full QA pass.
- 3D reels need a real GPU: film them on the Mac (or a cloud session linked to it). In the cloud `reel.mjs` skips a
  scene that films under 4 fps and says so; say it in the review page instead of waiting.
- Check whether a failing spec also fails on `main` before debugging it.
