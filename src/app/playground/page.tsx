"use client"
import { Car } from "@/components/models/car"
import { OrbitControls, Plane, SpotLight } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Physics, RigidBody } from "@react-three/rapier"

const Scene = () => {
  return (
    <>
      <Canvas>
        <OrbitControls/>
        <ambientLight/>
        <directionalLight/>
        <Physics debug>
          <RigidBody colliders="trimesh">
            <Car scale={[0.3, 0.3, 0.3]}></Car>
          </RigidBody>
          <RigidBody type="fixed">
            <mesh scale={[100, 100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
              <planeGeometry/>
            </mesh>
            {/* <Plane scale={[10, 10, 10]} rotation={[Math.PI / 2, Math.PI / 2, 0]}/> */}
          </RigidBody>
        </Physics>
      </Canvas>
    </>
  )
}

export default Scene;
