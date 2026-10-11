// Pictures only Coco's Canyon Glide uses. `art` here is the country's shared pictures (../../art.ts) plus this activity's own,
// so a new activity adds its pictures in its own folder and never edits the shared art.ts.
import { art as shared } from '../../art'
import bgCanyonFar from '../../assets/bg-canyon-far.webp'
import canyonCactus from '../../assets/canyon-cactus.webp'
import canyonCloud from '../../assets/canyon-cloud.webp'
import coco from '../../assets/canyon-coco.webp'
import canyonPerched from '../../assets/canyon-condor-perched.webp'
import pluma from '../../assets/canyon-pluma.webp'
import canyonSwallow from '../../assets/canyon-swallow-nest.webp'
import canyonTourists from '../../assets/canyon-tourists.webp'
import canyonViscacha from '../../assets/canyon-viscacha.webp'

export const art = { ...shared, bgCanyonFar, canyonCactus, canyonCloud, canyonPerched, canyonSwallow, canyonTourists, canyonViscacha, coco, pluma }
