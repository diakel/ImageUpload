import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const ws = new WebSocket('wss://ws.websocket-windows9.click')

ws.onopen = () => {
  console.log('connection to ws established')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default ws