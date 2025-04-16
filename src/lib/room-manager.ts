import { Vector3 } from "three";
import { getSocket } from "./socket";
import { getRoomCode, myPlayer, onPlayerJoin } from "playroomkit";

export const syncRoomWithServer = () => {
    const socket = getSocket();
    const roomCode = getRoomCode();
    const player = myPlayer();

    if (!roomCode || !player || !socket) return;

    socket.emit("join", {
        roomId: roomCode,
        userId: player.id,
        username: player.getProfile().name,
    });

    onPlayerJoin((player) => {
        console.log(`Player ${player.getProfile().name} joined the game`);
    });

    socket.on("userJoined", (data: any) => {
        console.log(`User ${data.username} joined from server`);
    });

    socket.on("userLeft", (data: any) => {
        console.log(`User ${data.username} left`);
    });

    socket.on("move", (data: any) => {
        console.log(`Player ${data.username} moved`);
    });

    return () => {
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("roomState");
        socket.off("move");
    };
};

export const updatePlayerPosition = (position: Vector3, rotation: Vector3) => {
    const socket = getSocket();
    const player = myPlayer();

    if (!socket || !player) return;

    socket.emit("move", {
        id: socket.id,
        position,
        rotation,
        username: player.getProfile().name,
    });
};
