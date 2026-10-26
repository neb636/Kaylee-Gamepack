// The family notice her look (planning/around-the-world/thailand/wardrobe.html, "being seen"): the first time she walks
// up to someone in a new look they say so in their own voice ("Ooh, a crown, Kaylee!"), once per change. What they
// notice is the newest thing she changed (the wardrobe tells us: markNew), else the first thing she's wearing. Pure data
// and memory for the visit (no three.js): the house asks for the line when she taps someone.
import type { Line } from '../../../../../sdk'
import { L } from '../../lines'
import { formatLook, itemById, type Style } from '../../characters/style'

export type Kind = 'head' | 'face' | 'back' | 'outfit' | 'feet' | 'paint'
/** In the order they're noticed when nothing is newest. */
const ORDER: Kind[] = ['head', 'back', 'outfit', 'face', 'feet', 'paint']

/** What each person last noticed (the look's `formatLook`), this visit. */
const seen = new Map<string, string>()
let newest: { sig: string; kind: Kind; item?: string } | null = null

/** The wardrobe changed her look: this is what's new about it. */
export function markNew(style: Style, kind: Kind, item?: string) {
  newest = { sig: formatLook(style), kind, item }
}

function kindOf(style: Style): { kind: Kind; item?: string } | null {
  const sig = formatLook(style)
  if (newest?.sig === sig) return newest
  for (const k of ORDER) {
    if (k === 'paint' ? Object.keys(style.paint).length : style.on[k]) return { kind: k, item: k === 'paint' ? undefined : style.on[k] }
  }
  return null
}

/** What `who` says about her look now, once: null if it's today's Kaylee or they've already seen this look. */
export function noticeLine(who: string, style: Style): Line | null {
  const sig = formatLook(style)
  if (!sig || seen.get(who) === sig) return null
  const lines = L.wardrobe.notice[who]
  if (!lines) return null
  const k = kindOf(style)
  if (!k) return null
  seen.set(who, sig)
  // (Wings are Daddy's "Cool wings!"; a crown is Mommy's own line.)
  return (k.item && itemById(k.item) ? L.wardrobe.noticeItem[who]?.[k.item] : undefined) ?? lines[k.kind]
}

/** What a thing is, for the wardrobe's `markNew`. */
export const kindOfItem = (id: string): Kind | null => itemById(id)?.slot ?? null
