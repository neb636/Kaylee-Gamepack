# Characters that feel alive

Kaylee's friends act out what happens and talk in their own voices; never just slide or bob a flat picture around.
How to build them in 3D and in 2D:

**One Sparkle everywhere:** `src/sdk/puppet/Sparkle.tsx` owns her design. Use the SDK `SparklePuppet` (or the square
`Mascot` adapter) in countries, games and menus; never copy her SVG or import an old pose image as a live character.
The reference pictures in `art/source/mascot/` are exported from that puppet. See `docs/sparkle.md`.

**In 3D (Thailand):** the characters are built from code, not generated pictures, except Kaylee herself: she is a
modelled vinyl toy made with Tripo3D and split in Blender into the same rig (`characters/model.ts`; the next family
members follow `docs/3d-characters.md`). `characters/looks.ts` describes each
family member (Dad picked them from `planning/around-the-world/thailand/lineup.webp`). The shared
`src/world/engine3d/characters/animal.ts` builds the chibi rig from any `Look` (body, head, arms, tail on their own pivots;
any 3D country's friends use it too), and `engine3d/characters/face.ts` blinks, looks at her and opens the
mouth with the character's voice. They wave, hop, sit, lie down, do a wai: ease into each pose (lean, settle), never
jump between poses in one frame. See them all at `#/world/thailand/hub/family` (`?who=<id>` for one on a turntable), or inspect any of them in the
**character lab** `#/world/characters/<id>` (`thailand/lab/`): poses, actions in slow motion with a filmstrip, every line
in their voice, Kaylee's outfits, lineups, light, lens and a PNG export, all kept in the URL. A new 3D character or
Look goes in `lab/catalog.ts` so it shows up there.

**In 2D:** a character is a **puppet**: layered SVG whose parts (ears, eyes, mouth, arms, tail) are separate `<g>` groups
that `usePuppet` moves every frame:
- **Idle life** comes free: breathing, random blinks, eyes that follow her finger (`f.look`), and a mouth that opens with
  the character's own voice (`f.mouth`, from the audio's loudness).
- **Actions** (`ref.current.play('hop')`, awaitable) use animation basics: anticipation (crouch before a jump), squash
  and stretch, follow-through (ears and tails on `spring()`s lag behind and flop), and settle.
- **Reactions to her hands**: `reach` + `f.near` lets a mouth open as she drags food close; tap a character for a giggle.

Build one: draw it in SVG in the same flat style as the art (5-unit dark outline, flat fills, blush, big eyes with
highlights), matching a generated reference picture of the character. Then look at it: screenshot it next to the
reference and fix what looks worse, and capture a filmstrip of each action (at least three rounds). Good examples:
`src/sdk/puppet/Sparkle.tsx`, `src/world/places/australia/puppets/` (Pip, Mama with a real pouch, Koko). Shared
kangaroo mechanics: `puppets/roo.ts`. Try puppets at `#/world/puppets` (buttons for every action and line; the 3D ones are at `#/world/characters`).
For secondary characters and critters, `<Buddy img=... voice=...>` gives a flat sprite breathing, squash-and-stretch
jumps, dances and a bounce in time with its voice, with no drawing needed.
