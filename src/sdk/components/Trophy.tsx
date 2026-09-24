import { motion } from 'motion/react'
import trophyImg from '../../assets/trophy/trophy.webp'
import { KID_NAME } from '../helpers'

/** A gold trophy with KAYLEE engraved on the plaque, plus the trophy title. */
export function Trophy({ title, size = 260, count, shine = true }: { title: string; size?: number; count?: number; shine?: boolean }) {
  // The plaque sits at 23%-77% across and 66%-90% down the trophy image.
  return (
    <div style={{ position: 'relative', width: size, height: size * (512 / 401) }}>
      {shine && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: '-15%',
            background: 'repeating-conic-gradient(from 0deg, rgba(255,200,61,0.28) 0deg 12deg, transparent 12deg 30deg)',
            borderRadius: '50%',
            maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
          }}
        />
      )}
      <img src={trophyImg} alt="trophy" style={{ position: 'relative', width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          left: '24%',
          right: '24%',
          top: '67%',
          height: '22%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          lineHeight: 1.05,
          color: 'var(--ink)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: size * 0.105, letterSpacing: size * 0.006, color: 'var(--hotpink)' }}>{KID_NAME.toUpperCase()}</div>
        <div style={{ fontWeight: 600, fontSize: size * 0.058, marginTop: size * 0.012 }}>{title}</div>
      </div>
      {count && count > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'var(--hotpink)',
            color: '#fff',
            borderRadius: 999,
            padding: '4px 12px',
            fontWeight: 700,
            fontSize: size * 0.08,
            boxShadow: 'var(--shadow)',
          }}
        >
          ×{count}
        </div>
      )}
    </div>
  )
}
