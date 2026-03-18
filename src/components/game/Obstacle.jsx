import { LANES } from '../../constants/game';
import { OBSTACLE_DEFS } from '../../utils/collision';

// ============================================================
//  OBSTACLE — Phase 2
//  Renders a 3D block based on type (low, high, bar).
//  Lane position and type are passed from parent segment.
// ============================================================

export function Obstacle({ type, lane, zOffset }) {
  const def = OBSTACLE_DEFS[type];
  if (!def) return null;

  return (
    <mesh position={[LANES[lane], def.cy, zOffset]} castShadow receiveShadow>
      <boxGeometry args={[def.sx, def.sy, def.sz]} />
      <meshStandardMaterial 
        color={def.color} 
        emissive={def.emissive} 
        emissiveIntensity={def.emissiveIntensity} 
        roughness={0.2} 
        metalness={0.8}
      />
    </mesh>
  );
}
