// How the world map moves. Tune them with ?feel=1 on #/world.
import { knobs } from '../kit/knobs'

export const FEEL = knobs('world-map', 'World map', 'src/world/map/feel.ts', {
  flight: { value: 1.8, min: 0.8, max: 4, step: 0.1, label: 'Balloon flight', unit: 's', note: 'from the last place she went to the country she tapped' },
  zoom: { value: 0.8, min: 0.3, max: 2, step: 0.1, label: 'Zoom in', unit: 's', note: 'how fast the map closes in on the country' },
  hold: { value: 0.9, min: 0.3, max: 3, step: 0.1, label: 'Look at it', unit: 's', note: 'how long the country stays on screen before she arrives' },
  shimmer: { value: 7, min: 2, max: 16, step: 0.5, label: 'Shimmer lap', unit: 's', note: 'how long the light takes to run around a country' },
  sparkle: { value: 14, min: 4, max: 40, step: 1, label: 'Shimmer length', unit: '%', note: 'how much of the outline is lit at once' },
  outline: { value: 12, min: 4, max: 28, step: 1, label: 'Outline width', unit: 'map units', note: '4000 units across the whole map' },
})
