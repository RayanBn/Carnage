import express from 'express'
import cors from 'cors'
import { createIoServer, PORT } from './config/server.config'
import { setupSocketHandlers } from './handlers/socket.handlers'
import { Clients } from './types/socket.types'

const app = express()
const ioServer = createIoServer()

app.use(cors())
app.use(express.json())

const clients: Clients = {}

setupSocketHandlers(ioServer, clients)

ioServer.listen(Number(PORT))
console.log(`Server running on port ${PORT}`)
