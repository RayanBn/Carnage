import { Center } from "@react-three/drei";
import { getCarComponent } from "./player";

export function VehicleModel({ player }: { player: any }) {
  const carName = player?.state?.state?.car?.name || "Sadako";
  const CarComponent = getCarComponent(carName);

  return (
    <Center>
      <CarComponent
        // @ts-ignore
        scale={1.5}
        position={[0, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
        playerId={player.id}
      />
    </Center>
  );
}
