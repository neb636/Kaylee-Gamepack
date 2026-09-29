/** Flat sandstone facets stay crisp at every size, on the sled and in the stack. */
export function PyramidStone({ cap = false, variant = 0, outline = false }: { cap?: boolean; variant?: number; outline?: boolean }) {
  const shape = cap
    ? 'M90 4 Q93 4 95 8 L176 111 Q180 117 173 117 H7 Q0 117 4 111 L85 8 Q87 4 90 4 Z'
    : 'M17 3 H163 Q168 3 171 9 L177 21 V109 Q177 117 169 117 H11 Q3 117 3 109 V21 L9 9 Q12 3 17 3 Z'
  const face = ['#EFC88D', '#F3CE96', '#EAC18A'][variant % 3]

  return (
    <svg viewBox="0 0 180 120" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
      {outline ? (
        <path d={shape} fill="#FFE8AA" fillOpacity="0.45" stroke="#FFF7F0" strokeWidth="4" strokeDasharray="9 7" strokeLinejoin="round" />
      ) : cap ? (
        <g strokeLinejoin="round" strokeLinecap="round">
          <path d={shape} fill="#F5D277" />
          <path d="M90 5 L90 117 H7 Q0 117 4 111 L85 8 Q87 4 90 5 Z" fill="#F5D277" />
          <path d="M90 5 L176 111 Q180 117 173 117 H90 Z" fill="#D9AC57" />
          <path d="M90 15 V109 M15 108 H165" fill="none" stroke="#E7BD66" strokeWidth="3" />
          <path d="M79 29 L33 95" fill="none" stroke="#FFF0BF" strokeWidth="4" />
          <path d={shape} fill="none" stroke="#594138" strokeWidth="3.5" />
        </g>
      ) : (
        <g strokeLinejoin="round" strokeLinecap="round">
          <path d={shape} fill={face} />
          {/* A shallow top bevel and side facet give depth without gaps between rows. */}
          <path d="M17 3 H163 Q168 3 171 9 L177 21 H3 L9 9 Q12 3 17 3 Z" fill="#FBE0AA" />
          <path d="M164 21 H177 V109 Q177 117 169 117 H157 L164 105 Z" fill="#D4A46C" />
          <path d="M3 103 L15 108 H161 L169 117 H11 Q3 117 3 109 Z" fill="#DEB47B" />
          <path d="M17 27 H151" fill="none" stroke="#FFE7BE" strokeWidth="4" />
          <path d="M3 21 H177" fill="none" stroke="#B88D60" strokeWidth="2" />
          {/* Just two little chisel marks: readable, friendly, and uncluttered. */}
          <path d={variant % 2 ? 'M27 78 H42 M123 48 H140' : 'M25 51 H41 M121 85 H139'} fill="none" stroke="#C99D6D" strokeWidth="2.5" />
          <path d={shape} fill="none" stroke="#594138" strokeWidth="3.5" />
        </g>
      )}
    </svg>
  )
}
