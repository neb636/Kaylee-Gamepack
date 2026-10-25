# Making a 3D character from a picture (Thailand)

How we turn a family member into a modelled 3D toy: concept picture → Tripo3D mesh → split in Blender → loaded as the
same rig the code-built characters use. Kaylee's unicorn was the first (2026-10-25). Follow this for the next one so
nobody has to re-decide the same things.

The old way (every character built from code shapes in `characters/animal.ts`) still works and is still the fallback.
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
3. **Pivots as empties**, with the meshes parented under them (keep their world transforms):

```
kaylee (root, at the feet, facing glTF +Z)
└─ body
   ├─ body_mesh            (dress + legs)
   ├─ head  @ neck         hair_mesh, face_mesh, ear_L, ear_R, braid*
   │  └─ eyes @ eye center eye_L, eye_R
   ├─ armL  @ left shoulder  (three.js -x, like animal.ts)
   ├─ armR  @ right shoulder (+x)
   └─ tail  @ tail root
```

4. Test a pose (raise an arm, tilt the head, swing the tail) and render it to check the pivots.
5. Export the GLB (`+Y up`, selection only, no animations) and save the `.blend` next to it.

Kaylee's numbers (Blender meters, Z up, front −Y, 1.0 tall): neck (0, −0.04, 0.44), shoulders (±0.11, −0.04, 0.40),
tail root (0.016, 0.077, 0.22), eyes (0, −0.222, 0.588). Files: `kaylee-rig.glb` and `kaylee-rig.blend`.

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
  caps at the shoulder cut get no ink, so the sleeve reads as one piece.
- **Blink:** Tripo paints the eye into the face texture and sculpts a glossy dome over it, so squashing `eyes` shows
  the painted eye through. `Rig.blink` (optional, used by `FaceLife`) lets the model draw its own blink: a cream lid
  grows down over each eye.
- **Arms vs. big hair:** a chibi with shoulder-length hair hides an arm raised out to the side. Each arm swings in a
  plane turned forward (`ARM_TILT`: a tilted frame around the pivot, the opposite turn inside), so the rest pose is
  unchanged and waves and cheers come up in front of her. The wai's hands don't meet yet.
- **Mouth:** Kaylee never talks, so the painted smile stays. A talking character needs the mouth painted out of the
  texture and the code mouth (`talk`) placed on the face.
- **Try it:** the lab entry `kaylee-toy` (`#/world/characters/kaylee-toy?lineup=kaylee,kaylee-toy`) shows it next
  to the code-built Kaylee. It isn't used in the game yet: Dad decides after trying it.

## Open questions

- A GLB of a family member is OK in this repo (Dad, 2026-10-25); photos never are.
- The wai with tilted arms; the painted mouth (a little toothy close up, with dark ticks at its corners: paint them
  out of the texture).
- Legs as their own pivots for a proper walk cycle (none of the code-built characters has them yet).
