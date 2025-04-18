import { Canvas } from "@react-three/fiber";
import { Car } from "../models/car";
import { useEffect, useState, useRef } from "react";
import {
    Center,
    Text,
    Sky,
    PresentationControls,
    Bounds,
    useBounds,
} from "@react-three/drei";
import { getState, usePlayersList } from "playroomkit";
import { Vector3 } from "three";
import { useAssets } from "../ui/assets-loader";

const Road = () => {
    const { registerAssetLoad } = useAssets();

    useEffect(() => {
        registerAssetLoad();
    }, [registerAssetLoad]);

    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.276, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#403f3f" />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                position={[0, -0.275, 0]}
            >
                <planeGeometry args={[0.2, 200]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </>
    );
};

interface PlayerProps {
    player: any;
    props: any;
}

const Player = ({ player, props }: PlayerProps) => {
    const { position } = props;
    const car = player.getState("car");
    const [playerName, setPlayerName] = useState(
        player.getState("name") || player.getProfile().name
    );

    useEffect(() => {
        setPlayerName(player.getState("name") || player.getProfile().name);

        const intervalId = setInterval(() => {
            const currentName =
                player.getState("name") || player.getProfile().name;
            if (currentName !== playerName) {
                setPlayerName(currentName);
            }
        }, 500);

        return () => {
            clearInterval(intervalId);
        };
    }, [player, playerName]);

    return (
        <>
            <Center position={position}>
                <Text
                    fontSize={0.1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, position.y + 0.1, 0.34]}
                    rotation={[0, -Math.PI / 2, 0]}
                >
                    {playerName}
                </Text>
                <Car scale={[0.01, 0.01, 0.01]} />
            </Center>
        </>
    );
};

const AutoFocus = () => {
    const bounds = useBounds();
    const initialized = useRef(false);
    const { assetsLoaded } = useAssets();
    const players = usePlayersList();

    useEffect(() => {
        if (players.length > 0 && assetsLoaded) {
            initialized.current = false;
        }
    }, [players.length, assetsLoaded]);

    useEffect(() => {
        if (assetsLoaded && !initialized.current) {
            const timer = setTimeout(() => {
                bounds.refresh().clip().fit();
                initialized.current = true;
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [bounds, assetsLoaded]);

    return null;
};

const LobbyScene = () => {
    const map = getState("map");
    const players = usePlayersList();

    return (
        <Canvas
            camera={{
                position: [-30, 5, 10],
                fov: 45,
                near: 0.1,
                far: 1000,
            }}
        >
            <Sky
                distance={450000}
                sunPosition={[0, 1, 0]}
                inclination={0}
                azimuth={0.25}
            />
            <ambientLight intensity={1.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <fog attach="fog" color="#e9eff2" near={0.5} far={40} />
            <PresentationControls
                global
                rotation={[0.13, 0.1, 0]}
                polar={[-0.4, 0.2]}
                azimuth={[-1, 0.75]}
                config={{ mass: 2, tension: 400 }}
                snap
            >
                <Road />
                <Bounds
                    fit
                    clip
                    observe
                    margin={1.2}
                    maxDuration={2}
                    interpolateFunc={(t) => 1 - Math.exp(-5 * t) + 0.007 * t}
                >
                    <AutoFocus />

                    {players.map((player, idx) => {
                        const totalPlayers = players.length;
                        const spacing = 0.8;
                        const maxCarsPerRow = 4;

                        const row = Math.floor(idx / maxCarsPerRow);
                        const positionInRow = idx % maxCarsPerRow;

                        const carsInCurrentRow = Math.min(
                            maxCarsPerRow,
                            totalPlayers - row * maxCarsPerRow
                        );
                        const totalWidth = (carsInCurrentRow - 1) * spacing;
                        const startZ = -totalWidth / 2;

                        const position = new Vector3(
                            row * 2,
                            0.5,
                            0.33 + (startZ + positionInRow * spacing)
                        );

                        return (
                            <Player
                                key={idx}
                                player={player}
                                props={{ position }}
                            />
                        );
                    })}
                </Bounds>
            </PresentationControls>
        </Canvas>
    );
};

export default LobbyScene;
