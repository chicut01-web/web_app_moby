import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Bubbles() {
  const bubblesData = useMemo(() => {
    return Array.from({ length: 30 }, () => ({
      position: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40 - 10,
        (Math.random() - 0.5) * 20 - 5
      ],
      scale: Math.random() * 0.8 + 0.2,
      speedY: Math.random() * 0.05 + 0.02,
      speedX: (Math.random() - 0.5) * 0.01,
      rotSpeedX: Math.random() * 0.02,
      rotSpeedY: Math.random() * 0.02
    }))
  }, [])

  return (
    <>
      {bubblesData.map((data, i) => (
        <Bubble key={i} data={data} />
      ))}
    </>
  )
}

function Bubble({ data }) {
  const meshRef = useRef()

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.position.y += data.speedY
    meshRef.current.position.x += data.speedX
    meshRef.current.rotation.x += data.rotSpeedX
    meshRef.current.rotation.y += data.rotSpeedY

    if (meshRef.current.position.y > 20) {
      meshRef.current.position.y = -20
      meshRef.current.position.x = (Math.random() - 0.5) * 40
    }
  })

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={data.position} scale={data.scale}>
      <MeshTransmissionMaterial
        color="white"
        transmission={0.9}
        opacity={1}
        transparent
        metalness={0.1}
        roughness={0.1}
        ior={1.5}
        thickness={0.5}
      />
    </Sphere>
  )
}

export default function Background3D() {
  return (
    <div id="bgCanvas">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7]} intensity={0.8} />
        <Bubbles />
      </Canvas>
    </div>
  )
}
