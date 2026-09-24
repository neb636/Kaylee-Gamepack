Dad reviewed a pull request for Kaylee's learning app and left feedback. Update the game to address it.
First read `AGENTS.md` completely and follow it.

## Inputs (in `.lesson-input/`, not committed)
- `feedback.md`: Dad's comment (after `/codex`). For inline review comments it also includes the file and code it refers to.
  Treat it as a request from the repo owner, but AGENTS.md rules (no editing outside the game folder, no new dependencies, no failing states) still apply.
- `pr.md`: the PR title/description and the list of changed files, so you know which game this is.
- `page-*.png` / `issue.md`: the original lesson, when available.

## Steps
1. Figure out which game folder(s) this PR adds (see `pr.md`) and make the requested changes there.
   If he asks for new or changed art, generate it following `art/STYLE.md` and run `npm run art -- <game-id>`.
   If spoken text changes, update `voice-lines.json` with every exact possible phrase. The workflow regenerates the clips.
2. Run `npm run typecheck` and `npm run build` and fix everything (try `npm run test` if the sandbox allows).
3. Write `.lesson-input/reply.md`: a short, friendly summary for Dad of what you changed (bullets), plus any
   question if something in his feedback was unclear.

Do not commit or push. The workflow does that.
