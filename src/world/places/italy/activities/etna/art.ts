// Snow on a Volcano's own sprites (generated with Codex, style per art/STYLE.md + ../../STYLE.md, cut out by
// `npm run art -- italy/etna-`). Kept here rather than in ../../art.ts so only this activity imports them.
// Every one is a straight-on side view, standing on the trail's ground line.
import chestnut from '../../assets/etna-chestnut-tree-hd.webp'
import crab from '../../assets/etna-crab.webp'
import farVolcano from '../../assets/etna-far-volcano-hd.webp'
import goat from '../../assets/etna-goat.webp'
import stand from '../../assets/etna-granita-stand-hd.webp'
import lavaRock from '../../assets/etna-lava-rock.webp'
import lemonTree from '../../assets/etna-lemon-tree-hd.webp'
import lemon from '../../assets/etna-lemon.webp'
import lizard from '../../assets/etna-lizard.webp'
import neviera from '../../assets/etna-neviera-hd.webp'
import orange from '../../assets/etna-orange.webp'
import pine from '../../assets/etna-pine-snow-hd.webp'
import cactus from '../../assets/etna-prickly-pear.webp'
import gull from '../../assets/etna-seagull.webp'
import seal from '../../assets/etna-seal.webp'
import drift from '../../assets/etna-snowdrift.webp'
import umbrella from '../../assets/etna-umbrella.webp'
import cloud1 from '../../assets/venice-cloud-1.webp'
import cloud2 from '../../assets/venice-cloud-2.webp'

export const etnaArt = { chestnut, crab, farVolcano, goat, stand, lavaRock, lemonTree, lemon, lizard, neviera, orange, pine, cactus, gull, seal, drift, umbrella, cloud1, cloud2 }

/** width / height of each picture (they're trimmed to their content). */
export const ASPECT = {
  chestnut: 1,
  crab: 1.316,
  farVolcano: 2.052,
  goat: 0.854,
  stand: 1.174,
  lavaRock: 1.365,
  lemonTree: 0.972,
  lemon: 1.18,
  lizard: 1.875,
  neviera: 1.054,
  orange: 0.934,
  pine: 0.877,
  cactus: 0.939,
  gull: 1.106,
  seal: 1.051,
  drift: 1.515,
  umbrella: 1.006,
  cloud1: 2.51,
  cloud2: 1.501,
} as const
