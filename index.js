import http from 'http'
import crypto from 'crypto'
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
  socket.on('public-message-sent', (data, cb) => {
    data = {id: crypto.randomUUID(), ...data, date: new Date()}
    socket.broadcast.emit('public-message-received', data)
    // if we want we can modify the received data and send it back as cb in
    // addition to emitting,
    // users might be in different geographical region so we want to set the
    // date in the server
    cb(null, data)
  })

  socket.on('join-room', ({ room }, cb) => {
    socket.join(room)
    if(socket.rooms.has(room)){
      cb(null, room)
    } else {
      cb(new Error('Room not joined'))
    }
  })
})

server.listen(3001, () => {
  console.log('listening on *:3001');
})
