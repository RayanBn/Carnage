import { Center, Text } from "@react-three/drei";
import { useState } from "react";
import { useEffect } from "react";
import { Model as Ai } from "./models/cars/Ai";
import { Model as Daika } from "./models/cars/Daika";
import { Model as Daishi } from "./models/cars/Daishi";
import { Model as Himari } from "./models/cars/Himari";
import { Model as Ouki } from "./models/cars/Ouki";
import { Model as Renzo } from "./models/cars/Renzo";
import { Model as Sadako } from "./models/cars/Sadako";

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
                <Text
                    fontSize={0.1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    position={[0, position.y - 0.4, 0]}
                    rotation={[0, -Math.PI / 2, 0]}
                >
                    {playerName}
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
