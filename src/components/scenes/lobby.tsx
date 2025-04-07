import { Canvas } from "@react-three/fiber";
import { Car } from "../models/car";
import { Suspense, useEffect, useState } from "react";
import { Center, OrbitControls, Text } from "@react-three/drei";
import { getState, usePlayersList } from "playroomkit";
import { Vector3 } from "three";

interface PlayerProps {
    player: any;
    props: any;
}

const Player = ({ player, props }: PlayerProps) => {
    const { position } = props
    const car = player.getState('car');
    const [playerName, setPlayerName] = useState(player.getState('name') || player.getProfile().name);

    useEffect(() => {
        setPlayerName(player.getState('name') || player.getProfile().name);
        
        const intervalId = setInterval(() => {
            const currentName = player.getState('name') || player.getProfile().name;
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
            <Center
                position={position}
            >
                <Text
                    fontSize={.1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, position.y + .1, .34]}
                    rotation={[0, -Math.PI / 2, 0]}
                >
                    {playerName}
                </Text>
                <Car scale={[ .01, .01, .01 ]} />
            </Center>
        </>
    )
}

const LobbyScene = () => {
    const map = getState('map');
    const players = usePlayersList();

    useEffect(() => {
        console.log(players);
    }, [players]);

    return (
        <Suspense fallback={null}>
            <Canvas
                camera={{
                    position: [-2, 1, 2],
                    fov: 45,
                    near: 0.1,
                    far: 1000,
                }}
            >
                <color attach="background" args={['#000000']} />

                <ambientLight />
                <pointLight position={[10, 10, 10]} />

                {
                    players.map((player, idx) => {
                        const position = new Vector3(0, .5, 0 + (idx));

                        return (
                            <Player key={idx} player={player} props={{ position }} />
                        )
                    })
                }

                <OrbitControls />
            </Canvas>
        </Suspense>
    );
};

export default LobbyScene;
