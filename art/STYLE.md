# Art style for Kaylee's Gamepack

Paste the **Style prompt** at the top of every image-generation request. Attach
`app-styling-inspiration-images/style-1.png` for mood. When the mascot appears,
attach `art/source/mascot/wave.png` as the character reference.

## Style prompt

> STYLE: flat vector illustration for a 5-year-old girl's iPad learning app. Bold simple
> rounded shapes, flat colors, no gradients, no textures, **no text, no letters, no numbers,
> no watermark**. Very thin dark (#2B2330) line details only where needed. Cute friendly faces
> where it makes sense (small dark dot or closed-arc happy eyes, pink blush cheeks).
> Palette: pink #FF8FB8, hot pink #FF4F9A, lavender #D9CCFF / #B9A6F5, butter yellow #FBEA9A,
> mint #8FE3C8, sky #A8DCFF, peach #FFC2A8, cream #FFF7F0, gold #FFC83D, ink #2B2330.
> The attached reference is only for mood/style (flat, bold, playful). Do not copy it.

### Sprites (things she taps or drags)

> Draw a single isolated object centered on a completely plain solid pure white (#FFFFFF)
> background with generous empty margin (object fills about 75% of the canvas), no ground shadow,
> no scenery, and a clear dark outline around the whole object so it can be cut out.
> The object itself must NOT be white or near-white (use cream #FFF7F0 or a pastel instead).
> Square 1024x1024.

### Backgrounds / covers (file name starts with `scene`, `cover` or `bg`)

> Full-bleed illustration, no white border. Scenes: 1536x1024 landscape, calm and uncluttered,
> keep the lower-middle area fairly empty so game items can sit on top. Covers: square 1024x1024.

## Mascot: Sparkle 🦄
A chubby kawaii pink unicorn: pink #FF8FB8 body, cream muzzle, hot-pink + lavender mane and tail,
white/ink striped horn, big dark eyes with tiny lashes, blush cheeks. Existing poses live in
`src/assets/mascot/` (wave, cheer, think) and are available through `<Mascot pose=... />`.
Always attach `art/source/mascot/wave.png` when drawing Sparkle in a new pose or scene.

## Pipeline
1. Save generated PNGs to `art/source/games/<game-id>/<name>.png` (scratch space, git-ignored; only the webp copies are committed).
2. `npm run art -- <game-id>` cuts out white backgrounds and writes `src/games/<game-id>/assets/<name>.webp`.
3. `node scripts/contact-sheet.mjs src/games/<game-id>/assets` makes `/tmp/contact-sheet.png`
   (sprites on purple). Look at it: if a sprite lost part of its body (white areas leaking), regenerate
   that sprite with a stronger outline or a non-white color.
