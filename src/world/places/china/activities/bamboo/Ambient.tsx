// Ambient life for the forest: drifting mist, a couple of falling leaves and a butterfly. All decoration (no touches).
import { motion } from 'motion/react'
import { INK } from '../../puppets/ink'

export function Ambient() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <style>{`
        @keyframes bamboo-mist { 0% { transform: translateX(-12vw); opacity: 0 } 15%,85% { opacity: .55 } 100% { transform: translateX(14vw); opacity: 0 } }
        @keyframes bamboo-fall { 0% { transform: translate(0,-12vh) rotate(0deg); opacity: 0 } 10% { opacity: 1 } 50% { transform: translate(-4vw,45vh) rotate(160deg) } 100% { transform: translate(3vw,105vh) rotate(340deg); opacity: .9 } }
      `}</style>
      {[{ top: '34%', w: '46vw', d: 22, delay: 0 }, { top: '52%', w: '58vw', d: 30, delay: -12 }].map((m, i) => (
        <div key={i} style={{ position: 'absolute', top: m.top, left: `${10 + i * 30}%`, width: m.w, height: '11vh', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', filter: 'blur(18px)', animation: `bamboo-mist ${m.d}s linear ${m.delay}s infinite` }} />
      ))}
      {[{ left: '22%', d: 13, delay: 0 }, { left: '70%', d: 17, delay: -7 }].map((l, i) => (
        <svg key={i} width="26" height="34" viewBox="-13 -34 26 34" style={{ position: 'absolute', top: 0, left: l.left, animation: `bamboo-fall ${l.d}s ease-in-out ${l.delay}s infinite` }}>
          <path d="M0 0 C-10 -10 -8 -26 0 -32 C8 -26 10 -10 0 0Z" fill="#B7E39F" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      ))}
      <motion.div
        animate={{ x: ['0vw', '20vw', '6vw', '28vw', '0vw'], y: ['0vh', '-6vh', '-2vh', '-8vh', '0vh'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '30%', top: '44%', fontSize: 'min(38px, 5vh)' }}
      >
        <motion.span animate={{ scaleX: [1, 0.35, 1] }} transition={{ duration: 0.4, repeat: Infinity }} style={{ display: 'inline-block' }}>
          🦋
        </motion.span>
      </motion.div>
    </div>
  )
}
