import {
    CuboidCollider,
    euler,
    quat,
    RapierRigidBody,
    RigidBody,
    vec3,
} from "@react-three/rapier";
import {
    PlayerState,
    Joystick,
    myPlayer,
    isHost,
    getState,
    useIsHost,
} from "playroomkit";
import { Car } from "./models/car";
import { Center, PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";

interface CarControllerProps {
    state: PlayerState | null;
    controls: Joystick | null;
    idx: number;
}

export const CarController = ({ state, controls, idx }: CarControllerProps) => {
    const me = myPlayer();
    const rb = useRef<RapierRigidBody>(null);
    const lookAt = useRef(new Vector3(0, 0, 0));
    const amHost = useIsHost();

    useFrame(({ camera }, dt) => {
        if (!rb.current) return;

        if (me?.id === state?.id) {
            const targetLookAt = vec3(rb.current.translation());
            lookAt.current.lerp(targetLookAt, 0.1);
            camera.lookAt(lookAt.current);
        }

        const rotVel = rb.current.angvel();

        if (me?.id === state?.id && controls?.isJoystickPressed()) {
            const angle = controls.angle();
            const dir = angle > Math.PI / 2 ? 1 : -1;
            rotVel.y = dir * Math.sin(angle) * 3;

            const impulse = vec3({
                x: 0,
                y: 0,
                z: 1000 * dt * -dir,
            });

            const eulerRot = euler().setFromQuaternion(
                quat(rb.current.rotation())
            );
            impulse.applyEuler(eulerRot);

            rb.current.applyImpulse(impulse, true);

            const input = {
                timestamp: Date.now(),
                angle: angle,
                deltaTime: dt,
                direction: dir,
            };

            state?.setState("lastInput", input, true);
        }

        rb.current.setAngvel(rotVel, true);

        if (amHost) {
            if (me?.id !== state?.id) {
                const lastInput = state?.getState("lastInput");
                if (
                    lastInput &&
                    lastInput.timestamp >
                        (state?.getState("lastProcessedInput")?.timestamp || 0)
                ) {
                    const dir = lastInput.direction;
                    const angle = lastInput.angle;

                    const impulse = vec3({
                        x: 0,
                        y: 0,
                        z: 1000 * lastInput.deltaTime * -dir,
                    });

                    const currentRot = quat(rb.current.rotation());
                    const eulerRot = euler().setFromQuaternion(currentRot);
                    impulse.applyEuler(eulerRot);

                    rb.current.applyImpulse(impulse, true);
                    rb.current.setAngvel(
                        { x: 0, y: dir * Math.sin(angle) * 3, z: 0 },
                        true
                    );

                    state?.setState("lastProcessedInput", lastInput);
                }
            }

            state?.setState("authPos", rb.current.translation());
            state?.setState("authRot", rb.current.rotation());
            state?.setState("authTime", Date.now());
        } else if (me?.id === state?.id) {
            const authPos = state?.getState("authPos");
            const authRot = state?.getState("authRot");
            const authTime = state?.getState("authTime");

            if (authPos && authTime) {
                const currentPos = vec3(rb.current.translation());
                const errorVec = vec3({
                    x: authPos.x - currentPos.x,
                    y: authPos.y - currentPos.y,
                    z: authPos.z - currentPos.z,
                });

                if (errorVec.length() > 0.5) {
                    const correctionFactor = 0.3;
                    const correction = errorVec.multiplyScalar(correctionFactor);

                    rb.current.setTranslation(
                        {
                            x: currentPos.x + correction.x,
                            y: currentPos.y + correction.y,
                            z: currentPos.z + correction.z,
                        },
                        true
                    );
                }

                if (authRot) {
                    const currentRot = quat(rb.current.rotation());
                    const errorRot = currentRot
                        .clone()
                        .invert()
                        .multiply(authRot);

                    if (errorRot.angleTo(new Quaternion()) > 0.05) {
                        const correctedRot = currentRot.slerp(authRot, 0.3);
                        rb.current.setRotation(correctedRot, true);
                    }
                }
            }
        } else {
            const authPos = state?.getState("authPos");
            const authRot = state?.getState("authRot");

            if (authPos) {
                const currentPos = vec3(rb.current.translation());
                const targetPos = vec3(authPos);

                rb.current.setTranslation(
                    {
                        x: currentPos.x + (targetPos.x - currentPos.x) * 0.2,
                        y: currentPos.y + (targetPos.y - currentPos.y) * 0.2,
                        z: currentPos.z + (targetPos.z - currentPos.z) * 0.2,
                    },
                    true
                );

                if (authRot) {
                    const currentRot = quat(rb.current.rotation());
                    const targetRot = quat(authRot);
                    const interpolatedRot = currentRot.slerp(targetRot, 0.2);
                    rb.current.setRotation(interpolatedRot, true);
                }
            }
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
