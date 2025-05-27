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

  const lerpTarget = useRef<Vector3>(new Vector3());
  const lerpRotation = useRef<Quaternion>(new Quaternion());

  const lastUpdate = useRef<number>(performance.now());

  // Ajouts pour la prédiction
  const lastServerPosition = useRef<Vector3>(new Vector3());
  const velocity = useRef<Vector3>(new Vector3());
  const tempVec = new Vector3();

  useEffect(() => {
    if (!socket) return;

    const myId = me?.id;

    socket.on("respawn", (data: any) => {
      if (data.id === myId) return;

      tempVec.set(data.position[0], data.position[1], data.position[2]);

      const newRotation = new Quaternion(
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.rotation.w
      );

      targetPosition.current.copy(tempVec);
      targetRotation.current.copy(newRotation);
      updatePlayerPosition(data.id, tempVec.clone(), newRotation);
    });

    const handleMove = (data: any) => {
      if (data.id === myId) return;

      const now = performance.now();
      const newPos = new Vector3(
        data.position[0],
        data.position[1],
        data.position[2]
      );
      const newRot = new Quaternion(
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.rotation.w
      );

      const dt = (now - lastUpdate.current) / 1000; // en secondes
      if (dt > 0) {
        velocity.current
          .copy(newPos)
          .sub(lastServerPosition.current)
          .divideScalar(dt);
      }

      lastServerPosition.current.copy(newPos);
      lerpTarget.current.copy(newPos);
      lerpRotation.current.copy(newRot);

      lastUpdate.current = now;
    };

    socket.on("move", handleMove);
    return () => socket.off("move", handleMove);
  }, [socket, me?.id]);

  // Interpolation + Prédiction
  useEffect(() => {
    if (!isLocalPlayer) {
      let animationFrameId: number;

      const animate = () => {
        const now = performance.now();
        const timeSinceUpdate = now - lastUpdate.current;

        if (timeSinceUpdate < PHYSICS.INTERPOLATION_DURATION) {
          const t = timeSinceUpdate / PHYSICS.INTERPOLATION_DURATION;
          targetPosition.current.lerp(lerpTarget.current, t);
          targetRotation.current.slerp(lerpRotation.current, t);
        } else {
          // Aucune nouvelle donnée : prédiction simple
          const dt = timeSinceUpdate / 1000; // en secondes
          tempVec
            .copy(lastServerPosition.current)
            .addScaledVector(velocity.current, dt);
          targetPosition.current.lerp(tempVec, 0.1); // lissage
        }

        updatePlayerPosition(
          id,
          targetPosition.current.clone(),
          targetRotation.current.clone()
        );
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isLocalPlayer, updatePlayerPosition, id]);

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
