---
name: playtest
description: Check-in 3 of the toy loop. Set up Kaylee's ten-minute playtest for Dad, then turn his screen recording and notes into findings and fixes. Use before a toy's check-in 3, and whenever Dad sends a video or notes of Kaylee playing (any toy, any time).
---

# Playtest: Kaylee decides what's fun

Only a five-year-old's hands can say whether a toy is fun. Toy studios for young children (Toca Boca, Sago) watch
kids with each prototype and read what they **do**, not what they say. Dad watches; you do the analysis.

## 1. Before: what Dad gets (one line on the review page)

At check-in 3 the toy is playable: bright, voiced, its core verb working, every section linked, the robot numbers
passing (`docs/qa.md`). The review page's top line for Dad:

> **Hand her the iPad at [the toy's link], say as little as you can, and screen-record with the mic on** (Control
> Center: hold the record button, turn on Microphone). If she asks what to do: "I don't know, what do you think?" Send
> me the video when she's done, or tell me what you saw.

Make that link open the toy from its start on the PR preview (`links` in `review/review.json`). Don't ask him to fill
in a form.

## 2. After: from a recording to findings

Recordings and photos of Kaylee **never** go in this repo (it's public). Keep them where Dad put them: a private
folder on the Mac (`~/repos/KayleeGamepack-planning-assets/playtests/<date>-<toy>/`) or the chat's upload. Work in a
scratch folder outside the repo, and delete your scratch copies when you're done.

1. **Her words:** `ffmpeg -i rec.mov -vn -ac 1 -ar 16000 rec.wav`, then transcribe with OpenAI (`OPENAI_API_KEY`, the
   same key as the voices; `gpt-4o-transcribe` or `whisper-1`) with timestamps. Separate her voice from the game's
   lines (the game's are in `lines.ts`).
2. **What she did:** a frame every 2 seconds plus a frame at each of her words, as contact sheets
   (`ffmpeg ... -vf "fps=1/2,scale=480:-2,tile=4x3"`). Match the scenes to the toy's sections.
3. **Read it with the six signals** (from Sago Sago's playtests with preschoolers):
   - **Speedbumps:** she hesitates or looks for what to touch.
   - **Crossed wires:** she does something and the game does something else.
   - **Roadblocks:** something ends her play (stuck, lost, a dead end, the screen left).
   - **Questions:** she asks what to do or how.
   - **Engagement:** she keeps going on her own, or drifts away (and where).
   - **Emotion:** laughing, showing Dad, "again!", or a glassy stare.
   One session is one data point. Fix what's clearly broken; for taste calls, look for the same thing twice (this
   session and her play diary, or two sessions) before changing the toy.
4. **Write the findings** in the toy's notes (`planning/around-the-world/<country>/<toy>.md`), in words only: date,
   what she loved, where she got stuck or bored (section and moment), what she said (paraphrased), and the fixes you'll
   make. No quotes long enough to identify her, no pictures.

## 3. Then

Fix it, film the moments that changed, and go to check-in 4 (`ship` skill): the review page's top line says what
changed because of her playtest, with before-and-after clips where it helps. If she didn't like the toy at all,
don't polish it: say so plainly and offer to change the verb (new pitch cards) or shelve it.
