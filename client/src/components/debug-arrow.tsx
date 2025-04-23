import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

type DebugArrowProps = {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  length?: number;
  color?: THREE.ColorRepresentation;
};

export function DebugArrow({
  origin,
  direction,
  length = 1,
  color = "lime"
}: DebugArrowProps) {
  const ref = useRef<THREE.ArrowHelper | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    const arrow = new THREE.ArrowHelper(
      direction.clone().normalize(),
      origin,
      length,
      color
    );
    scene.add(arrow);
    ref.current = arrow;

    return () => {
      scene.remove(arrow);
    };
  }, [origin, direction, length, color]);

  return null;
}
