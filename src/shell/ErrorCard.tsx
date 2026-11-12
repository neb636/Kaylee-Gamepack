import { Component, useEffect, type ReactNode } from 'react'
import { isChunkError, reloadForNewBuild } from '../chunk-recovery'
import { onDevice } from '../sdk/device'
import { say } from '../sdk/speech'
import { SayButton } from '../sdk/components/SayButton'

const TRY_AGAIN = () => onDevice('Oops! Tap the sparkle to try again.', 'Oops! Click the sparkle to try again.')

function Retry() {
  const line = TRY_AGAIN()
  useEffect(() => void say(line), [line])
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#ff8cb8' }}>
      <div style={{ display: 'grid', gap: 20, justifyItems: 'center', textAlign: 'center', padding: 16 }}>
        <button
          aria-label="Try again"
          onClick={() => location.reload()}
          style={{ width: 160, height: 160, borderRadius: 80, border: 0, background: '#fff', fontSize: 72, cursor: 'pointer' }}
        >
          ✨
        </button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>
          <span>{line}</span>
          <SayButton text={line} />
        </div>
      </div>
    </div>
  )
}

// Catches a crashed screen so she never sees a blank pink page: a lazy chunk that vanished after a deploy reloads
// once; anything else shows one big button, spoken and written.
export class ErrorCard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    if (isChunkError(error)) reloadForNewBuild()
  }
  render() {
    return this.state.failed ? <Retry /> : this.props.children
  }
}
