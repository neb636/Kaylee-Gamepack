# Her play data

The game is built for one child. What she does with it on her own (what she replays, where she quits, what she never
opens) decides what gets built, fixed or retired (`AGENTS.md`, rule 5). The user is the first tester and plays each
toy at check-in 3. Nobody records her: this page is the whole of what we learn from her play.

Only the main site sends anything (`src/posthog.ts`: `VITE_POSTHOG_ENABLED` is set only by `deploy.yml`). PR previews
and local builds send nothing. Read it with the PostHog MCP (`execute-sql`, the `query-*` tools).

## Who is who

| Who | How it's tagged | What it sends |
|---|---|---|
| **Her** (the target audience) | `target_audience: true` on every event, and one identified person, `target-audience`, for all her devices | everything |
| **The user** (a tester) | `?tester=1` once per browser (`?tester=0` undoes it), before the `#` or after it (`…/#/world?tester=1`); `tester: true` on its events | errors (`$exception`) and logs only |
| Anyone else on the public site | nothing | everything, untagged: leave it out |

- **Her iPad** was found in the data on 2026-11-21: an 820×1180 screen that reports itself as "Mac OS X / Safari"
  (iPads do), in Bangkok while she was there. Its two anonymous ids are listed in `src/posthog.ts`
  (`TARGET_AUDIENCE_IDS`): the iPad tags itself on its next launch. Before that, its events aren't tagged. Find them by
  `distinct_id`:
  - `01a17bf5-be61-78c6-96d3-10f54e01ffb3`: Safari, 2026-10-27 to 2026-11-12
  - `01a1d15e-e84c-7f57-9643-727cd59f29e5`: the Home Screen app, since 2026-11-12
- **A tester's browser goes quiet**: it sends no play at all, so it's absent from the data rather than tagged. Each
  browser keeps its own tag: Safari and Chrome each need `?tester=1` once. A Home Screen app has no address bar and
  its own storage, so the link can't reach it: find its anonymous id (`standalone: true` on `app_storage`, the screen
  size) and add it to `TESTER_IDS` in `src/posthog.ts`, which tags it on its next launch (`?tester=0` lasts one launch). Before
  2026-11-21 the tag existed only in builds from PR #502 on, and only before the `#`.
- **A new device of hers** (or the iPad after iOS cleared its storage): open `…/Kaylee-Gamepack/?target_audience=1`
  on it once, inside the Home Screen app if it's one (that app's storage is separate from Safari's). If it can't be
  reached, find its anonymous id the same way (screen size, place, lots of `world_section_*`, no `tester`) and add
  it to `TARGET_AUDIENCE_IDS`.

## The events

| Event | Properties | From |
|---|---|---|
| `world_section_entered` / `world_section_left` | `place`, `activity`, `section`; on leave `seconds`, `taps`, `hints`, `why` (`next`, `away`, `hidden`) | `src/world/diary.ts` |
| `world_activity_started` / `world_activity_completed` | `place_id`, `activity_id` (+ `stamp_count` on complete) | `src/world/PlaceFrame.tsx` |
| `world_place_opened`, `world_trophy_won` | `place_id` | `PlaceFrame.tsx` |
| `world_shelf_play` | `game`, `favorite` | `src/world/Shelf.tsx` |
| `game_restarted`, `chunk_reload` | | `src/shell/WinCeremony.tsx`, `src/chunk-recovery.ts` |
| `app_storage` | `usage_mb`, `quota_mb`, `persisted`, `standalone`, `offline_ready`, `cache_count` (once a day) | `src/storage-report.ts` |
| `offline_save_failed` | `error` (`QuotaExceededError` = out of space), `build`, `usage_mb`, `quota_mb` (once per build) | `src/offline/sw.js` → `register.ts` |
| `$pageview`, `$autocapture`, `$rageclick`, `$exception` | PostHog's own | posthog-js |

`hints` is a soft sign she was stuck: most hints come after a while with nothing touched, but a few are scripted (one
plays right after she boards the boat), so compare a section with itself over weeks. A `$rageclick` in a game is often
just fast play.

## Offline play

She often plays with no connection. Offline, every event goes into an outbox in localStorage (`src/analytics-outbox.ts`,
up to 2,000 events / 1.5 MB, oldest dropped first). It's sent to PostHog's `/batch/` when the iPad comes back online,
the app opens, or it comes back to the front. Each event keeps its own `uuid` (a resend never double-counts) and the
time it happened, and carries `$replayed_offline: true`. An event leaves the outbox only once PostHog answers with
its JSON, so a hotel wifi login page doesn't lose it. When timing between events matters (a session's length), it's
still right: the times are the real ones.

## Storage on her iPad

The offline copy of the game is the whole build, about 120 MB (2026-11-21). During an update a second copy downloads before the old
one is deleted (`src/offline/sw.js`), so for a few minutes it can take up to twice that. It isn't guaranteed. Since
iPadOS 17 a site's quota is up to about 60% of the disk, but when the iPad runs short, WebKit clears whole sites, least
recently used first, unless the site is in persistent mode (`navigator.storage.persist()`, asked for in
`src/offline/register.ts`; WebKit grants it by heuristics such as "it's a Home Screen app"). Clearing takes her
PostHog id and her stamps with it. `app_storage.persisted` says whether her iPad granted it. A page can't read the
iPad's free space; `offline_save_failed` is the real "out of space" signal.

## Feature flags

Unfinished work can merge to main behind a PostHog feature flag, so the live site doesn't show it yet (`src/flags.ts`).

- **Off by default.** On the live site a flag is on only when PostHog said so during this launch: off while offline, off until the flags have loaded and off if loading them failed. Her
  iPad, often offline, never sees something half-built.
- **On in previews.** Builds without PostHog (PR previews, local builds) show every flag as on, so a preview shows
  the work it's for. Only the main deploy has PostHog.
- **On for testers.** Each flag is released to the person property `tester = true`. Testers send no events, so a
  `?tester=1` browser sends `tester: true` with its flags request instead (`posthog.ts`, `setPersonPropertiesForFlags`).
- **A place behind a flag:** `featureFlag` in its `meta.ts` keeps it off the world map and the game shelf until the
  flag is on. Its links still work, and `?all=1` shows it anywhere.
- **Adding one:** create it in PostHog (key in kebab case, one release condition: person `tester` exactly `true`,
  100%), add the key to `FLAGS`, check it with `useFlag()`. **Shipping it:** delete the check and the `FLAGS`
  entry, then delete the flag in PostHog.

| Flag | Gates | Since |
|---|---|---|
| `new-canada-pin` | The new Canada (Maple's Team) on the world map and the game shelf | 2026-11-21 |

## Asking it

Every query needs a time range. Hers:

```sql
SELECT properties.place AS place, properties.activity AS activity,
       round(sum(toFloat(properties.seconds)) / 60, 1) AS minutes, sum(toInt(properties.taps)) AS taps, count() AS visits
FROM events
WHERE timestamp >= now() - INTERVAL 7 DAY
  AND event = 'world_section_left'
  AND (properties.target_audience = true
       OR distinct_id IN ('01a17bf5-be61-78c6-96d3-10f54e01ffb3', '01a1d15e-e84c-7f57-9643-727cd59f29e5'))
GROUP BY place, activity
ORDER BY minutes DESC
```

- **Favorites:** time, taps and replays (`world_activity_started` per activity, against `world_activity_completed`).
- **Where she quits:** `world_section_left` with `why = 'away'` or `'hidden'`, by section; the last section before she
  left an activity without its stamp.
- **Stuck:** sections with the most `hints` per minute.
- **Never opened:** activities in the countries' `meta.ts` with no `world_activity_started` in three weeks.

Read it with care: it's one child, a week is small, and a bad day is not a pattern. Say what it shows in a few lines,
with section links, when it shapes a pitch, a fix or something to retire.
