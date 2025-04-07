import { Canvas } from "@react-three/fiber";
import { Car } from "../models/car";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";

const LobbyScene = () => {
    return (
        <Suspense fallback={null}>
            <Canvas>
                <color attach="background" args={['#000000']} />

                <ambientLight />
                <pointLight position={[10, 10, 10]} />

                <Car scale={[ .01, .01, .01 ]} />

                <OrbitControls />
            </Canvas>
        </Suspense>
    );
};

export default LobbyScene;
