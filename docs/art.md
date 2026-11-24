# Art

Follow `art/STYLE.md` exactly (style prompt, sprites on pure white, backgrounds named `scene*`/`cover*`/`bg*`).
Generate with Codex (the command is in `docs/building.md`, A country's folder). The game shelf is the exception: its banners and icons are SVG drawn by hand in the flat
travel-app look of `src/world/shelf/STYLE.md`, never generated (user feedback, 2026-10-30). In 3D, the world and the characters are built from code; generated pictures are for 2D
screens, stickers and character references.
- **The Poles' stickers are drawn by hand too** (user feedback, 2026-11-24: the generated ones looked cheesy): round SVG
  badges in the shelf's look, `src/world/places/poles/assets/sticker-*.svg`. They are the pictures on the globe's trail,
  the stamp screen and the passport. Check them with `node scripts/shelf-sheet.mjs icons <files>`.
- **Egypt's Nile is drawn by hand too** (user feedback, 2026-11-24: the generated felucca, lotus, hippo and palms looked
  tacky): its river layers, boat, flowers and water wheel are SVG in `src/world/places/egypt/activities/nile/`, the
  lotus is `egypt/Lotus.tsx`, and the hippo is a puppet (`puppets/Hippo.tsx`; her sticker `assets/hippo.svg` is a still
  of it). Scenery has soft flat tones and no outlines; what she plays with has the puppets' ink line.
- **Peru's Machu Picchu level is drawn by hand as well** (user feedback, 2026-11-24: the generated pictures looked
  cheesy and the drawn llama looked bad). The view behind (`bg-machu-picchu*.svg`), the critters, the crops and Tika's
  sticker are SVG files in the shelf's look (no dark outlines; a base, a shade and a light tone); the walls, the
  terraces and the opening picture are drawn in code (`activities/terraces/Scene.tsx`, `Opening.tsx`); Tika and her
  friends are one puppet in four coats (`puppets/Tika.tsx`). New art for that level follows the same look.
- **Luna's Fluffy Day is drawn by hand too** (user feedback, 2026-11-24: the generated pictures looked tacky and
  lame next to the redrawn Peru levels). The meadow is drawn in code (`activities/fluffy/Meadow.tsx`: it also backs
  Peru's opening story and Luna's balloon page), the wall, the clouds and the satchel in `activities/fluffy/Scene.tsx`;
  the tools, the basket, the pond, the cactus and the things stuck in Luna's fleece are SVG files in the shelf's look.
  Luna, Paco and Abuela Killa (`puppets/Alpaca.tsx`) wear Tika's head, face and ears in their own colors, with flat
  woolly puffs and no ink outline; Luna's sticker `assets/sticker-luna.svg` is a still of the puppet.
- Save to `art/source/world/<id>/<name>.png`, run `npm run art -- world`, then
  `node scripts/contact-sheet.mjs src/world/places/<id>/assets` and **look at** `/tmp/contact-sheet.png`.
  Regenerate anything that cut out badly.
- **White patches inside cutouts** (this keeps reaching PR review). The cutout only clears white that touches the
  picture's edge, so white the drawing encloses stays: between legs, inside a handle or ring, between railings. Run
  `node scripts/qa-art.mjs <place>` and open each sheet in `qa-output/art/`. Fix every hole (regenerate with the gap
  filled, name the image `*-hd` so big holes are cleared, or `node scripts/clear-white.mjs <sprite.webp> x,y`), and
  mark sprites whose white is real (eye whites, clouds) with `node scripts/qa-art.mjs --ok <sprite.webp> "eye whites"`.
- Never put text/letters/numbers inside generated images. Render them with HTML text instead (crisp and correct).
- **One camera per scene (this keeps going wrong, so check it every time).** Pick the camera before you generate
  anything, usually straight-on, eye-level side view (like a theater stage, things stand on a ground line). Every
  background, prop, sprite, puppet and SVG shown in that scene uses that same camera: no top-down plate, pizza or table
  in a side-view scene, no 3/4 building next to flat side-view props. Write the camera into every image prompt
  ("straight-on eye-level side view, no top-down, no 3/4, no perspective tilt"), then look at each sprite composited on
  its background (`node scripts/contact-sheet.mjs` and a real screenshot) and regenerate any that disagree.
