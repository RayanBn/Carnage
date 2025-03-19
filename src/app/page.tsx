"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Car } from "@/components/models/car";
import { insertCoin } from "playroomkit";

const Home = () => {

    useEffect(() => {
        insertCoin({
            // skipLobby: true,
        });

        // waitForState("inGame", (value) => {
        //     setInGame(value);
        // });
    }, []);

    return (
        <>
            <Suspense fallback={null}>
                <Canvas>
                    <PerspectiveCamera makeDefault position={[2, 0, 5]} />

                    <ambientLight />
                    <pointLight position={[10, 10, 10]} />

                    <OrbitControls />

                    <Car scale={[ .01, .01, .01 ]} />

                </Canvas>
            </Suspense>
        </>
    );
}

export default Home;
