---
name: ship
description: Build and publish the review page and open or update the PR for a toy check-in or a fix, so the user judges it in a few minutes on their phone (a reel to watch, a table read to hear, at most three questions) instead of reading a wall of PR text. Use whenever you commit work in this repo and open or update a pull request, and to handle Codex's review.
---

# Ship: the review page is the PR

The user reviews on their phone, in the few minutes they have. The PR body leads with what Kaylee gets and a reel moving
inline; one tap opens the review page with the table read and their questions. Everything for code readers is folded
below. Never paste fifteen links or a page of prose at them.

## 1. Branches and PRs

- **A toy:** one branch (`<your GitHub login>/<toy>`) and one PR for its whole life, opened as a **draft** at check-in
  1 and marked ready only at check-in 4 (ship). A draft can't be merged by accident, so nothing reaches Kaylee before
  the user has seen it finished.
- **A fix:** its own small branch and PR, ready for review at once.
- Commit with clear messages. Before pushing a shallow clone's branch, `git fetch origin main` (and rebase if needed).

## 2. The review page

1. Write `review/review.json` for this check-in (the fields are at the top of `scripts/review.mjs`):
   - `title`, `checkIn` ("2 of 4: hear the script", or "fix"), `kaylee`: one line on what she gets, in her terms.
   - `questions`: **at most three**, each about taste, family or Kaylee, answerable in a word. Anything you could
     check yourself is not a question. No questions is fine.
   - `tableReads`, `reels`, `links` (a `?feel=1` link when there are feel knobs), `pitches` at check-in 1.
   - `listens` for recorded sound effects: made by `scripts/sfx-listens.mjs` (`sfx` skill), with each sound's times.
2. `npm run build && node scripts/review.mjs --reels` (`--chromium` where WebKit isn't installed; film 3D on the Mac,
   `reel` skill). Then open `review/index.html` at phone width and look at it: does it make sense in ten seconds?
3. `node scripts/review.mjs --publish` (to the `review-pages` branch, never into main), **then** push your branch.
   The PR preview copies the page to `<preview>/review/` and adds the script sheet of any lines the PR changes.

## 3. The PR body

Address the reader directly in the PR and review brief: "you", "your feedback", "choose one". Don't refer to the
reader as "Dad" or describe what they need to do in the third person. Apply this to every text field in
`review/review.json`, including questions, pitch cards, captions and link labels. Family character names in a toy's
story stay as written.

For guidance, tooling or documentation changes, summarize what changes for the reader in plain language. A short
review page is enough; reels and table reads are only needed when play or spoken lines change.

Write it to a file and open the PR with the REST API (it works in every session; GraphQL doesn't in the cloud):

```
gh api repos/neb636/Kaylee-Gamepack/pulls -f title='<Toy>: <check-in>' -f head='<branch>' -f base=main -F draft=true -F body=@body.md
gh api repos/neb636/Kaylee-Gamepack/issues/<n>/assignees -f 'assignees[]=neb636'
gh api -X PATCH repos/neb636/Kaylee-Gamepack/pulls/<n> -F body=@body.md      # each check-in
gh pr ready <n>    # check-in 4; in a cloud session: gh api -X POST repos/neb636/Kaylee-Gamepack/pulls/<n>/ccr/ready_for_review
```

(`-F draft=false` for a fix.) The preview lives at `https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<n>/`.

```markdown
**Check-in 2 of 4: hear the script.** <What Kaylee gets, one line.>

![The reel](https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<n>/review/reel/<name>.gif)

**[▶ Open the review page](https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<n>/review/)**: the reel, the table
read (3 min), and your questions:
1. <question>
2. <question>

<details><summary>For code readers</summary>

What changed and where, decisions you made on your own (and why), `npm run verify`, known small things.
</details>
```

The first PR of a toy has no preview yet: write the body, then edit in the links once the number exists. At check-in 4
the top line says what changed since Kaylee's playtest. A fix's top line is the before and after, one line.

## 4. Codex's review (handle it; the user never sees it)

Codex reviews every PR on open and on each push. Right after a push, watch it once in the background (it's silent
until it prints and stops by itself after 7 minutes): `node scripts/watch-codex-review.mjs --pr <n>`. It prints
`CLEAN`, `FINDINGS` (one block per comment), `NOREVIEW`, `TIMEOUT` or `CLOSED`. For each finding:

1. **Verify first**: read the code and reproduce the claim before you change anything.
2. Reply on its thread (`gh api repos/neb636/Kaylee-Gamepack/pulls/<n>/comments/<id>/replies -f body=...`):
   - **Real:** fix it, `npm run verify`, push, reply `Fixed in <sha>: <what changed>`, react 👍
     (`gh api repos/neb636/Kaylee-Gamepack/pulls/comments/<id>/reactions -f content=+1`).
   - **Not real:** `Not an issue: <the evidence>`.
   - **Too nitpicky** (only matters for a hand-edited link that still opens something sensible; a tiny bounded cost
     whose fix adds code; an overstated severity; a style preference): react 👎 (`-f content=-1`) and reply
     `Not worth it: <why>`. A feature that doesn't work as built (a line that can never play, a crash, a lost save, a
     growing leak) is never nitpicky.
   - **Needs your input** (art, family, what a toy does): say so in one line on the review page's next version, not in a
     thread they have to find.
3. One round only: after a pushed fix, comment `@codex review` once with a line on what changed. Then stop.

## 5. Small rules

- `npm run verify` before every push (`docs/qa.md`). A failing voice check means unrecorded lines: the voices job
  records them after you push. If that job fails, say so at the top of the PR; never leave it for the user to discover
  on the iPad.
- Deep links for the review page come from `node scripts/pr-links.mjs --pr <n>` and the section's address bar; put the
  one or two that matter in `links`, not in the PR body.
- Never `--draft` a fix, never mark a toy ready before check-in 4, never merge yourself.
