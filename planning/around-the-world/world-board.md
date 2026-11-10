# The world board (#/world, the home map)

Dad, 2026-11-10: the painted 2D world map "isn't doing the game justice" next to Thailand; he liked the 3D Thailand
map and asked for the same approach, keeping each country's place and shape so Kaylee learns where they are, and with
room for new countries. (Three earlier redesigns were closed: the globe #282, the picture pins #341, the flat atlas #356.)

## What's built (`src/world/board/`)

- A toy board of the whole world on a tray (Miller's map, north always up), coasts from Natural Earth 1:50m
  (`scripts/world-board-land.mjs` writes `land.ts`).
- The continents are low pastel land, one color each; a tap says the continent's name (the old lines).
- Her eight countries stand up as cake-slice pieces in their real shapes (`pieces.ts`), each with a painted top and a
  few props. Italy, Thailand, Egypt and Peru are drawn a little bigger than life (`grow` in `places.ts`).
- A toy animal rides a pin at the top edge of each country, so the country shows in front of it (`animals.ts`):
  beaver, wolf cub, camel, panda, elephant, alpaca, kangaroo with joey, penguin; a polar bear on the Arctic ice is a
  second pin for the Poles. A finished country's pin wears a gold trophy.
- Tap an animal or its country: Sparkle names it, her balloon flies there, the camera swoops down, the country opens.
  The balloon waits over the last country she flew to (this session).
- Pokes: the whale, the orca, the sea turtle, the sailboat, the balloon, clouds, trees, the sea.
- A narrow screen shows part of the board bigger; a drag slides it sideways.
- `Travel.tsx` (the spinning globe) is gone: the flight happens on the board.

## Adding a country

One line in `places.ts` (country code, pin spot, animal, color, look), run the land script, model its animal in
`animals.ts` (until then it gets a gold star) and, if wanted, a look in `pieces.ts` and props in `toys.ts`.

## Next

- Dad's answers at check-in 2 (the look, bigger-than-life small countries, the animals).
- Sparkle facts for the sea toys (no lines yet: they only play), and more land animals if he wants the board busier.
- Kaylee's playtest: does she find the animals without the hint, does she slide the board on the phone.
