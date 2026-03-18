import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { LANES, CHASER_CATCH_Z } from '../../constants/game';

// ============================================================
//  CHASER — Phase 3
//  The "Inspector" following the player.
//  Moves towards the player's X lane but with more lag.
//  If chaserZ reaches CHASER_CATCH_Z, it's game over.
// ============================================================

export function Chaser() {
  const meshRef = useRef();
  const smoothedX = useRef(0);
  const { laneIndex, gameStatus, endGame } = useGameStore();

  useFrame((_, delta) => {
    const { chaserZ } = useGameStore.getState();
    if (gameStatus !== 'running') return;

    if (!meshRef.current) return;

    // Smoothly follow player's lane with high lag
    const targetX = LANES[laneIndex];
    smoothedX.current = THREE.MathUtils.lerp(smoothedX.current, targetX, 0.05);

    meshRef.current.position.x = smoothedX.current;
    meshRef.current.position.z = chaserZ;

    // Check for catch (Game Over)
    if (chaserZ >= CHASER_CATCH_Z) {
      endGame();
    }
  });

  return (
    <group ref={meshRef}>
      {/* Chaser Body (Placeholder: Dark ominous box/robot) */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[1.2, 2.4, 0.8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Police Lights */}
      <mesh position={[-0.4, 2.5, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.4, 2.5, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}
