// Playground demos for the advanced interaction kit (src/sdk/interact). Small, real examples an AI builder can copy.
import { useState } from 'react'
import scene from '../games/unicorn-tea-party/assets/scene.webp'
import { burst, countByKind, DressUpStudio, JigsawPuzzle, StickerBoard, Swatch, useSaved, type DressSlot, type Placed } from './sdk-internal'

const box = { width: '100%', height: 'min(72vh, 680px)' }

export function JigsawDemo({ onLog }: { onLog: (s: string) => void }) {
  const [size, setSize] = useState(2)
  return (
    <div style={{ ...box, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <JigsawPuzzle
        key={size}
        img={scene}
        rows={size}
        cols={size + 1}
        onSnap={(done, total) => onLog(`Jigsaw: ${done} of ${total}`)}
        onMiss={() => onLog('Jigsaw: not there, its spot is glowing')}
        onDone={() => {
          onLog('Jigsaw done!')
          setSize((s) => (s === 2 ? 3 : 2))
        }}
      />
    </div>
  )
}

const TOPPINGS = [
  { kind: 'tomato', content: '🍅' },
  { kind: 'cheese', content: '🧀', size: 0.14 },
  { kind: 'basil', content: '🌿', size: 0.13 },
  { kind: 'mushroom', content: '🍄' },
  { kind: 'olive', content: '🫒', size: 0.12 },
]

function Pizza() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <circle cx="100" cy="100" r="95" fill="#f2b766" stroke="#2b2330" strokeWidth="5" />
      <circle cx="100" cy="100" r="78" fill="#e8553f" />
      <path d="M40 95 Q50 45 100 40 Q160 45 162 100 Q158 150 100 160 Q45 155 40 95Z" fill="#ffe7a3" opacity=".85" />
    </svg>
  )
}

export function PizzaDemo({ onLog }: { onLog: (s: string) => void }) {
  const [items, setItems] = useState<Placed[]>([])
  const counts = countByKind(items)
  return (
    <div style={{ ...box, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p data-testid="pizza-count" style={{ fontSize: 22 }}>
        {items.length} toppings {Object.entries(counts).map(([k, n]) => `${k} ×${n}`).join(', ')}
      </p>
      <div style={{ flex: 1, minHeight: 0, background: 'var(--lavender)', borderRadius: 'var(--radius)', padding: 16 }}>
        <StickerBoard
          stickers={TOPPINGS}
          items={items}
          onChange={setItems}
          surface={<Pizza />}
          shape="circle"
          max={20}
          onPlace={(it) => onLog(`Placed ${it.kind}`)}
        />
      </div>
    </div>
  )
}

// A little avatar drawn in the house style: 5-unit dark outline, flat fills, blush, big eyes with highlights.
type Look = Record<string, string>
const INK = '#2b2330'
const SKIN: Record<string, string> = { light: '#fbd9bf', tan: '#e9b48a', brown: '#b87850', deep: '#7a4a2e' }
const HAIR_COLOR: Record<string, string> = { brown: '#8b5a3c', black: '#2f2a35', blonde: '#f3cf6b', red: '#d9653b', pink: '#ff8fb8', lavender: '#b9a6f5' }
const OUTFIT: Record<string, { main: string; extra: string }> = {
  dress: { main: '#ff8fb8', extra: '#ff4f9a' },
  overalls: { main: '#7fb6ef', extra: '#fbea9a' },
  sparkle: { main: '#b9a6f5', extra: '#ffc83d' },
  sporty: { main: '#8fe3c8', extra: '#fff' },
}

function Avatar({ look, headOnly }: { look: Look; headOnly?: boolean }) {
  const hair = HAIR_COLOR[look.hairColor] ?? HAIR_COLOR.brown
  const skin = SKIN[look.skin] ?? SKIN.light
  const outfit = OUTFIT[look.outfit] ?? OUTFIT.dress
  const s = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  return (
    <svg viewBox={headOnly ? '40 20 220 220' : '0 0 300 360'} width="100%" height="100%" style={{ display: 'block', maxHeight: '100%' }}>
      {/* back hair */}
      {look.hair === 'long' && <path d="M72 140 Q58 270 100 272 L200 272 Q242 270 228 140Z" fill={hair} {...s} />}
      {look.hair === 'bob' && <path d="M70 140 Q62 228 102 230 L198 230 Q238 228 230 140Z" fill={hair} {...s} />}
      {look.hair === 'ponytail' && <ellipse cx="238" cy="178" rx="28" ry="58" fill={hair} {...s} />}
      {look.hair === 'puffs' && (
        <>
          <circle cx="78" cy="86" r="38" fill={hair} {...s} />
          <circle cx="222" cy="86" r="38" fill={hair} {...s} />
        </>
      )}
      {/* body + outfit */}
      {!headOnly && (
        <>
          <rect x="135" y="220" width="30" height="30" fill={skin} {...s} />
          {look.outfit === 'overalls' ? (
            <>
              <path d="M95 250 Q150 236 205 250 L212 352 L88 352Z" fill={outfit.extra} {...s} />
              <path d="M112 280 H188 V352 H112Z" fill={outfit.main} {...s} />
              <circle cx="125" cy="292" r="5" fill={INK} />
              <circle cx="175" cy="292" r="5" fill={INK} />
            </>
          ) : (
            <path d="M105 250 Q150 238 195 250 L238 352 L62 352Z" fill={outfit.main} {...s} />
          )}
          {look.outfit === 'sparkle' && [[120, 300], [170, 285], [150, 330], [195, 330], [100, 335]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="6" fill={outfit.extra} />)}
          {look.outfit === 'sporty' && <path d="M112 300 H188" stroke={outfit.extra} strokeWidth="10" />}
          {look.outfit === 'dress' && <path d="M85 330 Q150 345 215 330" stroke={outfit.extra} strokeWidth="8" fill="none" />}
        </>
      )}
      {/* head + face */}
      <circle cx="150" cy="150" r="80" fill={skin} {...s} />
      <ellipse cx="122" cy="160" rx="9" ry="12" fill={INK} />
      <ellipse cx="178" cy="160" rx="9" ry="12" fill={INK} />
      <circle cx="125" cy="155" r="3.5" fill="#fff" />
      <circle cx="181" cy="155" r="3.5" fill="#fff" />
      <ellipse cx="104" cy="186" rx="13" ry="8" fill="#ff8fb8" opacity=".7" />
      <ellipse cx="196" cy="186" rx="13" ry="8" fill="#ff8fb8" opacity=".7" />
      <path d="M134 190 Q150 205 166 190" fill="none" {...s} />
      {/* front hair */}
      {look.hair === 'puffs' ? (
        <path d="M78 128 Q90 72 150 70 Q210 72 222 128 Q190 100 150 102 Q110 100 78 128Z" fill={hair} {...s} />
      ) : look.hair === 'ponytail' ? (
        <path d="M70 150 Q68 68 150 66 Q232 68 230 150 Q200 104 120 108 Q92 118 70 150Z" fill={hair} {...s} />
      ) : (
        <path d="M68 152 Q66 66 150 64 Q234 66 232 152 Q210 112 150 112 Q96 112 68 152Z" fill={hair} {...s} />
      )}
      {/* accessory */}
      {look.extra === 'crown' && <path d="M112 76 L118 38 L135 60 L150 28 L165 60 L182 38 L188 76Z" fill="#ffc83d" {...s} />}
      {look.extra === 'horn' && (
        <>
          <path d="M138 70 L150 8 L162 70Z" fill="#fbea9a" {...s} />
          <path d="M142 50 L158 44 M145 32 L155 28" stroke="#ffc83d" strokeWidth="4" />
        </>
      )}
      {look.extra === 'bow' && <path d="M205 70 L240 52 L236 96Z M205 70 L176 48 L180 92Z" fill="#ff4f9a" {...s} />}
      {look.extra === 'glasses' && (
        <g fill="rgba(255,255,255,.25)" {...s}>
          <circle cx="122" cy="160" r="22" />
          <circle cx="178" cy="160" r="22" />
          <path d="M144 158 Q150 152 156 158" fill="none" />
        </g>
      )}
    </svg>
  )
}

export function AvatarDemo() {
  const [look, setLook] = useSaved<Look>('playground:avatar', { skin: 'light', hair: 'long', hairColor: 'brown', outfit: 'dress', extra: 'none' })
  const slots: DressSlot[] = [
    { id: 'hair', icon: '💇‍♀️', label: 'Hair', options: ['long', 'bob', 'ponytail', 'puffs'].map((id) => ({ id, label: `${id} hair`, thumb: <Avatar look={{ ...look, hair: id, extra: 'none' }} headOnly /> })) },
    { id: 'hairColor', icon: '🎨', label: 'Hair color', options: Object.entries(HAIR_COLOR).map(([id, c]) => ({ id, label: `${id} hair color`, thumb: <Swatch color={c} /> })) },
    { id: 'skin', icon: '✋', label: 'Skin', options: Object.entries(SKIN).map(([id, c]) => ({ id, label: `${id} skin`, thumb: <Swatch color={c} /> })) },
    { id: 'outfit', icon: '👗', label: 'Outfit', options: Object.keys(OUTFIT).map((id) => ({ id, label: `${id} outfit`, thumb: <Avatar look={{ ...look, outfit: id }} /> })) },
    {
      id: 'extra',
      icon: '👑',
      label: 'Extras',
      options: ['none', 'crown', 'horn', 'bow', 'glasses'].map((id) => ({ id, label: id, thumb: id === 'none' ? '🚫' : <Avatar look={{ ...look, extra: id }} headOnly /> })),
    },
  ]
  return (
    <div style={box} data-testid="avatar-demo" data-look={JSON.stringify(look)}>
      <DressUpStudio slots={slots} values={look} onChange={setLook} onPick={() => burst()} character={<Avatar look={look} />} />
    </div>
  )
}
