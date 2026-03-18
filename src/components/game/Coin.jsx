import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LANES } from '../../constants/game';

// ============================================================
//  COIN — Phase 2
//  Spinning gold coin with a pulsing emissive glow.
// ============================================================

export function Coin({ lane, zOffset, collected = false }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    // Spinning animation
    meshRef.current.rotation.y += 0.05;
    // Hovering subtle Y bounce
    meshRef.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
  });

  if (collected) return null;

  return (
    <mesh 
      ref={meshRef} 
      position={[LANES[lane], 0.9, zOffset]} 
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
    >
      <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
      <meshStandardMaterial 
        color="#ffd700" 
        emissive="#ff8c00" 
        emissiveIntensity={0.5} 
        metalness={1.0} 
        roughness={0.1} 
      />
    </mesh>
  );
}
