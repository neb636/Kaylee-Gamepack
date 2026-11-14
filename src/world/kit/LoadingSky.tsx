// The loading screen behind a place while it loads (PlaceFrame) and the cover over a Thailand toy map while its first
// frames go up (thailand/trip/MapCover.tsx): Sparkle thinking in the same blue-to-pink sky the toy maps float in
// (thailand/trip/sky.ts, skyTexture), with a few puffy clouds drifting by. Both screens draw this one component, and the
// clouds' drift is set by the wall clock, so the cut from the loading screen to the map's cover is invisible.
import type { CSSProperties, ReactNode } from 'react'

/** The toy maps' sky (skyTexture in thailand/trip/sky.ts): soft blue up top, lavender, pink down low. */
export const LOADING_SKY = 'linear-gradient(180deg, #BFE6FF 0%, #E4DCFF 55%, #FFD9EC 100%)'

/** One puffy cloud, drawn like the maps' toon clouds: white puffs, a lavender shade underneath, a soft dark outline. */
function Cloud({ width }: { width: string }) {
  return (
    <svg viewBox="0 0 200 100" style={{ width, display: 'block', overflow: 'visible' }} aria-hidden>
      <g stroke="#3A2E52" strokeOpacity={0.55} strokeWidth={3} strokeLinejoin="round">
        <path
          d="M30 84 C8 84 6 58 28 56 C26 34 54 26 66 42 C72 18 112 12 122 38 C134 24 164 30 160 54 C184 54 190 84 168 84 Z"
          fill="#FFFFFF"
        />
      </g>
      <path d="M22 80 C60 72 130 72 172 78 C168 83 160 84 150 84 L40 84 C32 84 26 83 22 80 Z" fill="#E6DDFB" />
      <ellipse cx="72" cy="46" rx="14" ry="7" fill="#FFFFFF" opacity={0.9} />
    </svg>
  )
}

/** Where each cloud flies: its height, size, how long one pass across takes, where in its pass it starts, how faint. */
const CLOUDS = [
  { top: '12%', width: 'clamp(110px, 24vmin, 220px)', dur: 70, phase: 0.1, opacity: 0.95 },
  { top: '26%', width: 'clamp(70px, 14vmin, 130px)', dur: 95, phase: 0.62, opacity: 0.8 },
  { top: '64%', width: 'clamp(130px, 28vmin, 260px)', dur: 82, phase: 0.38, opacity: 0.95 },
  { top: '80%', width: 'clamp(80px, 17vmin, 160px)', dur: 110, phase: 0.85, opacity: 0.85 },
]

const KEYFRAMES = `
@keyframes kgp-cloud-drift { from { transform: translateX(-30vw) } to { transform: translateX(110vw) } }
@media (prefers-reduced-motion: reduce) { .kgp-cloud { animation-play-state: paused !important } }
`

/** The loading sky filling its box, with `children` (Sparkle) centered over it. */
export function LoadingSky({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  // Seconds by the wall clock, so a cloud is in the same place on whichever screen draws it.
  const now = Date.now() / 1000
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: LOADING_SKY, display: 'grid', placeItems: 'center', ...style }}>
      <style>{KEYFRAMES}</style>
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="kgp-cloud"
          style={{
            position: 'absolute',
            left: 0,
            top: c.top,
            opacity: c.opacity,
            animation: `kgp-cloud-drift ${c.dur}s linear infinite`,
            animationDelay: `${-((now + c.phase * c.dur) % c.dur)}s`,
          }}
        >
          <Cloud width={c.width} />
        </div>
      ))}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  )
}
