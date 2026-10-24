# I Spy: a shelf of I Spy books

Kaylee loves I Spy. Home has an **I Spy** tile (under Around the World) that opens a shelf (`#/ispy`) of I Spy books.
Each book is a folder in `src/ispy/<book>/` (`meta.ts` + `Book.tsx`, found automatically by `src/ispy/registry.ts`),
runs in the shell's game frame (🏠 goes back to the shelf, stars at the top, the trophy ceremony at the end), and has
deep links like an activity: `#/ispy/<book>/<section>?<state>` (`src/ispy/sections.ts`, the same idea as
`src/world/kit/sections.ts`). Spoken lines live in each book's `lines.ts`; `node scripts/world-voice-lines.mjs` writes
its `voice-lines.json`. Art goes in `art/source/ispy/<book>/` and `npm run art -- ispy` makes the webps.

## Book 1: Sparkly I Spy (`sparkly-abc`, built 2026-10-23)

After Webber Books' *I Spy for Girls: A Fun Guessing Game for 3-5 Year Olds* (ISBN 9781914047039): each puzzle is a
letter of the alphabet, the child finds the character, animal or object that begins with it, then turns the page to
check. Our version keeps that rhythm and makes it touchable:

- **Find page** (`page?letter=B&n=1`): Sparkle says "I spy something beginning with B!" A big "B b" card (tap it to
  hear it again) and Sparkle sit beside a page of pictures. Tap a picture that isn't it and it wiggles, shows its own
  letter and says it ("Cupcake starts with C!"): a wrong guess is a little lesson, never an "oops". Tap the empty page
  and a spy-glass ring pops where she looked. Stuck for 8 s: the answer wiggles and Sparkle says "Look, Kaylee!
  Something is wiggling!"; after 16 s it also grows and glows.
- **Reveal** (`found?letter=B`): the page flips like a book to "B is for butterfly!": the picture dances (tap it to
  make it hop and say its name), the word is written with its first letter in pink, and a curled page corner (or a
  swipe left) turns to the next page.
- **Eight pages a sitting, busier each time**: 3, 4, 4, 5, 6, 6, 7, then 8 pictures (`PAGE_SIZES` in `items.ts`).
  Letters she has never found come first, so the whole alphabet comes round over three or four sittings; the cover and
  the shelf show every letter she has found in pink.
- **End** (`end?found=A,B,...`): everything she found hops in a row, "You found them all, Kaylee!", then the shell's
  trophy ceremony (KAYLEE, **I Spy Star**).
- 26 pictures, one per letter (apple, butterfly, cupcake, dolphin, elephant, flamingo, gift, heart, ice cream,
  jellyfish, kitten, lollipop, mermaid, necklace, owl, puppy, queen, rainbow, strawberry, teddy bear, unicorn, violin,
  wand, xylophone, yo-yo, zebra). The other pictures on a page are other letters' answers, but never ones that start
  with the same sound (cupcake, kitten, queen; xylophone, zebra) or look alike (lollipop, yo-yo, wand): `CLASHES`.

Touches per sitting: 8 answers + the wrong guesses and pokes (usually 2-4 per page) + 8 page turns, about 25-40 in
2-3 minutes. Talk: one ~2 s line per page plus the reveal line.

## What's next

- Dad plays it on the iPad: are 8 pages the right length? Is 8 pictures on the last page hard enough (or too hard)?
- More books on the shelf, one per PR, e.g. a **busy-scene** book (find 5 things hidden in one big picture: a pink
  bedroom, a beach, a toy shop), a **colors** book ("I spy something pink!"), a **counting** book ("I spy three
  stars"), or an animals book. Each is a new folder in `src/ispy/`.
- Ideas for this book: a spy-glass she drags over the page to look closer; lower-case-only pages later in a sitting;
  a sticker for each letter she finds.
