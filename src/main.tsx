import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/heebo'
import '@fontsource-variable/space-grotesk'
import './index.css'
import './lib/i18n'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
