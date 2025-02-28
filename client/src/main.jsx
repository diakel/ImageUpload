import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

var ws = null;
/*

const ws = new WebSocket('ws://3.96.63.210:8080')

ws.onopen = () => {
  console.log('connection to ws established')
}
*/

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default ws