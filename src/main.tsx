import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import './theme.css'
import './posthog'
import './offline/register'
import App from './App'

// The desktop Studio's game pane (local dev only): slow every animation down while the Studio is in the background.
if (import.meta.env.DEV && window.parent !== window && new URLSearchParams(location.search).get('studio') === '1') void import('./world/labs/studio-pace')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
