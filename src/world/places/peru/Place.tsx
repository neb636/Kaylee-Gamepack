import { useCallback, useEffect, useRef, useState } from 'react'
import { BigButton, lineText, say, SayButton, sounds, type PuppetHandle } from '../../../sdk'
import { StoryBeat } from '../../kit/StoryBeat'
import { StampEarned } from '../../kit/StampEarned'
import type { PlaceProps } from '../../types'
import { CozyAndes } from './activities/CozyAndes'
import { art } from './art'
import { L } from './lines'
import { Clothing } from './puppets/Clothing'
import { Luna } from './puppets/Luna'
import './peru.css'
const DISCOVERIES = [
  { id: 'cozy-andes', name: 'Cozy Andes', icon: '🧣', x: 67.3, y: 70.9 },
  { id: 'weaving', name: 'Rainbow Weaving', icon: '🧶', x: 46, y: 52 },
  { id: 'condor', name: 'Condor Sky Ride', icon: '🪶', x: 78, y: 87 },
  { id: 'river', name: 'River Ripples', icon: '🐬', x: 53.6, y: 25.8 },
  { id: 'lookout', name: 'Machu Picchu Lookout', icon: '⛰️', x: 41, y: 79 },
]
let introSeen = false
export default function Place({ activity, meta, earnStamp, setProgress, backToMap, ...rest }: PlaceProps) {
  const [earned, setEarned] = useState(false)
  const finished = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    earnStamp('cozy-andes')
    setProgress(4, 4)
    timer.current = setTimeout(() => setEarned(true), 1400)
  }, [earnStamp, setProgress])
  useEffect(() => {
    if (activity !== 'cozy-andes' || !window.__kayleeWorld) return
    window.__kayleeWorld.finish = finish
    return () => { if (window.__kayleeWorld?.finish === finish) delete window.__kayleeWorld.finish }
  }, [activity, finish])
  useEffect(() => () => { clearTimeout(timer.current) }, [])
  if (activity === 'cozy-andes') return <>
    <CozyAndes onDone={finish} setProgress={setProgress} />
    {earned && <StampEarned activity={meta.activities[0]} onClose={backToMap} />}
  </>
  if (activity === 'expedition' || activity === 'party') return <ExpeditionSoon backToMap={backToMap} />
  return <Hub {...rest} meta={meta} />
}
function Hub({ stamps, openActivity }: Pick<PlaceProps, 'stamps' | 'openActivity' | 'meta' | 'onWin'>) {
  const [intro, setIntro] = useState(!introSeen && !stamps.length)
  const luna = useRef<PuppetHandle>(null)
  const done = stamps.includes('cozy-andes')
  useEffect(() => { if (!intro) void say(done ? L.hubNext : L.hub) }, [intro, done])
  return <div className="peru-screen" style={{ backgroundImage: `url(${art.andes})` }}>
    <div className="peru-hub-layout">
      <div className="peru-map"><div className="peru-map-content">
        {/* Cartographic view is only used in the hub. The activity uses frontal eye-level artwork. */}
        <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <rect width="600" height="700" fill="#A8DCFF" />
          <path d="M474.4,183.8L443.8,182.2L439.3,187.3L411.5,193.8L372.7,216.9L370.3,232.7L361.6,244.5L365.0,262.8L344.5,272.6L344.6,286.9L335.6,293.1L349.7,323.6L368.6,344.2L361.4,358.8L383.9,360.8L396.7,378.8L426.6,379.7L454.4,359.7L452.2,411.2L467.6,415.1L486.7,409.3L516.0,463.8L508.7,475.3L507.1,499.1L506.4,528.0L493.2,544.9L499.2,557.5L491.5,568.9L506.0,597.4L484.7,634.0L475.6,651.3L458.1,660.0L424.2,640.5L421.2,626.6L354.0,592.6L293.2,555.5L267.1,534.6L253.0,506.6L258.6,496.9L229.9,452.4L196.5,389.8L164.4,322.3L150.6,306.9L139.9,281.9L113.6,259.8L89.4,246.1L100.4,231.0L84.0,198.6L94.5,174.9L121.5,153.5L125.6,167.6L115.9,175.7L116.8,188.1L130.8,185.4L144.5,189.0L158.7,206.2L177.9,192.2L184.3,169.3L205.1,139.9L245.9,126.5L282.8,91.0L293.4,69.0L288.6,43.2L297.7,40.0L320.2,56.1L331.0,72.1L346.7,80.8L366.7,116.3L391.9,120.6L410.6,111.6L422.9,117.5L443.2,114.6L469.2,130.4L447.3,164.9L457.4,165.7L474.4,183.8Z" fill="#8FE3C8" stroke="#2B2330" strokeWidth="5" />
          <path d="M164 267Q187 334 237 399T339 536L427 592" fill="none" stroke="#D9CCFF" strokeWidth="65" />
          {[320,400,480,560].map((y,i) => <path key={y} d={`M${178+i*65} ${y+25}l22-48 22 48Z`} fill="#B9A6F5" />)}
          <path d="M310 180q-40 30 30 50t20 80" fill="none" stroke="#A8DCFF" strokeWidth="16" />
        </svg>
        {DISCOVERIES.map(d => <button key={d.id} data-discovery={d.id} aria-label={d.id === 'cozy-andes' ? d.name : `${d.name} coming soon`} className={`peru-map-pin ${d.id === 'cozy-andes' && !done ? 'world-glow' : ''}`} style={{ left: `${d.x}%`, top: `${d.y}%`, opacity: d.id === 'cozy-andes' ? 1 : .72 }} onClick={() => { sounds.pop(); if (d.id === 'cozy-andes') openActivity(d.id); else void say(L.soon) }}>
          {d.id === 'cozy-andes' ? <Clothing kind="hat" /> : d.icon}<small>{d.id === 'cozy-andes' ? done ? '✅' : '✨' : '☁️'}</small>
        </button>)}
      </div></div>
      <div className="peru-hub-side">
        <h1>Peru</h1>
        <Luna ref={luna} height="min(34vh, 33vw)" hat={done} scarf={done} jacket={done} zipped={done} onTap={() => { sounds.pop(); void luna.current?.play('giggle'); void say(L.tickle[0]) }} />
        <div className="peru-journal" aria-label="Explorer journal">
          {DISCOVERIES.map(d => <button key={d.id} aria-label={`${d.id === 'cozy-andes' ? 'Warm alpaca' : d.name} journal picture${d.id === 'cozy-andes' && done ? ' earned' : ''}`} onClick={() => { sounds.pop(); void say(d.id === 'cozy-andes' ? done ? L.sticker : L.hub : L.soon) }}>{d.id === 'cozy-andes' && done ? <img src={art.cover} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 12 }} /> : <span style={{ opacity: .6 }}>{d.icon}<small style={{ fontSize: 15 }}>☁️</small></span>}</button>)}
        </div>
        <button aria-label="Party" className="peru-finale-button" onClick={() => openActivity('expedition')}>🎈 <small style={{ fontSize: 22 }}>☁️</small></button>
        <SayButton text={done ? L.hubNext : L.hub} size={88} />
      </div>
    </div>
    {intro && <StoryBeat lines={L.intro} bg={art.andes} friend={<Luna height="100%" />} onDone={() => { introSeen = true; setIntro(false) }} />}
  </div>
}
function ExpeditionSoon({ backToMap }: { backToMap: () => void }) {
  useEffect(() => { void say(L.expeditionSoon) }, [])
  return <div className="peru-screen" style={{ backgroundImage: `url(${art.andes})`, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <div className="peru-prompt"><p>{lineText(L.expeditionSoon)}</p><SayButton text={L.expeditionSoon} size={88} /></div>
    <Luna height="min(50vh,70vw)" />
    <BigButton ariaLabel="Return to Peru" onClick={backToMap}>🗺️ ▶</BigButton>
  </div>
}
