# China art style (add-on to `art/STYLE.md`)

China follows `art/STYLE.md` (flat, bold, rounded, no text, sprites on pure white, backgrounds named `scene*`/`bg*`)
with a **kawaii dumpling-sticker look** taken from `art/source/world/china/ref-kawaii.jpg`. Everything in China uses
it: generated scenes, props, Buddies, and the SVG puppets and dumplings drawn in code. One outline color and one
weight everywhere is what stops the puppets from looking pasted onto the backgrounds.

## The rules

- **Outline: warm brown `#6E3B24`**, never near-black. Rounded caps and joins, one even weight all around each shape
  (like a felt-tip sticker line). Inner details (pleats, smiles, fur tufts, roof tiles) use the same brown, a bit thinner.
  - Art prompts: "about 1% of the image width" for the main outline (~10 px on a 1024 px sprite, ~14 px on a 1536 px scene
    for near objects; far-away skyline shapes get a thinner line).
  - SVG puppets: `INK = '#6E3B24'` (`puppets/ink.ts`), outline about 1.3% of the character's height (5 units
    outside the fills on a 400-unit-tall viewBox), details ~3.5 units. Dumplings are small on screen, so theirs is
    chunkier (like the reference stickers, ~2.5% of their width).
- **Fills: flat cream and pastels.** Dough cream `#F7E7DA`. At most **one soft shade step** per shape, as a flat
  darker band on the bottom/away side (dough shade `#F2D2BE`); no gradients, no textures, no highlights beyond one small
  flat shine where it helps (a cooked dumpling, a lantern).
- **Blush: soft pink ovals `#F9C4C0`** on every face, a little below and outside the eyes.
- **Kawaii faces:** tiny dark-brown dot eyes (`#4A2616`) or closed arcs (happy `^ ^`, content `‿ ‿`), eyes set wide and
  low on the face, a small mouth between them (a thin smile arc, or an open D-shaped laugh with a pink tongue `#F28C8C`).
  No noses on dumplings; animal noses small and rounded.
- **Palette:** keep the base palette from `art/STYLE.md`, softened toward warm: pink `#FF8FB8`, hot pink `#FF4F9A`,
  lavender `#D9CCFF`/`#B9A6F5`, butter `#FBEA9A`, mint `#8FE3C8`, sky `#A8DCFF`, peach `#FFC2A8`, cream `#FFF7F0`,
  gold `#FFC83D`. China accents: lantern red `#E8504F` (a warm, slightly soft red, not fire-engine), jade `#7CCBA2`,
  dusk sky `#FFB8A8` → `#C9B3F0` (as flat bands, not a gradient).
- **Shapes:** chubby, soft, rounded corners on everything, even buildings and boats. Big simple silhouettes, few small
  details.
- **No text, letters, numbers or Chinese characters inside images** (no shop signs with writing, no lantern characters,
  no couplets with writing). Render 你好, 福 and every character as HTML/SVG text in the app.
- Respectful and real: real buildings, clothing and food drawn cute, never caricature.

## Prompt block (paste after the base style prompt from `art/STYLE.md`)

> CHINA ADD-ON (overrides the line color above): kawaii sticker style matching the attached dumpling reference.
> Outlines are warm chocolate brown #6E3B24 (never black or gray), one even rounded felt-tip weight around every shape,
> about 1% of the image width for near objects; inner details in the same brown, a little thinner. Flat cream and pastel
> fills (dough cream #F7E7DA), at most ONE soft flat shade band per shape (e.g. #F2D2BE at the bottom), no gradients,
> no textures. Faces: tiny dark-brown dot or happy-arc eyes set wide and low, soft pink blush ovals #F9C4C0, small smile.
> Everything chubby and rounded, even buildings and boats. Accents: lantern red #E8504F, jade #7CCBA2, gold #FFC83D,
> pink #FF8FB8. Absolutely no text, letters, numbers or Chinese characters anywhere (no signs, no writing on lanterns).

Attach for every China image: `art/source/world/china/ref-kawaii.jpg`, `app-styling-inspiration-images/style-1.png`,
and (from Stage 2 on) the approved style key `art/source/world/china/style-key.jpg`.
