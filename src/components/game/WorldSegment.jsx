import { Obstacle } from './Obstacle';
import { Coin } from './Coin';
import { TRACK_WIDTH, SEGMENT_LENGTH } from '../../constants/game';

// ============================================================
//  WORLD SEGMENT — Phase 2
//  A single chunk of the track containing ground, dividers, 
//  and its specific obstacles/coins.
// ============================================================

export function WorldSegment({ index, obstacles = [], coins = [], collectedCoins = new Set() }) {
  const isAlternate = index % 2 === 0;

  return (
    <group>
      {/* Ground Plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH, SEGMENT_LENGTH]} />
        <meshStandardMaterial
          color={isAlternate ? '#1a1a2e' : '#16213e'}
          roughness={0.9}
        />
      </mesh>

      {/* Lane Indicators (simple glow lines) */}
      <LaneDivider xPos={-2} />
      <LaneDivider xPos={2} />

      {/* Obstacles */}
      {obstacles.map((obs, i) => (
        <Obstacle key={`obs-${i}`} {...obs} />
      ))}

      {/* Coins */}
      {coins.map((coin) => (
        <Coin 
          key={`coin-${coin.id}`} 
          {...coin} 
          collected={collectedCoins.has(coin.id)} 
        />
      ))}
    </group>
  );
}

function LaneDivider({ xPos }) {
  return (
    <mesh position={[xPos, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.05, SEGMENT_LENGTH]} />
      <meshStandardMaterial color="#533483" emissive="#533483" emissiveIntensity={0.5} />
    </mesh>
  );
}
