import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const ws = new WebSocket('ws://ec2-3-96-63-210.ca-central-1.compute.amazonaws.com:8080')

ws.onopen = () => {
  console.log('connection to ws established')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default ws