import {
    CuboidCollider,
    Physics,
    RapierRigidBody,
    RigidBody,
} from "@react-three/rapier";
import { myPlayer } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { Quaternion, Vector3 } from "three";
import { usePlayerCamera } from "@/lib/hooks/usePlayerCamera";
import { CarControllerProps } from "@/lib/types";
import { useNetworkSync } from "@/lib/hooks/useNetworkSync";
import { useVehiclePhysics } from "@/lib/hooks/useVehiclePhysics";
import { PHYSICS } from "@/lib/constants";
import { VehicleModel } from "./vehicle-model";
import { PlayerCamera } from "./player-camera";
import { PlayerNameTag } from "./player-nametag";
import { Box, OrbitControls, TransformControls } from "@react-three/drei";
import { DebugRay } from "./debug-ray";

export const CarController = ({
    id,
    state,
    controls,
    idx,
    position,
    rotation,
}: CarControllerProps) => {
    const me = myPlayer();
    const isLocalPlayer = me?.id === state?.id;

    const rb = useRef<RapierRigidBody>(null);
    const targetRotation = useRef(new Quaternion());
    const targetPosition = useRef(new Vector3());
    const [rays, setRays] = useState<{ origin: Vector3, end: Vector3, hit: boolean }[]>([]);

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

    const { emitPositionUpdate } = useNetworkSync(
        id,
        isLocalPlayer,
        targetPosition,
        targetRotation
    );

    useVehiclePhysics(
        rb,
        isLocalPlayer,
        controls,
        targetPosition,
        targetRotation,
        emitPositionUpdate,
        setRays
    );

    // usePlayerCamera(rb, isLocalPlayer);

    return (
        <>
            {rays.map((ray, i) => (
                <DebugRay key={i} start={ray.origin} end={ray.end} color={ray.hit ? "red" : "green"} />
            ))}
            <RigidBody
                ref={rb}
                // colliders={false}
                angularDamping={15}
                type="dynamic"
                // mass={1000}
                position={position || undefined}
                quaternion={rotation || undefined}
            >
                {/* <CuboidCollider args={[4, 1, 1.4]} /> */}
                <Box
                    args={[4, 1, 2]}
                    material-color="grey"
                    castShadow
                />
                {/* <VehicleModel /> */}
                {/* {isLocalPlayer && <PlayerCamera />} */}
                {/* <PlayerNameTag state={state} /> */}
            </RigidBody>
        </>
    );
};
