"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model() {
  // Load the model directly from public/
  const { scene } = useGLTF("/Model/Chatbot.glb");

  // Center and scale the model
  return <primitive object={scene} scale={10} position={[0, -1, 0]} />;
}

export default function HeroModel() {
  return (
    <div className="flex justify-center items-center w-full h-[120px]">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        <Suspense fallback={null}>
          <Model />
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}

