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
import { useEffect, use, useRef, useState } from "react";
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
    const [ currentTranslation, setCurrentTranslation ] = useState<Vector3>(new Vector3(0, 0, 0));
    const [ currentRotation, setCurrentRotation ] = useState<Vector3>(new Vector3(0, 0, 0));
    const { updatePlayerPosition } = usePlayerStatesStore();

    useEffect(() => {
        if (socket) {
            socket.on("move", (data: any) => {
                updatePlayerPosition(data.id, data.position, data.rotation);
            });
        }
    }, [socket]);

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
                const currentPosition = vec3(rb.current.translation());
                const currentRotation = vec3(rb.current.rotation());
                setCurrentTranslation(currentPosition);
                setCurrentRotation(currentRotation);
                if (socket) {
                    console.log("emitting move from", currentTranslation, currentRotation);
                    socket.emit("move", {
                        id: id,
                        position: [
                            currentTranslation.x,
                            currentTranslation.y,
                            currentTranslation.z,
                        ],
                        rotation: [
                            currentRotation.x,
                            currentRotation.y,
                            currentRotation.z,
                        ],
                        username: me.getProfile().name || "Unknown",
                    });
                }
            }
        }
    });

    return (
        <>
            {position && (
                <group position={[0, 0, idx]}>
                    <RigidBody ref={rb} colliders={false} position={position}>
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
