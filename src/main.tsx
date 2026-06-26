import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// apply saved theme immediately to avoid flash
try {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.documentElement.classList.add('theme-light');
} catch (e) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
