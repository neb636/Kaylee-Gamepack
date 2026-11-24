// The Poles' 2D pictures: the stickers and the friend's portrait (Snow Coats' tundra is drawn in code:
// activities/coats/Tundra.tsx). The stickers are round
// badges drawn by hand as SVG in the shelf's flat look (src/world/shelf/STYLE.md), not generated pictures.
import friendPola from './assets/friend-pola.webp'
import stickerAdelie from './assets/sticker-adelie.svg'
import stickerBear from './assets/sticker-bear.svg'
import stickerChick from './assets/sticker-chick.svg'
import stickerFox from './assets/sticker-fox.svg'
import stickerNarwhal from './assets/sticker-narwhal.svg'

export const art = {
  friend: friendPola,
  stickers: {
    bear: stickerBear,
    fox: stickerFox,
    adelie: stickerAdelie,
    chick: stickerChick,
    narwhal: stickerNarwhal,
  },
}
