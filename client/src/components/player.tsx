import { Center, Image, Text } from "@react-three/drei";
import { useState } from "react";
import { useEffect } from "react";
import { Model as Ai } from "./models/cars/Ai";
import { Model as Daika } from "./models/cars/Daika";
import { Model as Daishi } from "./models/cars/Daishi";
import { Model as Himari } from "./models/cars/Himari";
import { Model as Ouki } from "./models/cars/Ouki";
import { Model as Renzo } from "./models/cars/Renzo";
import { Model as Sadako } from "./models/cars/Sadako";
import { usePlayerState } from "playroomkit";

interface PlayerProps {
    player: any;
    props: any;
    car: any;
}

const carComponents = {
    Ai: Ai,
    Daika: Daika,
    Daishi: Daishi,
    Himari: Himari,
    Ouki: Ouki,
    Renzo: Renzo,
    Sadako: Sadako,
} as const;

export function getCarComponent(carName: string) {
    return carComponents[carName as keyof typeof carComponents] || Sadako;
}

const Player = ({ player, props, car }: PlayerProps) => {
    const { position } = props;
    const [playerName, setPlayerName] = useState(
        player.getState("name") || player.getProfile().name
    );
    const [carName, setCarName] = useState(car?.name);
    const [isReady, _] = usePlayerState(player, "ready", false);

    useEffect(() => {
        if (!car) return;
        setCarName(car.name);
    }, [car]);

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
    }, [player, playerName])

    const CarComponent = getCarComponent(carName);

    return (
        <>
            <Center position={position}>
                <mesh
                    position={[0.01, position.y - 0.4, 0]}
                    rotation={[0, -Math.PI / 2, 0]}
                >
                    <planeGeometry args={[playerName.length * 0.06 + 0.2, 0.15]} />
                    <meshBasicMaterial
                        color="black"
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
                <Text
                    fontSize={0.1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, position.y - 0.4, -0.05]}
                    rotation={[0, -Math.PI / 2, 0]}
                >
                    {playerName}
                    {isReady ? (
                        <Image
                            url="/icons/green-light.png"
                            transparent
                            scale={[0.15, 0.15]}
                            position={[playerName.length * 0.039, 0, 0]}
                        /> ) : (
                            <Image
                                url="/icons/red-light.png"
                                transparent
                                scale={[0.15, 0.15]}
                                position={[playerName.length * 0.039, 0, 0]}
                            />
                        )
                    }
                </Text>
                <Center position-y={0} key={carName}>
                    <CarComponent
                        scale={[0.4, 0.4, 0.4]}
                        position={[0, 0, 0]}
                        rotation={[0, -Math.PI / 2, 0]}
                        castShadow
                        receiveShadow
                    />
                </Center>
            </Center>
        </>
    );
};

export default Player;
