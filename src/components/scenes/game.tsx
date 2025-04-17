import { RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useAssets } from "../ui/assets-loader";
import { usePlayerStatesStore } from "@/lib/store";
import { CarController } from "../car-controller";
import { useSocket } from "@/lib/hooks/useSocket";
import { getRoomCode, useIsHost } from "playroomkit";

const GameScene = () => {
    const { players } = usePlayerStatesStore();
    const { registerAssetLoad } = useAssets();
    const { socket } = useSocket();
    const isHost = useIsHost();
    const roomCode = getRoomCode();

    useEffect(() => {
        registerAssetLoad();
    }, [registerAssetLoad]);

    useEffect(() => {
        if (!socket) return;
        if (isHost) {
            const payload = {
                roomId: roomCode,
            }

            socket.emit("game-started", payload);
        }
    }, [socket, isHost, roomCode]);

    return (
        <Canvas>
            <ambientLight/>
            <directionalLight />

            <Physics>
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
                        />
                    );
                })}

                <RigidBody type="fixed">
                    <mesh scale={[100, 100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
                        <planeGeometry />
                    </mesh>
                </RigidBody>
            </Physics>
        </Canvas>
    );
};

export default GameScene;
