import {
  CuboidCollider,
  Physics,
  RapierRigidBody,
  RigidBody,
  vec3,
} from "@react-three/rapier";
import { myPlayer } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import { Quaternion, Vector3 } from "three";
import { usePlayerCamera } from "@/lib/hooks/usePlayerCamera";
import { CarControllerProps } from "@/lib/types";
import { useNetworkSync } from "@/lib/hooks/useNetworkSync";
import { useVehiclePhysics } from "@/lib/hooks/useVehiclePhysics";
import { VehicleModel } from "./vehicle-model";
import { PlayerCamera } from "./player-camera";
import { PlayerNameTag } from "./player-nametag";
import {
  Box,
  OrbitControls,
  Point,
  TransformControls,
} from "@react-three/drei";
import { DebugRay } from "./debug-ray";
import { DebugArrow } from "./debug-arrow";
import { RayData, SuspensionForceData } from "@/lib/data";

export const CarController = ({
  id,
  state,
  controls,
  idx,
  position,
  rotation,
  player,
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

  const { suspensionData, slipVector } = useVehiclePhysics(
    rb,
    isLocalPlayer,
    controls,
    targetPosition,
    targetRotation,
    emitPositionUpdate,
    player
  );

  usePlayerCamera(rb, isLocalPlayer);

  return (
    <>
      {/* {suspensionData.map((data, i) => (
        <>
          <DebugArrow
            key={i}
            origin={data.suspensionPoint}
            direction={data.force}
            length={data.force.length()}
          />
          <DebugRay
            key={i + 1}
            start={data.suspensionPoint}
            end={data.wheelPoint}
            color={"green"}
          />
        </>
      ))}
      {rb.current ? (
        <DebugArrow
          origin={vec3(rb.current.translation())}
          direction={slipVector}
          length={slipVector?.length() * 10}
        />
      ) : null} */}
      <RigidBody
        ref={rb}
        angularDamping={10}
        mass={1000}
        type="dynamic"
        position={position || undefined}
        quaternion={rotation || undefined}
        colliders={false}
      >
        <CuboidCollider args={[2, 0.6, 1]} />
        <VehicleModel player={player} />
        {isLocalPlayer && <PlayerCamera />}
      </RigidBody>
    </>
  );
};
