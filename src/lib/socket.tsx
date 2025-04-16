import { io } from "socket.io-client";

let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL);
  }
  return socket;
};
