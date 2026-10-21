// HarborLand without WebGL (an old browser, a test browser without a GPU, or ?gl=off): the playground as one picture
// page per level. Each ride is a big button: tap it and it whooshes, and its sticker goes on her sock band. The arrows
// go up and down the levels (the same sections as the 3D playground).
import { motion } from 'motion/react'
import { sounds } from '../../../../../sdk'
import { sfx } from '../../sfx'
import type { HarborSection } from './harborland/harborland'
import { RIDE_ICONS, type RideId } from './harborland/layout'

const LEVELS: Record<HarborSection, { bg: string; rides: { id: RideId | 'cannon' | 'monkey'; icon: string }[]; up?: HarborSection; down?: HarborSection }> = {
  play: {
    bg: 'linear-gradient(#EBDDFF, #FFE3EF)',
    rides: [
      { id: 'pool', icon: RIDE_ICONS.pool },
      { id: 'cannon', icon: '💥' },
      { id: 'monkey', icon: '🐒' },
    ],
    up: 'mountain',
  },
  mountain: {
    bg: 'linear-gradient(#D7ECFF, #FFF1C9)',
    rides: [
      { id: 'mountain', icon: RIDE_ICONS.mountain },
      { id: 'donut', icon: RIDE_ICONS.donut },
      { id: 'zip', icon: RIDE_ICONS.zip },
    ],
    up: 'dragon',
    down: 'play',
  },
  dragon: {
    bg: 'linear-gradient(#CFF3E3, #EBDDFF)',
    rides: [
      { id: 'roller', icon: RIDE_ICONS.roller },
      { id: 'dragon', icon: RIDE_ICONS.dragon },
    ],
    down: 'mountain',
  },
}

const big = { width: 'clamp(110px, 22vmin, 170px)', height: 'clamp(110px, 22vmin, 170px)', borderRadius: '50%', border: '6px solid #fff', background: 'rgba(255,255,255,.75)', boxShadow: 'var(--shadow)', fontSize: 'clamp(54px, 11vmin, 84px)', padding: 0 } as const

export function Flat({ section, rides, onSection, onRide }: { section: HarborSection; rides: RideId[]; onSection: (s: HarborSection) => void; onRide: (id: RideId) => void }) {
  const lv = LEVELS[section]
  const go = (s?: HarborSection) => {
    if (!s) return
    sfx.boing()
    onSection(s)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: lv.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(18px, 4vmin, 36px)', paddingTop: 'var(--top-clear)' }}>
      {lv.up && (
        <motion.button aria-label="Climb up" whileTap={{ scale: 0.9 }} onClick={() => go(lv.up)} style={{ ...big, width: 'clamp(96px, 16vmin, 130px)', height: 'clamp(96px, 16vmin, 130px)', fontSize: 'clamp(44px, 8vmin, 64px)' }}>
          ⬆️
        </motion.button>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(14px, 3vmin, 30px)' }}>
        {lv.rides.map((r) => (
          <motion.button
            key={r.id}
            aria-label={r.id}
            whileTap={{ scale: 0.85, rotate: -8 }}
            onClick={() => {
              sounds.whoosh()
              if (r.id === 'cannon') sfx.thoomp()
              else if (r.id === 'monkey') sfx.chatter()
              else {
                sfx.chime()
                onRide(r.id)
              }
            }}
            style={{ ...big, outline: r.id in RIDE_ICONS && !rides.includes(r.id as RideId) ? '6px solid rgba(255,200,61,.8)' : 'none' }}
          >
            {r.icon}
          </motion.button>
        ))}
      </div>
      {lv.down && (
        <motion.button aria-label="Slide down" whileTap={{ scale: 0.9 }} onClick={() => go(lv.down)} style={{ ...big, width: 'clamp(96px, 16vmin, 130px)', height: 'clamp(96px, 16vmin, 130px)', fontSize: 'clamp(44px, 8vmin, 64px)' }}>
          ⬇️
        </motion.button>
      )}
    </div>
  )
}
