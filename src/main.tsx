import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/globals.css'
import App from '@/app/App'

// iOS Safari ignores user-scalable=no, so block its pinch gesture directly.
document.addEventListener('gesturestart', (e) => e.preventDefault())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
