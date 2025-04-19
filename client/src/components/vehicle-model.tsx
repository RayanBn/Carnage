import { Center } from "@react-three/drei";
import { Car } from "./models/car";

export function VehicleModel() {
    return (
        <Center>
            <Car scale={[0.05, 0.05, 0.05]} />
        </Center>
    );
}
