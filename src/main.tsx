import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import './theme.css'
import { reactErrorHandlers } from './react-errors'
import './offline/register'
import App from './App'

createRoot(document.getElementById('root')!, reactErrorHandlers).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
