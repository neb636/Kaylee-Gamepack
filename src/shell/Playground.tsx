// #/playground: every SDK building block in one place, for trying things out while building games.
import { useState, type ReactNode } from 'react'
import { go } from '../router'
import { BigButton, burst, ChoiceCards, MatchPairs, Mascot, SayButton, SortIntoBins, StarProgress, TapCounter, TapToReveal, Trophy } from './sdk-internal'

function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <h2 style={{ alignSelf: 'flex-start', fontSize: 28 }}>{title}</h2>
      {children}
    </section>
  )
}

export function Playground() {
  const [log, setLog] = useState('')
  const [key, setKey] = useState(0)
  const done = (what: string) => () => {
    setLog(`${what} done!`)
    burst()
  }
  return (
    <div className="screen" style={{ gap: 24, background: 'var(--lavender)' }} key={key}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <BigButton size="md" color="white" onClick={go.home}>
          🏠
        </BigButton>
        <h1 style={{ fontSize: 44, flex: 1 }}>SDK playground</h1>
        <BigButton size="md" color="butter" onClick={() => setKey((k) => k + 1)}>
          Reset
        </BigButton>
      </header>
      <p data-testid="playground-log" style={{ fontSize: 24, minHeight: 30 }}>{log}</p>
      <Demo title="Mascot + SayButton + StarProgress">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Mascot pose="wave" size={140} />
          <Mascot pose="cheer" size={140} />
          <Mascot pose="think" size={140} />
          <SayButton text="Hi Kaylee! Tap me to hear it again." />
          <StarProgress done={2} total={5} />
        </div>
      </Demo>
      <Demo title="ChoiceCards">
        <ChoiceCards
          choices={[
            { key: 'a', content: '🍎', correct: false },
            { key: 'b', content: '🦄', correct: true },
            { key: 'c', content: '🐸', correct: false },
          ]}
          onCorrect={done('ChoiceCards')}
          hint="Find the unicorn!"
        />
      </Demo>
      <Demo title="SortIntoBins">
        <SortIntoBins
          bins={[
            { id: 'hot', content: '☀️', say: 'Hot!', color: 'var(--butter)' },
            { id: 'cold', content: '❄️', say: 'Cold!', color: 'var(--sky)' },
          ]}
          items={[
            { id: '1', content: '🍦', bin: 'hot', say: 'ice cream' },
            { id: '2', content: '🧤', bin: 'cold', say: 'mittens' },
            { id: '3', content: '🩴', bin: 'hot', say: 'flip flops' },
            { id: '4', content: '⛄', bin: 'cold', say: 'snowman' },
          ]}
          onDone={done('SortIntoBins')}
        />
      </Demo>
      <Demo title="MatchPairs">
        <MatchPairs
          pairs={[
            { id: 'a', a: 'A', b: '🍎', say: 'A is for apple' },
            { id: 'b', a: 'B', b: '🐻', say: 'B is for bear' },
            { id: 'c', a: 'C', b: '🐱', say: 'C is for cat' },
          ]}
          onDone={done('MatchPairs')}
          cardSize={110}
        />
      </Demo>
      <Demo title="TapToReveal">
        <TapToReveal onDone={done('TapToReveal')} size={360}>
          <span style={{ fontSize: 120 }}>🌈</span>
        </TapToReveal>
      </Demo>
      <Demo title="TapCounter (3 taps)">
        <TapCounter count={3} onDone={done('TapCounter')}>
          <Mascot pose="cheer" size={150} bounce={false} />
        </TapCounter>
      </Demo>
      <Demo title="Trophy">
        <Trophy title="Playground Pro" size={220} count={3} />
      </Demo>
    </div>
  )
}
