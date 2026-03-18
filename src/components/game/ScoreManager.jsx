import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

// ============================================================
//  SCORE MANAGER — Phase 1
//  Runs inside the R3F canvas (has access to useFrame).
//  Calls the store's tick() every frame so score & speed
//  update without any React re-renders.
// ============================================================

export function ScoreManager() {
  useFrame((_, delta) => {
    useGameStore.getState().tick(delta);
  });

  return null;
}
