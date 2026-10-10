# Peru art and camera contract

Generated with the built-in imagegen tool. PNG sources are scratch files in `art/source/world/peru/`; production WebP copies are in `assets/`.

Every prompt begins with the style prompt in `art/STYLE.md`: flat vector illustration for a five-year-old, rounded shapes, flat pink/lavender/mint/sky/peach/cream palette, thin dark details, no text, numbers, letters or watermark. `app-styling-inspiration-images/style-1.png` is the mood reference. Cover also references `art/source/mascot/wave.png` and Luna's generated reference.

## Prompts

- **luna.png:** One young alpaca girl, fluffy peach fleece, cream muzzle, large round dark eyes/highlights, pink blush, long upright ears with pink interiors, long neck, curly tuft, four short legs, no clothes or accessories. Camera locked to straight-on FRONT view at chest/eye level, orthographic elevation, symmetrical face/body, both ears visible, no top surfaces or 3/4 rotation. Isolated on pure white, no ground shadow, generous margin, centered at 75% of square. This image is the SVG puppet reference and animal sticker.
- **bg-andes.png:** Full-bleed 1536×1024 landscape, highland meadow near Cusco. Eye-level horizon in upper half, straight-on elevation; no overhead, isometric or top-down view. Lavender Andes above mint meadow, sky blue, cream clouds, pink flowers at outer edges. Lower-middle 60% calm and open for Luna and clothing. No characters, buildings or furniture; solid flat colors, no shading/airbrush.
- **cover.png:** Square full-bleed Cozy Andes cover, Luna in pink/lavender knitted hat (ears visible), pink scarf, mint jacket; Sparkle beside her. Mint meadow, lavender Andes, pink edge flowers. Both eye-level/front-facing, no overhead/isometric objects. Luna reference locks alpaca identity; mascot reference locks Sparkle identity; style image is mood only. No text/border.

## Clothes: identical drawing from tray to puppet

`puppets/Clothing.tsx` draws each garment once in a frontal SVG view. `Luna.tsx` nests these exact shapes in head/body layers, so perspective and proportion cannot change on placement. The warm hat fits between Luna's ears, scarf follows her neck, and jacket follows her body. The beach-hat distractor is also frontal, with no visible top ellipse.

The country hub is a separate SVG cartographic illustration. Its overhead geography is never composited as a prop in the eye-level activity scene.

Review the contact sheet and all first/helped/zip/dressed screenshots together. Compare Luna in the puppet lab with `assets/luna.webp`; inspect all eight actions in three filmstrip rounds.

The hub outline uses Natural Earth’s public-domain 1:110m country geometry (Peru), projected into a 600×700 viewBox with its aspect ratio preserved. Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson . Coming-soon discovery buttons sit around their region; the first playable pin sits near Cusco.
