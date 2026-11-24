// The level's opening picture, behind the story line: the mountainside after the storm. Three terrace walls climb
// into the clouds with stones missing, mud where the grass was, and the fallen stones lying in the meadow. It is
// built from the level's own pieces (the walls' stones and gaps, the terraces), so the opening looks like the game.
// The view at the top stays hidden in cloud: Machu Picchu is the surprise at the end.
import { useMemo } from 'react'
import { CLOUD, Hole, Ledge, SKY, Stone } from './Scene'
import { buildWall, roundedPath, WALLS } from './stones'

// The picture is 1440 x 1000 and always fills the screen from the bottom up (xMidYMax slice): an upright phone sees
// the middle 460 or so, so the mountain fills it; a wide screen sees the snow peaks either side.
const VIEW = 1440
const CX = VIEW / 2
/** Each wall: where its top edge sits, its size in the game's own units and how much smaller it is drawn. */
const TIERS = [
  { y: 643, w: 1210, s: 0.63, seed: 4021 },
  { y: 444, w: 1166, s: 0.52, seed: 911 },
  { y: 282, w: 1087, s: 0.42, seed: 77 },
]
const WALL_H = 250
const LEDGE_H = 110
const FLOWERS = [[90, 880, '#FFC4DA'], [250, 950, '#FFFFFF'], [420, 870, '#FFF6CC'], [560, 985, '#FFFFFF'], [760, 990, '#FFF6CC'], [900, 975, '#FF8FB8'], [1010, 880, '#FFFFFF'], [1180, 950, '#FFC4DA'], [1350, 870, '#FFF6CC']] as const
const CLOUDS = [[CX - 230, 96, 2.1], [CX + 40, 150, 1.25], [CX - 330, 200, 1.1], [80, 250, 1.5], [1130, 210, 1.7]] as const

export function TerracesOpening() {
  const walls = useMemo(() => TIERS.map((t, i) => buildWall(WALLS[i], t.w, WALL_H, t.seed, false)), [])
  const hill = useMemo(() => {
    const left: [number, number][] = [[CX - 620, 1100], [CX - 560, 800], [CX - 470, 640], [CX - 385, 440], [CX - 300, 280], [CX - 170, 170]]
    const pts = [...left, [CX, 140] as [number, number], ...left.map(([x, y]) => [VIEW - x, y] as [number, number]).reverse()]
    return roundedPath(pts.map(([x, y]) => ({ x, y })), 70)
  }, [])
  // The three stones that fell out of the lowest wall, lying in the meadow.
  const fallen = walls[0].filter((st) => st.gap)
  const lie = [
    { x: CX - 400, y: 900, rot: -10, s: 0.5 },
    { x: CX - 140, y: 958, rot: 4, s: 0.42 },
    { x: CX + 138, y: 956, rot: 96, s: 0.42 },
  ]
  return (
    <svg viewBox={`0 0 ${VIEW} 1000`} preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: SKY }}>
      <defs>
        <linearGradient id="terr-open-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
          <stop offset="0" stopColor={SKY} />
          <stop offset="0.45" stopColor="#C2E5FF" />
          <stop offset="0.8" stopColor="#FFEEDD" />
        </linearGradient>
        <radialGradient id="terr-open-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFF6CC" stopOpacity="0" />
        </radialGradient>
        <clipPath id="terr-open-hill">
          <path d={hill} />
        </clipPath>
      </defs>
      <rect x="-1000" y="0" width="3440" height="1000" fill="url(#terr-open-sky)" />
      <circle cx={CX - 440} cy="300" r="230" fill="url(#terr-open-sun)" />
      <circle cx={CX - 440} cy="300" r="44" fill="#FFFBE8" />

      {/* Far snow peaks either side, and the hazy hills in front of them. */}
      {[-1, 1].map((d) => (
        <g key={d} transform={d < 0 ? 'translate(150 0)' : `translate(${VIEW - 150} 0) scale(-1 1)`}>
          <path d="M-700 700L-560 380L-470 500L-330 300L-210 470L-90 330L40 520L150 410L290 700Z" fill="#D3D6F3" />
          <path d="M-330 300L-210 470L-290 700H-330ZM-90 330L40 520L-40 700H-90ZM-560 380L-470 500L-520 700H-560Z" fill="#BFC2EA" />
          <path d="M-330 300L-392 388L-362 374L-340 396L-316 372L-290 384L-280 370ZM-90 330L-140 400L-116 388L-96 408L-70 386L-48 392ZM-560 380L-604 480L-580 464L-560 484L-540 462L-524 468Z" fill="#fff" />
          <path d="M-700 640Q-520 500 -330 600Q-180 520 -20 610Q100 560 240 640V900H-700Z" fill="#A9D5C6" />
        </g>
      ))}

      {/* The mountainside. */}
      <path d={hill} fill="#62C47F" />
      <rect x={CX} y="0" width={VIEW} height="1100" fill="#4DB172" clipPath="url(#terr-open-hill)" />
      {[[CX - 440, 610, 44], [CX - 392, 640, 30], [CX - 350, 410, 38], [CX - 262, 250, 30]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#3E9E78" />
          <ellipse cx={x - r * 0.3} cy={y - r * 0.5} rx={r * 0.42} ry={r * 0.2} fill="#5CBD78" />
          <circle cx={VIEW - x} cy={y} r={r} fill="#3E9E78" />
          <ellipse cx={VIEW - x - r * 0.3} cy={y - r * 0.5} rx={r * 0.42} ry={r * 0.2} fill="#5CBD78" />
        </g>
      ))}

      {/* Three broken terrace walls, the highest first. */}
      {[2, 1, 0].map((i) => {
        const t = TIERS[i]
        return (
          <g key={i} transform={`translate(${CX - (t.w * t.s) / 2} ${t.y}) scale(${t.s})`}>
            {walls[i].map((st) => (st.gap ? <Hole key={st.id} st={st} glow={false} hover={false} active={false} /> : <Stone key={st.id} st={st} />))}
            <Ledge x={-26} y={-LEDGE_H} w={t.w + 52} h={LEDGE_H} green={false} seed={i + 21} />
          </g>
        )
      })}

      {/* The meadow in front, with the fallen stones. */}
      <path d="M-1000 800Q-200 770 200 796T600 790T1000 800T2000 790V1100H-1000Z" fill="#C9F2B6" />
      <path d="M-1000 808Q-200 778 200 804T600 798T1000 808T2000 798V1100H-1000Z" fill="#7FD487" />
      <path d="M-1000 880Q-100 850 300 872T1000 866T2000 880V1100H-1000Z" fill="#70C97D" />
      <path d={[[130, 850], [330, 846], [560, 852], [640, 990], [860, 850], [1090, 846], [1280, 930], [40, 980], [1400, 990]].map(([x, y]) => `M${x} ${y}l-9 -20M${x} ${y}l2 -26M${x} ${y}l12 -18`).join('')} fill="none" stroke="#56B673" strokeWidth="5" strokeLinecap="round" />
      {FLOWERS.map(([x, y, c], i) => (
        <g key={i}>
          {[0, 1, 2, 3, 4].map((p) => (
            <circle key={p} cx={x + Math.cos(((p * 72 - 90) * Math.PI) / 180) * 7} cy={y + Math.sin(((p * 72 - 90) * Math.PI) / 180) * 7} r="6" fill={c} />
          ))}
          <circle cx={x} cy={y} r="4.5" fill="#FFC83D" />
        </g>
      ))}
      {fallen.map((st, i) => (
        <g key={st.id} transform={`translate(${lie[i].x} ${lie[i].y}) rotate(${lie[i].rot}) scale(${lie[i].s}) translate(${-st.w / 2} ${-st.h / 2})`}>
          <Stone st={st} local />
        </g>
      ))}

      {/* Clouds hide the top of the mountain. */}
      {CLOUDS.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d={CLOUD} fill="#C3D3F4" transform="translate(0 7)" />
          <path d={CLOUD} fill="#fff" />
        </g>
      ))}
    </svg>
  )
}
