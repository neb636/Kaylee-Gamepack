// Sparkle's hot-air balloon on the home screen: the balloon is drawn here (flat shapes, no outlines, light from the
// top left, like the shelf's pictures), and the Sparkle in its basket is the living puppet, so she blinks, waves and
// cheers like everywhere else. `BalloonPicture` is the same balloon with nobody in it, for a button.
import { forwardRef, useId, type CSSProperties } from 'react'
import { SparklePuppet, type PuppetHandle } from '../../sdk'
import { starPoints } from '../kit/Flag'

const BALLOON = 'M100 8 C152 8 190 46 190 96 C190 138 152 160 128 188 L72 188 C48 160 10 138 10 96 C10 46 48 8 100 8Z'
const SVG = { viewBox: '0 0 200 310', 'aria-hidden': true, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', overflow: 'visible' } } as const
/** The balloon's box, wide to tall. */
export const BALLOON_RATIO = 200 / 310

const HEART = 'M0 4.6C-8.5 -3 -4.5 -8.6 0 -4.2 4.5 -8.6 8.5 -3 0 4.6Z'

/** The balloon above the basket: its ropes, the striped envelope with its sash and star, and the burner's rim. */
function Envelope({ clip }: { clip: string }) {
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d={BALLOON} />
        </clipPath>
      </defs>
      {/* ropes */}
      <path d="M77 192 L68 250 M123 192 L132 250" stroke="#c99266" strokeWidth="3.5" strokeLinecap="round" />
      {/* the balloon: pink with lavender stripes, a butter sash and a gold star */}
      <g clipPath={`url(#${clip})`}>
        <rect width="200" height="200" fill="#ff8fb8" />
        <path d="M100 0 C127 40 129 130 117 192 L83 192 C71 130 73 40 100 0Z" fill="#b9a6f5" />
        <path d="M0 0 H46 C24 60 30 130 60 192 H0Z M200 0 H154 C176 60 170 130 140 192 H200Z" fill="#b9a6f5" />
        <path d="M0 108 Q100 142 200 108 V125 Q100 159 0 125Z" fill="#fff3b0" />
        <path d="M152 0 C196 60 184 140 132 192 H200 V0Z" fill="#4b3a8c" opacity="0.13" />
        <ellipse cx="54" cy="58" rx="11" ry="27" transform="rotate(22 54 58)" fill="#fff" opacity="0.38" />
      </g>
      <polygon points={starPoints(100, 62, 25, 5, 0.5)} fill="#ffc83d" stroke="#ffc83d" strokeWidth="6" strokeLinejoin="round" />
      <rect x="70" y="184" width="60" height="11" rx="5.5" fill="#e7699c" />
    </>
  )
}

/** The basket: gold wicker, a pale rim and three hearts. */
function Basket() {
  return (
    <>
      <path d="M64 252 H136 L130 296 Q129 305 120 305 H80 Q71 305 70 296Z" fill="#ffc83d" />
      <path d="M114 252 H136 L130 296 Q129 305 120 305 H110Z" fill="#eba123" opacity="0.6" />
      <rect x="59" y="243" width="82" height="14" rx="7" fill="#ffe189" />
      <rect x="59" y="251" width="82" height="6" rx="3" fill="#eba123" opacity="0.35" />
      {[80, 100, 120].map((x) => (
        <path key={x} d={HEART} transform={`translate(${x} 281)`} fill="#ff4f9a" />
      ))}
    </>
  )
}

/** Fills its parent (give the parent a height and `aspect-ratio: BALLOON_RATIO`). `ref` is Sparkle: `play('cheer')`. */
export const SparkleBalloon = forwardRef<PuppetHandle>(function SparkleBalloon(_, ref) {
  const clip = useId()
  return (
    <>
      <svg {...SVG}>
        <Envelope clip={clip} />
      </svg>
      {/* Sparkle, from the basket's rim up; below the rim only what is inside the basket. */}
      <div style={{ position: 'absolute', left: '26.5%', top: '53.5%', height: '48.4%', aspectRatio: '836 / 960', clipPath: 'polygon(-60% -60%, 160% -60%, 160% 56%, 63% 56%, 61% 92%, 11% 92%, 9% 56%, -60% 56%)', pointerEvents: 'none' }}>
        <SparklePuppet ref={ref} height="100%" lookToward={0.4} />
      </div>
      <svg {...SVG}>
        {/* the basket, in front of her */}
        <Basket />
      </svg>
    </>
  )
})

/** The same balloon with nobody in it, as one small picture: a button's or a line's own drawing (a place's balloon trip). */
export function BalloonPicture({ style }: { style?: CSSProperties }) {
  const clip = useId()
  return (
    <svg viewBox="0 0 200 310" aria-hidden style={{ display: 'block', overflow: 'visible', ...style }}>
      <Envelope clip={clip} />
      <Basket />
    </svg>
  )
}
