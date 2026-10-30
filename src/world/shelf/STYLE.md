# The game shelf's pictures

The world map's list view (`src/world/Shelf.tsx`, cards in `src/world/cards.ts`) shows every place as a **banner**
and every game as an **icon**. Both are SVG drawn by hand in code. Dad, 2026-10-30: no generated pictures here (the
generated thumbnails looked bad); follow the flat travel-app illustrations he picked as the style guide.

```
src/world/shelf/banners/<row>.svg          # favorites, house, mall, krabi, nan, or a country's id
src/world/shelf/icons/<place>/<card>.svg   # card = the part after "<place>/" in the game's key (thailand/vet -> icons/thailand/vet.svg)
src/world/shelf/icons/tea-party.svg, surprise.svg
```

A game without an icon still shows (its activity emoji on a pastel tile), but every new game and place gets its
picture in the same PR. Check them with `node scripts/shelf-sheet.mjs icons|banners [files]` (a contact sheet in
`qa-output/shelf/`), then on the real shelf (`#/world?view=list`).

## The look

Flat vector, like a modern travel app's illustrations: big simple rounded shapes, soft and friendly, cute rather than
realistic.

- **No outlines.** No dark contour around shapes. Form comes from **flat tones**: each material has a base, a shade
  and a light (table below). The shade is a clean shape on the side away from the light (the right face of a
  mountain, the lower half of a ball, the inside of a sail); the light is a small shape on the top-left edge.
- **Light from the top-left.** Shades fall right and down. Shades are cool (they lean lavender), never grey or black.
- **Gradients only on big areas**: the sky, water, hills, a tile's background, a glow. Two stops, gentle.
- **Depth by haze** (banners): far layers are lighter, paler and more lavender; near layers are richer.
- **Faces** (animals and friends only): eyes are ink (`#2b2330`) ovals with a white catchlight up and right, pink
  blush ovals (`#ff8fb8`, opacity 0.55), a small smile. Strokes are allowed only for little line details like these:
  mouths, whiskers, steam, rain, birds, sparkle rays (round caps, 2-4 units wide, ink or white).
- **Never**: text, letters or numbers (also no logos or brand names); temples or Buddha images; real people; known
  characters from films, shows or brands; Sparkle (she is a live puppet, `src/sdk/puppet/Sparkle.tsx`).
- **SVG hygiene**: `xmlns`, `viewBox`, a `<title>`, `<defs>` first, layers as commented `<g>`s. No `<text>`, no
  `<script>`, no `<image>` or links to other files, no `filter` (blur and drop shadows are slow on the iPad: use a
  gradient or a soft ellipse instead), no CSS animation (each one repaints the whole picture). Coordinates rounded to
  0.5. Icons stay under about 8 KB, banners under about 30 KB.

### Palette: base / shade / light

| Material | base | shade | light |
|---|---|---|---|
| Pink | `#ff8fb8` | `#e7699c` | `#ffc4da` |
| Hot pink | `#ff4f9a` | `#d8367f` | `#ff8fc0` |
| Lavender | `#b9a6f5` | `#937ee0` | `#ddd2ff` |
| Grape | `#8b78e6` | `#6a57c7` | `#b3a5f2` |
| Sky blue | `#8ccfff` | `#5fb0ea` | `#c9e9ff` |
| Turquoise water | `#3fc1cf` | `#1f9cb3` | `#8fe3ea` |
| Mint | `#8fe3c8` | `#5cc6a6` | `#c7f3e4` |
| Leaf green | `#73cf86` | `#48a96c` | `#aee8b7` |
| Pine green | `#3e9e78` | `#2b7a5f` | `#69c19a` |
| Butter | `#fbea9a` | `#ecc95c` | `#fff6cc` |
| Gold | `#ffc83d` | `#eba123` | `#ffe189` |
| Orange | `#ff9c57` | `#e57a35` | `#ffc595` |
| Red | `#ff6b6b` | `#d9485e` | `#ffa3a3` |
| Peach | `#ffc2a8` | `#f09d80` | `#ffe2d4` |
| Sand | `#f5dba8` | `#e3bb7a` | `#fdeecc` |
| Red rock / terracotta | `#e9785a` | `#c65a45` | `#f6a283` |
| Fur / wood brown | `#c99266` | `#a46e4b` | `#e5b78f` |
| Dark brown | `#8a5b3d` | `#6b432e` | `#b17d56` |
| Stone (lavender grey) | `#bcb6d6` | `#9790ba` | `#dedaf0` |
| Cream | `#fff7f0` | `#efdccd` | `#ffffff` |
| White (fur, snow, clouds) | `#ffffff` | `#e4ddf6` | |

Ink `#2b2330` for eyes and noses. Cast and contact shadows: `#4b3a8c` at opacity 0.12-0.18. Mix in your own in-between
tones when a subject needs them (a sunset, a mossy rock), keeping them soft and slightly cool in the shade.

## Icons (one per game)

`viewBox="0 0 120 120"`, square, full bleed. The shelf rounds the corners (about 26%) and adds a white rim, so keep the
subject inside a circle of radius 50 around the centre and nothing important near the corners.

- **One hero subject** a five-year-old who can't read knows at 90 px: big (about 70% of the tile), centred a little
  low (around 60,64). At most one or two small helpers (a banana, a heart, a sparkle). When the place is the point
  (the boat ride, the bay), a simple mini scene works: a horizon, water, one rock, the subject big in front.
- **Background**: one of the tile tints (a two-stop gradient, top to bottom), a soft white glow behind the subject
  (radial gradient), and a soft contact shadow under it. Neighbouring games in a row use different tints.

  | Tint | top | bottom |
  |---|---|---|
  | pink | `#ffe1ee` | `#ffbcd8` |
  | lavender | `#ece6ff` | `#cdbfff` |
  | sky | `#e0f2ff` | `#b3dbff` |
  | mint | `#ddf7ee` | `#a9e8d2` |
  | butter | `#fff5d1` | `#ffe08f` |
  | peach | `#ffe9de` | `#ffc3a8` |

- **Detail**: readable at 90 px, lovely at 400 px. About 15-60 shapes; nothing thinner than 2 units.
- Two games must not look alike (the Italian pizzeria and the Thai pizza; the two penguin games; the two races).

Start from this template:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <title>The vet</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ddf7ee"/><stop offset="1" stop-color="#a9e8d2"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.45" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="120" height="120" fill="url(#bg)"/>
  <circle cx="60" cy="56" r="50" fill="url(#glow)"/>
  <ellipse cx="60" cy="104" rx="32" ry="5.5" fill="#4b3a8c" opacity="0.14"/>
  <!-- the subject, back to front -->
</svg>
```

## Banners (one per place)

`viewBox="0 0 1200 450"` with `preserveAspectRatio="xMidYMid slice"`. The shelf shows it as wide as 4:1 (phones on
their side: the top and bottom 75 crop away) and as narrow as 2.6:1 (phones upright: about 15 off each side), and its
white sheet overlaps the bottom edge. So everything that names the place stays inside **x 60-1140, y 75-350**; above
is sky, below is foreground ground or water, and both may be cut.

- **Layers, back to front**: the sky (a soft gradient, lighter at the horizon, often a warm glow near the sun) → the
  sun (a pale disc and a wide soft glow) → clouds (round puffs with flat bottoms, white, slightly see-through) → the far
  layer (hazy, pale, lavender-tinted hills or skyline) → the middle (the landmark, hills with lit and shaded faces) →
  the near ground or water (richer colour, light streaks on water) → small life (birds as little curved strokes, a
  boat, an animal, flowers, sparkles).
- **One landmark or idea** per place, known at a glance (the karst islands and a longtail boat for Krabi), plus two or
  three supporting things. Leave calm areas: it sits behind a title and a row of icons.
- Skies: day `#9fd4fa` to `#e4f4ff`; the app's dreamy sky `#a9b4f7` to `#f7d6ee`; dusk `#b7a6f2` to `#ffc9b8`.
