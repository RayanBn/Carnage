/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { usePlayerStatesStore } from "@/lib/store";
import { CarModelProps } from "@/lib/types";

type GLTFResult = GLTF & {
  nodes: {
    Body004_1: THREE.Mesh;
    Body004_2: THREE.Mesh;
    Spoiler001: THREE.Mesh;
    FrontLeftWheel004: THREE.Mesh;
    FrontRightWheel004: THREE.Mesh;
    RearLeftWheel004: THREE.Mesh;
    RearRightWheel004: THREE.Mesh;
  };
  materials: {
    ["AKC_Col_1_Tex.004"]: THREE.MeshStandardMaterial;
    ["AKC_Lights_Tex.004"]: THREE.MeshStandardMaterial;
  };
};

export function Model({ playerId, ...props }: CarModelProps) {
  const { nodes, materials } = useGLTF("/models/cars/Ouki.glb") as GLTFResult;

  const { registerPlayerWheels } = usePlayerStatesStore();
  const frontLeftWheelRef = useRef<THREE.Mesh>(null);
  const frontRightWheelRef = useRef<THREE.Mesh>(null);
  const rearLeftWheelRef = useRef<THREE.Mesh>(null);
  const rearRightWheelRef = useRef<THREE.Mesh>(null);
  const registrationRef = useRef(false);

  useEffect(() => {
    if (registrationRef.current) return;

    const wheelRefs = {
      FrontLeftWheel: frontLeftWheelRef,
      FrontRightWheel: frontRightWheelRef,
      RearLeftWheel: rearLeftWheelRef,
      RearRightWheel: rearRightWheelRef,
    };

    registerPlayerWheels(playerId, wheelRefs);

    registrationRef.current = true;
  }, []);

  return (
    <group {...props} dispose={null}>
      <group name="Ouki" userData={{ name: "Ouki" }}>
        <group name="Body004" userData={{ name: "Body.004" }}>
          <mesh
            name="Body004_1"
            castShadow
            receiveShadow
            geometry={nodes.Body004_1.geometry}
            material={materials["AKC_Col_1_Tex.004"]}
          />
          <mesh
            name="Body004_2"
            castShadow
            receiveShadow
            geometry={nodes.Body004_2.geometry}
            material={materials["AKC_Lights_Tex.004"]}
          />
        </group>
        <mesh
          name="Spoiler001"
          castShadow
          receiveShadow
          geometry={nodes.Spoiler001.geometry}
          material={materials["AKC_Col_1_Tex.004"]}
          position={[0, 1.033, -1.705]}
          userData={{ name: "Spoiler.001" }}
        />
        <group name="Meshes004" userData={{ name: "Meshes.004" }}>
          <mesh
            ref={frontLeftWheelRef}
            name="FrontLeftWheel004"
            castShadow
            receiveShadow
            geometry={nodes.FrontLeftWheel004.geometry}
            material={materials["AKC_Col_1_Tex.004"]}
            position={[0.613, 0.287, 1.055]}
            userData={{ name: "FrontLeftWheel.004" }}
          />
          <mesh
            ref={frontRightWheelRef}
            name="FrontRightWheel004"
            castShadow
            receiveShadow
            geometry={nodes.FrontRightWheel004.geometry}
            material={materials["AKC_Col_1_Tex.004"]}
            position={[-0.613, 0.287, 1.055]}
            userData={{ name: "FrontRightWheel.004" }}
          />
          <mesh
            ref={rearLeftWheelRef}
            name="RearLeftWheel004"
            castShadow
            receiveShadow
            geometry={nodes.RearLeftWheel004.geometry}
            material={materials["AKC_Col_1_Tex.004"]}
            position={[0.62, 0.287, -1.055]}
            userData={{ name: "RearLeftWheel.004" }}
          />
          <mesh
            ref={rearRightWheelRef}
            name="RearRightWheel004"
            castShadow
            receiveShadow
            geometry={nodes.RearRightWheel004.geometry}
            material={materials["AKC_Col_1_Tex.004"]}
            position={[-0.62, 0.287, -1.055]}
            userData={{ name: "RearRightWheel.004" }}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/cars/Ouki.glb");
