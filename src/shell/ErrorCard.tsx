import { Component, type ReactNode } from 'react'
import { isChunkError, reloadForNewBuild } from '../chunk-recovery'

// Catches a crashed screen so she never sees a blank pink page: a lazy chunk that vanished after a deploy reloads
// once; anything else shows one big button.
export class ErrorCard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    if (isChunkError(error)) reloadForNewBuild()
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#ff8cb8' }}>
        <button
          aria-label="Try again"
          onClick={() => location.reload()}
          style={{ minWidth: 160, minHeight: 160, borderRadius: 80, border: 0, background: '#fff', fontSize: 72, cursor: 'pointer' }}
        >
          ✨
        </button>
      </div>
    )
  }
}
