import {
    CuboidCollider,
    euler,
    quat,
    RapierRigidBody,
    RigidBody,
    vec3,
} from "@react-three/rapier";
import { PlayerState, Joystick, myPlayer, isHost, getState } from "playroomkit";
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
        if (me?.id === state?.id) {
            const targetLookAt = vec3(rb.current.translation());
            lookAt.current.lerp(targetLookAt, 0.1);
            camera.lookAt(lookAt.current);
        }

        const rotVel = rb.current.angvel();
        if (controls?.isJoystickPressed()) {
            const angle = controls.angle();
            console.log(angle);
            const dir = angle > Math.PI / 2 ? 1 : -1;
            rotVel.y = dir * Math.sin(angle) * 3;
            const impulse = vec3({
                x: 0,
                y: 0,
                z: 1000 * dt * -dir,
            });
            const eulerRot = euler().setFromQuaternion(quat(rb.current.rotation()));
            impulse.applyEuler(eulerRot);
            rb.current.applyImpulse(impulse, true);
        }
        rb.current.setAngvel(rotVel, true);
        if (isHost()) {
            state?.setState("pos", rb.current.translation());
            state?.setState("rot", rb.current.rotation());
        } else {
            const pos = state?.getState("pos");
            if (pos) {
                rb.current.setTranslation(pos, true);
                rb.current.setRotation(state?.getState("rot"), true);
            }
        }
    });

    return (
        <>
            <group
                position={[0, 0, idx]}
            >
                <RigidBody
                    ref={rb}
                    colliders={false}
                >
                    <group
                        rotation={[0, -Math.PI / 2, 0]}
                    >
                        <CuboidCollider args={[4, 1, 1.4]} />
                        <Center>
                            <Car
                                scale={[.05, .05, .05]}
                            />
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
