// Snow on a Volcano's own sprites (generated with Codex, style per art/STYLE.md + ../../STYLE.md, cut out by
// `npm run art -- italy/etna-`). Kept here rather than in ../../art.ts so only this activity imports them.
// Every one is a straight-on side view, standing on the trail's ground line.
import chestnut from '../../assets/etna-chestnut-tree-hd.webp'
import crab from '../../assets/etna-crab.webp'
import farVolcano from '../../assets/etna-far-volcano-hd.webp'
import stand from '../../assets/etna-granita-stand-hd.webp'
import lavaRock from '../../assets/etna-lava-rock.webp'
import lemonTree from '../../assets/etna-lemon-tree-hd.webp'
import lemon from '../../assets/etna-lemon.webp'
import orange from '../../assets/etna-orange.webp'
import piglet from '../../assets/etna-piglet.webp'
import pine from '../../assets/etna-pine-snow-hd.webp'
import cactus from '../../assets/etna-prickly-pear.webp'
import gull from '../../assets/etna-seagull.webp'
import seal from '../../assets/etna-seal.webp'
import drift from '../../assets/etna-snowdrift.webp'
import umbrella from '../../assets/etna-umbrella.webp'
import cloud1 from '../../assets/venice-cloud-1.webp'
import cloud2 from '../../assets/venice-cloud-2.webp'

export const etnaArt = { chestnut, crab, farVolcano, stand, lavaRock, lemonTree, lemon, orange, piglet, pine, cactus, gull, seal, drift, umbrella, cloud1, cloud2 }

/** width / height of each picture (they're trimmed to their content). */
export const ASPECT = {
  chestnut: 1,
  crab: 1.316,
  farVolcano: 2.052,
  stand: 1.174,
  lavaRock: 1.365,
  lemonTree: 0.972,
  lemon: 1.18,
  orange: 0.934,
  piglet: 1.039,
  pine: 0.877,
  cactus: 0.939,
  gull: 1.106,
  seal: 1.051,
  drift: 1.515,
  umbrella: 1.006,
  cloud1: 2.51,
  cloud2: 1.501,
} as const

/** Where the granita stand's parts are, as shares of its height: the awning's lowest stripe, the window's top (just under
 *  the scallops), and the counter's top. Friends stand in the window; the awning and counter are drawn again over them. */
export const STAND_BANDS = { awning: 0.28, window: 0.31, counter: 0.545 } as const
