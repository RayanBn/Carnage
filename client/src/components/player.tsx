import { Center, Html } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { Model as Ai } from "./models/cars/Ai";
import { Model as Daika } from "./models/cars/Daika";
import { Model as Daishi } from "./models/cars/Daishi";
import { Model as Himari } from "./models/cars/Himari";
import { Model as Ouki } from "./models/cars/Ouki";
import { Model as Renzo } from "./models/cars/Renzo";
import { Model as Sadako } from "./models/cars/Sadako";
import ready from "../../assets/icons/green-light.png";
import notReady from "../../assets/icons/red-light.png";

interface PlayerProps {
  player: any;
  props: any;
  car: any;
  isReady: boolean;
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

const Player = ({ player, props, car, isReady }: PlayerProps) => {
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
      const currentName = player.getState("name") || player.getProfile().name;
      if (currentName !== playerName) {
        setPlayerName(currentName);
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [player, playerName]);

  const CarComponent = getCarComponent(carName);

  return (
    <Suspense fallback={null}>
      <Center position={position}>
        <Html
          distanceFactor={10}
          position={[0, 0.8, 0]}
          scale={[0.15, 0.15, 0.15]}
          rotation={[0, -Math.PI / 2, 0]}
          zIndexRange={[0, 50]}
          transform
          occlude
          style={{
            transition: "all 0.2s",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div className="player-info-container">
            <div className="player-info-content">
              <span className="player-name">{playerName}</span>
              <img
                src={isReady ? ready.src : notReady.src}
                alt="Status"
                className="status-icon"
              />
            </div>
          </div>
        </Html>

        <CarComponent
          playerId={player.id}
          // @ts-ignore
          scale={[0.4, 0.4, 0.4]}
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
          receiveShadow
        />
      </Center>
    </Suspense>
  );
};

export default Player;
