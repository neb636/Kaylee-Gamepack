// Pictures only Tika's Mountain Terraces uses. `art` here is the country's shared pictures (../../art.ts) plus this activity's own,
// so a new activity adds its pictures in its own folder and never edits the shared art.ts.
import { art as shared } from '../../art'
import bear from '../../assets/bear.webp'
import bgMpTall from '../../assets/bg-machu-picchu-tall.webp'
import bgMp from '../../assets/bg-machu-picchu.webp'
import bush from '../../assets/bush.webp'
import cockRock from '../../assets/cock-of-the-rock.webp'
import corn from '../../assets/corn.webp'
import cria from '../../assets/cria.webp'
import doorway from '../../assets/doorway.webp'
import kantuta from '../../assets/kantuta.webp'
import llamaBrown from '../../assets/llama-brown.webp'
import llamaGrey from '../../assets/llama-grey.webp'
import potatoPlant from '../../assets/potato-plant.webp'
import tika from '../../assets/tika.webp'
import viscacha from '../../assets/viscacha.webp'

export const art = { ...shared, bear, bgMp, bgMpTall, bush, cockRock, corn, cria, doorway, kantuta, llamaBrown, llamaGrey, potatoPlant, tika, viscacha }
