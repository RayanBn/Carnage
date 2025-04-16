import {
    CuboidCollider,
    RapierRigidBody,
    RigidBody,
    vec3,
} from "@react-three/rapier";
import {
    PlayerState,
    Joystick,
    myPlayer,
} from "playroomkit";
import { Car } from "./models/car";
import { Center, PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

interface CarControllerProps {
    state: PlayerState | null;
    controls: Joystick | null;
    idx: number;
}

export const CarController = ({ state, controls, idx }: CarControllerProps) => {
    const me = myPlayer();
    const rb = useRef<RapierRigidBody>(null);
    const lookAt = useRef(new Vector3(0, 0, 0));

    useFrame(({ camera }, dt) => {
        if (!rb.current) return;

        if (me?.id === state?.id) {
            const targetLookAt = vec3(rb.current.translation());
            lookAt.current.lerp(targetLookAt, 0.1);
            camera.lookAt(lookAt.current);
        }
    });

    return (
        <>
            <group position={[0, 0, idx]}>
                <RigidBody ref={rb} colliders={false}>
                    <group rotation={[0, -Math.PI / 2, 0]}>
                        <CuboidCollider args={[4, 1, 1.4]} />
                        <Center>
                            <Car scale={[0.05, 0.05, 0.05]} />
                        </Center>
                    </group>
                    {me?.id === state?.id && (
                        <PerspectiveCamera
                            makeDefault
                            position={[30, 60, 30]}
                            near={1}
                        />
                    )}
                </RigidBody>
            </group>
        </>
    );
};
