import type { SeekScene, SceneKind } from './scenes'
const ink = '#62516a'
const scenesSeed = (kind: SceneKind) => ['camp', 'beach', 'fair', 'snow', 'market'].indexOf(kind) * 53
const palette = ['#eea9b8', '#9ecbd1', '#e9c476', '#b7abd7', '#a8c68f', '#e8ae88']

/** Hand-drawn vector pieces keep the scene and the tappable positions perfectly aligned at every size. */
export function Unicorn({ color = '#fff8f1' }: { color?: string }) {
  return <g stroke={ink} strokeWidth="2.5" strokeLinejoin="round">
    <path d="M-22 4 Q-41 -12 -33 17 Q-29 27 -21 19" fill="#cf9baa" />
    <ellipse cx="0" cy="8" rx="24" ry="16" fill={color} />
    <path d="M-14 18 L-17 35 L-8 35 L-5 20 M12 19 L14 35 L23 35 L21 13" fill={color} />
    <path d="M12 5 Q7 -13 20 -25 Q35 -25 38 -10 L41 -1 Q34 8 23 3 L21 13" fill={color} />
    <path d="M18 -21 L16 -35 L27 -26 M31 -24 L38 -43 L38 -19" fill="#f2cb7b" />
    <path d="M18 -24 Q4 -23 7 -8 L15 5 L21 -6 L16 -13 L24 -21" fill="#c99fb4" />
    <circle cx="31" cy="-12" r="2" fill={ink} stroke="none" /><circle cx="34" cy="-5" r="3" fill="#eca6b1" stroke="none" />
    <path d="M32 0 Q35 2 38 0" fill="none" />
  </g>
}
function Tree({ snow = false }: { snow?: boolean }) {
  return <g stroke={ink} strokeWidth="3"><path d="M-5 0 L5 0 L7 -88 L-7 -88 Z" fill="#b8896b" /><path d="M0 -155 L-42 -86 L-23 -86 L-55 -40 L55 -40 L23 -86 L42 -86 Z" fill={snow ? '#c5dddc' : '#78a993'} />{snow && <path d="M0 -155 L-25 -111 Q0 -97 25 -111Z" fill="#fff" />}</g>
}
function Person({ color, n }: { color: string; n: number }) {
  const skin = ['#efc5a3', '#ce997a', '#a87561'][n % 3]
  return <g stroke={ink} strokeWidth="2.5" strokeLinecap="round"><path d="M-8 4 L-11 22 M8 4 L12 22" /><path d="M-15 -28 L-27 -5 M15 -28 L25 -10" /><path d="M-16 -30 Q0 -39 16 -30 L19 7 L-19 7Z" fill={color} /><circle cy="-48" r="16" fill={skin} /><path d="M-17 -51 Q-9 -76 14 -59 L18 -49 Q4 -60 -17 -51" fill={['#765647', '#ceb06a', '#56434c'][n % 3]} /><circle cx="-5" cy="-47" r="1.5" /><circle cx="5" cy="-47" r="1.5" /><path d="M-4 -40 Q0 -37 4 -40" fill="none" /></g>
}
function Prop({ kind, color, n }: { kind: SceneKind; color: string; n: number }) {
  if (kind === 'camp') return n % 2 === 0 ? <g stroke={ink} strokeWidth="3"><path d="M-80 18 L0 -85 L80 18Z" fill={color} /><path d="M0 -85 L-27 18 L28 18Z" fill="#6d7878" /><path d="M-85 23 H85" /><path d="M0 -85 L37 18" fill="none" /></g> : <g stroke={ink} strokeWidth="3"><rect x="-73" y="-70" width="146" height="86" rx="18" fill="#fff3d8" /><rect x="-47" y="-55" width="43" height="34" rx="5" fill="#a9d9df" /><rect x="10" y="-55" width="38" height="69" rx="5" fill={color} /><circle cx="-39" cy="19" r="12" fill={ink} /><circle cx="45" cy="19" r="12" fill={ink} /></g>
  if (kind === 'beach') return <g stroke={ink} strokeWidth="3"><path d="M0 -76 V35" /><path d="M-73 -60 Q0 -153 73 -60Z" fill={color} /><path d="M0 -103 Q-23 -83 -25 -60 H25 Q23 -83 0 -103" fill="#fff1d9" /><path d="M-49 13 L-34 42 L40 32 L22 3Z" fill={palette[(n + 2) % 6]} /><path d="M-33 42 L-40 52 M32 34 L43 49" /></g>
  if (kind === 'snow') return <g stroke={ink} strokeWidth="3"><rect x="-60" y="-54" width="120" height="80" rx="4" fill={color} /><path d="M-76 -53 L0 -110 L76 -53Z" fill="#fdfbff" /><rect x="-12" y="-18" width="26" height="44" fill="#947b94" /><rect x="-44" y="-35" width="22" height="23" fill="#fbe7a2" /><rect x="26" y="-35" width="22" height="23" fill="#fbe7a2" /><path d="M-45 -23 H-22 M37 -35 V-12" /></g>
  return <g stroke={ink} strokeWidth="3"><path d="M-66 -65 V26 M66 -65 V26" /><rect x="-72" y="-4" width="144" height="34" rx="5" fill={color} /><path d="M-84 -60 L-64 -103 H64 L84 -60Z" fill={color} />{[-48, -16, 16, 48].map(x => <path key={x} d={`M${x - 10} -103 L${x - 15} -60 H${x + 15} L${x + 10} -103Z`} fill="#fff2da" stroke="none" />)}{[-44, -15, 15, 44].map((x, i) => <g key={x}><path d={`M${x} -7 V-31`} stroke="#648d69" /><circle cx={x} cy="-32" r={kind === 'market' ? 12 : 9} fill={palette[(i + n) % 6]} /><circle cx={x} cy="-32" r="4" fill="#f7e8a1" /></g>)}</g>
}
function Detail({ kind, n }: { kind: SceneKind; n: number }) {
  const color = palette[n % 6]
  if (kind === 'beach') return n % 3 === 0 ? <g stroke={ink} strokeWidth="2.5"><path d="M-30 16 L-25 -15 H-15 V-28 H-4 V-15 H8 V-28 H19 V-15 H27 L31 16Z" fill="#d2af79" /><path d="M-5 16 V1 Q5 -12 13 1 V16" fill="#ad946d" /></g> : n % 3 === 1 ? <g stroke={ink} strokeWidth="2"><ellipse rx="16" ry="37" fill={color} transform="rotate(25)" /><path d="M-13 25 L13 -25" stroke="#fff0bd" strokeWidth="8" /></g> : <g stroke={ink} strokeWidth="2"><circle r="18" fill="#fff3d7" /><path d="M0 -18 Q-18 0 0 18 Q18 0 0 -18" fill={color} /></g>
  if (kind === 'camp') return n % 3 === 0 ? <g stroke={ink} strokeWidth="2.5"><path d="M-30 15 L30 0 M-30 0 L30 15" stroke="#a87b5b" strokeWidth="10" /><path d="M-16 3 Q-30 -12 -8 -26 Q-3 -13 6 -40 Q30 -10 13 3Z" fill="#f1ac68" /><path d="M-6 3 Q-13 -6 3 -20 Q15 -3 7 3Z" fill="#ffe28a" /></g> : n % 3 === 1 ? <g stroke={ink} strokeWidth="3"><path d="M-32 -12 H32 M-23 6 H23 M-20 -12 L-27 23 M20 -12 L27 23" /><path d="M-35 -16 H35 V-8 H-35Z" fill="#c99678" /></g> : <g stroke={ink} strokeWidth="2"><rect x="-18" y="-22" width="36" height="42" rx="10" fill={color} /><path d="M-8 -22 Q0 -39 8 -22" fill="none" /><rect x="-13" y="-3" width="26" height="16" rx="4" fill="#fff1d5" /></g>
  if (kind === 'fair') return <g stroke={ink} strokeWidth="2"><path d="M0 25 L-12 -16 M0 25 L13 -35 M0 25 L27 -9" fill="none" />{[[-13,-28],[10,-48],[26,-23]].map(([x,y],i) => <ellipse key={i} cx={x} cy={y} rx="13" ry="17" fill={palette[(n+i)%6]} />)}</g>
  if (kind === 'snow') return n % 2 === 0 ? <g stroke={ink} strokeWidth="2"><path d="M-35 10 Q-37 26 35 20 Q45 19 45 9" fill="none" /><path d="M-28 10 V-2 M27 10 V-2" /><rect x="-37" y="-8" width="70" height="12" rx="4" fill={color} /><path d="M34 -2 Q58 -20 70 -10" fill="none" /></g> : <g stroke={ink} strokeWidth="2"><circle r="25" fill="#fff" /><circle cy="-33" r="18" fill="#fff" /><path d="M-16 -47 H16 L13 -60 H-12Z" fill={color} /><path d="M0 -32 L17 -28 L0 -24Z" fill="#e9b079" /><circle cx="-5" cy="-37" r="2" fill={ink} /><path d="M-21 -5 L-43 -22 M21 -5 L43 -22" /></g>
  return <g stroke={ink} strokeWidth="2"><path d="M-25 0 H25 L18 25 H-18Z" fill="#c49b80" />{[-17,0,17].map((x,i) => <g key={x}><path d={`M${x} 0 L${x} -25`} stroke="#779d72" /><path d={`M${x} -8 q-23 -15 -8 -19 q10 2 8 19 q4 -19 15 -15 q8 13 -15 15`} fill="#a8c68f" /><circle cx={x} cy={-32 - (i%2)*9} r="12" fill={palette[(n+i)%6]} /><circle cx={x} cy={-32 - (i%2)*9} r="4" fill="#ffe9a0" /></g>)}</g>
}
export function SceneArt({ scene }: { scene: SeekScene }) {
  return <svg className="seek-art" viewBox="0 0 1200 720" aria-hidden="true">
    <rect width="1200" height="720" fill={scene.sky} />
    <circle cx="1070" cy="75" r="38" fill="#fff1af" />
    {[130, 420, 780].map(x => <path key={x} d={`M${x} 95 q-24 -32 4 -45 q22 -20 39 4 q35 -16 40 20 q14 30 -83 21`} fill="#ffffff" opacity=".75" />)}
    <path d="M0 180 Q220 65 460 190 Q700 85 920 180 Q1050 105 1200 160 V720 H0Z" fill={scene.id === 'beach' ? '#76c7d9' : scene.id === 'snow' ? '#adc8d3' : '#8cba9c'} />
    <path d="M0 250 Q280 175 600 255 T1200 235 V720 H0Z" fill={scene.ground} />
    {scene.id === 'beach' ? <path d="M0 205 Q250 150 520 220 T1200 195 M0 242 Q250 187 520 252 T1200 227" stroke="#d3f2f0" strokeWidth="10" fill="none" /> : <path d="M560 215 Q340 360 620 440 T550 740" stroke={scene.id === 'snow' ? '#d4e4ed' : '#eedab9'} strokeWidth="100" fill="none" />}
    {scene.id !== 'beach' && [45, 300, 565, 850, 1160].map((x, i) => <g key={x} transform={`translate(${x} ${220 + i % 2 * 30}) scale(.75)`}><Tree snow={scene.id === 'snow'} /></g>)}
    {[0, 1, 2, 3, 4, 5, 6, 7].map(n => <g key={n} transform={`translate(${95 + (n % 4) * 320} ${330 + Math.floor(n / 4) * 235}) scale(${n % 2 ? '.8' : '.95'})`}><Prop kind={scene.id} color={palette[n % 6]} n={n} /></g>)}
    {Array.from({ length: 38 }, (_, n) => {
      const seed = ['camp', 'beach', 'fair', 'snow', 'market'].indexOf(scene.id)
      const x = 55 + ((n * 173 + seed * 71) % 1090), y = 330 + ((n * 97 + seed * 47) % 350)
      return <g key={n} transform={`translate(${x} ${y}) scale(${.6 + n % 3 * .12})`}><Person color={palette[n % 6]} n={n} /></g>
    })}
    {Array.from({ length: 26 }, (_, n) => <g key={n} transform={`translate(${60 + n * 257 % 1100} ${280 + n * 131 % 405})`} stroke={ink} strokeWidth="2">
      {n % 3 === 0 ? <><ellipse cy="4" rx="18" ry="12" fill={palette[n % 6]} /><circle cx="15" cy="-9" r="12" fill={palette[n % 6]} /><path d="M8 -17 L6 -28 L17 -20 M20 -19 L27 -29 L28 -9" fill={palette[n % 6]} /><circle cx="19" cy="-10" r="2" fill={ink} /><path d="M-13 12 V23 M8 12 V23 M-17 1 Q-30 -14 -27 6" fill="none" /></> : n % 3 === 1 ? <><ellipse rx="23" ry="8" fill="#799b7a" /><path d="M0 0 V-23" stroke="#6b956e" /><circle cy="-28" r="13" fill={palette[n % 6]} /><circle cy="-28" r="5" fill="#fff0a8" /></> : <><path d="M-15 -14 H15 L12 16 H-12Z" fill={palette[n % 6]} /><path d="M-12 -14 Q0 -39 12 -14" fill="none" /></>}
    </g>)}
    {Array.from({ length: 14 }, (_, n) => <g key={`detail-${n}`} transform={`translate(${80 + (n * 233 + scenesSeed(scene.id)) % 1050} ${365 + (n * 151) % 315}) scale(.8)`}><Detail kind={scene.id} n={n} /></g>)}
    {scene.id === 'fair' && <g transform="translate(540 180)" stroke={ink} strokeWidth="3" fill="none"><circle r="70" /><path d="M-45 82 L0 0 L45 82 M-70 0 H70 M0 -70 V70 M-49 -49 L49 49 M49 -49 L-49 49" />{[0, 1, 2, 3, 4, 5].map(n => <rect key={n} x={Math.cos(n * Math.PI / 3) * 70 - 13} y={Math.sin(n * Math.PI / 3) * 70 - 8} width="26" height="24" rx="7" fill={palette[n]} />)}</g>}
    {scene.id === 'snow' && [490, 800].map(x => <g key={x} transform={`translate(${x} 590)`} stroke={ink} strokeWidth="2"><circle r="27" fill="#fff" /><circle cy="-38" r="19" fill="#fff" /><path d="M0 -40 L17 -36 L0 -33Z" fill="#eeac76" /><path d="M-19 -23 H20" stroke="#d88fa8" strokeWidth="8" /><circle cx="-5" cy="-43" r="2" fill={ink} /></g>)}
  </svg>
}
