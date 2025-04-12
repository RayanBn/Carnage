import { CuboidCollider, RapierRigidBody, RigidBody, vec3 } from "@react-three/rapier";
import { PlayerState, Joystick, myPlayer, usePlayerState } from "playroomkit"
import { Car } from "./models/car";
import { PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface CarControllerProps {
  state: PlayerState | null,
  joystick: Joystick | null
}

export const CarController = ({state, joystick}: CarControllerProps) => {
  const me = myPlayer();
  const rb = useRef<RapierRigidBody>(null);
  // const [carModel] = usePlayerState(state, "car", null);

  useFrame(({camera}, dt) => {
    if (!rb.current) {
      return;
    }

    if (joystick?.isJoystickPressed()) {
      const impulse = vec3({
        x: 0,
        y: 0,
        z: 10
      });
      rb.current.applyImpulse(impulse, true);
    }
  })

  return (
    <>
    {
      state && joystick &&
      <group>
        <RigidBody
          ref={rb}
          colliders={false}
        >
          <CuboidCollider args={[1, 1, 1]}/>
          <Car scale={[0.3, 0.3, 0.3]}/>
          {me?.id === state?.id && (
            <PerspectiveCamera
              makeDefault
              position={[0, 30, 100]}
              near={1}
            />
          )}
        </RigidBody>
      </group>
    }
    </>
  );
}
