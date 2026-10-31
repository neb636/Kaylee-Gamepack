import { useState, type CSSProperties } from 'react'
import { sounds } from './sdk-internal'
import { unlockSounds } from '../sdk/sounds'
import './halloween.css'

/** Flat, friendly party cutouts; no scary faces, flashing lights, or extra instructions. */
export function HalloweenArt({ kind }: { kind: 'pumpkin' | 'ghost' | 'candy' }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" style={{ width: '100%', height: '100%', display: 'block' }}>
      <g stroke="#624773" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'pumpkin' ? <>
          <path d="M58 33 Q49 13 66 12 L69 32" fill="#a9dba9" />
          <path d="M66 28 Q87 12 93 29 Q78 39 66 28" fill="#c2e9b5" />
          <path d="M60 34 C16 19 6 58 18 88 Q30 110 60 103 Q91 110 104 87 C117 57 102 20 60 34Z" fill="#ffbc87" />
          <ellipse cx="60" cy="69" rx="25" ry="35" fill="#ffd0a3" />
          <path d="M34 61 Q40 54 46 61 M74 61 Q80 54 86 61 M48 78 Q60 91 72 78" fill="none" />
          <path d="M27 73 h9 M84 73 h9" stroke="#f38f9b" strokeWidth="6" />
        </> : kind === 'ghost' ? <>
          <path d="M26 99 V51 C26 9 94 9 94 51 V99 Q84 88 76 100 Q67 111 59 100 Q51 88 42 100 Q34 111 26 99Z" fill="#fff9f2" />
          <path d="M27 65 L13 76 M93 65 l14 11" fill="none" />
          <ellipse cx="46" cy="53" rx="4" ry="6" fill="#624773" stroke="none" />
          <ellipse cx="74" cy="53" rx="4" ry="6" fill="#624773" stroke="none" />
          <path d="M51 69 Q60 78 69 69" fill="none" />
          <path d="M34 65 h9 M77 65 h9" stroke="#ffb4cf" strokeWidth="6" />
          <path d="M36 26 l9 -8 8 10 -9 8Z M44 26 l19 -4 -1 13 -18 -4Z" fill="#dda6f2" />
        </> : <>
          <path d="M34 47 L12 31 15 60 8 84 36 74 M86 47 l22 -16 -3 29 7 24 -28 -10" fill="#d9b5f5" />
          <rect x="30" y="35" width="60" height="50" rx="20" fill="#ffb4cf" />
          <path d="M48 38 l-9 43 M68 38 l-9 43 M87 43 l-8 36" stroke="#fff5cf" strokeWidth="9" />
        </>}
      </g>
    </svg>
  )
}

/** Tap to swap the party guest, with the same familiar sound as the rest of the menu. */
export function HalloweenGuest({ kind, style }: { kind: 'pumpkin' | 'ghost'; style: CSSProperties }) {
  const [swapped, setSwapped] = useState(false)
  return <button className="halloween-guest" aria-label={kind === 'ghost' ? 'Friendly ghost' : 'Smiling pumpkin'} style={style} onClick={() => {
    unlockSounds()
    sounds.sparkle()
    setSwapped(!swapped)
  }}><span className="halloween-float"><HalloweenArt kind={swapped ? 'candy' : kind} /></span></button>
}

export function HalloweenBanner() {
  return <div className="halloween-banner" aria-hidden="true">
    <div className="halloween-moon" />
    <div className="halloween-bunting" />
    <span className="halloween-banner-pumpkin"><HalloweenArt kind="pumpkin" /></span>
    <span className="halloween-banner-ghost halloween-float"><HalloweenArt kind="ghost" /></span>
    <span className="halloween-banner-candy"><HalloweenArt kind="candy" /></span>
  </div>
}
