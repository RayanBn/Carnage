import { Vector3 } from "three";
import { getSocket } from "./socket";
import { getRoomCode, myPlayer } from "playroomkit";
import { usePlayerStatesStore } from "./store";

interface MovePayload {
    id: string;
    position: Vector3;
    rotation: Vector3;
    username: string;
}

export const syncRoomWithServer = () => {
    const socket = getSocket();
    const roomCode = getRoomCode();
    const player = myPlayer();

    if (!roomCode || !player || !socket) return;

    socket.emit("join", {
        roomId: roomCode,
        playroomId: player.id,
        username: player.getProfile().name,
    });

    return () => {
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("roomState");
        socket.off("move");
    };
};