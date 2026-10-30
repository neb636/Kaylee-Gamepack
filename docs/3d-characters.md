# Making a 3D character from a picture (Thailand)

How we turn a family member into a modelled 3D toy: concept picture → Tripo3D mesh → split in Blender → loaded as the
same rig the code-built characters use. Kaylee's unicorn was the first (2026-10-25). Follow this for the next one so
nobody has to re-decide the same things.

**Local studio:** run `npm run studio` after `npm run studio:install`. Its **Character concepts** view generates one
concept, checks actual transparency, and refines the same character. Choose a workflow stage to prepare a Claude Code
or Codex prompt with the chosen concept path, this recipe and Dad’s notes. Tripo stays a manual handoff; Blender uses
the selected CLI’s configured MCP. [Studio setup](../workbench/README.md).

The old way (every character built from code shapes in `src/world/engine3d/characters/animal.ts`) still works and is still the fallback.
A modelled character must plug into the **same `Rig`** (body, head, arms, tail, eyes, mouth on their own pivots), so
every walk, wave, wai, outfit and voice keeps working.

## 1. The concept picture (Codex image gen, one image at a time)

**The look: a soft-vinyl designer art toy.** Smooth matte plastic, puffy rounded shapes, soft studio light, glossy
eyes, a very simple cute face. (Dad's style reference was a Pop Mart-style bunny figure. The earlier flat-illustration
look made Tripo meshes that read as "the same as before".)

What worked:
- **One image per run**, and iterate on the last picture: attach it and say "redraw the SAME character, change only
  X". Batches of 5 variations all came out nearly identical and were hard to steer.
- **Describe the person in words** (hair color and cut, eyes, a signature detail, their usual clothes). Attach a
  family photo only as a narrow reference ("ONLY a color reference for her hair"), never as the main input. Photos
  stay in `~/repos/KayleeGamepack-planning-assets/photos/family/<id>/`, never in this repo.
- **Normal-ish chibi proportions:** ask for the head to be about a third of her height. Copying a big-headed picture
  keeps the big head; say the proportion as a number.
- **One color per animal:** no mismatched pastel limbs (the style reference had them; Dad didn't want them).
- **The final picture is the Tripo input:** exactly front-facing, symmetrical **A-pose** (arms ~40° out with a clear
  gap to the body, legs apart with a gap), gentle smile, eyes forward, even lighting, no floor, no shadow.
- **Transparent background works:** say "WITH A TRANSPARENT BACKGROUND (the PNG must have a real alpha channel)".
  Codex writes a real alpha PNG. Check it (`sharp(...).metadata()` → `hasAlpha: true`).

Run it like the 2D art (see AGENTS.md "Art"), from a scratch folder:

```
codex exec -m gpt-6.1-sol -c model_reasoning_effort="low" --sandbox workspace-write --skip-git-repo-check \
  -C <scratch> -i <last-picture.png> - < prompt.md
```

Prompt skeleton (always include "Do not run git or gh; do not commit, push or open PRs"):

```
Generate ONE image with your image generation tool, WITH A TRANSPARENT BACKGROUND (real alpha channel).
Save it as a PNG at exactly: <path> (square 1024x1024)
The attached <last>.png is the character. Redraw it EXACTLY the same (pose, style, face, proportions, outfit,
framing) with one change: <the change>.
No text, no letters, no numbers.
```

Kaylee's pictures: `~/repos/KayleeGamepack-planning-assets/models/kaylee/` (the chosen one is `vinyl-5.png`:
a lilac unicorn, medium-brown hair with blunt bangs and lighter tips, a pink braided string, pink and mint streaks,
a pink striped t-shirt dress).

## 2. Tripo3D (mesh, then texture)

Upload the transparent A-pose picture. Settings:

| Setting | Pick | Why |
|---|---|---|
| Generate | **Smart Mesh** (not HD Model) | Clean low-poly game topology; HD is a dense sculpt |
| Topology | **Quad** | Bends cleanly at the joints and is easy to edit in Blender; three.js splits it into triangles anyway |
| Polycount | **5000** (same for all) | ≈ 10.7k triangles in the game: enough for chunky hair locks; ~10 family members on screen stay light on an iPad |
| Generations | **4** | They look alike in Tripo's viewer: compare them in Blender (step 3) |
| Privacy | private if the plan allows | It's a likeness of the family |
| Texture | texture **only the chosen mesh** | Texturing costs credits and doesn't change the shape |
| Texture resolution (export) | **1k** | Flat pastel colors look the same as 4k; 4k is ~64 MB of GPU memory each |
| Export format | **GLB** | One file with mesh + texture; three.js loads it natively |
| Rigging | **none** (not Tripo auto-rig, not Mixamo) | See step 4 |

Downloading a generated model is free; generating, texturing and rigging cost credits.

## 3. Pick the best of the 4 (Blender MCP)

Export all four untextured GLBs to `~/repos/KayleeGamepack-planning-assets/models/<id>/`, open Blender with the MCP
add-on, and have Claude import them side by side and render front / 3/4 / side / back (Workbench, cavity, outline).
Check, in order: the back (Tripo invents it: hair holes, a stray knob, a tail growing out of the hem), gaps at the
arms and legs, the small parts (horn, ears, braid), the side silhouette. The face matters least (step 5). Also count
triangles, loose pieces and non-manifold edges; fewer pieces is cleaner. Kaylee: model 2 won (open eyes, clean back,
fewest pieces).

## 4. Split it into the rig in Blender (no skeleton)

The family is animated by code moving rigid pivots, not by bones: `animal.ts` returns a `Rig` with `root`, `body`,
`head` (pivots at the neck), `armL`/`armR` (at the shoulders), `tail`, `mane`, `eyes` (squash `scale.y` to blink),
`mouth`/`talk`. So we cut the mesh into those pieces instead of skinning it. That reuses every animation, suits the
jointed vinyl-toy look and is cheaper on the iPad than skinning. (Mixamo expects human proportions and gives human
mocap; a Tripo auto-rig gives canned clips. Both would replace the code-driven poses and face.)

Steps (Claude does them through the Blender MCP):
1. Import the textured GLB, merge by distance, **separate by loose parts**. Tripo makes separate pieces for hair, face,
   body (dress + legs + arms), tail, ears, eyes and braid bits. Name them by size and position.
2. **Cut the arms off the body with a clean plane, then cap the holes.** Bisect the shoulder region at a plane
   (`bmesh.ops.bisect_plane`, Kaylee: x = ±0.105 above the armpit), flood-fill the faces from the hoof without crossing
   the cut, and separate them. Then fill the cut on both sides (`bmesh.ops.holes_fill`, UVs borrowed from a
   neighbouring face, triangulated). A cut along face centers leaves a jagged, open edge: frayed sleeves, and black
   holes from behind where you look into the inside of the outline hull.
   **Cut the legs off the same way**, with a level plane just under the skirt's hem (Kaylee: z = 0.17, the hem is at
   0.19-0.2), so the cut hides inside the skirt and the leg can swing forward to sit. A long-legged toy needs this:
   squashing the whole body to "sit" (what the code-built chibis do) looks like a squished picture. Kaylee's script:
   `split-legs.py` next to her `.blend` (Blender in the background: `Blender -b kaylee-rig.blend --python
   split-legs.py -- <out dir>`).
3. **Pivots as empties**, with the meshes parented under them (keep their world transforms):

```
kaylee (root, at the feet, facing glTF +Z)
└─ body
   ├─ body_mesh            (dress)
   ├─ head  @ neck         hair_mesh, face_mesh, ear_L, ear_R, braid*
   │  └─ eyes @ eye center eye_L, eye_R
   ├─ armL  @ left shoulder  (three.js -x, like animal.ts)
   ├─ armR  @ right shoulder (+x)
   ├─ legL  @ left hip      legL_mesh
   ├─ legR  @ right hip     legR_mesh
   └─ tail  @ tail root
```

4. Test a pose (raise an arm, tilt the head, swing the tail) and render it to check the pivots.
5. Export the GLB (`+Y up`, selection only, no animations, `export_image_format='JPEG'`, quality 92: the default
   re-encodes the texture as PNG and the file grows from ~0.8 to 1.9 MB) and save the `.blend` next to it.

Kaylee's numbers (Blender meters, Z up, front −Y, 1.0 tall): neck (0, −0.04, 0.44), shoulders (±0.11, −0.04, 0.40),
tail root (0.016, 0.077, 0.22), eyes (0, −0.222, 0.588), hips (±0.072, −0.03, 0.16). Files: `kaylee-rig.glb` and
`kaylee-rig.blend`.

## 5. Into the game (`characters/model.ts`)

- The GLB lives in `src/world/places/thailand/characters/models/` and loads lazily (`loadKayleeModel`, imported only
  from inside the Thailand folder, never from `meta.ts` / `sections.ts`). `buildModelRig` clones it and maps the named
  nodes onto a `Rig`, so `Avatar` (`new Avatar(bag, model)`) walks, poses, waves and wears outfits unchanged.
- **Look:** each mesh's texture goes on a `MeshToonMaterial` with the shared `toonGradient()`, and each piece gets an
  ink hull, except the eye domes, 1.35 px on screen (`PX` 1.8 × the game-wide `TUNE.outline` 0.75; 0.45 of the
  code-built toys' 3 px: Dad's pick, it hides most of what goes wrong at the bangs and shoulders). A scanned-looking mesh needs a **smoothed hull** (`smoothHull`): the plain `makeHull`
  zigzags along low-poly hair tips and bangs and blotches in tight creases. It takes the normals from a Taubin-smoothed
  copy but keeps the real surface, so the line hugs the shape (a smoothed hull sags below the bangs and leaves a gap
  between hair and line). Only the face stays smoothed and stood 4 mm off, which keeps ink out of its dimples and eye
  sockets. The hair's ink is drawn 7 mm nearer the camera (`outlineMaterial`'s `bias`), so the bangs keep their line
  where they rest on the forehead; more than that brings ink up through the inside of the hair from the side. The flat
  caps at the shoulder and hip cuts get no ink, so the sleeve reads as one piece.
- **Sitting, walking, lying** (`avatar.ts`): with `Rig.legL`/`legR`, sitting drops the body onto its hips (0.11 m) and
  eases the legs forward over the seat (-1.35 rad), the tail lifts clear of the seat, and each hop of the walk swings
  one leg forward. Her hair is deeper than her body, so lying flat would sink her head into the floor: `Rig.lie` tips
  her up 0.46 rad so the heels and the back of her hair both touch.
- **What she wears** (`model-wear.ts`, `Rig.wardrobe`): the code-built outfits are sized for a round head and a capsule
  torso, so on her they land wrong (sunglasses on the bangs, floaties on her tummy, a headband through her hair).
  Hats and sunglasses reuse `animal.ts`'s recipes with a `Frame` measured on her (the hair dome for hats, the face for
  the glasses); the scrub cap is her own dome (the code-built one is a whole squashed ball that bulges over her
  forehead), and the mongkhon is a tube through her hair's measured outline (`BAND_R`: not round, the bangs and the pink
  lock stand out in front), so it neither sinks into her hair nor goes under a lock. Sleeves start above the arm pivot:
  the shoulder cap rises 4 cm above it and the dress's own sleeve shows there otherwise. Clothes are turned on a lathe around her dress (`shell`), and arm and leg things sit along her own arm
  (47° out, in the forward-tilted arm frame) and on the leg pivots, so the trousers follow her legs when she sits.
  Measure a new model the same way (read the GLB's vertices: cross-sections of the body, the hair and the arm) before
  fitting its clothes.
- **Blink:** Tripo paints the eye into the face texture and sculpts a glossy dome over it, so squashing `eyes` shows
  the painted eye through. `Rig.blink` (optional, used by `FaceLife`) lets the model draw its own blink: a cream lid
  grows down over each eye.
- **Arms vs. big hair:** a chibi with shoulder-length hair hides an arm raised out to the side. Each arm swings in a
  plane turned forward (`ARM_TILT`: a tilted frame around the pivot, the opposite turn inside), so the rest pose is
  unchanged and waves and cheers come up in front of her. The wai's hands don't meet yet.
- **Mouth:** Kaylee never talks, so the painted smile stays. A talking character needs the mouth painted out of the
  texture and the code mouth (`talk`) placed on the face.
- **In the game (2026-10-25):** she is the game's Kaylee. Thailand's `Place.tsx` waits for the GLB (`kayleeReady()`,
  under PlaceFrame's Suspense: Sparkle thinking for a moment) before any scene builds, so every `new Avatar(bag)` and
  the mall's `Racer('kaylee')` get her from the first frame. If the GLB fails to load, the code-built Kaylee stands in.
- **What the scenes hang on her** goes through the rig, not code-built numbers: `Rig.hands` (a group at each hoof,
  turned like her body at rest: the rice farm's seedlings and sickle), `Rig.waist` (the boxing belt) and `Rig.front`
  (the dress's surface: the rice farm's mud). The grip socks (`mall-trip/socks.ts`) go on her leg pivots. A new
  modelled character fills these in the same way.
- **Try it:** the lab entry `kaylee` (`#/world/characters/kaylee?lineup=kaylee,kaylee-code`) shows her next to the
  code-built Kaylee (`kaylee-code`, kept to compare).

## Daddy, the second one (2026-10-30)

A mint unicorn in his brown tee and khaki shorts (`characters/dad-model.ts`, `models/dad.glb`, 1.7 m). What was
different from Kaylee, for the next family member:
- **Tripo split him already:** arms, legs, ears, brows, nose, horn, tail and the eye domes came as separate loose
  parts, so nothing was cut (no caps, `inkPieces(meshes, bag, null)`). Check the loose parts before cutting.
- **He talks, so the face was painted out** (`paint_out.py` next to `dad-rig.blend` in the planning assets, run inside
  Blender): it maps every texel of the face texture back to its 3D point, then fills the painted mouth and the eyes
  painted under the glossy domes from the skin around them (inside each dome's footprint everything, around it only
  what isn't mint or muzzle cream, so the muzzle's edge stays). The domes carry the eyes, so the usual squash of
  `eyes` blinks (no lids), and the code draws a smile on the muzzle (beads along the painted curve, each on the
  surface: a flat torus floats off where the face curves back) and the talking mouth.
- **Same arm turn as Kaylee** (`swingForward`, model.ts): his head is wider than his reach.
- **Sitting** (member.ts): a rig with legs drops its body onto its hips and swings the legs forward over the seat.
- Blender numbers (meters, Z up, front −Y, 1.0 tall): neck (0, −0.021, 0.462), shoulders (±0.175, −0.005, 0.405),
  hips (±0.086, −0.009, 0.175), eyes (0, −0.164, 0.627), tail root (0.022, 0.105, 0.23).
- `Member` builds him whenever the look is his own (`LOOKS.nick`); the lab's `nick-code` keeps the code-built Daddy
  to compare (`#/world/characters/nick?lineup=nick,nick-code`).
- **His pivots are in meters.** Unlike Kaylee's, his root isn't scaled: the pivots sit where they are at full size and
  only the meshes are scaled up, so head-local, body-local and leg-local positions are meters, as on the code-built
  rig. The trips already hang things on Daddy (the boat's sunglasses, the rice field's straw, the mall's socks, the
  ball on his horn, the cafe's cream, the vet's suds, the barber's strands), and they all land right that way.
- **Say where things go.** A head that isn't a ball doesn't fit the code-built formulas (`face.R`, `face.headY`), so
  the rig gives `spots` (eyes, brow, nose, crown, horn tip, the shin below the shorts), measured in Blender, and those
  consumers use them when they're there. His hair, brows and horn are their own (`hair`, `brows`, `horn`,
  `hairColors`): the barber swaps them for strands in his browns and its own horn, and the vet's suds puff the hair
  up (less than a mane, or it lifts off). A new modelled member: give the same fields, then check each trip that
  dresses them.

## Open questions

- A GLB of a family member is OK in this repo (Dad, 2026-10-25); photos never are.
- The wai with tilted arms; the painted mouth (a little toothy close up, with dark ticks at its corners: paint them
  out of the texture).
- The code-built characters still have no legs of their own (only the modelled Kaylee does).
