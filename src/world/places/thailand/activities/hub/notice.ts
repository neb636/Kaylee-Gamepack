// Family members react to something new they can see in Kaylee's wardrobe look.
import type { Line } from '../../../../../sdk'
import { L } from '../../lines'
import { BARE, formatLook, PAINT_PARTS, type Style } from '../../characters/style'

type Kind = 'head' | 'face' | 'back' | 'outfit' | 'feet' | 'paint'
/** In the order they're noticed when nothing is newest. */
const ORDER: Kind[] = ['head', 'back', 'outfit', 'face', 'feet', 'paint']

/** What each person actually saw this visit. Shoes on the rack don't count. */
const seen = new Map<string, Style>()
let newest: { sig: string; kind: Kind } | null = null

/** The wardrobe changed her look: this is what's new about it. */
export function markNew(style: Style, kind: Kind) {
  newest = { sig: formatLook(style), kind }
}

/** Pick a real change since this relative last saw her. Taking something off shouldn't trigger praise for an old item. */
export function noticeLine(who: string, style: Style, shoesVisible: boolean): Line | null {
  const lines = L.wardrobe.notice[who]
  if (!lines) return null
  const before = seen.get(who) ?? BARE
  const on = { ...style.on }
  if (!shoesVisible) {
    if (before.on.feet) on.feet = before.on.feet
    else delete on.feet
  }
  seen.set(who, { ...style, on })
  const paintChanged = PAINT_PARTS.some((part) => style.paint[part] && style.paint[part] !== before.paint[part])
  const changed = (kind: Kind) => kind === 'paint' ? paintChanged : !!on[kind] && on[kind] !== before.on[kind]
  const preferred = newest?.sig === formatLook(style) ? newest.kind : null
  const kind = preferred && changed(preferred) ? preferred : ORDER.find(changed)
  if (!kind) return null
  const item = kind === 'paint' ? undefined : on[kind]
  return (item && L.wardrobe.noticeItem[who]?.[item]) || lines[kind]
}
