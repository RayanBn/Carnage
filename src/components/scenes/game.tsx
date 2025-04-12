import { RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { useAssets } from "../ui/assets-loader";
import { usePlayerStatesStore } from "@/lib/store";
import { CarController } from "../CarController";

const GameScene = () => {
    const {playerStates} = usePlayerStatesStore();
    const { registerAssetLoad } = useAssets();

    useEffect(() => {
        registerAssetLoad();
    }, [registerAssetLoad]);

    return (
        <Canvas>
            <Suspense fallback={null}>
                <ambientLight/>
                <directionalLight />
                <Physics debug>
                {playerStates.map(({player, joystick}, index) => {
                    return (
                        <CarController key={index} state={player} joystick={joystick}/>
                    )}
                )}
                    <RigidBody type="fixed">
                        <mesh scale={[100, 100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
                            <planeGeometry />
                        </mesh>
                        </RigidBody>
                </Physics>
            </Suspense>
        </Canvas>
    );
};

export default GameScene;
