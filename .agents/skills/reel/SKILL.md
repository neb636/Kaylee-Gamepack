---
name: reel
description: Film the game being played (a robot finger with a pink dot, title cards per moment) as an mp4 and a GIF for the PR, so the user watches a minute instead of playing grey boxes. Use for every toy check-in, for before-and-after clips in the fix lane, and whenever you need to see your own change moving.
---

# Reels: show the toy in motion

Studios review work as dailies: the shot moving, every time. A reel is that for a toy. It is also how you check your
own work: watch the frames before you call something done.

## Film it

```
npm run build
node scripts/reel.mjs <name> <moment>... [--chromium] [--viewport=ipad-landscape]
```

- A **moment** is a filmed robot run from a country's `qa.mjs` `motion` list (`barber-grow-snip`, or a prefix like
  `barber` for all of them), or a section link to open and watch untouched (`'#/world/canada/taffy/share~5'`).
- Every toy gets `motion` runs for its core verb and its payoff in its `qa.mjs` (`docs/qa.md`): those are its reel. A
  run that fails is a finding, not a reason to leave the moment out.
- Output: `review/reel/<name>.mp4` (about 30 fps, 960 wide), `<name>.gif` (its first 12 s, under 4 MB, for the PR
  body) and `<name>.json` (each moment and how it went).
- Look at it: `ffmpeg -i review/reel/<name>.mp4 -vf "fps=1/2,scale=480:-2,tile=3x3" -frames:v 1 sheet.jpg`, then open
  the sheet. Fix what looks wrong before the user sees it.

## Where to film

- **3D needs a real GPU.** On the Mac a 3D scene films at about 15 fps. In a cloud session or CI there is no GPU and
  a 3D scene films a frame a minute: `reel.mjs` gives up on any moment under 4 fps and says so. Film 3D on the Mac
  (or a cloud session linked to it through the desktop app), and say on the review page when a reel is still to come.
- 2D toys film fine anywhere. WebKit is the iPad's engine and the default; `--chromium` where WebKit isn't installed.

## Before and after (the fix lane)

Film the same moment on `main` and on your branch, with the same name plus `-before` and `-after`. For `main`, use a
worktree (`git worktree add ../before origin/main`, `npm ci && npm run build` there) and run its `scripts/reel.mjs`
with `--out=<this checkout>/review/reel`. The review page shows every reel in `review/reel/`, so both appear, one under
the other.
