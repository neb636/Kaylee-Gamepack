import type { CSSProperties, ReactNode } from 'react'

/** Full-screen background picture with game content on top. */
export function Scene({ bg, children, style, dim = 0 }: { bg?: string; children: ReactNode; style?: CSSProperties; dim?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--lavender)',
        backgroundImage: bg ? `linear-gradient(rgba(255,247,240,${dim}), rgba(255,247,240,${dim})), url(${bg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
