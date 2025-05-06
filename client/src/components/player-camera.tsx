import { PerspectiveCamera } from "@react-three/drei";

export function PlayerCamera() {
  return <PerspectiveCamera makeDefault position={[15, 7, 0]} near={1} />;
}
