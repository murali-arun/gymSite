import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function MuscleSegment({ active, children }) {
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

const MUSCLE_TO_BODY_PART = {
  neckFront: 'Neck',
  neckBack: 'Neck',

  upperChestLeft: 'Chest',
  upperChestRight: 'Chest',
  lowerChestLeft: 'Chest',
  lowerChestRight: 'Chest',

  frontDeltoidLeft: 'Shoulders',
  frontDeltoidRight: 'Shoulders',
  lateralDeltoidLeft: 'Shoulders',
  lateralDeltoidRight: 'Shoulders',
  rearDeltoidLeft: 'Shoulders',
  rearDeltoidRight: 'Shoulders',

  bicepsLeft: 'Biceps',
  bicepsRight: 'Biceps',
  tricepsLeft: 'Triceps',
  tricepsRight: 'Triceps',
  forearmFlexorsLeft: 'Forearms',
  forearmFlexorsRight: 'Forearms',

  upperAbs: 'Core',
  lowerAbs: 'Core',
  obliqueLeft: 'Core',
  obliqueRight: 'Core',

  hipFlexorLeft: 'Pelvic',
  hipFlexorRight: 'Pelvic',
  adductors: 'Pelvic',

  traps: 'Back',
  latsLeft: 'Back',
  latsRight: 'Back',
  midBack: 'Back',
  lowerBack: 'Back',

  gluteLeft: 'Glutes',
  gluteRight: 'Glutes',

  quadsLeft: 'Quads',
  quadsRight: 'Quads',
  hamstringsLeft: 'Hamstrings',
  hamstringsRight: 'Hamstrings',
  calvesLeft: 'Calves',
  calvesRight: 'Calves'
};

function HumanModel({ bodyPartImpact }) {
  const isActive = (muscleName) => {
    const bodyPart = MUSCLE_TO_BODY_PART[muscleName];
    return (bodyPartImpact?.[bodyPart] || 0) > 0;
  };

  return (
    <group position={[0, -0.55, 0]}>
      {/* Neck muscles */}
      <group position={[0, 1.58, 0.05]}>
        <MuscleSegment active={isActive('neckFront')}>
          <cylinderGeometry args={[0.07, 0.09, 0.18, 18]} />
        </MuscleSegment>
      </group>
      <group position={[0, 1.58, -0.05]}>
        <MuscleSegment active={isActive('neckBack')}>
          <cylinderGeometry args={[0.1, 0.12, 0.2, 24]} />
        </MuscleSegment>
      </group>

      {/* Head (neutral) */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Shoulders / Delts */}
      <group position={[-0.38, 1.45, 0]}>
        <MuscleSegment active={isActive('lateralDeltoidLeft')}>
          <sphereGeometry args={[0.13, 20, 20]} />
        </MuscleSegment>
      </group>
      <group position={[0.38, 1.45, 0]}>
        <MuscleSegment active={isActive('lateralDeltoidRight')}>
          <sphereGeometry args={[0.13, 20, 20]} />
        </MuscleSegment>
      </group>
      <group position={[-0.3, 1.34, 0.12]}>
        <MuscleSegment active={isActive('frontDeltoidLeft')}>
          <boxGeometry args={[0.14, 0.18, 0.09]} />
        </MuscleSegment>
      </group>
      <group position={[0.3, 1.34, 0.12]}>
        <MuscleSegment active={isActive('frontDeltoidRight')}>
          <boxGeometry args={[0.14, 0.18, 0.09]} />
        </MuscleSegment>
      </group>
      <group position={[-0.3, 1.34, -0.12]}>
        <MuscleSegment active={isActive('rearDeltoidLeft')}>
          <boxGeometry args={[0.14, 0.18, 0.09]} />
        </MuscleSegment>
      </group>
      <group position={[0.3, 1.34, -0.12]}>
        <MuscleSegment active={isActive('rearDeltoidRight')}>
          <boxGeometry args={[0.14, 0.18, 0.09]} />
        </MuscleSegment>
      </group>

      {/* Chest: upper / lower */}
      <group position={[-0.18, 1.27, 0.11]}>
        <MuscleSegment active={isActive('upperChestLeft')}>
          <boxGeometry args={[0.26, 0.16, 0.1]} />
        </MuscleSegment>
      </group>
      <group position={[0.18, 1.27, 0.11]}>
        <MuscleSegment active={isActive('upperChestRight')}>
          <boxGeometry args={[0.26, 0.16, 0.1]} />
        </MuscleSegment>
      </group>
      <group position={[-0.18, 1.11, 0.11]}>
        <MuscleSegment active={isActive('lowerChestLeft')}>
          <boxGeometry args={[0.25, 0.15, 0.1]} />
        </MuscleSegment>
      </group>
      <group position={[0.18, 1.11, 0.11]}>
        <MuscleSegment active={isActive('lowerChestRight')}>
          <boxGeometry args={[0.25, 0.15, 0.1]} />
        </MuscleSegment>
      </group>

      {/* Core */}
      <group position={[0, 0.95, 0.1]}>
        <MuscleSegment active={isActive('upperAbs')}>
          <boxGeometry args={[0.28, 0.2, 0.08]} />
        </MuscleSegment>
      </group>
      <group position={[0, 0.75, 0.1]}>
        <MuscleSegment active={isActive('lowerAbs')}>
          <boxGeometry args={[0.26, 0.18, 0.08]} />
        </MuscleSegment>
      </group>
      <group position={[-0.21, 0.86, 0.08]} rotation={[0, 0, -0.25]}>
        <MuscleSegment active={isActive('obliqueLeft')}>
          <boxGeometry args={[0.12, 0.24, 0.08]} />
        </MuscleSegment>
      </group>
      <group position={[0.21, 0.86, 0.08]} rotation={[0, 0, 0.25]}>
        <MuscleSegment active={isActive('obliqueRight')}>
          <boxGeometry args={[0.12, 0.24, 0.08]} />
        </MuscleSegment>
      </group>

      {/* Pelvic/hip complex */}
      <group position={[-0.12, 0.6, 0.09]}>
        <MuscleSegment active={isActive('hipFlexorLeft')}>
          <boxGeometry args={[0.12, 0.12, 0.09]} />
        </MuscleSegment>
      </group>
      <group position={[0.12, 0.6, 0.09]}>
        <MuscleSegment active={isActive('hipFlexorRight')}>
          <boxGeometry args={[0.12, 0.12, 0.09]} />
        </MuscleSegment>
      </group>
      <group position={[0, 0.53, 0.02]}>
        <MuscleSegment active={isActive('adductors')}>
          <boxGeometry args={[0.2, 0.1, 0.08]} />
        </MuscleSegment>
      </group>

      {/* Back */}
      <group position={[0, 1.43, -0.08]}>
        <MuscleSegment active={isActive('traps')}>
          <boxGeometry args={[0.34, 0.16, 0.1]} />
        </MuscleSegment>
      </group>
      <group position={[-0.2, 1.11, -0.1]}>
        <MuscleSegment active={isActive('latsLeft')}>
          <boxGeometry args={[0.18, 0.42, 0.1]} />
        </MuscleSegment>
      </group>
      <group position={[0.2, 1.11, -0.1]}>
        <MuscleSegment active={isActive('latsRight')}>
          <boxGeometry args={[0.18, 0.42, 0.1]} />
        </MuscleSegment>
      </group>
      <group position={[0, 1.05, -0.1]}>
        <MuscleSegment active={isActive('midBack')}>
          <boxGeometry args={[0.2, 0.3, 0.1]} />
        </MuscleSegment>
      </group>
      <group position={[0, 0.76, -0.1]}>
        <MuscleSegment active={isActive('lowerBack')}>
          <boxGeometry args={[0.2, 0.2, 0.1]} />
        </MuscleSegment>
      </group>

      {/* Arms */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <group position={[0.45 * side, 1.1, 0.09]}>
            <MuscleSegment active={isActive(side < 0 ? 'bicepsLeft' : 'bicepsRight')}>
              <boxGeometry args={[0.13, 0.34, 0.08]} />
            </MuscleSegment>
          </group>
          <group position={[0.45 * side, 1.1, -0.09]}>
            <MuscleSegment active={isActive(side < 0 ? 'tricepsLeft' : 'tricepsRight')}>
              <boxGeometry args={[0.13, 0.34, 0.08]} />
            </MuscleSegment>
          </group>
          <group position={[0.45 * side, 0.76, 0]}>
            <MuscleSegment active={isActive(side < 0 ? 'forearmFlexorsLeft' : 'forearmFlexorsRight')}>
              <cylinderGeometry args={[0.07, 0.06, 0.3, 18]} />
            </MuscleSegment>
          </group>
        </group>
      ))}

      {/* Glutes */}
      <group position={[-0.12, 0.6, -0.12]}>
        <MuscleSegment active={isActive('gluteLeft')}>
          <boxGeometry args={[0.18, 0.14, 0.12]} />
        </MuscleSegment>
      </group>
      <group position={[0.12, 0.6, -0.12]}>
        <MuscleSegment active={isActive('gluteRight')}>
          <boxGeometry args={[0.18, 0.14, 0.12]} />
        </MuscleSegment>
      </group>

      {/* Legs */}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          <group position={[0.18 * side, 0.27, 0.07]}>
            <MuscleSegment active={isActive(side < 0 ? 'quadsLeft' : 'quadsRight')}>
              <boxGeometry args={[0.18, 0.56, 0.14]} />
            </MuscleSegment>
          </group>
          <group position={[0.18 * side, 0.27, -0.07]}>
            <MuscleSegment active={isActive(side < 0 ? 'hamstringsLeft' : 'hamstringsRight')}>
              <boxGeometry args={[0.18, 0.56, 0.14]} />
            </MuscleSegment>
          </group>
          <group position={[0.18 * side, -0.27, 0]}>
            <MuscleSegment active={isActive(side < 0 ? 'calvesLeft' : 'calvesRight')}>
              <cylinderGeometry args={[0.08, 0.06, 0.42, 18]} />
            </MuscleSegment>
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
