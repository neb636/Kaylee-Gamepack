---
name: table-read
description: Check-in 2 of the toy loop, and any change to spoken lines. Turn a toy's lines into a table read Dad hears in about three minutes (every line in its real voice, in play order) with a script sheet, so no voice is final before he has heard it. Use whenever lines.ts or a cast.json changes, before a toy's check-in 2, and when Dad asks to hear a script.
---

# Table read: Dad hears the script before it's final

Studios read a script out loud before recording because a line that reads fine can sound wrong. Here the voices are
cheap to make, so record them as scratch early and let Dad hear them in context. Once he has heard a toy's lines,
they're locked: anything new or reworded goes in the next table read, marked as changed.

## 1. Make the lines worth hearing

- Write `lines.ts` in **play order**, with a comment above each line or list saying when it plays ("Sparkle, when the
  👆 shows", "each kid, as they sit down"). The table read plays the lines in the file's order and shows those
  comments, so the order and the comments are the script's stage directions.
- Record them: `node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs` (needs `OPENAI_API_KEY`: `.env`
  on the Mac, the environment's secret in a cloud session). A key that fails (401) is a blocker to tell Dad about in
  one line, not something to work around: unrecorded lines play silent on her iPad.

## 2. Make the table read and fix the easy flags

```
node scripts/table-read.mjs --list <place>              # the groups and their sizes
node scripts/table-read.mjs <place> <group>             # e.g. thailand mall.barber, canada taffy
node scripts/table-read.mjs --changed                   # every group this branch changed, new and reworded marked
```

It prints the flags. Fix these before Dad listens; don't ask him about them:
- **not recorded**: record it.
- **long** (over 3 s): shorten it, unless its slowness is the joke (a sleepy moose). Kaylee is five.
- **name**: her name in more than two or three lines of one toy is too many (rule 4). Keep it for the big moments.
- **rule 7**: temple or Buddha words. Take them out and tell Dad.
- **twice**: the same words in two places. Fine for a repeated hint; otherwise vary it.

Then listen yourself the only way you can: read the sheet top to bottom as the story she'll hear. Is the first touch
after at most two lines? Does Sparkle nag (`spendHint`)? Does each character sound like themselves?

## 3. Put it in front of Dad

Add it to `review/review.json` (`"tableReads": [["<place>", "<group>"]]`), build and publish the review page (`ship`
skill). The PR preview also adds the script sheet of every group of lines a PR changes, by itself (without audio:
the runner has no ffmpeg), so a script change never reaches main unseen. The audio is yours to record and publish.

His questions here are about taste only, at most three, answerable in a word: "Is the kids' 'Close enough!' funny or
mean?", "Too much Sparkle before the first snip?" When he answers, change the lines, re-record, and mark the toy notes:
"Script heard <date>: <what changed>".
