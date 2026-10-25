---
name: plan-page
description: Write, update or convert a plan in planning/ (a country, an activity, a trip, a rebuild) as a visual HTML plan page that Dad can skim and tap through, with the plan kept as JSON inside so agents can read and edit it. Use whenever you write a new plan, add "what's built" after a gate, update a plan's next step, or turn an old Markdown plan into a page.
---

# Plan pages

Dad is a visual reader. A long Markdown plan makes him skip through it and miss what matters. So plans are **HTML
pages**: a hero with the pitch, the next step and the numbers, a table of contents, the flow as boxes and arrows, the
verb as a ladder, the sections as tappable links, the build as a progress tracker, and what's built as fold-out
entries. The plan itself is **JSON** in the page, so agents read and edit data, not markup.

This skill is shared by Claude Code and Codex. The one copy lives in `.agents/skills/plan-page/`, and
`.claude/skills/plan-page` is a symlink to it. Edit it only there.

## How it works

- `planning/<...>/<name>.html` holds `<script type="application/json" id="plan">{ ... }</script>`: the whole plan.
- `planning/viewer/plan.js` and `plan.css` draw it. One viewer for every plan: never put styles or scripts in a plan
  page, and never hand-write HTML for the content.
- It opens straight from disk (`open planning/around-the-world/thailand/nan-trip.html`), and the build copies every plan
  page to `<app>/planning/...` (`scripts/vite-plans.ts`), so Dad can read it on the iPad:
  - main: `https://neb636.github.io/Kaylee-Gamepack/planning/around-the-world/thailand/nan-trip.html`
  - a PR: `https://neb636.github.io/Kaylee-Gamepack/pr-preview/pr-<N>/planning/around-the-world/thailand/nan-trip.html`
- App links written `#/world/...` open the build the page is served from (so on a PR preview they open the preview).
  `.md` links open on GitHub.
- `node scripts/plan.mjs check` validates every plan page (it runs in `npm run verify`). `node scripts/plan.mjs md
  <file>` prints a plan as Markdown: the quickest way for an agent to **read** one. Edit the JSON in the `.html` file.

Reference plans: `planning/around-the-world/thailand/baan-chang.html` (a place that's built, with a full log) and
`nan-trip.html` (a trip in the works, with planned and built sections).

## Writing for Dad

1. **Lead with the picture.** The hero carries the pitch (2-3 sentences), the status, the **next step** (what Dad does
   next, with links), and 3-5 facts (minutes, touches, sections, stops). If Dad reads only the hero, he knows where it
   stands.
2. **Show, don't paragraph.** A sequence is a `flow`. A verb that deepens is a `ladder`. Things to poke and silly
   moments are `chips`. Numbers per section are `bars`. Dad's answers and open questions are `qa`. Choices of a few
   parallel things are `cards`. Use `text` only for what really is a paragraph, and keep each one short.
3. **Every section has a link.** The `sections` block lists them in play order; put handy cases (a later round, a
   state) in a second `sections` block. Sections not built yet get `"status": "todo"` (shown, not linked).
4. **Dad first, builder after.** Sections Dad reads (the toy, the story, the numbers, the build plan, open questions)
   come first. Sections for the builder (where it plugs in, camera, look, voices, tech plan, sources) get
   `"for": "build"` and `"group": "For the builder"`: the page's **Overview** hides them, **Everything** shows them.
   Agents always get everything from the JSON.
5. **Keep what the builder needs.** Converting or condensing never drops a fact, a file path, a number or a decision.
   Move detail into `details`, a `log` entry or a builder section instead of deleting it.
6. Same voice as the rest of the repo: short sentences, no jargon for Dad, Kaylee's words in quotes (“”, so the JSON
   needs no escaping), no temples or Buddhas (AGENTS.md rule 7).

## The JSON

```json
{
  "schema": 1,
  "title": "Baan Chang Cafe: the elephants in Krabi",
  "icon": "🐘",
  "kind": "Boat trip place",
  "updated": "2026-10-25",
  "status": { "label": "Built and on for Kaylee", "tone": "mint" },
  "pitch": "In Krabi the songthaew stops at a signpost, and Kaylee picks the elephant...",
  "next": "Dad plays the whole trip on the iPad ... Then the boardwalk.",
  "facts": [{ "icon": "⏱️", "value": "4-5 min", "label": "from the fork to the splash" }],
  "related": [{ "label": "← Thailand plan", "href": "../thailand.md" }],
  "sections": [
    { "id": "toy", "title": "The toy", "icon": "🍌", "lede": "optional one line under the heading", "blocks": [ ... ] },
    { "id": "tech", "title": "Tech plan", "icon": "🛠️", "for": "build", "group": "For the builder", "blocks": [ ... ] }
  ]
}
```

- `status.tone` and chip colors: `pink`, `lav`, `mint`, `gold`, `peach`, `grey`.
- Section `id`: lower-case-with-dashes, unique (it's the `#anchor`). `group` starts a heading in the table of contents.
- Text fields take inline Markdown: `**bold**`, `*em*`, `` `code` ``, `[text](href)`; `PR #123` links itself.
  `md` fields also take paragraphs (a blank line, `\n\n`) and `- ` lists (two spaces per level).
- Items with a body (cards, rungs, build steps, log entries, callouts) take any of `md`, `items` (a list: strings, or
  `{ "text", "items" }` to nest) and `blocks` (nested blocks). Most also take `tag` (a chip, string or list), `status`
  (`done`, `next`, `doing`, `todo`, `dropped`, `plan`), `date` and `pr` (a number or a list).
- Any block can have a `title` (a small heading above it).

| Block | Fields | Use it for |
|---|---|---|
| `text` | `md` | a short paragraph |
| `list` | `items`, `ordered?` | bullets |
| `callout` | `tone` (`note`, `dad`, `open`, `warn`, `done`), `icon?`, `title?`, body | the core verb, a rule, “changed from the plan”, a warning |
| `flow` | `rows: [{ label?, steps: [{ icon, label, note?, hl?, dim? }] }]` | the shape of it: the path through the activity, one row per route |
| `cards` | `items: [{ icon?, title, ...body }]`, `wide?` | parallel things: places, elephants, stops, the fun check |
| `ladder` | `items: [{ n?, icon?, title, ...body }]` | how the verb deepens (1, 2, 3, then a side verb with `n: "🍕"`) |
| `chips` | `items: [{ icon, label, md? }]` | things to poke, silly moments |
| `bars` | `series: [{ key, label, unit? }]`, `items: [{ label, note?, <key>: n or [min, max] }]` | time and touches per section |
| `table` | `head`, `rows` (cells are inline Markdown), `total?` (last row bold) | params, comparisons |
| `sections` | `base` (`#/world/<place>/<activity>/`), `items: [{ n?, id, name, query?, reads?, status? }]` | the tappable section links |
| `build` | `items: [{ n, title, status, date?, pr?, ...body }]` | the build plan as a tracker (the hero's progress bar counts these) |
| `log` | `items: [{ title, date, status, pr?, summary, open?, ...body }]` | what's built, one fold-out per PR, newest last |
| `qa` | `items: [{ q, a }]` answered, `[{ q, why }]` open | Dad's answers, still open |
| `code` | `text` | a file tree |
| `details` | `summary`, body, `open?` | detail Dad can skip (the same numbers as a table) |
| `image` | `src` (relative to the page), `alt`, `caption?` | a lineup or reference picture that's in the repo |

## Steps

**A new plan:** copy `planning/viewer/template.html` next to the other plans (fix its two `../../viewer/` paths if it
sits at another depth; `check` says so), fill in the JSON (follow
`planning/around-the-world/ACTIVITY-TEMPLATE.md` for what an activity plan must answer), then:
```
node scripts/plan.mjs check
open <the page>          # look at it: the hero, the flow, the ladder, the links
```

**After a gate** (a greybox, the look, the full loop): in the same PR, mark the build step `done` with its date and PR,
set the next one to `next`, add a `log` entry (what's built, “Changed from the plan” as a `warn` callout, known small
things), update the hero's `status`, `next` and `updated`, and add the new sections to the `sections` block. Then
`node scripts/plan.mjs check`.

**Converting a Markdown plan:** read it whole, then map it: pitch and next step to the hero; Dad's answers to `qa`;
ASCII diagrams to `flow`; numbers tables to `bars` (keep the table in a `details`); "how it deepens" to `ladder`;
pokes and silly moments to `chips`; sections tables to `sections` (check `sections.ts` for which exist; the rest are
`todo`); the build plan to `build`; each "built so far" entry to a `log` entry; builder detail to `for: "build"`
sections. Delete the `.md`, and point every reference at the `.html` (`grep -rn "<name>.md"`: AGENTS.md, other plans,
code comments). Run `node scripts/plan.mjs md <file>` and compare it with the old Markdown: nothing should be missing.

**In the PR:** a changed plan gets a 📋 link in the PR body's “Test this” block, to the page on the PR preview
(`.../pr-preview/pr-<N>/planning/...`). Dad reads plans on the iPad too.
