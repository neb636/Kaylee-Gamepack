// The Poles' 2D pictures: the stickers and the friend's portrait (and the 2D scenes' layers, added with their art).
// Until the art is generated, everything shows the world map's globe.
import globe from '../../assets/globe.webp'
import coatsGroundLate from './assets/bg-coats-ground-late.webp'
import coatsGroundSnow from './assets/bg-coats-ground-snow.webp'
import coatsGroundSummer from './assets/bg-coats-ground-summer.webp'
import coatsSkyLate from './assets/bg-coats-sky-late.webp'
import coatsSkySummer from './assets/bg-coats-sky-summer.webp'
import coatsSkyWinter from './assets/bg-coats-sky-winter.webp'

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
  friend: globe,
  stickers: {
    bear: globe,
    fox: globe,
    adelie: globe,
    chick: globe,
    narwhal: globe,
  },
}
