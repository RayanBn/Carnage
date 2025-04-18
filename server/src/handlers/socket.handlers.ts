import { Server, Socket } from 'socket.io'
import { RateLimiter as Limiter } from 'limiter'
import { Clients, GameStartedPayload, JoinPayload, MovePayload } from '../types/socket.types'

const moveRateLimiter = new Limiter({
    tokensPerInterval: 300,
    interval: 'second'
})

const validateMovePayload = (payload: MovePayload): boolean => {
    return (
        typeof payload.id === 'string' &&
        Array.isArray(payload.position) &&
        typeof payload.rotation === 'object' &&
        payload.position.length === 3 &&
        typeof payload.rotation.x === 'number' &&
        typeof payload.rotation.y === 'number' &&
        typeof payload.rotation.z === 'number' &&
        typeof payload.rotation.w === 'number'
    )
}

const validateJoinPayload = (payload: JoinPayload): boolean => {
    return (
        typeof payload.roomId === 'string' &&
        typeof payload.playroomId === 'string' &&
        typeof payload.username === 'string'
    )
}

export const setupSocketHandlers = (io: Server, clients: Clients) => {
    io.on('connection', (client: Socket) => {
        console.log(`Client connected: ${client.id}`)

        clients[client.id] = {
            position: [10, 0, 0],
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            username: '',
            roomId: null
        }
        console.log('Current clients:', Object.keys(clients))

        client.on("game-started", (payload: GameStartedPayload) => {
            try {
                const { roomId } = payload
                const clientsInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
                    .map(socketId => io.sockets.sockets.get(socketId))
                    .filter(Boolean);
                console.log('Clients in room:', clientsInRoom.map(c => c.id));
                const roomState = clientsInRoom.reduce((acc, clientSocket) => {
                    const id = clientSocket.id;
                    const clientData = clients[id];
                    if (clientData) {
                        return {
                            ...acc,
                            [id]: {
                                id,
                                position: clientData.position,
                                rotation: clientData.rotation,
                                username: clientData.username,
                                playroomId: clientData.playroomId
                            }
                        };
                    }
                    return acc;
                }, {});
                io.to(roomId).emit('gameStarted', {
                    clients: roomState
                });
            } catch (error) {
                console.error('Game started error:', error);
                client.emit('error', { message: 'Failed to start game' });
            }
        });

        client.on("join", (payload: JoinPayload) => {
            console.log('Received join event:', payload)
            try {
                if (!validateJoinPayload(payload)) {
                    throw new Error('Invalid join payload')
                }

                const { roomId, playroomId, username } = payload

                if (clients[client.id].roomId) {
                    client.leave(clients[client.id].roomId)
                }

                client.join(roomId)
                clients[client.id].roomId = roomId
                clients[client.id].username = username
                clients[client.id].playroomId = playroomId

                const roomClients = io.sockets.adapter.rooms.get(roomId)
                console.log('Clients in room:', roomClients)

                client.to(roomId).emit('userJoined', {
                    id: client.id,
                    playroomId: clients[client.id].playroomId,
                    username,
                    position: clients[client.id].position,
                    rotation: clients[client.id].rotation
                })

                const roomState = Object.entries(clients)
                    .filter(([id]) => id !== client.id && clients[id].roomId === roomId)
                    .reduce((acc, [id, data]) => ({
                        ...acc,
                        [id]: {
                            position: data.position,
                            rotation: data.rotation,
                            username: data.username
                        }
                    }), {})

                client.emit('roomState', roomState)

            } catch (error) {
                console.error('Join error:', error)
                client.emit('error', { message: 'Failed to join room' })
            }
        })

        client.on('move', async (payload: MovePayload) => {
            try {
                const hasToken = await moveRateLimiter.tryRemoveTokens(1)
                if (!hasToken) {
                    console.warn(`Rate limit exceeded for client ${client.id}`)
                    return
                }

                if (!validateMovePayload(payload)) {
                    console.log('Validation failed for payload:', payload)
                    throw new Error('Invalid move payload')
                }

                const { id, rotation, position } = payload
                if (!clients[id]) {
                    throw new Error('Client not found')
                }

                clients[id].position = position
                clients[id].rotation = rotation

                if (clients[id].roomId) {
                    client.to(clients[id].roomId).emit('move', {
                        id,
                        position,
                        rotation,
                        username: clients[id].username
                    })
                }
            } catch (error) {
                console.error('Move error:', error)
                client.emit('error', { message: 'Failed to process move' })
            }
        })

        client.on('disconnect', (reason: any) => {
            const clientData = clients[client.id]
            if (clientData) {
                const { roomId } = clientData

                if (roomId) {
                    client.to(roomId).emit('userLeft', {
                        id: client.id,
                        username: clientData.username
                    })
                }

                delete clients[client.id]
            }
        })
    })
}