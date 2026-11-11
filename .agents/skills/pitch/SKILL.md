---
name: pitch
description: Check-in 1 of the toy loop. Make three one-page pitch cards for the next toy (an activity, a trip stop, a rebuild) so the user picks one in three minutes instead of reading a plan. Use whenever the user asks for something new to be built, asks what to make next, or a toy is being rethought.
---

# Pitch cards: three visual choices

A studio's one-page design: a picture and a few words that make the idea obvious at a glance. The user picks one of three
on their phone. Picking from three is easier, and more honest, than saying yes to one.

## 1. Know what Kaylee loves now

Before you invent anything:
- Her play diary, if it's set up (`kaylee-week` skill): what she replays, where she quits, what she never opens.
- What the user told you about her lately, in this chat and in the country's notes (`planning/around-the-world/`).
- `docs/play-design.md` (the eight principles) and "What Kaylee told us" in `AGENTS.md`.

At least one pitch builds on something she already loves (she loved the haircut game, so the snowman became a
decorating game). The three differ in their **verb**, not just their theme: three ways to play, not three skins.

## 2. Make the cards

Put the three in `review/review.json` as `pitches` (the fields are at the top of `scripts/review.mjs`), with
`"checkIn": "1 of 4: pick"`, and run `node scripts/review.mjs`. Each card is:

- **A picture.** It carries the card. Locally, generate one concept image per card with Codex (`docs/art.md`: one
  image, the scene's camera, the app's style, no text in it) and save it in `review/pitch/`. In a cloud session
  without image generation, draw the scene as an SVG in the app's flat style (5-unit dark outlines, flat pastel
  fills), or for 3D, screenshot a quick toon mock-up of the place. A card without a picture isn't a pitch card.
- **Title** with the friend: "Snow Cones with Pip".
- **Her finger**, one line: the core verb as she does it ("tilt the syrup bottle and paint the ice").
- **How it grows**: three steps of the same verb, an emoji and two to five words each.
- **She learns** (by doing), **silly** (what odd play does), **why her** (a favorite, a wish, a gap in her week),
  each one line. **Size**: minutes (1.5 to 3) and touches (20 to 40).

Look at the page at phone width before the user does. If a card needs a scroll and a think to understand, cut words.

## 3. Show it to the user

- **Live in chat:** show the page (or the three pictures with their lines) and let them answer in a word.
- **Otherwise:** start the toy's branch (`<your GitHub login>/<toy>`), commit a stub of the toy notes, publish the page
  and open a **draft** PR (`ship` skill). The PR stays draft until check-in 4, so nothing merges early.

## 4. After they pick

Write the toy notes from `planning/around-the-world/ACTIVITY-TEMPLATE.md` (for agents; they won't read them) in
`planning/around-the-world/<country>/<toy>.md`, with their pick and anything they said, and start building on the same
branch. Family facts in a pitch (who comes, which animal) are the user's: ask, don't invent. No temples or Buddhas (rule 8).
