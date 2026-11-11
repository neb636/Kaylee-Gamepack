---
name: table-read
description: Check-in 2 of the toy loop, and any change to spoken lines. Turn a toy's lines into a table read the user hears in about three minutes (every line in its real voice, in play order) with a script sheet, so no voice is final before they have heard it. Use whenever lines.ts or a cast.json changes, before a toy's check-in 2, and when the user asks to hear a script.
---

# Table read: the user hears the script before it's final

Studios read a script out loud before recording because a line that reads fine can sound wrong. Here the voices are
cheap to make, so record them as scratch early and let the user hear them in context. Once they have heard a toy's lines,
they're locked: anything new or reworded goes in the next table read, marked as changed.

## 1. Make the lines worth hearing

- Write `lines.ts` in **play order**, with a comment above each line or list saying when it plays ("Sparkle, when the
  👆 shows", "each kid, as they sit down"). The table read plays the lines in the file's order and shows those
  comments, so the order and the comments are the script's stage directions.
- Record them: push the branch. The PR preview workflow's `voices` job records every line without a clip (the
  `OPENAI_API_KEY` repository secret), commits the clips and re-runs CI; then `git pull`. With a key in `.env` you
  can record locally instead. If the voices job fails (a bad key: 401), tell the user in one line: unrecorded lines play
  silent on her iPad.

## 2. Make the table read and fix the easy flags

```
node scripts/table-read.mjs --list <place>              # the groups and their sizes
node scripts/table-read.mjs <place> <group>             # e.g. thailand mall.barber, canada taffy
node scripts/table-read.mjs --changed                   # every group this branch changed, new and reworded marked
```

It prints the flags. Fix these before the user listens; don't ask them about them:
- **not recorded**: record it.
- **long** (over 3 s): shorten it, unless its slowness is the joke (a sleepy moose). Kaylee is five.
- **name**: her name in more than two or three lines of one toy is too many (rule 5). Keep it for the big moments.
- **rule 8**: temple or Buddha words. Take them out and tell the user.
- **touch only**: a gesture word (tap, finger, swipe, flick, rub) with no Mac version. If it's an instruction, wrap it in
  `onDevice(touch, mouse)` (design rule 2); a fact or a sound ("tap tap tap!") can stay.
- **twice**: the same words in two places. Fine for a repeated hint; otherwise vary it.

Then listen yourself the only way you can: read the sheet top to bottom as the story she'll hear. Is the first touch
after at most two lines? Does Sparkle nag (`spendHint`)? Does each character sound like themselves?

## 3. Put it in front of the user

Add it to `review/review.json` (`"tableReads": [["<place>", "<group>"]]`), build and publish the review page (`ship`
skill). The PR preview also adds the script sheet of every group of lines a PR changes, by itself (without audio:
the runner has no ffmpeg), so a script change never reaches main unseen. The audio is yours to record and publish.

Their questions here are about taste only, at most three, answerable in a word: "Is the kids' 'Close enough!' funny or
mean?", "Too much Sparkle before the first snip?" When they answer, change the lines, re-record, and mark the toy notes:
"Script heard <date>: <what changed>".
