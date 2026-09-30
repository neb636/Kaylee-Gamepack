# Italy art style (add-on to `art/STYLE.md`)

Italy uses the same **kawaii sticker look** as China (see `src/world/places/china/STYLE.md`), so the puppets drawn in
code and the generated pictures look like one world: one warm brown outline everywhere, flat pastel fills, chubby
rounded shapes, and blushing kawaii faces. What changes is the palette and the mood: **sunny summer postcard Italy**.

## The rules

- **Outline: warm espresso brown `#6E3B24`**, never near-black. Rounded caps and joins, one even felt-tip weight
  (about 1% of the image width for near objects), inner details a bit thinner in the same brown.
  SVG puppets: `INK = '#6E3B24'` (`puppets/ink.ts`), outline 5 units on a 400-unit-tall viewBox, details ~3.5.
- **Fills: flat pastels**, at most one soft flat shade band per shape. No gradients, textures or photo detail.
- **Blush `#F9C4C0`**, tiny dark-brown dot eyes `#4A2616` or happy arcs, set wide and low, small smiles.
- **Palette:** the base palette (pink `#FF8FB8`, hot pink `#FF4F9A`, lavender `#D9CCFF`, butter `#FBEA9A`, mint
  `#8FE3C8`, sky `#A8DCFF`, peach `#FFC2A8`, cream `#FFF7F0`, gold `#FFC83D`) plus Italy accents:
  tomato red `#E8574F`, basil green `#5DBB7A`, olive `#9DAA4E`, terracotta `#E48A62`, lemon `#FFE27A`,
  Mediterranean blue `#6EC3E6`, dough cream `#F7E7DA` (shade `#F2D2BE`), crust gold `#F2B872`.
- **Mood:** warm sun, terracotta roofs, lemon trees, pastel houses, blue sea. Pizza red-white-green feels like the flag.
- **No text, letters or numbers** anywhere (no shop signs with writing, no labels on tomato cans).
- Respectful and real: real buildings, food and clothing drawn cute; no caricature.

## Prompt block (paste after the base style prompt from `art/STYLE.md`)

> ITALY ADD-ON (overrides the line color above): kawaii sticker style matching the attached references.
> Outlines are warm chocolate brown #6E3B24 (never black or gray), one even rounded felt-tip weight around every
> shape, about 1% of the image width for near objects; inner details in the same brown, a little thinner. Flat pastel
> fills, at most ONE soft flat shade band per shape, no gradients, no textures. Faces: tiny dark-brown dot or
> happy-arc eyes set wide and low, soft pink blush ovals #F9C4C0, small smile. Everything chubby and rounded, even
> buildings. Sunny summer-postcard Italy: tomato red #E8574F, basil green #5DBB7A, olive #9DAA4E, terracotta
> #E48A62, lemon #FFE27A, Mediterranean blue #6EC3E6, dough cream #F7E7DA, plus pink #FF8FB8 and lavender #D9CCFF.
> Absolutely no text, letters or numbers anywhere.

Attach for every Italy image: `art/source/world/italy/ref-style-key.jpg` (China's approved style key, for line and
fill style only, not content) and `app-styling-inspiration-images/style-1.png`.
