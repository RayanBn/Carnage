import {
    CuboidCollider,
    quat,
    euler,
    RapierRigidBody,
    RigidBody,
    vec3,
} from "@react-three/rapier";
import { PlayerState, Joystick, myPlayer } from "playroomkit";
import { Car } from "./models/car";
import { Center, Html, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";
import { useSocket } from "@/lib/hooks/useSocket";
import { usePlayerStatesStore } from "@/lib/store";

const EMIT_THROTTLE = 5; // ms
const POSITION_THRESHOLD = 0.000001;
const ROTATION_THRESHOLD = 0.0001;
const LERP_FACTOR = 0.1;
const ROTATION_MULTIPLIER = 3;
const IMPULSE_MULTIPLIER = 1000;
const DISTANCE_THRESHOLD = 0.1;
const FORCE_MULTIPLIER = 100;
const ANGLE_THRESHOLD = 0.01;
const TORQUE_MULTIPLIER = 50;
const HALF_PI = Math.PI / 2;

interface CarControllerProps {
    id: string;
    state: PlayerState | null;
    controls: Joystick | null;
    idx: number;
    position: Vector3 | null;
    rotation: Quaternion | null;
}

export const CarController = ({
    id,
    state,
    controls,
    idx,
    position,
    rotation,
}: CarControllerProps) => {
    const me = myPlayer();
    const rb = useRef<RapierRigidBody>(null);
    const lookAt = useRef(new Vector3(0, 0, 0));
    const { socket } = useSocket();
    const isLocalPlayer = me?.id === state?.id;

    const targetRotation = useRef(new Quaternion());
    const targetPosition = useRef(new Vector3());

    const prevTranslation = useRef<Vector3>(new Vector3(0, 0, 0));
    const prevRotation = useRef<Quaternion>(new Quaternion());
    const lastEmitTime = useRef<number>(0);
    const { updatePlayerPosition } = usePlayerStatesStore();

    const tempVector = useRef(new Vector3());
    const identityQuaternion = useRef(new Quaternion());

    useEffect(() => {
        if (!position) return;

        targetPosition.current.copy(position);
        if (rb.current) rb.current.setTranslation(position, true);
    }, [position]);

    useEffect(() => {
        if (!rotation) return;

        targetRotation.current.copy(rotation);
        if (rb.current) rb.current.setRotation(rotation, true);
    }, [rotation]);

    useEffect(() => {
        if (!socket) return;

        const myId = me?.id;

        const handleMove = (data: any) => {
            if (data.id === myId) return;

            tempVector.current.set(
                data.position[0],
                data.position[1],
                data.position[2]
            );

            const newRotation = new Quaternion(
                data.rotation.x,
                data.rotation.y,
                data.rotation.z,
                data.rotation.w
            );

            targetPosition.current.copy(tempVector.current);
            targetRotation.current.copy(newRotation);
            updatePlayerPosition(
                data.id,
                tempVector.current.clone(),
                newRotation
            );
        };

        socket.on("move", handleMove);

        return () => {
            socket.off("move", handleMove);
        };
    }, [socket, updatePlayerPosition, me?.id]);

    const emitPositionUpdate = useCallback(
        (currentPosition: Vector3, currentRotation: Quaternion) => {
            const now = performance.now();
            if (now - lastEmitTime.current < EMIT_THROTTLE) return;

            if (!socket) return;

            const positionChanged =
                currentPosition.distanceTo(prevTranslation.current) >
                POSITION_THRESHOLD;
            const rotationChanged =
                Math.abs(currentRotation.angleTo(prevRotation.current)) >
                ROTATION_THRESHOLD;

            if (!(positionChanged || rotationChanged)) return;

            const playerName = me?.getProfile().name || "Unknown";

            socket.emit("move", {
                id,
                position: [
                    currentPosition.x,
                    currentPosition.y,
                    currentPosition.z,
                ],
                rotation: {
                    x: currentRotation.x,
                    y: currentRotation.y,
                    z: currentRotation.z,
                    w: currentRotation.w,
                },
                username: playerName,
            });

            prevTranslation.current.copy(currentPosition);
            prevRotation.current.copy(currentRotation);
            lastEmitTime.current = now;
        },
        [socket, id, me]
    );

    useFrame(({ camera }, dt) => {
        const rigidBody = rb.current;
        if (!rigidBody) return;

        if (isLocalPlayer) {
            const targetLookAt = vec3(rigidBody.translation());
            lookAt.current.lerp(targetLookAt, LERP_FACTOR);
            camera.lookAt(lookAt.current);

            if (controls?.isJoystickPressed()) {
                const angle = controls.angle();
                const velocity = vec3(rigidBody.linvel());
                const speed = velocity.length();

                const MIN_ROT = 0.2;
                const MAX_ROT = 4.0;
                const MAX_SPEED = 50;

                const rotationFactor = Math.min(
                    MIN_ROT + (speed / MAX_SPEED) * (MAX_ROT - MIN_ROT),
                    MAX_ROT
                );

                const rotVel = vec3(rigidBody.angvel());

                if (speed > 0.1) {
                    rotVel.y = -Math.sin(angle) * rotationFactor;
                    rigidBody.setAngvel(rotVel, true);
                }
                const dir = angle > HALF_PI ? 1 : -1;

                if (Math.abs(Math.cos(angle)) > 0.5) {
                    const impulse = vec3({
                        x: IMPULSE_MULTIPLIER * dt * -dir,
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

            if (distanceToTarget > DISTANCE_THRESHOLD) {
                tempVector.current
                    .normalize()
                    .multiplyScalar(FORCE_MULTIPLIER * dt);
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

            if (angle > ANGLE_THRESHOLD) {
                tempVector.current
                    .copy(axis)
                    .multiplyScalar(angle * TORQUE_MULTIPLIER * dt);
                rigidBody.applyTorqueImpulse(tempVector.current, true);
            }
        }
    });

    return (
        <>
            <group position={[0, 0, idx]} rotation={[0, -HALF_PI, 0]}>
                <RigidBody
                    ref={rb}
                    colliders={false}
                    type="dynamic"
                    mass={1000}
                    position={position || undefined}
                    quaternion={rotation || undefined}
                >
                    <CuboidCollider args={[4, 1, 1.4]} />
                    <Center>
                        <Car scale={[0.05, 0.05, 0.05]} />
                    </Center>
                    {isLocalPlayer && (
                        <PerspectiveCamera
                            makeDefault
                            position={[30, 60, 30]}
                            near={1}
                        />
                    )}
                    <Html>
                        <p>{state?.getProfile().name}</p>
                    </Html>
                </RigidBody>
            </group>
        </>
    );
};
