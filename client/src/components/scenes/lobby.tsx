import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  Sky,
  PresentationControls,
  Bounds,
  useBounds,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { getState, usePlayersList, usePlayersState } from "playroomkit";
import { Vector3 } from "three";
import { useAssets } from "../ui/assets-loader";
import { Model as Map } from "../models/map";
import Player from "../player";

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
  const playerCars = usePlayersState("car");
  const playersStatus = usePlayersState("ready");

  return (
    <Canvas
      shadows
      camera={{
        position: [-30, 5, 10],
        fov: 80,
        near: 0.1,
        far: 100000,
      }}
    >
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      <Environment preset="sunset" />
      <fog attach="fog" color="#e9eff2" near={1} far={200} />
      <pointLight
        position={[0, 10, 0]}
        intensity={100}
        castShadow
        shadow-radius={0.5}
      />

      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        config={{ mass: 2, tension: 400 }}
        snap
      >
        <Map
          physic={false}
          scale={[0.23, 0.23, 0.23]}
          position={[30, -19.27, -5]}
          rotation={[0, -Math.PI / 2, 0]}
        />

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
              0.03,
              0.33 + (startZ + positionInRow * spacing)
            );

            return (
              <Player
                key={idx}
                player={player}
                props={{ position }}
                isReady={playersStatus[idx].state}
                car={playerCars[idx].state}
              />
            );
          })}
        </Bounds>
      </PresentationControls>
    </Canvas>
  );
};

export default LobbyScene;
