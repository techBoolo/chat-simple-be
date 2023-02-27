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
let clients = []
io.on('connection', (socket) => {
  // push the client socket in the client array, for collecting stat
  clients.push(socket)
  console.log('client connected', socket.id);
  io.emit('new connection', { count: clients.length })
  socket.on('disconnect', (reason) => {
    console.log('client disconnected,', reason);
    // when the client disconnected remove the connection from the clients stat
    const idx = clients.indexOf(socket)
    clients.splice(idx, 1)
    io.emit('client left', { count: clients.length })
  })
})

server.listen(3001, () => {
  console.log('listening on *:3001');
})
