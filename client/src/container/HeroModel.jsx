"use client"
import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"

function Model() {
  // Load the model directly from public/
  const { scene } = useGLTF("/Model/model.glb")

  return <primitive object={scene} scale={12} />
}

export default function HeroModel() {
  return (
    <div className="w-full max-w-3xl h-[350px]  ">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        {/* Load model lazily */}
        <Suspense fallback={null}>
          <Model />
        </Suspense>

        {/* Orbit Controls */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  )
}
