import { OrbitControls } from "@react-three/drei";
import { Car } from "../models/car";
import { RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { useAssets } from "../ui/assets-loader";

const GameScene = () => {
    const { registerAssetLoad } = useAssets();
    
    useEffect(() => {
        registerAssetLoad();
    }, [registerAssetLoad]);

    return (
        <Canvas
            onCreated={() => {
                console.log("Game Canvas created");
            }}
        >
            <Suspense fallback={null}>
                <OrbitControls />
                <ambientLight />
                <directionalLight />
                <Physics debug>
                    <RigidBody colliders="trimesh">
                        <Car scale={[0.3, 0.3, 0.3]}></Car>
                    </RigidBody>
                    <RigidBody type="fixed">
                        <mesh scale={[100, 100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
                            <planeGeometry />
                        </mesh>
                        {/* <Plane scale={[10, 10, 10]} rotation={[Math.PI / 2, Math.PI / 2, 0]}/> */}
                    </RigidBody>
                </Physics>
            </Suspense>
        </Canvas>
    );
};

export default GameScene;
