import { useEffect, useRef, useCallback } from "react";
import { Vector3, Quaternion } from "three";
import { useSocket } from "@/lib/hooks/useSocket";
import { usePlayerStatesStore } from "@/lib/store";
import { myPlayer } from "playroomkit";
import { PHYSICS } from "../constants";

export function useNetworkSync(
  id: string,
  isLocalPlayer: boolean,
  targetPosition: React.MutableRefObject<Vector3>,
  targetRotation: React.MutableRefObject<Quaternion>
) {
  const { socket } = useSocket();
  const me = myPlayer();
  const { updatePlayerPosition } = usePlayerStatesStore();

  const prevTranslation = useRef<Vector3>(new Vector3(0, 0, 0));
  const prevRotation = useRef<Quaternion>(new Quaternion());
  const lastEmitTime = useRef<number>(0);
  const tempVector = useRef(new Vector3());

  useEffect(() => {
    if (!socket) return;

    const myId = me?.id;

    socket.on("respawn", (data: any) => {
      if (data.id === myId) return;

      tempVector.current.set(
        data.position[0],
        data.position[1],
        data.position[2]
      );

      const newRotation = new Quaternion(
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.rotation.w
      );

      targetPosition.current.copy(tempVector.current);
      targetRotation.current.copy(newRotation);
      updatePlayerPosition(data.id, tempVector.current.clone(), newRotation);
    });

    const handleMove = (data: any) => {
      if (data.id === myId) return;

      tempVector.current.set(
        data.position[0],
        data.position[1],
        data.position[2]
      );

      const newRotation = new Quaternion(
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.rotation.w
      );

      targetPosition.current.copy(tempVector.current);
      targetRotation.current.copy(newRotation);
      updatePlayerPosition(data.id, tempVector.current.clone(), newRotation);
    };

    socket.on("move", handleMove);

    return () => {
      socket.off("move", handleMove);
    };
  }, [socket, updatePlayerPosition, me?.id, targetPosition, targetRotation]);

  const emitPositionUpdate = useCallback(
    (currentPosition: Vector3, currentRotation: Quaternion) => {
      const now = performance.now();
      if (now - lastEmitTime.current < PHYSICS.EMIT_THROTTLE) return;

      if (!socket) return;

      const positionChanged =
        currentPosition.distanceTo(prevTranslation.current) >
        PHYSICS.POSITION_THRESHOLD;
      const rotationChanged =
        Math.abs(currentRotation.angleTo(prevRotation.current)) >
        PHYSICS.ROTATION_THRESHOLD;

      if (!(positionChanged || rotationChanged)) return;

      const playerName = me?.getProfile().name || "Unknown";

      if (currentPosition.y < 10) {
        socket.emit("respawn", {
          id,
          position: [currentPosition.x, currentPosition.y, currentPosition.z],
          rotation: {
            x: currentRotation.x,
            y: currentRotation.y,
            z: currentRotation.z,
            w: currentRotation.w,
          },
          username: playerName,
        });
      }

      socket.emit("move", {
        id,
        position: [currentPosition.x, currentPosition.y, currentPosition.z],
        rotation: {
          x: currentRotation.x,
          y: currentRotation.y,
          z: currentRotation.z,
          w: currentRotation.w,
        },
        username: playerName,
      });

      prevTranslation.current.copy(currentPosition);
      prevRotation.current.copy(currentRotation);
      lastEmitTime.current = now;
    },
    [socket, id, me]
  );

  return { emitPositionUpdate };
}
