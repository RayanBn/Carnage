import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useAssets } from "../ui/assets-loader";
import { usePlayerStatesStore } from "@/lib/store";
import { CarController } from "../car-controller";
import { useSocket } from "@/lib/hooks/useSocket";
import { getRoomCode, useIsHost } from "playroomkit";
import { OrbitControls } from "@react-three/drei";

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
        <Canvas
            shadows
            camera={{
                position: [20, -5, 5]
            }}
        >
            <ambientLight/>
            <directionalLight
                castShadow
                intensity={10}
                rotation={[20, 0, 20]}
            />
            <color attach={"background"} args={["#FF5500"]}/>
            <OrbitControls makeDefault/>
            <Physics debug={true}>
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
                <RigidBody position={[1, -1, .9]}>
                    <CuboidCollider
                        args={[2, .1, 2]}
                    />
                </RigidBody>
                <RigidBody type="fixed" position={[0, 0, 0]}>
                    <mesh
                        scale={[500, 500, 500]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, -10, 0]}
                        receiveShadow
                    >
                        <meshPhongMaterial
                            color="grey"
                        />
                        <planeGeometry/>
                    </mesh>
                </RigidBody>
            </Physics>
        </Canvas>
    );
};

export default GameScene;
