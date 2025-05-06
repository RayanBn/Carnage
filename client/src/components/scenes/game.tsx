import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useAssets } from "../ui/assets-loader";
import { usePlayerStatesStore } from "@/lib/store";
import { useSocket } from "@/lib/hooks/useSocket";
import { getRoomCode, useIsHost } from "playroomkit";
import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";
import { CarController } from "../car-controller";

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
            <color attach={"background"} args={["#AAAAAA"]}/>
            <OrbitControls makeDefault/>
            <GizmoHelper>
                <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
            </GizmoHelper>

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
                <RigidBody position={[3, 0, 1]}>
                    <CuboidCollider
                        args={[2, .3, 2]}
                    />
                </RigidBody>
                <RigidBody
                    position={[-10, 0, 1]}
                    rotation={[0, Math.PI / 6, 0]}
                >
                    <CuboidCollider
                        args={[2, .2, 20]}
                    />
                </RigidBody>
                <RigidBody
                    position={[-12, 0, 1]}
                    rotation={[0, Math.PI / 6, 0]}
                >
                    <CuboidCollider
                        args={[2, .1, 20]}
                    />
                </RigidBody>
                <RigidBody position={[1, 0, 1]}>
                    <CuboidCollider
                        args={[2, .3, 2]}
                    />
                </RigidBody>
                <RigidBody
                    type="fixed"
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, 0]}
                >
                    <mesh
                        scale={[500, 500, 500]}
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
