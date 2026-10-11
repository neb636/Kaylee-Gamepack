// Pictures only Rosa's Rainy River uses. `art` here is the country's shared pictures (../../art.ts) plus this activity's own,
// so a new activity adds its pictures in its own folder and never edits the shared art.ts.
import { art as shared } from '../../art'
import bgAmazon from '../../assets/bg-amazon.webp'
import butterfly from '../../assets/butterfly.webp'
import canoe from '../../assets/canoe.webp'
import capybaraBaby from '../../assets/capybara-baby.webp'
import capybara from '../../assets/capybara.webp'
import fish from '../../assets/fish.webp'
import frog from '../../assets/frog.webp'
import macaw from '../../assets/macaw.webp'
import monkey from '../../assets/monkey.webp'
import rosa from '../../assets/rosa.webp'
import sloth from '../../assets/sloth.webp'
import toucan from '../../assets/toucan.webp'
import treeMonkey from '../../assets/tree-monkey-hd.webp'
import treeSloth from '../../assets/tree-sloth-hd.webp'

export const art = { ...shared, bgAmazon, butterfly, canoe, capybara, capybaraBaby, fish, frog, macaw, monkey, rosa, sloth, toucan, treeMonkey, treeSloth }
