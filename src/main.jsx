import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AdminPortal from './AdminPortal'
import './styles.css'

const adminPaths = ['/login', '/register', '/admin']
const RootComponent = adminPaths.includes(window.location.pathname.replace(/\/+$/, '') || '/')
  ? AdminPortal
  : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
