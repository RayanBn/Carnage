"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

const Home = () => {
    return (
        <>
            <Suspense fallback={null}>
                <Canvas>
                    <PerspectiveCamera makeDefault position={[2, 0, 5]} />

                    <ambientLight />
                    <pointLight position={[10, 10, 10]} />

                    <OrbitControls />

                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="hotpink" />
                    </mesh>
                </Canvas>
            </Suspense>
        </>
    );
}

export default Home;
