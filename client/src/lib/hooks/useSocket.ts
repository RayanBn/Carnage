// lib/useSocket.ts
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export const useSocket = () => {
  const [socketInstance, setSocketInstance] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsReady(true);
      setSocketInstance(socket);
    };

    const handleDisconnect = () => {
      setIsReady(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return { socket: socketInstance, isReady };
};
