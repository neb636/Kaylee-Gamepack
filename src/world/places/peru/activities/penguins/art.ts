// Pictures only Pepa's Penguin Cliff uses. `art` here is the country's shared pictures (../../art.ts) plus this activity's own,
// so a new activity adds its pictures in its own folder and never edits the shared art.ts.
import { art as shared } from '../../art'
import bgCoastTall from '../../assets/bg-coast-tall.webp'
import bgCoast from '../../assets/bg-coast.webp'
import boat from '../../assets/boat.webp'
import cliff from '../../assets/cliff-hd.webp'
import crab from '../../assets/crab.webp'
import tern from '../../assets/inca-tern.webp'
import jellyfish from '../../assets/jellyfish.webp'
import kelp from '../../assets/kelp.webp'
import pelicanFloat from '../../assets/pelican-float.webp'
import pelicanFly from '../../assets/pelican-fly.webp'
import pepa from '../../assets/pepa.webp'
import seaRock from '../../assets/sea-rock.webp'
import sock from '../../assets/seaweed-sock.webp'

export const art = { ...shared, bgCoast, bgCoastTall, boat, cliff, crab, jellyfish, kelp, pelicanFloat, pelicanFly, pepa, seaRock, sock, tern }
