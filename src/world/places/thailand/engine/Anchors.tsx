// Invisible buttons laid over the things in a 3D world, moved every frame by the world's placeAnchors(). They make small
// things easy to hit (never under 64 px, even on an iPhone), give everything a name for VoiceOver and for the tests,
// and show the family's name pills in the house (so Dad can tell who's who).
import { memo } from 'react'
import type { AnchorInput } from './View3D'

/** A DOM tap target over something in the scene. */
export interface AnchorInfo {
  id: string
  label: string
  /** Family members show their name. */
  name?: string
  thai?: string
  kind: 'thing' | 'family'
}

interface Props extends AnchorInput {
  list: AnchorInfo[]
  els: Map<string, HTMLElement>
}

export const Anchors = memo(function Anchors({ list, els, onDown, onKey, onHover }: Props) {
  return (
    <>
      {list.map((a) => (
        <button
          key={a.id}
          ref={(el) => {
            if (el) els.set(a.id, el)
            else els.delete(a.id)
          }}
          aria-label={a.label}
          data-anchor={a.id}
          onPointerDown={(e) => {
            e.preventDefault()
            onDown(e, a.id)
          }}
          // Keyboard (Enter/Space) only: pointer taps are handled on pointer up by the tracker.
          onClick={(e) => e.detail === 0 && onKey(a.id)}
          onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(a.id)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && onHover(null)}
          style={{ position: 'absolute', left: 0, top: 0, display: 'none', padding: 0, border: 'none', borderRadius: '50%', background: 'transparent', touchAction: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          {a.kind === 'family' && a.name && (
            <span style={{ position: 'absolute', left: '50%', top: 'var(--pill, 0px)', transform: 'translate(-50%, -105%)', whiteSpace: 'nowrap', background: 'rgba(255,255,255,.92)', color: 'var(--ink)', borderRadius: 999, padding: '3px 12px', fontSize: 'clamp(13px, 1.6vw, 18px)', fontWeight: 600, boxShadow: '0 2px 6px rgba(43,35,48,.18)', pointerEvents: 'none' }}>
              {a.name}
              {a.thai && <small style={{ marginLeft: 6, opacity: 0.7, fontFamily: 'Thonburi, "Noto Sans Thai", sans-serif' }}>{a.thai}</small>}
            </span>
          )}
        </button>
      ))}
    </>
  )
})
