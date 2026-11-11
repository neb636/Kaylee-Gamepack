import type { RootOptions } from 'react-dom/client'
import posthog, { isPostHogEnabled } from './posthog'

function reportReactError(source: string): NonNullable<RootOptions['onCaughtError']> {
  return (error, info) => {
    // Send the original Error (with its JS stack), plus React's component stack.
    posthog.captureException(error, {
      source,
      componentStack: info.componentStack,
    })
    // Keep a local diagnostic without capturing it a second time through console.error.
    console.warn(`[${source}]`, error, info.componentStack)
  }
}

// React 19 handles some render errors itself; they never reach window.onerror.
// Leave React's default reporting alone in previews and local development.
export const reactErrorHandlers: RootOptions = isPostHogEnabled ? {
  onUncaughtError: reportReactError('react.uncaught'),
  onCaughtError: reportReactError('react.caught'),
  onRecoverableError: reportReactError('react.recoverable'),
} : {}
