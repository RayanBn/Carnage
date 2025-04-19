import {
    CuboidCollider,
    RapierRigidBody,
    RigidBody,
} from "@react-three/rapier";
import { myPlayer } from "playroomkit";
import { useEffect, useRef } from "react";
import { Quaternion, Vector3 } from "three";
import { usePlayerCamera } from "@/lib/hooks/usePlayerCamera";
import { CarControllerProps } from "@/lib/types";
import { useNetworkSync } from "@/lib/hooks/useNetworkSync";
import { useVehiclePhysics } from "@/lib/hooks/useVehiclePhysics";
import { PHYSICS } from "@/lib/constants";
import { VehicleModel } from "./vehicle-model";
import { PlayerCamera } from "./player-camera";
import { PlayerNameTag } from "./player-nametag";

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
        emitPositionUpdate
    );

    usePlayerCamera(rb, isLocalPlayer);

    return (
        <group position={[0, 0, idx]} rotation={[0, -PHYSICS.HALF_PI, 0]}>
            <RigidBody
                ref={rb}
                colliders={false}
                type="dynamic"
                mass={1000}
                position={position || undefined}
                quaternion={rotation || undefined}
            >
                <CuboidCollider args={[4, 1, 1.4]} />
                <VehicleModel />
                {isLocalPlayer && <PlayerCamera />}
                <PlayerNameTag state={state} />
            </RigidBody>
        </group>
    );
};
