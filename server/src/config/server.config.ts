import { Server } from "socket.io";

export const PORT = process.env.PORT || 5000;

export const createIoServer = () => {
  return new Server({
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });
};
