import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RapierRigidBody, useRapier, vec3 } from '@react-three/rapier';
import { SpringData } from '../data';
import { clamp } from 'three/src/math/MathUtils.js';

type SuspensionResult = {
  force: THREE.Vector3;
  wheelPoint: THREE.Vector3;
  suspensionPoint: THREE.Vector3;
};

type UseSuspensionProps = {
  wheelPositions: THREE.Vector3[];
  rb: React.RefObject<RapierRigidBody>;
  spring: SpringData;
};

export function useSuspension({
  wheelPositions,
  rb,
  spring,
}: UseSuspensionProps) {
  const { world, rapier } = useRapier();

  const [suspensionData, setSuspensionData] = useState<SuspensionResult[]>([]);
  const [previousSpringLength, setPreviousSpringLength] = useState<number[]>([
    spring.restLength,
    spring.restLength,
    spring.restLength,
    spring.restLength,
  ]);

  const lDownVec = new THREE.Vector3(0, -1, 0);

  useFrame((state, delta) => {
    const chassis = rb.current;
    if (!chassis) return;

    const newData: SuspensionResult[] = [];
    const newSpringLength: number[] = [];
    const rbRot = chassis.rotation();
    const rbPos = chassis.translation();
    const rayDir = lDownVec.clone().applyQuaternion(rbRot).normalize();

    wheelPositions.forEach((localPos, i) => {
      // Transform wheel local position to world space
      const wSuspensionPos = localPos.clone().applyQuaternion(rbRot).add(rbPos);

      // Perform raycast in Rapier world
      const ray = new rapier.Ray(wSuspensionPos, rayDir);
      const hit = world.castRay(ray, spring.restLength, true, undefined, undefined, undefined, chassis);

      // Calculate compression and force
      var springLength = spring.restLength;
      var forceVec = new THREE.Vector3();
      var wheelPoint = wSuspensionPos.clone().addScaledVector(rayDir, spring.restLength);

      if (hit)
      {
        springLength = hit.timeOfImpact;
        wheelPoint = vec3(ray.pointAt(hit.timeOfImpact));

        const compression = clamp(spring.restLength - springLength, -spring.maxTravel, spring.maxTravel);
        const compressionSpeed = springLength - previousSpringLength[i];
        const force = (spring.stiffness * compression) - (spring.damping * compressionSpeed);

        forceVec = rayDir.clone().negate().multiplyScalar(force);
      }

      newSpringLength.push(springLength);
      newData.push({ force: forceVec, wheelPoint, suspensionPoint: wSuspensionPos});
      chassis.applyImpulseAtPoint(forceVec, wSuspensionPos, true);

    });

    setSuspensionData(newData);
    setPreviousSpringLength(newSpringLength);
  });

  return suspensionData;
}
