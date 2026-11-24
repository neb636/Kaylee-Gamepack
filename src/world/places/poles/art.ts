// The Poles' 2D pictures: the stickers, the friend's portrait, and the 2D scenes' layers. The stickers are round
// badges drawn by hand as SVG in the shelf's flat look (src/world/shelf/STYLE.md), not generated pictures.
import coatsGroundLate from './assets/bg-coats-ground-late.webp'
import coatsGroundSnow from './assets/bg-coats-ground-snow.webp'
import coatsGroundSummer from './assets/bg-coats-ground-summer.webp'
import coatsSkyLate from './assets/bg-coats-sky-late.webp'
import coatsSkySummer from './assets/bg-coats-sky-summer.webp'
import coatsSkyWinter from './assets/bg-coats-sky-winter.webp'
import friendPola from './assets/friend-pola.webp'
import stickerAdelie from './assets/sticker-adelie.svg'
import stickerBear from './assets/sticker-bear.svg'
import stickerChick from './assets/sticker-chick.svg'
import stickerFox from './assets/sticker-fox.svg'
import stickerNarwhal from './assets/sticker-narwhal.svg'

export const art = {
  // Snow Coats' tundra: the sky and far hills, and the near ground, in late summer, winter and summer.
  coats: {
    skyLate: coatsSkyLate,
    skyWinter: coatsSkyWinter,
    skySummer: coatsSkySummer,
    groundLate: coatsGroundLate,
    groundSnow: coatsGroundSnow,
    groundSummer: coatsGroundSummer,
  },
  friend: friendPola,
  stickers: {
    bear: stickerBear,
    fox: stickerFox,
    adelie: stickerAdelie,
    chick: stickerChick,
    narwhal: stickerNarwhal,
  },
}
