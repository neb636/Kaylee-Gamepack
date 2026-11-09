// The little things on the world map (clouds, the whale, the animals). Each one is its own small drawing, placed by
// longitude and latitude, so adding or moving one never changes anything else. Keep them off her countries' outlines.
import { project, MAP_H, MAP_W } from './project'

const art = import.meta.glob<string>('./stickers/*.svg', { eager: true, import: 'default', query: '?no-inline' })
const src = (name: string) => art[`./stickers/${name}.svg`]

/** [drawing, longitude, latitude, width in % of the map, its height over its width] */
const STICKERS: [string, number, number, number, number][] = [
  ['cloud', -48, 28, 7.5, 0.58],
  ['cloud', -122, -18, 7.5, 0.58],
  ['cloud', 72, -40, 7.5, 0.58],
  ['cloud', 158, 16, 6.5, 0.58],
  ['whale', -30, -42, 8.5, 0.69],
  ['wave', -42, 20, 4, 0.25],
  ['wave', -128, 16, 4, 0.25],
  ['wave', 76, -8, 4, 0.25],
  ['wave', 8, -36, 4, 0.25],
  ['wave', -110, -44, 4, 0.25],
  ['wave', 160, -50, 4, 0.25],
  ['mountains', -111, 40, 6.5, 0.69],
  ['bear', -92, 37, 5.5, 0.83],
  ['pine', -82, 39, 2, 1.5],
  ['pine', 58, 62, 2.2, 1.5],
  ['pine', 95, 63, 2.2, 1.5],
  ['pine', 135, 60, 2.2, 1.5],
  ['pine', 25, 62, 2, 1.5],
  ['palm', -58, -6, 3.4, 1.25],
  ['palm', -2, 12, 3.4, 1.25],
  ['lion', 24, -8, 7, 0.92],
  ['acacia', 26, -24, 4.5, 0.9],
]

export const DECOR = STICKERS.map(([name, lon, lat, width, ratio], i) => {
  const [x, y] = project(lon, lat)
  return { key: `${name}${i}`, src: src(name), sea: name === 'cloud' || name === 'whale', left: (x / MAP_W) * 100 - width / 2, top: (y / MAP_H) * 100 - ((width * ratio) / 2) * (MAP_W / MAP_H), width }
})
