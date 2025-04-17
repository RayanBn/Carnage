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
import { Vector3 } from "three";
import { useSocket } from "@/lib/hooks/useSocket";
import { usePlayerStatesStore } from "@/lib/store";

interface CarControllerProps {
    id: string;
    state: PlayerState | null;
    controls: Joystick | null;
    idx: number;
    position: Vector3 | null;
}

export const CarController = ({
    id,
    state,
    controls,
    idx,
    position,
}: CarControllerProps) => {
    const me = myPlayer();
    const rb = useRef<RapierRigidBody>(null);
    const lookAt = useRef(new Vector3(0, 0, 0));
    const { socket } = useSocket();

    const prevTranslation = useRef<Vector3>(new Vector3(0, 0, 0));
    const prevRotation = useRef<Vector3>(new Vector3(0, 0, 0));
    const lastEmitTime = useRef<number>(0);
    const { updatePlayerPosition } = usePlayerStatesStore();

    const MOVEMENT_THRESHOLD = 0.001;
    const THROTTLE_TIME = 10;

    useEffect(() => {
        if (socket) {
            socket.on("move", (data: any) => {
                updatePlayerPosition(data.id, data.position, data.rotation);
            });
        }

        return () => {
            if (socket) {
                socket.off("move");
            }
        };
    }, [socket, updatePlayerPosition]);

    const hasPositionChanged = useMemo(
        () => (curr: Vector3, prev: Vector3) => {
            return curr.distanceTo(prev) > MOVEMENT_THRESHOLD;
        },
        []
    );

    const hasRotationChanged = useMemo(
        () => (curr: Vector3, prev: Vector3) => {
            return (
                Math.abs(curr.y - prev.y) > MOVEMENT_THRESHOLD ||
                Math.abs(curr.x - prev.x) > MOVEMENT_THRESHOLD ||
                Math.abs(curr.z - prev.z) > MOVEMENT_THRESHOLD
            );
        },
        []
    );

    const emitPositionUpdate = useMemo(
        () => (currentPosition: Vector3, currentRotation: Vector3) => {
            const now = performance.now();
            if (now - lastEmitTime.current < THROTTLE_TIME) return;

            if (
                socket &&
                (hasPositionChanged(currentPosition, prevTranslation.current) ||
                    hasRotationChanged(currentRotation, prevRotation.current))
            ) {
                socket.emit("move", {
                    id: id,
                    position: [
                        currentPosition.x,
                        currentPosition.y,
                        currentPosition.z,
                    ],
                    rotation: [
                        currentRotation.x,
                        currentRotation.y,
                        currentRotation.z,
                    ],
                    username: me.getProfile().name || "Unknown",
                });

                prevTranslation.current.copy(currentPosition);
                prevRotation.current.copy(currentRotation);
                lastEmitTime.current = now;
            }
        },
        [socket, id, me, hasPositionChanged, hasRotationChanged]
    );

    useFrame(({ camera }, dt) => {
        if (!rb.current) return;

        if (me?.id === state?.id) {
            const targetLookAt = vec3(rb.current.translation());
            lookAt.current.lerp(targetLookAt, 0.1);
            camera.lookAt(lookAt.current);

            const rotVel = rb.current.angvel();

            if (controls?.isJoystickPressed()) {
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
            }

            const currentPosition = vec3(rb.current.translation());
            const currentRotation = vec3(rb.current.rotation());

            emitPositionUpdate(currentPosition, currentRotation);
        }
    });

    return (
        <>
            {position && (
                <group position={[0, 0, idx]}>
                    <RigidBody
                        ref={rb}
                        colliders={false}
                        position={position}
                    >
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
                        <Html>
                            <p>{state?.getProfile().name}</p>
                        </Html>
                    </RigidBody>
                </group>
            )}
        </>
    );
};
