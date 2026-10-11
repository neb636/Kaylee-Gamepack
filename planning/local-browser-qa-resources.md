# Local browser QA resource plan

Date: 2026-10-11

Status: planned, not implemented. This document records the agreed approach for a later implementation PR.

## Background and motivation

Dad uses an 8 GB MacBook Neo and Orca to run two or three AI agents concurrently. The machine slows down during concurrent browser automation and visual QA. CPU usage usually stays below 40%, according to Dad, which makes sustained overall CPU saturation less likely; it does not rule out a busy browser thread or delays from memory pressure and swapping.

The Activity Monitor screenshot supplied during planning showed approximately:

| Visible processes | Combined reported memory |
| --- | ---: |
| Four `chrome-headless-shell` processes | 1.4 GB |
| Chrome GPU process | 1.03 GB |
| Three main Orca processes | 1.05 GB |
| Five Node processes | 1.3 GB |

These are partial screenshot totals, not a complete memory accounting or proof of which processes caused the slowdown. A later read-only check showed about 1.3 GB of swap in use. Multiple browser processes are normal and do not by themselves establish a leak. Memory Pressure during an actual slowdown is the more useful diagnostic than memory totals alone ([Apple's guidance](https://support.apple.com/guide/activity-monitor/view-memory-usage-actmntr1004/mac)).

Browser contention can also weaken QA evidence. Functional checks can time out; screenshots can catch incomplete states; motion captures can miss short reactions. The current motion script captures screenshots as fast as possible within a fixed wall-clock interval, then builds a GIF with uniformly spaced frames. A slow machine can reduce frame count and distort apparent motion. Pacing measurements of browser responsiveness can include host delays, although spoken-duration calculations based on recorded clip lengths are less affected. Increasing timeouts alone does not restore missing frames.

The scripts already run their scenarios sequentially, but separate agents and workspaces can each launch a browser. Playwright test workers also start their own browsers ([Playwright parallelism documentation](https://playwright.dev/docs/test-parallel)). At planning time, `playwright.config.ts` has no worker limit, and the WebKit tap-around suite explicitly runs countries in parallel.

Main branch through `da726bd` already improved QA scope: small changes skip QA agents, activity-prefix filters and section links enable focused review, and CI runs sharded WebKit tap-around coverage. Keep those improvements. CI exception coverage does not replace visual, motion, pacing, or real iPad review.

The aim is to preserve concurrent coding while limiting local browser concurrency. Changing agent runners would remove some Orca overhead but would leave browsers, Node processes, and builds consuming memory. Browser coordination is the first intervention; no fixed memory reduction is promised.

Dad initially asked to consider `~/repos/new-start`, then explicitly narrowed this work to Kaylee's Gamepack. That other repository is excluded. Dad chose to cover both scripts and interactive QA, using a managed Playwright CLI workflow for interactive sessions.

## Summary and scope

Allow coding agents to work concurrently, while running **one managed browser job at a time across all Gamepack workspaces on this Mac**. Set local Playwright tests to one worker.

Include scripted tests, visual QA, and interactive QA through the installed Playwright CLI. Leave `new-start`, Orca itself, and application rendering unchanged. This is infrastructure work: scripts, test configuration, and agent instructions are in scope despite the game-building rule that normally restricts edits to a game folder.

## Implementation

### Shared browser queue

- Add repo-managed tooling at `scripts/browser-queue.mjs`, using Node's built-in APIs and no new dependencies.
- Use one background coordinator with a Unix socket and state under `~/.cache/kaylee-gamepack/browser-queue/`. All checkouts use this same location.
- Queue requests in arrival order. Display the active job's workspace, label, and elapsed time while callers wait.
- Acquire the slot **before starting a browser or QA preview server**. Waiting jobs must not launch either.
- Provide these commands:
  - `run -- <command> [args...]`: queue and execute a scripted job, preserving arguments, output, and exit status.
  - `status`: show the active job and waiting requests.
  - `browser begin`: queue an interactive session and return its session token.
  - `browser <token> <playwright-cli command> [args...]`: operate that session.
  - `browser end <token>`: close its browser and release the slot.
- Nested managed commands inherit a coordinator-validated ownership token instead of acquiring the slot again.
- Cancel disconnected waiting requests. On job failure or interruption, terminate the job's process group and finish cleanup before handing off the slot.
- Recover stale coordinator state conservatively: clean up recorded queue-owned jobs and sessions before accepting new work. Never terminate unrelated Chrome, Orca, or agent processes.

### Scripted QA and worker limits

- Route `npm run test` and `npm run tap-around` through the queue, retaining their Chromium and WebKit project selection. `npm run check` continues to invoke the queued test command.
- Add an entry-point guard to the screenshot, motion, pacing, and Sparkle QA scripts so existing `node scripts/qa-*.mjs` commands automatically queue themselves. Acquire before creating or clearing output files.
- Put browser, context, and owned preview-server cleanup in `finally` blocks, including failure paths.
- In `playwright.config.ts`, set `workers: process.env.CI ? undefined : 1`. Explicit command-line worker overrides remain supported.
- Bypass queueing in CI; retain its existing project selection and sharding.
- Queue browser work only. Builds, typechecks, voice generation, and art processing remain outside this queue.

### Interactive browser sessions

- Use the already installed `playwright-cli`; do not install or upgrade packages.
- Give each managed session a unique CLI session name. Route its commands through the coordinator and hold the slot for the entire session, including pauses between commands.
- Permit one browser session and one live page per interactive job. Reject extra-tab commands; navigate the existing page instead.
- Close and release sessions after **10 minutes without a command**. Do not expire a command while it is running.
- Provide a `browser <token> keepalive` command for longer screenshot or code review.
- On explicit completion, expiry, or command failure requiring shutdown, close that specific session before releasing the slot. Never use blanket `close-all` or `kill-all`.
- Update `AGENTS.md` and layout-QA instructions to use these commands, close sessions promptly, and retain the recently added activity filters.
- Document that direct browser APIs, unmanaged CLI commands, and Orca's embedded browser bypass this cooperative queue. This does not intercept every browser on the machine.

## Validation and acceptance criteria

- Add focused queue tests using lightweight child processes: exclusivity, arrival order, shared state across working directories, cancellation, nested ownership, exit-code propagation, interruption, and stale-state recovery.
- Verify that two scripted requests from separate Gamepack workspaces never overlap and the waiting request starts no preview server.
- Verify that an interactive session blocks scripted QA until closed, rejects another page, and closes on inactivity. Use a shortened timeout in tests.
- Confirm local Playwright defaults to one worker and CI retains its existing behavior.
- Run typecheck, build, queued smoke tests, and one focused WebKit screenshot run. Check cleanup after an intentionally failed job.
- Compare Activity Monitor during concurrent requests before and after; report observed memory changes without promising a fixed reduction.
- Passing means the managed paths enforce one browser job, cleanup permits the next queued job, existing QA commands and arguments still work, and CI concurrency is unaffected. It does not establish game smoothness on an iPad.

## Delivery and assumptions

- The installed Node and Playwright CLI are prerequisites; show an actionable error if the CLI is unavailable.
- This coordinates managed Gamepack jobs across workspaces, not every browser on the machine. Existing unmanaged sessions need to be closed separately.
- The scope is concurrency and worker limits. Improved motion sampling, deterministic screenshot readiness, remote full QA, and renderer optimization are separate follow-up work.
- Commit the implementation and open a ready-for-review PR using the `open-pr` skill, assigned to `neb636`, with terminal verification steps for the queue and a preview link for the representative QA screen.
