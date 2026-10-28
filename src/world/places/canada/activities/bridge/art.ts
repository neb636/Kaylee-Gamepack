// Animal Bridge's painted pieces (art/source/world/canada/bridge-*.png, cut out by `npm run art -- canada`), all drawn
// with the scene's one camera: straight-on and eye level, things standing on the ground line. Each has its picture's
// width / height, so the scene can stand it on a point at a given height. Plain data, no React.
import boulders from '../../assets/bridge-boulders.webp'
import bush from '../../assets/bridge-bush.webp'
import camera from '../../assets/bridge-camera.webp'
import carBack from '../../assets/bridge-car-back.webp'
import carFront from '../../assets/bridge-car-front.webp'
import eagle from '../../assets/bridge-eagle.webp'
import flower from '../../assets/bridge-flower.webp'
import goat from '../../assets/bridge-goat.webp'
import mountains from '../../assets/bridge-mountains-hd.webp'
import spruce2 from '../../assets/bridge-spruce-2.webp'
import spruce from '../../assets/bridge-spruce.webp'
import town from '../../assets/bridge-town.webp'
import truckBack from '../../assets/bridge-truck-back.webp'
import truckFront from '../../assets/bridge-truck-front.webp'
import wolf from '../../assets/bridge-wolf.webp'

export interface Pic {
  src: string
  /** Width over height. */
  aspect: number
}
const pic = (src: string, w: number, h: number): Pic => ({ src, aspect: w / h })

export const ART = {
  mountains: pic(mountains, 1024, 340),
  town: pic(town, 512, 122),
  spruce: pic(spruce, 188, 512),
  spruce2: pic(spruce2, 408, 512),
  bush: pic(bush, 512, 394),
  boulders: pic(boulders, 512, 216),
  camera: pic(camera, 186, 512),
  carFront: pic(carFront, 512, 424),
  carBack: pic(carBack, 512, 422),
  truckFront: pic(truckFront, 470, 512),
  truckBack: pic(truckBack, 431, 512),
  wolf: pic(wolf, 450, 512),
  goat: pic(goat, 512, 481),
  eagle: pic(eagle, 512, 335),
  flower: pic(flower, 477, 512),
} satisfies Record<string, Pic>
