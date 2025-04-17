export interface ClientData {
    position: [number, number, number]
    rotation: [number, number, number]
    username: string
    roomId: string | null
    playroomId?: string
}

export interface Clients {
    [key: string]: ClientData
}

export interface JoinPayload {
    roomId: string
    playroomId: string
    username: string
}

export interface MovePayload {
    id: string
    rotation: [number, number, number]
    position: [number, number, number]
    username: string
}

export interface GameStartedPayload {
    roomId: string
}
