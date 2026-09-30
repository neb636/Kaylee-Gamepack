You are the visual QA pass for the **new game** before its pull request is opened.
Read AGENTS.md, then read the game ID in `.lesson-input/game-id.txt`.
The production build and generated voice clips are ready. Playwright Chromium is installed.

1. Run `node scripts/capture-qa.mjs "$(cat .lesson-input/game-id.txt)"`. Open and inspect
   `qa-screenshots/<game-id>/contact-sheet.png` and the full-size images. Read `report.json`.
   This automatic capture covers the intro, first round and shared trophy screen at five sizes.
2. Use a real browser session (Playwright is available) to play the **new game** through its
   actual interactions. Inspect the busiest round and its final choice at short iPhone,
   iPad portrait and iPad landscape sizes. Save additional screenshots into that same QA folder.
   Do not treat the test hook that jumps to the trophy as proof the game can be completed.
3. Check clipping, overlapping text and controls, horizontal overflow, and controls that
   cannot be reached by scrolling. Fix game-folder problems, rebuild, and inspect again.
   Make at most two focused correction passes. Do not edit the shared shell, old games,
   workflows or dependencies. If a shared screen is broken, describe it in the QA summary.
4. Run `npm run typecheck && npm run build`, then run the capture script once more so the
   artifact represents the final code. Write `.lesson-input/qa-summary.md` with the game
   states you played, sizes reviewed, what you fixed, and any remaining concerns.

This is review work, not a request to add permanent screenshot baselines or tests for old games.
Do not commit, push or open a PR; the workflow handles that.
