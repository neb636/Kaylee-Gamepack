// Pictures only Luna's Fluffy Day uses. `art` here is the country's shared pictures (../../art.ts) plus this activity's own,
// so a new activity adds its pictures in its own folder and never edits the shared art.ts.
import { art as shared } from '../../art'
import basket from '../../assets/basket.webp'
import beetle from '../../assets/beetle.webp'
import bgAndesTall from '../../assets/bg-andes-tall.webp'
import bird from '../../assets/bird.webp'
import brush from '../../assets/brush.webp'
import burr from '../../assets/burr.webp'
import cactus from '../../assets/cactus.webp'
import clippers from '../../assets/clippers.webp'
import dandelion from '../../assets/dandelion.webp'
import lizard from '../../assets/lizard.webp'
import pond from '../../assets/pond.webp'
import post from '../../assets/post.webp'
import stoneWall from '../../assets/stone-wall.webp'
import twig from '../../assets/twig.webp'

export const art = { ...shared, basket, beetle, bgAndesTall, bird, brush, burr, cactus, clippers, dandelion, lizard, pond, post, stoneWall, twig }
