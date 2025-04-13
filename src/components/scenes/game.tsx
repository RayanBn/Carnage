import { RigidBody } from "@react-three/rapier";
import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useAssets } from "../ui/assets-loader";
import { usePlayerStatesStore } from "@/lib/store";
import { CarController } from "../car-controller";
import { onPlayerJoin } from "playroomkit";

const GameScene = () => {
    const {players, addPlayer} = usePlayerStatesStore();
    const { registerAssetLoad } = useAssets();

    useEffect(() => {
        registerAssetLoad();
    }, [registerAssetLoad]);

    useEffect(() => {
        onPlayerJoin((state) => {
            addPlayer(state);
        });
    }, []);

    return (
        <Canvas>
            <ambientLight/>
            <directionalLight />

            <Physics debug>
                {players.map(({state, controls}, index) => (
                    <CarController key={state?.id} state={state} controls={controls} idx={index}/>
                ))}

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
