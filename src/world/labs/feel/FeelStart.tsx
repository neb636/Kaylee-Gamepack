// #/world?feel=1 (no country in the link): the feel lab opens on the first scene that has knobs, so the README needs one
// link, and the panel's Country, Game and Section lists take it from there.
import { useEffect } from 'react'
import { worldLink } from '../../../router'
import { places } from '../../registry'
import { firstScene } from '../ScenePicker'
import { TUNED } from './tuned.gen'

export default function FeelStart() {
  useEffect(() => {
    const place = places.find((p) => Object.keys(TUNED).some((k) => k.startsWith(`${p.meta.id}/`)))?.meta.id
    const first = place ? firstScene(place) : undefined
    if (place && first) location.replace(worldLink(place, first.activity, first.section, { feel: '1' }))
  }, [])
  return null
}
