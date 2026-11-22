// The labs' scene picker: which game (the country's maps first, then its activities) and which section of it, the same
// in the camera lab and the feel lab. Picking opens that section's link with the lab's own params (`open`).
import type { ReactNode } from 'react'
import { HUB } from '../kit/sections'
import { findPlace, places, sectionsFor } from '../registry'
import { Field, Section, Select } from './ui'

/** The Game list's map entries: `map:<activity>` (an activity id never has a colon). */
const MAP = 'map:'

export interface SceneChoice {
  id: string
  name: string
  icon?: string
}

/** The games of a country that have sections (Home base first), as the pickers list them. */
export function gamesOf(place: string): SceneChoice[] {
  const meta = findPlace(place)?.meta
  if (!meta) return []
  return [...(sectionsFor(place, HUB) ? [{ id: HUB, name: 'Home base', icon: '🏠' }] : []), ...meta.activities, ...(meta.inTheWorks ?? [])].filter((a) => sectionsFor(place, a.id))
}

/** The game and section on screen: the address bar says which game; the section is the game's own once it has entered
 *  one (just after a pick the last game's is still there, so it only counts when the games match). */
export function sceneHere(place: string): { activity?: string; section?: string } {
  const page = location.hash.split('?')[0]
  const path = page.match(/^#\/world\/[^/]+\/([^/]+)(?:\/([^/]+))?/)
  const activity = path?.[1] ?? (page === `#/world/${place}` ? HUB : undefined)
  const live = window.__kayleeSection
  return { activity, section: live && live.place === place && live.activity === activity ? live.id : path?.[2] }
}

export function ScenePicker({
  place,
  open,
  mark,
  openPlace,
  children,
}: {
  place: string
  /** Opens a section (undefined: the game from its start). */
  open: (activity: string, section: string | undefined) => void
  /** A label to put before a game or a section in the lists (the feel lab marks where its knobs are). */
  mark?: (activity: string, section?: string) => string
  /** Opens another country's map (or its first game): the Country list shows only when this is given. */
  openPlace?: (place: string, activity: string, section: string | undefined) => void
  children?: ReactNode
}) {
  const here = sceneHere(place)
  const activities = gamesOf(place)
  const activity = here.activity ?? activities[0]?.id
  // The country's maps (a section called `map`: the Thailand map in Home base, the Nan map in the road trip) sit at
  // the top of the Game list, so a map is one pick away instead of buried in its game's sections.
  const maps = activities.flatMap((a) => {
    const s = sectionsFor(place, a.id)?.sections.find((x) => x.id === 'map')
    return s ? [{ id: `${MAP}${a.id}`, activity: a.id, name: s.name.split(':')[0] }] : []
  })
  const onMap = maps.find((m) => m.activity === activity && here.section === 'map')
  const tag = (a: string, s?: string) => mark?.(a, s) ?? ''
  const games = [
    ...maps.map((m) => ({ id: m.id, label: `${tag(m.activity, 'map')}🗺️ ${m.name}` })),
    ...activities.map((a) => ({ id: a.id, label: `${tag(a.id)}${a.icon ?? ''} ${a.name}` })),
  ]
  const sections = activity ? (sectionsFor(place, activity)?.sections ?? []) : []
  // Other countries with games to open (Canada, the Poles...), the way the Game list starts with a country's maps.
  const countries = openPlace ? places.filter((p) => gamesOf(p.meta.id).length > 0) : []
  const pickCountry = (id: string) => {
    const list = gamesOf(id)
    const withMap = list.find((a) => sectionsFor(id, a.id)?.sections.some((x) => x.id === 'map'))
    if (withMap) openPlace?.(id, withMap.id, 'map')
    else if (list[0]) openPlace?.(id, list[0].id, undefined)
  }
  return (
    <Section title="Scene">
      {countries.length > 1 && (
        <Field label={<span className="cl-sub">Country</span>}>
          <Select
            value={place}
            options={countries.map((p) => ({ id: p.meta.id, label: p.meta.name }))}
            label={<span className="cm-ellipsis">{findPlace(place)?.meta.name ?? place}</span>}
            align="right"
            onChange={pickCountry}
          />
        </Field>
      )}
      <Field label={<span className="cl-sub">Game</span>}>
        <Select
          value={onMap?.id ?? activity ?? ''}
          options={games}
          label={<span className="cm-ellipsis">{onMap ? `🗺️ ${onMap.name}` : (activities.find((a) => a.id === activity)?.name ?? 'Pick a game')}</span>}
          align="right"
          onChange={(id) => (id.startsWith(MAP) ? open(id.slice(MAP.length), 'map') : open(id, undefined))}
        />
      </Field>
      <Field label={<span className="cl-sub">Section</span>}>
        <Select
          value={here.section ?? ''}
          options={sections.map((s, i) => ({ id: s.id, label: `${activity ? tag(activity, s.id) : ''}${i + 1}. ${s.name}` }))}
          label={<span className="cm-ellipsis">{sections.find((s) => s.id === here.section)?.name ?? 'From the start'}</span>}
          align="right"
          onChange={(id) => activity && open(activity, id)}
        />
      </Field>
      {children}
    </Section>
  )
}
