import { PerspectiveCamera } from "@react-three/drei";

export function PlayerCamera() {
    return <PerspectiveCamera makeDefault position={[30, 60, 30]} near={1} />;
}
