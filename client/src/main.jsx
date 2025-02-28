import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const ws = new WebSocket('ws://image-upload-backend-rose.vercel.app:8080')
ws.onopen = () => {
  console.log('connection to ws established')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default ws