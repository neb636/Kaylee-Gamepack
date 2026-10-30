# Kaylee Gamepack Studio

This folder is the local Electron builder app for the game in the parent directory. It was imported from
`~/repos/agent-workbench` and is now maintained here. It is intentionally tailored to this game.

- Follow the root AGENTS.md for family privacy, character identities, art, game changes and validation.
- Keep Electron dependencies and builds isolated here. The published game must not import native APIs or this renderer.
  The one shared dependency is `src/shared/labs.ts`, a dependency-free protocol and numeric validator.
- Reuse the live game labs; do not fork their controls, character renderer or camera implementation.
- Native processes belong in main, behind typed preload APIs. Only the top frame receives native capabilities.
  Lab messages must match the exact local origin and iframe source. Never accept arbitrary executable paths or shell commands from lab output.
- AI tuning previews bounded numbers only. Reject stale replies and unknown/non-finite controls atomically. Preserve Undo.
  A separate, reviewable agent prompt saves the chosen numbers in the game; do not silently edit source when previewing.
- Character concepts follow ../docs/3d-characters.md: one image, same character, one change. Keep photos, meshes and .blend scratch data private outside the repo.
- Tripo is a manual handoff. Do not auto-spend credits. Blender work uses the user's configured CLI/MCP and preserves the existing rigid-pivot Rig.
- Semantic `--wb-*` CSS variables; reuse the inherited accessible controls and CLI/session lifecycle.
- `npm run build` checks both TypeScript projects. `npm test` here runs Node contract tests (not the game’s prohibited local Playwright suite).
- Launch from the root with `npm run studio`; it owns both loopback servers and Electron and stops them together.

- `npm run studio:dist:dir` builds a macOS app. The packaged renderer is independent of the opened repository; Git branches/worktrees choose the editable checkout. Labs lazily start that workspace’s Vite server using Electron’s bundled Node runtime. Keep the renderer/game origins exact and stop owned servers on quit.
