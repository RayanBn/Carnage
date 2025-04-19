import { useRef } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { RapierRigidBody } from "@react-three/rapier";
import { PHYSICS } from "../constants";

export function usePlayerCamera(
    rigidBodyRef: React.RefObject<RapierRigidBody>,
    isLocalPlayer: boolean
) {
    const lookAt = useRef(new Vector3(0, 0, 0));

    useFrame(({ camera }) => {
        if (!isLocalPlayer || !rigidBodyRef.current) return;

        const targetLookAt = vec3(rigidBodyRef.current.translation());
        lookAt.current.lerp(targetLookAt, PHYSICS.LERP_FACTOR);
        camera.lookAt(lookAt.current);
    });
}
