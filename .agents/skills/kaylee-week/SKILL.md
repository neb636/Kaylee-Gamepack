---
name: kaylee-week
description: Turn Kaylee's play diary (PostHog events from the main site) into a one-screen digest of her week - her favorites, where she quits, what she never opens - and what to build, fix or retire next. Use on Sundays, before pitching a new toy, or when Dad asks what she's been playing.
---

# Kaylee's week

What she replays, where she leaves, and what she never opens decide what we make next. Studios call it telemetry;
here it's one child's diary, so read it with care: a week is small, and a bad day is not a pattern.

## Needs (set up once; until then say so in one line and stop)

- `POSTHOG_PERSONAL_API_KEY`: a PostHog personal API key with **query read** only, in `.env` (Mac) or the cloud
  environment's secrets. Never the project token, never in git.
- `POSTHOG_PROJECT_ID`, and the API host: `https://us.posthog.com` for a US project (the ingestion host the app sends
  to, `us.i.posthog.com`, is not the API).

## The events (only the main site sends them)

| Event | Properties | From |
|---|---|---|
| `world_section_entered` / `world_section_left` | `place`, `activity`, `section`; on leave `seconds`, `taps`, `hints`, `why` (`next`, `away`, `hidden`) | `src/world/diary.ts` |
| `world_activity_started` / `world_activity_completed` | `place_id`, `activity_id` | `src/world/PlaceFrame.tsx` |
| `world_place_opened`, `world_trophy_won`, `world_shelf_play` | the place, or the shelf game and whether it's a favorite | `PlaceFrame.tsx`, `Shelf.tsx` |

## Ask

```
curl -s "$HOST/api/projects/$POSTHOG_PROJECT_ID/query/" -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY" \
  -H 'Content-Type: application/json' -d @query.json
```

with HogQL in `query.json` (`{"query": {"kind": "HogQLQuery", "query": "..."}}`), for the last 7 days:
- **Time and taps per toy:** `sum(properties.seconds)`, `sum(properties.taps)`, `count()` of `world_section_left`
  grouped by `place, activity`.
- **Replays:** `world_activity_started` per activity, against `world_activity_completed`.
- **Where she quits:** `world_section_left` with `why = 'away'` or `'hidden'`, grouped by section; the last section
  before she left an activity without its stamp.
- **Stuck:** sections with the most `hints` per minute. A soft sign: most hints follow a while with nothing touched,
  but a few are scripted (one plays right after she boards the boat), so compare a section with itself over weeks.
- **Never opened:** activities in the countries' `meta.ts` with no `world_activity_started` this week (and last).

## Tell Dad (one screen, no tables he has to read)

Three lines and a short list: her top three toys (time, replays), the one place she keeps quitting or getting stuck
(with the section link), what she hasn't opened in three weeks. Then your proposal: the next fix, the next pitch's
theme (built on a favorite), and what to retire from her map (the code stays; Supercell celebrates a kill because it
frees time for what works). If the cloud session has the Artifact tool, a small chart helps; otherwise a short message.
