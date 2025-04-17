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
import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Euler, Quaternion, Vector3 } from "three";
import { useSocket } from "@/lib/hooks/useSocket";
import { usePlayerStatesStore } from "@/lib/store";

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

    useEffect(() => {
        if (socket) {
            socket.on("move", (data: any) => {
                const newPosition = new Vector3(
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

                if (data.id !== me?.id) {
                    targetPosition.current.copy(newPosition);
                    targetRotation.current.copy(newRotation);
                }

                updatePlayerPosition(data.id, newPosition, newRotation);
            });
        }

        return () => {
            if (socket) {
                socket.off("move");
            }
        };
    }, [socket, updatePlayerPosition, me?.id]);

    const emitPositionUpdate = useMemo(() => {
        return (currentPosition: Vector3, currentRotation: Quaternion) => {
            const now = performance.now();
            if (now - lastEmitTime.current < 20) return;

            if (
                socket &&
                (currentPosition.distanceTo(prevTranslation.current) > 0.001 ||
                    Math.abs(currentRotation.angleTo(prevRotation.current)) >
                        0.01)
            ) {
                socket.emit("move", {
                    id: id,
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
                    username: me.getProfile().name || "Unknown",
                });

                prevTranslation.current.copy(currentPosition);
                prevRotation.current.copy(currentRotation);
                lastEmitTime.current = now;
            }
        };
    }, [socket, id, me]);

    useFrame(({ camera }, dt) => {
        if (!rb.current) return;

        if (isLocalPlayer) {
            const targetLookAt = vec3(rb.current.translation());
            lookAt.current.lerp(targetLookAt, 0.1);
            camera.lookAt(lookAt.current);

            const rotVel = rb.current.angvel();

            if (controls?.isJoystickPressed()) {
                const angle = controls.angle();
                const dir = angle > Math.PI / 2 ? 1 : -1;
                rotVel.y = -dir * Math.sin(angle) * 3;
                const impulse = vec3({
                    x: 0,
                    y: 0,
                    z: 1000 * dt * -dir,
                });
                const eulerRot = euler().setFromQuaternion(
                    quat(rb.current.rotation())
                );
                impulse.applyEuler(eulerRot);
                rb.current.setAngvel(rotVel, true);
                rb.current.applyImpulse(impulse, true);
            }

            const currentPosition = vec3(rb.current.translation());
            const currentRotation = quat(rb.current.rotation());
            emitPositionUpdate(currentPosition, currentRotation);
        } else {
            if (position && rotation) {
                const currentPos = new Vector3().copy(rb.current.translation());
                currentPos.lerp(targetPosition.current, dt * 10);

                const currentRot = new Quaternion().copy(rb.current.rotation());
                currentRot.slerp(targetRotation.current, dt * 5);

                rb.current.setNextKinematicTranslation(currentPos);
                rb.current.setNextKinematicRotation(currentRot);
            }
        }
    });

    useEffect(() => {
        if (position) targetPosition.current.copy(position);
    }, [position]);

    useEffect(() => {
        if (rotation) targetRotation.current.copy(rotation);
    }, [rotation]);

    return (
        <>
            {position && (
                <group position={[0, 0, idx]}>
                    <RigidBody
                        ref={rb}
                        colliders={false}
                        position={position}
                        type={isLocalPlayer ? "dynamic" : "kinematicPosition"}
                    >
                        <group rotation={[0, -Math.PI / 2, 0]}>
                            <CuboidCollider args={[4, 1, 1.4]} />
                            <Center>
                                <Car scale={[0.05, 0.05, 0.05]} />
                            </Center>
                        </group>
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
            )}
        </>
    );
};
