// Review sheet for the puppet lab: every dumpling state, every face and every dough color.
import { forwardRef } from 'react'
import type { PuppetHandle } from '../../../../sdk'
import { DOUGH, Dumpling, type DoughColor, type DumplingFace, type DumplingState } from './Dumpling'

const STATES: DumplingState[] = ['dough', 'wrapper', 'filled', 'pleated', 'steaming', 'cooked', 'nibbled', 'eaten']
const FACES: DumplingFace[] = ['happy', 'smile', 'content', 'surprised', 'giggle']

export const DumplingGrid = forwardRef<PuppetHandle, { height: string }>(function DumplingGrid({ height }, ref) {
  const cell = `calc(${height} / 7)`
  const row = (children: React.ReactNode) => <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>{children}</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
      {row(<Dumpling ref={ref} state="dough" smooth={0} size={cell} />)}
      {(Object.keys(DOUGH) as DoughColor[]).map((c) => <div key={c}>{row(STATES.map((s) => <Dumpling key={s} state={s} color={c} size={cell} />))}</div>)}
      {row(FACES.map((f) => <Dumpling key={f} state="cooked" face={f} size={cell} />))}
      {row([0, 0.3, 0.6, 1].map((p) => <Dumpling key={p} state="pleated" pleats={p} face="smile" size={cell} />))}
    </div>
  )
})
