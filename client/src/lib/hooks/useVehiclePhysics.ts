import { useEffect, useRef } from "react";
import { Vector3, Quaternion } from "three";
import { RapierRigidBody, useRapier } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { vec3, quat, euler } from "@react-three/rapier";
import { Joystick } from "playroomkit";
import * as THREE from "three"

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

type RayData = {
    origin: THREE.Vector3,
    end: THREE.Vector3,
    hit: boolean
};

export function useVehiclePhysics(
    rigidBodyRef: React.RefObject<RapierRigidBody>,
    isLocalPlayer: boolean,
    controls: Joystick | null,
    targetPosition: React.MutableRefObject<Vector3>,
    targetRotation: React.MutableRefObject<Quaternion>,
    emitPositionUpdate: (pos: Vector3, rot: Quaternion) => void,
    setRays: (rays: RayData[]) => void,
) {
    const tempVector = useRef(new Vector3());
    const identityQuaternion = useRef(new Quaternion());
    const { world, rapier } = useRapier();

    const suspensionPoints = [
        new THREE.Vector3(-2, -0.6, -1), // front-left
        new THREE.Vector3(2, -0.6, -1),  // front-right
        new THREE.Vector3(-2, -0.6, 1),  // rear-left
        new THREE.Vector3(2, -0.6, 1)   // rear-right
    ];

    const suspensionLength = 1;
    const stiffness = 10; // spring strength
    const damping = 2;     // damping strength

    useFrame((_, dt) => {
        const rigidBody = rigidBodyRef.current;
        if (!rigidBody) return;

        if (isLocalPlayer) {
            const position = rigidBody.translation();
            const rotation = rigidBody.rotation();

            const carRot = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
            const carPos = new THREE.Vector3(position.x, position.y, position.z);

            const raysThisFrame: RayData[] = [];

            suspensionPoints.forEach(point => {
                const worldStart = point.clone().applyQuaternion(carRot).add(carPos);
                const downVector = new THREE.Vector3(0, -1, 0);
                const ray = new rapier.Ray(worldStart, { x: 0, y: -1, z: 0 });
                const hit = world.castRay(ray, suspensionLength, true);

                var worldEnd = worldStart.clone().addScaledVector(downVector, suspensionLength);

                if (hit && hit.timeOfImpact < suspensionLength) {
                    worldEnd = vec3(ray.pointAt(hit.timeOfImpact));

                    const compression = suspensionLength - hit.timeOfImpact;

                    const linVel = rigidBody.linvel();

                    const spring = stiffness * compression;
                    const damp = damping * linVel.y;
                    const forceY = spring - damp;

                    const force = new THREE.Vector3(0, forceY, 0);
                    rigidBody.applyImpulseAtPoint(
                        { x: force.x, y: force.y, z: force.z },
                        { x: worldStart.x, y: worldStart.y, z: worldStart.z },
                        true
                    );
                }
                raysThisFrame.push({
                    origin: worldStart,
                    end: worldEnd,
                    hit: hit ? true : false
                });
            });

            setRays(raysThisFrame);
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
