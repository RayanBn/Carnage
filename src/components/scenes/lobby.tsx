import { Canvas } from "@react-three/fiber";
import { Car } from "../models/car";
import { useEffect, useState, Suspense, useCallback } from "react";
import { Center, OrbitControls, Text, Sky, useTexture } from "@react-three/drei";
import { getState, usePlayersList } from "playroomkit";
import { Vector3 } from "three";
import { useAssets } from "../ui/assets-loader";

const Road = () => {
  const { registerAssetLoad } = useAssets();
  
  // Simuler le chargement de texture pour la route
  useEffect(() => {
    // Indiquer que la ressource est chargée
    registerAssetLoad();
  }, [registerAssetLoad]);
  
  return (
    <>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.276, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#403f3f" />
        </mesh>

        
        <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 2]} position={[0, -.275, 0]}>
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
    const { forceHideLoader } = useAssets();

    useEffect(() => {
        console.log(players);
    }, [players]);
    
    // Force la fermeture du loader lorsque la scène est montée
    useEffect(() => {
        // Attendre que la scène soit montée puis forcer la fermeture du loader
        const forceHideTimer = setTimeout(() => {
            console.log("Forcing loader to hide from LobbyScene");
            forceHideLoader();
        }, 2000);
        
        return () => clearTimeout(forceHideTimer);
    }, [forceHideLoader]);

    return (
        <Canvas
            camera={{
                position: [-3, .5, 1],
                fov: 45,
                near: 0.1,
                far: 1000,
            }}
            onCreated={() => {
                console.log("Canvas created");
            }}
        >
            <Suspense fallback={null}>
                <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />

                <ambientLight intensity={1.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                
                <fog attach="fog" color="#e9eff2" near={.5} far={20} />

                <Road />

                {
                    players.map((player, idx) => {
                        const totalPlayers = players.length;
                        const spacing = 0.8;
                        const maxCarsPerRow = 4;
                        
                        const row = Math.floor(idx / maxCarsPerRow);
                        const positionInRow = idx % maxCarsPerRow;
                        
                        const carsInCurrentRow = Math.min(maxCarsPerRow, totalPlayers - (row * maxCarsPerRow));
                        const totalWidth = (carsInCurrentRow - 1) * spacing;
                        const startZ = -totalWidth / 2;
                        
                        const position = new Vector3(
                            row * 2,
                            0.5,
                            0.33 + (startZ + (positionInRow * spacing))
                        );

                        return (
                            <Player key={idx} player={player} props={{ position }} />
                        )
                    })
                }

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 2.5}
                    enableRotate={true}
                    rotateSpeed={0.5}
                    minAzimuthAngle={-Math.PI / 1.2}
                    maxAzimuthAngle={0}
                />
            </Suspense>
        </Canvas>
    );
};

export default LobbyScene;
