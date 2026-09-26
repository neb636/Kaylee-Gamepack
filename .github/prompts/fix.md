The game you just built fails the repo checks. Read `AGENTS.md` if you haven't.

The failing output of `npm run check` is in `.lesson-input/check.log`. Read it, find the cause, and fix it. If voice clips are missing or stale, also read `.lesson-input/voice.log` (voice generation output: e.g. an unknown speaker in `voice-lines.json`, or a line that failed to record). You can't record audio yourself; fix `voice-lines.json` and the workflow records again.
Only change files inside the new game's folders (`src/games/<game-id>/`, `art/source/games/<game-id>/`),
unless the failure is clearly caused by something else you changed, in which case undo that change.

Then run `npm run typecheck` and `npm run build` again until they pass. Do not commit or push.
