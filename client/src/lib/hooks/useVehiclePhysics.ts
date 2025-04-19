import { useRef } from "react";
import { Vector3, Quaternion } from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { vec3, quat, euler } from "@react-three/rapier";
import { Joystick } from "playroomkit";

const PHYSICS = {
    EMIT_THROTTLE: 5,
    POSITION_THRESHOLD: 0.000001,
    ROTATION_THRESHOLD: 0.0001,
    LERP_FACTOR: 0.1,
    ROTATION_MULTIPLIER: 3,
    IMPULSE_MULTIPLIER: 1000,
    DISTANCE_THRESHOLD: 0.1,
    FORCE_MULTIPLIER: 100,
    ANGLE_THRESHOLD: 0.01,
    TORQUE_MULTIPLIER: 50,
    HALF_PI: Math.PI / 2,
};

export function useVehiclePhysics(
    rigidBodyRef: React.RefObject<RapierRigidBody>,
    isLocalPlayer: boolean,
    controls: Joystick | null,
    targetPosition: React.MutableRefObject<Vector3>,
    targetRotation: React.MutableRefObject<Quaternion>,
    emitPositionUpdate: (pos: Vector3, rot: Quaternion) => void
) {
    const tempVector = useRef(new Vector3());
    const identityQuaternion = useRef(new Quaternion());

    useFrame((_, dt) => {
        const rigidBody = rigidBodyRef.current;
        if (!rigidBody) return;

        if (isLocalPlayer) {
            if (controls?.isJoystickPressed()) {
                const angle = controls.angle();
                const velocity = vec3(rigidBody.linvel());
                const speed = velocity.length();

                const MIN_ROT = 0.2;
                const MAX_ROT = 4.0;
                const MAX_SPEED = 100;

                const rotationFactor = Math.min(
                    MIN_ROT + (speed / MAX_SPEED) * (MAX_ROT - MIN_ROT),
                    MAX_ROT
                );

                const rotVel = vec3(rigidBody.angvel());

                if (speed > 0.1) {
                    rotVel.y = -Math.sin(angle) * rotationFactor;
                    rigidBody.setAngvel(rotVel, true);
                }
                const dir = angle > PHYSICS.HALF_PI ? 1 : -1;

                if (Math.abs(Math.cos(angle)) > 0.5) {
                    const impulse = vec3({
                        x: PHYSICS.IMPULSE_MULTIPLIER * dt * -dir,
                        y: 0,
                        z: 0,
                    });

                    const eulerRot = euler().setFromQuaternion(
                        quat(rigidBody.rotation())
                    );

                    impulse.applyEuler(eulerRot);
                    rigidBody.applyImpulse(impulse, true);
                }
            }

            const currentPosition = vec3(rigidBody.translation());
            const currentRotation = quat(rigidBody.rotation());
            emitPositionUpdate(currentPosition, currentRotation);
        } else {
            const currentPos = vec3(rigidBody.translation());
            tempVector.current.copy(targetPosition.current).sub(currentPos);
            const distanceToTarget = tempVector.current.length();

            if (distanceToTarget > PHYSICS.DISTANCE_THRESHOLD) {
                tempVector.current
                    .normalize()
                    .multiplyScalar(PHYSICS.FORCE_MULTIPLIER * dt);
                rigidBody.applyImpulse(tempVector.current, true);
            }

            const currentRot = quat(rigidBody.rotation());

            const deltaRot = new Quaternion()
                .copy(targetRotation.current)
                .multiply(currentRot.invert());

            const axis = new Vector3(
                deltaRot.x,
                deltaRot.y,
                deltaRot.z
            ).normalize();

            const angle = deltaRot.angleTo(identityQuaternion.current);

            if (angle > PHYSICS.ANGLE_THRESHOLD) {
                tempVector.current
                    .copy(axis)
                    .multiplyScalar(angle * PHYSICS.TORQUE_MULTIPLIER * dt);
                rigidBody.applyTorqueImpulse(tempVector.current, true);
            }
        }
    });
}
