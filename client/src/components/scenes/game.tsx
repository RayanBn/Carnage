import { RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { useAssets } from "../ui/assets-loader";
import { usePlayerStatesStore } from "@/lib/store";
import { useSocket } from "@/lib/hooks/useSocket";
import { getRoomCode, useIsHost } from "playroomkit";
import {
  GizmoHelper,
  GizmoViewport,
  KeyboardControls,
  KeyboardControlsEntry,
  OrbitControls,
  Sky,
} from "@react-three/drei";
import { CarController } from "../car-controller";
import { Model as GameMap } from "../models/gamemap";

enum Controls {
  drift='drift'
}

const GameScene = () => {
  const { players } = usePlayerStatesStore();
  const { registerAssetLoad } = useAssets();
  const { socket } = useSocket();
  const isHost = useIsHost();
  const roomCode = getRoomCode();

  const controlsMap = useMemo<KeyboardControlsEntry<Controls>[]>(()=>[
    { name: Controls.drift, keys: ['Space'] },
  ], [])
  useEffect(() => {
    registerAssetLoad();
  }, [registerAssetLoad]);

  useEffect(() => {
    if (!socket) return;
    if (isHost) {
      const payload = {
        roomId: roomCode,
      };

      socket.emit("game-started", payload);
    }
  }, [socket, isHost, roomCode]);

  return (
    <KeyboardControls map={controlsMap}>
      <Canvas
        shadows
        camera={{
          position: [5, -5, 5],
        }}
      >
        <ambientLight />
        <color attach={"background"} args={["#AAAAAA"]} />
        <OrbitControls makeDefault />
        {/* <GizmoHelper>
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="black"
          />
        </GizmoHelper> */}

        <Sky
          distance={450000}
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />
        <pointLight
          position={[-5, 30, 0]}
          intensity={1000}
          castShadow
          shadow-radius={0.5}
        />

        <Physics debug={false}>
          {players.map((player, index) => {
            return (
              <CarController
                id={player.id}
                key={player.state?.id}
                state={player.state}
                controls={player.controls}
                idx={index}
                position={player.position}
                rotation={player.rotation}
                player={player}
              />
            );
          })}
          <RigidBody position={[0, 0, 0]} colliders="trimesh" type="fixed">
            <GameMap
              scale={0.04}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[25, 5, 0]}
            />
          </RigidBody>
        </Physics>
      </Canvas>
    </KeyboardControls>

  );
};

export default GameScene;
