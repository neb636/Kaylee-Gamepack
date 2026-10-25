---
name: open-pr
description: Commit, push and open a ready-for-review pull request for Kaylee's Gamepack, with "Test this" deep links to exactly the game, activity section and state the change touched on the PR preview. Use whenever you finish a task and open (or update) a PR in this repo.
---

# Open a PR with test links

Dad tests every PR on the GitHub Pages preview on his iPad. A link to the app's front page makes him tap and play
through minutes of earlier sections to reach what changed. Your job: put links in the PR that open **exactly** what you
changed, already in the state needed to see it.

This skill is shared by Claude Code and Codex. The one copy lives in `.agents/skills/open-pr/`, and
`.claude/skills/open-pr` is a symlink to it. Edit it only there.

## 1. Commit and open the PR

1. Work on a branch, not `main`. Commit with a clear message.
2. Push, then open the PR **ready for review** (never `--draft`), assigned to `neb636`:
   ```
   gh pr create --assignee neb636 --title "..." --body-file <file>
   ```
3. Get the PR number (`gh pr view --json number -q .number`). The preview lives at
   `https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<N>/`. It is built a minute or two after each push.

## 2. Work out what to link

```
node scripts/pr-links.mjs --pr <N>
```
It reads the branch's changed files and prints a draft: each changed game (`#/game/<id>`), and for each changed world
activity, every section with its state params. **Don't paste the draft as is.** Narrow it down:

- **Which section?** Read your diff. Find the section where the changed code runs: the activity's `sections.ts` lists
  them in play order, and its main component maps them to stages. Link that section, not the activity's start. If you
  changed the oven in the Pizzeria's last pizza, link `pizzeria/own?at=oven`, not `pizzeria`.
- **Which state?** Sections that come later read state from earlier ones: the sauce she picked, the boat, the hats,
  the toppings. Set the params that reproduce the case you fixed or built. If the bug was "pink sauce looks brown in
  the oven", link `pizzeria/own?at=oven&sauce=pink`. Params you leave out use sensible defaults.
- **Several places?** Link each one, most specific first. A change to shared code (`src/world/kit`, `src/sdk`) needs a
  link to one or two screens that use it, plus `#/world/sections`.
- **Finale?** `#/world/<place>/party?stamps=all` collects the stamps first.
- **Easy way:** play to the moment locally (`npm run dev`). The address bar always shows the deep link for what's on
  screen, including the state (`enter()` in `src/world/kit/sections.ts` keeps it up to date). Copy it.

Check every link before you post it: open it locally (`npm run build && npx vite preview`, then `<url>`, tap
"Let's play!"), and confirm `window.__kayleeSection` is the section you meant and it looks right.

## 3. Put the links in the PR

Add this block near the top of the PR body (`gh pr edit <N> --body-file <file>`):

```markdown
## 🔗 Test this
- 🍕 **The fix**: [Her own pizza, in the oven, pink sauce](https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<N>/#/world/italy/pizzeria/own?at=oven&sauce=pink)
- ▶️ From the start: [Pizzeria](https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<N>/#/world/italy/pizzeria)
- 🧭 [Every section](https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<N>/#/world/sections)
```
Each link gets one short line saying what to look at. When a later push changes what to test, update the block.

## 4. Watch for Codex's review (Claude Code only)

Codex reviews every PR on open and on each push, usually in 1-2 minutes. The session that built the change handles the
review, since it knows the subject. Right after the PR is open, start the watcher with the `Monitor` tool (silent while
it waits, so it costs no context until it prints; it stops by itself after 7 minutes):

```
node scripts/watch-codex-review.mjs --pr <N>
```

It prints one of: `CLEAN` (nothing to do; say so and stop), `FINDINGS` followed by one block per inline comment,
`NOREVIEW` (Codex posted a setup notice instead of reviewing; tell Dad, don't retry), `TIMEOUT` (say so and stop,
don't poll further), or `CLOSED`. On `FINDINGS`, for each comment:

1. **Verify first.** Read the code it points at and try to reproduce the claim. Don't apply a suggestion you haven't
   confirmed.
2. **Reply on every comment's thread**, so Codex and Dad can see what happened
   (`gh api repos/{owner}/{repo}/pulls/<N>/comments/<comment id>/replies -f body=...`):
   - **Real:** fix it, run `npm run verify`, commit, push, then reply `Fixed in <short sha>: <one line on what changed>`.
   - **Not real:** reply `Not an issue: <the evidence, e.g. the line or the reason the case can't happen>`. No code change.
   - **Needs Dad:** reply `Left for Dad: <why>`.
3. If you pushed anything, post a separate PR comment `gh pr comment <N> --body "@codex review"` listing in a line or
   two what changed, then start the watcher again. At most **3 rounds**; after that, stop and tell Dad what is left.
4. A finding that needs a decision from Dad (art, family facts, changing what a toy does) is reported, not fixed.

## If the link you need doesn't exist

If a moment you changed can't be reached by a link (the section doesn't exist yet, or it needs state that isn't a
param), add it in the same PR. Add a section or param in the activity's `sections.ts`, seed it when `start` is set, and
report it with `enter()` (`src/world/kit/sections.ts` explains how). `tests/sections.spec.ts` checks that every section
link lands.
