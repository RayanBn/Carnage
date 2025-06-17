import { useEffect, useRef, useState } from "react";
import { Vector3, Quaternion } from "three";
import { RapierContext, RapierRigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { vec3, quat } from "@react-three/rapier";
import { Joystick } from "playroomkit";
import * as THREE from "three";
import { RayData, SpringData, SuspensionForceData } from "../data";
import { useSuspension } from "./useSuspension";
import { useKeyboardControls } from "@react-three/drei";

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

const suspensionPoints = [
  new THREE.Vector3(-1.9, -0.3, -1), // front-left
  new THREE.Vector3(1.9, -0.3, -1), // front-right
  new THREE.Vector3(-1.9, -0.3, 1), // rear-left
  new THREE.Vector3(1.9, -0.3, 1), // rear-right
];

const springData: SpringData = {
  restLength: 1.5,
  stiffness: 0.8,
  damping: 20,
  maxTravel: 1,
};

function radToXY(rad: number) {
  return {
    y: Math.cos(rad),
    x: Math.sin(rad),
  };
}

export function useVehiclePhysics(
  rigidBodyRef: React.RefObject<RapierRigidBody>,
  isLocalPlayer: boolean,
  controls: Joystick | null,
  targetPosition: React.MutableRefObject<Vector3>,
  targetRotation: React.MutableRefObject<Quaternion>,
  emitPositionUpdate: (pos: Vector3, rot: Quaternion) => void,
  player: any
) {
  const tempVector = useRef(new Vector3());
  const identityQuaternion = useRef(new Quaternion());
  const [wheelRefs, setWheelRefs] = useState<any>(null);

  const suspensionData = useSuspension({
    wheelPositions: suspensionPoints,
    rb: rigidBodyRef,
    spring: springData,
  });
  const [_, get] = useKeyboardControls();


  useEffect(() => {
    if (!player) return;
    const wheelRefs = player?.wheelRefs;
    console.log("wheelRefs", wheelRefs);
    setWheelRefs(wheelRefs);
  }, [player]);

  const localForwardVec = new THREE.Vector3(1, 0, 0);
  const localRightVec = new THREE.Vector3(0, 0, 1);

  const [slipVector, setSlipVector] = useState<Vector3>(new Vector3());
  const [steeringAngle, setSteeringAngle] = useState<number>(0);
  const wheelRotation = useRef<number>(0);

  useFrame((_, dt) => {
    const rigidBody = rigidBodyRef.current;
    if (!rigidBody) return;

    if (isLocalPlayer) {
      // Steering logic
      let currentSteeringAngle = 0;

      if (controls?.isJoystickPressed()) {
        const { x, y } = radToXY(controls.angle());
        rigidBody.applyImpulseAtPoint(
          new THREE.Vector3(y * 2, 0, 0).applyQuaternion(rigidBody.rotation()),
          vec3(rigidBody.translation()).add(new Vector3(0, -1, 0)),
          true
        );
        rigidBody.applyTorqueImpulse(new THREE.Vector3(0, -x * 4, 0), true);

        // Set steering angle based on joystick x input (limited to ±0.5 radians or ~28 degrees)
        currentSteeringAngle = -x * 0.5;
      }

      // Smoothly transition steering angle
      setSteeringAngle(
        THREE.MathUtils.lerp(steeringAngle, currentSteeringAngle, 0.2)
      );

      // Apply wheel rotations if wheels are available
      if (wheelRefs) {
        // Calculate forward velocity for wheel rotation speed
        const worldForwardVec = localForwardVec
          .clone()
          .applyQuaternion(rigidBody.rotation());
        const forwardVel = vec3(rigidBody.linvel()).dot(worldForwardVec);

        // Update wheel rotation based on forward velocity
        wheelRotation.current += forwardVel * dt * 2;

        // Apply front wheel steering
        if (wheelRefs.FrontLeftWheel?.current) {
          wheelRefs.FrontLeftWheel.current.rotation.y = steeringAngle;
          wheelRefs.FrontLeftWheel.current.rotation.x = wheelRotation.current;
        }
        if (wheelRefs.FrontRightWheel?.current) {
          wheelRefs.FrontRightWheel.current.rotation.y = steeringAngle;
          wheelRefs.FrontRightWheel.current.rotation.x = wheelRotation.current;
        }

        // Apply wheel rolling rotation to rear wheels
        if (wheelRefs.RearLeftWheel?.current) {
          wheelRefs.RearLeftWheel.current.rotation.x = wheelRotation.current;
        }
        if (wheelRefs.RearRightWheel?.current) {
          wheelRefs.RearRightWheel.current.rotation.x = wheelRotation.current;
        }
      }

      const worldRightVec = localRightVec
        .clone()
        .applyQuaternion(rigidBody.rotation());

      var gripFactor = 1.0;

      if (get()["drift"] || controls?.isPressed("drift")) {
        gripFactor = 0.3;
      }
      const slipVel = vec3(rigidBody.linvel()).dot(worldRightVec) * gripFactor;
      setSlipVector(worldRightVec.clone().multiplyScalar(-slipVel));
      rigidBody.applyImpulse(slipVector, true);

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

      const axis = new Vector3(deltaRot.x, deltaRot.y, deltaRot.z).normalize();

      const angle = deltaRot.angleTo(identityQuaternion.current);

      if (angle > PHYSICS.ANGLE_THRESHOLD) {
        tempVector.current
          .copy(axis)
          .multiplyScalar(angle * PHYSICS.TORQUE_MULTIPLIER * dt);
        rigidBody.applyTorqueImpulse(tempVector.current, true);
      }
    }
  });
  return {
    suspensionData: suspensionData,
    slipVector: slipVector,
  };
}
