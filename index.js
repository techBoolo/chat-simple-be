import http from 'http'
import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { Server as SocketioServer } from 'socket.io'

dotenv.config()
const app = express()
const server = http.createServer(app)

const io = new SocketioServer(server, {
  cors: {
    origin: [ process.env.FRONTEND_ROOT_URL ],
    method: [ 'GET', 'POST' ]
  }
})

app.use(cors())
app.get('/', (req, res) => {
  res.send('hello')
})

// executes when a new connection is created with the client
io.on('connection', (socket) => {
  console.log('client connected', socket.id);
})

server.listen(3001, () => {
  console.log('listening on *:3001');
})
