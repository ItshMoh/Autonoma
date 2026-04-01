import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF, Float } from '@react-three/drei';
import { useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';

function CustomRobotModel() {
  // Load the custom GLTF model from the public folder
  const { scene } = useGLTF('/robotic_dumper.glb');
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Mouse position normalized from -1 to 1
    const mx = (state.pointer.x * Math.PI) / 4;
    const my = (state.pointer.y * Math.PI) / 4;

    if (modelRef.current) {
      // Smoothly interpolate rotation towards mouse position
      modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, mx, 0.05);
      modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, -my, 0.05);
    }
  });

  return (
    <group ref={modelRef} position={[3, -2.2, 0]} scale={1.5}>
      <primitive object={scene} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload('/robotic_dumper.glb');

export default function RobotArm3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      window.scrollBy({
        top: e.deltaY,
        left: e.deltaX,
        behavior: 'auto'
      });
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: true });
    return () => wrapper.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-20 pointer-events-auto">
      <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#F27D26" />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <CustomRobotModel />
          </Float>
        </Suspense>
        
        <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
