// One frontal drawing per garment, shared by the tray and Luna's moving SVG layers.
export type Garment = 'hat' | 'scarf' | 'jacket'
const INK = '#2B2330'
export function ClothingShape({ kind, zipped = false }: { kind: Garment; zipped?: boolean }) {
  if (kind === 'hat') return <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
    <path d="M42 120 Q40 34 120 34 Q200 34 198 120Z" fill="#D9CCFF" />
    <circle cx="120" cy="30" r="22" fill="#FF8FB8" />
    <rect x="30" y="108" width="180" height="42" rx="17" fill="#FF8FB8" />
    {[55, 82, 109, 136, 163, 190].map(x => <path key={x} d={`M${x} 120v18`} stroke="#FF4F9A" strokeWidth="4" />)}
    <path d="M109 78l11-14 11 14-11 14Z" fill="#FFC83D" />
  </g>
  if (kind === 'scarf') return <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
    <path d="M135 77L180 145 141 168 110 96Z" fill="#B9A6F5" />
    <path d="M145 143l25-14M151 154l25-14" stroke="#FFF7F0" />
    <path d="M37 56Q120 85 203 56L207 100Q120 134 33 100Z" fill="#FF8FB8" />
    <path d="M40 78Q120 108 200 78" stroke="#FFF7F0" strokeWidth="9" />
  </g>
  return <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
    <path d="M67 27L30 44 9 93 48 111 59 85 55 164Q120 182 185 164L181 85 192 111 231 93 210 44 173 27 144 44H96Z" fill="#8FE3C8" />
    <path d="M96 44L120 65 144 44M120 65V167" fill="none" />
    {!zipped && <path d="M120 68L101 162H139Z" fill="#FFC2A8" />}
    <path d="M63 132h32v20H63zM145 132h32v20h-32z" fill="#A8DCFF" />
    <path d="M55 165Q120 179 185 165" stroke="#B9A6F5" strokeWidth="12" />
    <circle cx="120" cy={zipped ? 73 : 156} r="9" fill="#FFC83D" />
  </g>
}
export function Clothing({ kind }: { kind: Garment }) {
  return <svg viewBox="0 0 240 180" width="100%" height="100%" aria-hidden="true"><ClothingShape kind={kind} /></svg>
}
export function BeachHat() {
  return <svg viewBox="0 0 240 180" width="100%" height="100%" aria-hidden="true">
    <g fill="#FBEA9A" stroke={INK} strokeWidth="5"><path d="M55 111L71 44Q120 27 169 44L185 111Z" /><path d="M22 112Q120 101 218 112L208 141H32Z" /><path d="M60 88H180V109H60Z" fill="#FF8FB8" /></g>
    <path d="M147 68l8-11 9 11-9 10Z" fill="#FF4F9A" />
  </svg>
}
