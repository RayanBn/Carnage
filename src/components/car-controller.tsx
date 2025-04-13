import {
    CuboidCollider,
    RapierRigidBody,
    RigidBody,
    vec3,
} from "@react-three/rapier";
import { PlayerState, Joystick, myPlayer } from "playroomkit";
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
        if (!rb.current) {
            return;
        }

        if (controls?.isJoystickPressed()) {
            const impulse = vec3({
                x: 0,
                y: 0,
                z: -10,
            });
            rb.current.applyImpulse(impulse, true);
        }
    });

    return (
        <>
            <group
                position={[0, 0, idx]}
                rotation={[0, -Math.PI / 2, 0]}
            >
                <RigidBody ref={rb} colliders={false}>
                    <CuboidCollider args={[4, 1, 1.4]} />
                    <Center>
                        <Car
                            scale={[.05, .05, .05]}
                        />
                    </Center>
                </RigidBody>
            </group>
            {me?.id === state?.id && (
                <PerspectiveCamera
                    makeDefault
                    position={[0, 3, 3]}
                    near={1}
                />
            )}
        </>
    );
};
