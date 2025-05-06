import { useRef, useState } from "react";
import { Vector3, Quaternion } from "three";
import { RapierContext, RapierRigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { vec3, quat } from "@react-three/rapier";
import { Joystick } from "playroomkit";
import * as THREE from "three"
import { RayData, SpringData, SuspensionForceData } from "../data";
import { useSuspension } from "./useSuspension";

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

const suspensionPoints = [
    new THREE.Vector3(-2, -0.3, -1), // front-left
    new THREE.Vector3(2, -0.3, -1),  // front-right
    new THREE.Vector3(-2, -0.3, 1),  // rear-left
    new THREE.Vector3(2, -0.3, 1)   // rear-right
];

const springData: SpringData = {
    restLength: 1.5,
    stiffness: 2,
    damping: 20,
    maxTravel: 1
};

function radToXY(rad: number) {
    return {
        y: Math.cos(rad),
        x: Math.sin(rad)
    };
}

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

    const suspensionData = useSuspension({ wheelPositions: suspensionPoints, rb: rigidBodyRef, spring: springData });

    const localForwardVec = new THREE.Vector3(1, 0, 0);
    const localRightVec = new THREE.Vector3(0, 0, 1);

    const [slipVector, setSlipVector] = useState<Vector3>();

    useFrame((_, dt) => {
        const rigidBody = rigidBodyRef.current;
        if (!rigidBody) return;

        if (isLocalPlayer) {


            if (controls?.isJoystickPressed()) {
                const {x, y} = radToXY(controls.angle());
                rigidBody.applyImpulseAtPoint(new THREE.Vector3(y, 0, 0).applyQuaternion(rigidBody.rotation()), vec3(rigidBody.translation()).add(new Vector3(0, -1, 0)), true);
                rigidBody.applyTorqueImpulse(new THREE.Vector3(0, -x * 4, 0), true);
            }

            const worldRightVec = localRightVec.clone().applyQuaternion(rigidBody.rotation());
            const slipVel = vec3(rigidBody.linvel()).dot(worldRightVec);
            rigidBody.applyImpulse(new Vector3(0, 0, -slipVel * 1).applyQuaternion(rigidBody.rotation()), true);

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
    return ({
        suspensionData: suspensionData,
    });
}
