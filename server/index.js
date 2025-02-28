import express from 'express'
import config from './config/index.js'
import s3Router from './routes/misc.js'
import cors from 'cors'
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const app = express()

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    //origin: 'http://10.159.23.119:5173'
    origin: 'https://image-upload-frontend-one.vercel.app'
    // origin: 'http://192.168.0.102:5173'
}))

app.use('/api/s3', s3Router)

app.listen(config.PORT, () => {
    console.log(`Server listening on http://localhost:${config.PORT}`)
})


// WebSocket server
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

var connections = []

wss.on('connection', ws => {
  console.log('New connection established');
  connections.push(ws);

  ws.on('message', message => {
    console.log(`Received message: ${message}`);

    connections.forEach(element => {
      element.send(message);
    });
  });

  ws.on('close', () => {
    console.log('Connection closed');
  });
});

wss.on('error', err => {
  console.error('WebSocket Server Error:', err);
});

console.log('WebSocket server running on ws://localhost:8080');