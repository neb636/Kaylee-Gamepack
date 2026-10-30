# Kaylee Gamepack Studio

A local Electron app for building Kaylee’s Gamepack. The workbench source, Claude Code/Codex adapters, terminals,
file browser, source control and image gallery were imported from `~/repos/agent-workbench`. Nothing runs from that sibling repo.

From the game repo:

```sh
npm ci                       # game dependencies (if needed)
npm run studio:install       # isolated Electron dependencies + native PTY rebuild
npm run studio
```

The launcher compiles Electron, starts the game at `http://127.0.0.1:5174` and the studio renderer at
`http://127.0.0.1:5175`, then opens Electron. It refuses occupied ports. Close the studio window, use Cmd+Q, or press Ctrl+C
in the launching terminal to stop the servers. Normal game development can still use port 5173. Node 22.12+ (24 recommended), npm, installed and signed-in `claude` and/or
`codex` CLIs are required for AI. Their existing login/config is used; the studio needs no API key of its own.

To build and open a macOS app (like agent-workbench's `dist:dir`), run from the game repo:

```sh
npm run studio:dist:dir
# Or build a DMG as well:
npm run studio:dist
```

The app is written to `workbench/release/mac-arm64/Kaylee Gamepack Studio.app` on Apple Silicon
(`release/mac/` on Intel). You can copy it to Applications and open it from Finder or the Dock.
`npm --prefix workbench run open:app` opens the last build again. Quit an already running Studio before rebuilding.
These are local, ad-hoc-signed builds, not notarized distribution builds.

The packaged app opens independently of any game checkout. Use **Add workspace** to open your local Gamepack repository;
it remembers your workspaces for the next launch. In the **Source control** sidebar, choose a local or remote tracking
branch and **Switch branch**, or enter a new branch name and **Create worktree** to keep existing work separate.
Switching requires a clean working tree; Studio never stashes or discards edits for you. The worktree starts from the
current HEAD. The existing agent launcher can also create a worktree for a session.

Open that workspace's camera, feel or character lab to start its live game server on loopback port 5174.
Switching workspaces and opening a lab restarts the server for that checkout. The built interface stays on port 5175,
so the labs retain their exact-origin checks. Quit Studio to stop both servers. Each checkout needs `npm ci` once
(use a Studio terminal), Node 22.12+ and your signed-in AI CLIs. If a branch is missing, run `git fetch` in its terminal
and reopen the sidebar. The app uses Electron’s bundled Node runtime for the game server. It doesn't bundle a game checkout, npm, AI CLIs or Blender; only changes to Studio itself
require rebuilding the `.app`. Game changes reload in the labs.

Source-run Studio opens the current checkout automatically. Each added workspace includes four Studio views:

- **3D character lab**: the actual lab, poses, voices, outfits, lineups and exports. Prepare a character builder prompt
  or open Character concepts. The game and its existing lab stay available on iPad and PR previews.
- **Camera lab**: paste any 3D section link. Choose frame/mode and freeze the moment using the existing controls.
  Explain the framing problem, choose Claude or Codex, and press **Ask AI & preview controls**. AI gets the current
  shot, lens, frame, section state and bounded controls. It does not see a screenshot; describe visual issues precisely.
- **Feel lab**: paste a section with knobs, play it, then describe the problem. AI gets that activity’s controls,
  their notes/source paths and a sample of watched input/output. It previews values in the running toy.
- **Character concepts**: generate one transparent vinyl A-pose concept, inspect it, then use **Refine from this**.
  A workflow selector prepares prompts for the Tripo handoff, four-mesh comparison, Blender split/rig and game QA.

Tuning results include an explanation and **Undo AI change**. Invalid or stale replies change nothing. Requests can
be cancelled and time out after three minutes. Keep the same scene, frame, mode and controls while a reply is pending.
**Prepare prompt to save in game** opens a normal Claude/Codex composer with the exact snapshot and your note; review
and send it there. Previewing alone never changes source defaults. The CLIs' regular permission/trust prompts appear
in their terminal for agent sessions and image orchestration.

Tripo generation/texturing is manual (no API/credits integration). Blender work uses the selected CLI’s configured
Blender MCP; the studio does not bundle Blender. Dad chooses family identity/animal, the final concept and winning
mesh. Read [the character recipe](../docs/3d-characters.md) for the full process.

Sources, generated images and studio state live under `~/Library/Application Support/Kaylee Gamepack Studio/`.
Family photos stay out of Git. Private mesh/.blend working files remain under
`~/repos/KayleeGamepack-planning-assets/models/<id>/`; only approved runtime GLBs enter the game repo.

```sh
npm --prefix workbench run qa:packaged # after dist:dir, with Studio closed; no model calls
npm run studio:check          # renderer/main build + Node contract tests
npm run verify                # normal game checks; no Electron install required in game CI
npm --prefix workbench run qa:labs  # with studio running; fixture CLIs, no model calls
npm --prefix workbench run qa:images # after studio:check; fixture concept workflow
```

Verified locally: both studio builds, 50 Node contracts, fixture Electron lab and concept flows, plus real Codex camera/steering requests. Claude returned its sign-in error on this machine; run `/login` in Claude Code to use it.

The migration plan is [planning/gamepack-studio.html](../planning/gamepack-studio.html). The upstream MIT license is
preserved in `LICENSE` (upstream commit `81610597caaa18e68fb17731b54a7513c9985064`). Build products, dependencies, releases and private scratch data are ignored by Git.
