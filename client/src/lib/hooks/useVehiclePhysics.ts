import { useRef } from "react";
import { Vector3, Quaternion } from "three";
import { RapierContext, RapierRigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { vec3, quat } from "@react-three/rapier";
import { Joystick } from "playroomkit";
import * as THREE from "three"
import { RayData, SuspensionForceData } from "../data";

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

const suspensionLength = 1;
const springStrength = 2; // spring strength
const damping = 1;    // damping strength
const suspensionPoints = [
    new THREE.Vector3(-2, -0.55, -1), // front-left
    new THREE.Vector3(2, -0.55, -1),  // front-right
    new THREE.Vector3(-2, -0.55, 1),  // rear-left
    new THREE.Vector3(2, -0.55, 1)   // rear-right
];

const computeSuspensionForce = (linVel: number, toi: number) => {
    const compression = suspensionLength - toi;
    const force = (springStrength * compression) - (damping * linVel);
    const suspensionForce = new THREE.Vector3(0, force, 0);

    return suspensionForce;
}

const simulateSuspension = (rb: RapierRigidBody, context: RapierContext) => {
    const carRot = quat(rb.rotation());
    const carPos = vec3(rb.translation());
    const rays: RayData[] = [];
    const suspensionForces: SuspensionForceData[] = [];
    const localDown = new THREE.Vector3(0, -1, 0);

    suspensionPoints.forEach(point => {
        const worldStart = point.clone().applyQuaternion(carRot).add(carPos);
        const worldDown = localDown.clone().applyQuaternion(carRot).normalize();
        const ray = new context.rapier.Ray(worldStart, worldDown);
        const hit = context.world.castRay(ray, suspensionLength, true);

        var worldEnd = worldStart.clone().addScaledVector(worldDown, suspensionLength);
        var suspensionForce = worldDown.clone().negate();

        if (hit) {
            worldEnd = vec3(ray.pointAt(hit.timeOfImpact));
            suspensionForce = computeSuspensionForce(rb.linvel().y, hit.timeOfImpact);
            suspensionForce.applyQuaternion(carRot);
            rb.applyImpulseAtPoint(suspensionForce, worldStart, true);
        }
        rays.push({
            origin: worldStart,
            end: worldEnd,
            direction: worldDown,
            hit: hit ? true : false
        });

        suspensionForces.push({
            origin: worldStart,
            force: suspensionForce,
        });
    });
    return {
        rays: rays,
        suspensionForces: suspensionForces
    }
};

export function useVehiclePhysics(
    rigidBodyRef: React.RefObject<RapierRigidBody>,
    isLocalPlayer: boolean,
    controls: Joystick | null,
    targetPosition: React.MutableRefObject<Vector3>,
    targetRotation: React.MutableRefObject<Quaternion>,
    emitPositionUpdate: (pos: Vector3, rot: Quaternion) => void,
    setRays: (rays: RayData[]) => void,
    setSuspensionForces: (suspensionForces: SuspensionForceData[]) => void
) {
    const tempVector = useRef(new Vector3());
    const identityQuaternion = useRef(new Quaternion());
    const rapierContext = useRapier();

    useFrame((_, dt) => {
        const rigidBody = rigidBodyRef.current;
        if (!rigidBody) return;

        if (isLocalPlayer) {
            const { rays, suspensionForces } = simulateSuspension(rigidBody, rapierContext);

            setRays(rays);
            setSuspensionForces(suspensionForces);

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
