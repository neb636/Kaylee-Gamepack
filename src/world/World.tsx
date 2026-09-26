// Around the World: the shell section with the world map, the passport, the coloring book and every country.
import { ColoringBook } from './ColoringBook'
import { Passport } from './Passport'
import { PlaceFrame } from './PlaceFrame'
import { PuppetLab } from './PuppetLab'
import { WorldMap } from './WorldMap'
import './world.css'

export function World({ place, activity }: { place?: string; activity?: string }) {
  let screen
  if (place === 'passport') screen = <Passport />
  else if (place === 'puppets') screen = <PuppetLab only={activity} />
  else if (place === 'coloring') screen = <ColoringBook page={activity} />
  else if (place) screen = <PlaceFrame id={place} activity={activity} />
  else screen = <WorldMap />
  return (
    <div className="world" style={{ position: 'absolute', inset: 0 }}>
      {screen}
    </div>
  )
}
