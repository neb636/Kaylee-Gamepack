# Art

Follow `art/STYLE.md` exactly (style prompt, sprites on pure white, backgrounds named `scene*`/`cover*`/`bg*`).
Generate with Codex (the command is in `docs/building.md`, A country's folder). The game shelf is the exception: its banners and icons are SVG drawn by hand in the flat
travel-app look of `src/world/shelf/STYLE.md`, never generated (user feedback, 2026-10-30). In 3D, the world and the characters are built from code; generated pictures are for 2D
screens, stickers and character references.
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
