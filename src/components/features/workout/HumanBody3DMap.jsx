import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function BodySegment({ active, children }) {
  return (
    <mesh>
      {children}
      <meshStandardMaterial
        color={active ? '#22c55e' : '#ef4444'}
        emissive={active ? '#14532d' : '#7f1d1d'}
        roughness={0.45}
        metalness={0.1}
      />
    </mesh>
  );
}

function HumanModel({ bodyPartImpact }) {
  const isActive = (part) => (bodyPartImpact?.[part] || 0) > 0;

  return (
    <group position={[0, -0.55, 0]}>
      {/* Neck */}
      <group position={[0, 1.6, 0]}>
        <BodySegment active={isActive('Neck')}>
          <cylinderGeometry args={[0.1, 0.12, 0.2, 24]} />
        </BodySegment>
      </group>

      {/* Head (neutral) */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Shoulders */}
      <group position={[-0.38, 1.45, 0]}>
        <BodySegment active={isActive('Shoulders')}>
          <sphereGeometry args={[0.13, 20, 20]} />
        </BodySegment>
      </group>
      <group position={[0.38, 1.45, 0]}>
        <BodySegment active={isActive('Shoulders')}>
          <sphereGeometry args={[0.13, 20, 20]} />
        </BodySegment>
      </group>

      {/* Chest */}
      <group position={[0, 1.22, 0.09]}>
        <BodySegment active={isActive('Chest')}>
          <boxGeometry args={[0.7, 0.4, 0.12]} />
        </BodySegment>
      </group>

      {/* Back */}
      <group position={[0, 1.22, -0.09]}>
        <BodySegment active={isActive('Back')}>
          <boxGeometry args={[0.7, 0.4, 0.12]} />
        </BodySegment>
      </group>

      {/* Core */}
      <group position={[0, 0.88, 0.08]}>
        <BodySegment active={isActive('Core')}>
          <boxGeometry args={[0.52, 0.36, 0.1]} />
        </BodySegment>
      </group>

      {/* Pelvic */}
      <group position={[0, 0.63, 0]}>
        <BodySegment active={isActive('Pelvic')}>
          <boxGeometry args={[0.52, 0.18, 0.22]} />
        </BodySegment>
      </group>

      {/* Glutes (back pelvis) */}
      <group position={[0, 0.61, -0.12]}>
        <BodySegment active={isActive('Glutes')}>
          <boxGeometry args={[0.48, 0.14, 0.12]} />
        </BodySegment>
      </group>

      {/* Arms + biceps/triceps + forearms */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <group position={[0.45 * side, 1.1, 0.08]}>
            <BodySegment active={isActive('Biceps')}>
              <boxGeometry args={[0.14, 0.34, 0.08]} />
            </BodySegment>
          </group>
          <group position={[0.45 * side, 1.1, -0.08]}>
            <BodySegment active={isActive('Triceps')}>
              <boxGeometry args={[0.14, 0.34, 0.08]} />
            </BodySegment>
          </group>
          <group position={[0.45 * side, 0.76, 0]}>
            <BodySegment active={isActive('Forearms')}>
              <cylinderGeometry args={[0.07, 0.06, 0.3, 18]} />
            </BodySegment>
          </group>
        </group>
      ))}

      {/* Legs: quads/hamstrings/calves */}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          <group position={[0.18 * side, 0.27, 0.07]}>
            <BodySegment active={isActive('Quads')}>
              <boxGeometry args={[0.18, 0.56, 0.14]} />
            </BodySegment>
          </group>
          <group position={[0.18 * side, 0.27, -0.07]}>
            <BodySegment active={isActive('Hamstrings')}>
              <boxGeometry args={[0.18, 0.56, 0.14]} />
            </BodySegment>
          </group>
          <group position={[0.18 * side, -0.27, 0]}>
            <BodySegment active={isActive('Calves')}>
              <cylinderGeometry args={[0.08, 0.06, 0.42, 18]} />
            </BodySegment>
          </group>
        </group>
      ))}
    </group>
  );
}

export default function HumanBody3DMap({ bodyPartImpact }) {
  return (
    <div className="h-[520px] w-full rounded-xl border border-gray-600 bg-gray-900/50 overflow-hidden">
      <Canvas camera={{ position: [0, 1.3, 3.2], fov: 40 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <directionalLight position={[-3, 3, -4]} intensity={0.7} />
        <HumanModel bodyPartImpact={bodyPartImpact} />
        <OrbitControls enablePan={false} minDistance={2.2} maxDistance={5.2} />
      </Canvas>
    </div>
  );
}
