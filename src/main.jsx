import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'  // Old app
import AppXState from './AppXState.tsx'  // New XState v5 app

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppXState />
  </StrictMode>,
)
