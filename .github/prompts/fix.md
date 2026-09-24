The game you just built fails the repo checks. Read `AGENTS.md` if you haven't.

The failing output of `npm run check` is in `.lesson-input/check.log`. Read it, find the cause, and fix it.
Only change files inside the new game's folders (`src/games/<game-id>/`, `art/source/games/<game-id>/`),
unless the failure is clearly caused by something else you changed, in which case undo that change.

Then run `npm run typecheck` and `npm run build` again until they pass. Do not commit or push.
