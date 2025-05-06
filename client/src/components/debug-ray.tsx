import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { Line } from '@react-three/drei'

type DebugRayProps = {
  start: THREE.Vector3
  end: THREE.Vector3
  color?: THREE.ColorRepresentation
}

export function DebugRay({ start, end, color = 'green' }: DebugRayProps) {
    return (
        <Line
            points={[start, end]}
            color={color}
            lineWidth={4}
        />
  )
}
