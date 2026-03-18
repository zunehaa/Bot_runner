import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { playerState } from '../../state/playerState';
import { WorldSegment } from './WorldSegment';
import { 
  SEGMENT_LENGTH, 
  POOL_SIZE, 
  WORLD_SPEED_INITIAL,
  LANES
} from '../../constants/game';
import { 
  generateObstacles, 
  generateCoins, 
  checkPlayerObstacle, 
  checkPlayerCoin,
  OBSTACLE_DEFS,
  getPlayerHalfH
} from '../../utils/collision';

// ============================================================
//  TRACK / WORLD MANAGER — Phase 2
//  Manages the object pool of segments.
//  Handles per-frame movement, recycling, and collisions.
// ============================================================

export function Track() {
  const gameStatus = useGameStore(s => s.gameStatus);
  const addCoin    = useGameStore(s => s.addCoin);
  const endGame    = useGameStore(s => s.endGame);

  // We store the pool data in a ref to avoid React overhead.
  const segments = useRef(
    Array.from({ length: POOL_SIZE }, (_, i) => {
      const z = -i * SEGMENT_LENGTH;
      const obs = i > 1 ? generateObstacles() : [];
      return {
        id: i,
        z: z,
        obstacles: obs,
        coins: i > 1 ? generateCoins(obs) : [],
        collectedCoins: new Set(),
      };
    })
  );

  const [tick, setTick] = useState(0);

  const setGameStatus = useGameStore(s => s.setGameStatus);

  useEffect(() => {
    // intermediate 'prepare' state ensures reset happens before useFrame sees 'running'
    if (gameStatus === 'prepare') {
      segments.current.forEach((seg, i) => {
        seg.z = -i * SEGMENT_LENGTH;
        seg.obstacles = i > 1 ? generateObstacles() : [];
        seg.coins = i > 1 ? generateCoins(seg.obstacles) : [];
        seg.collectedCoins = new Set();
      });
      
      startTimeRef.current = 0;
      setTick(t => t + 1);
      
      // Reset complete — let's roll
      setGameStatus('running');
    }
  }, [gameStatus]);

  const startTimeRef = useRef(0);
  
  useFrame((state, delta) => {
    const { gameStatus, speed } = useGameStore.getState();
    if (gameStatus !== 'running') return;

    if (startTimeRef.current === 0) startTimeRef.current = state.clock.elapsedTime;
    const isGracePeriod = state.clock.elapsedTime - startTimeRef.current < 0.1;

    const currentSpeed = speed;
    const playerX = playerState.x;
    const playerY = playerState.y;
    const playerHalfH = getPlayerHalfH(playerState.isSliding);

    for (let i = 0; i < segments.current.length; i++) {
      const seg = segments.current[i];
      // 1. Move segment
      seg.z += currentSpeed;

      // 2. Collision Detection
      // Check ALL segments that could possibly be near the player
      
      // --- Check Obstacles & Power-ups ---
      for (const obs of seg.obstacles) {
        const obsWorldZ = seg.z + obs.zOffset;
        const def = OBSTACLE_DEFS[obs.type];
        if (!def) continue;

        if (isGracePeriod && obs.type !== 'powerup') continue;

        if (checkPlayerObstacle(playerX, playerY, playerHalfH, obsWorldZ, def, obs.lane)) {
          const { activePowerUp, activatePowerUp } = useGameStore.getState();
          
          if (obs.type === 'powerup') {
            activatePowerUp(obs.powerupType);
            obs.type = null; 
          } else {
            // SHIELD LOGIC: Protect from one hit
            if (activePowerUp === 'shield') {
              console.log("SHIELD CONSUMED!");
              useGameStore.setState({ activePowerUp: null, powerUpTimeLeft: 0 });
              obs.type = null; // Destroy obstacle
              continue;
            }

            // JETPACK LOGIC: Fly over everything (optional, but good for "feel")
            if (activePowerUp === 'jetpack') continue;

            console.log("CRASH DETECTED at z:", obsWorldZ);
            endGame(); 
            return; 
          }
        }
      }

      // --- Check Coins ---
      const isMagnetActive = useGameStore.getState().activePowerUp === 'magnet';

      for (const coin of seg.coins) {
        if (seg.collectedCoins.has(coin.id)) continue;
        
        const coinWorldZ = seg.z + coin.zOffset;
        let collected = checkPlayerCoin(playerX, playerY, coinWorldZ, coin.lane);

        // Magnet logic: pull coins if they are close enough
        if (!collected && isMagnetActive) {
          const distZ = Math.abs(coinWorldZ); // player at z=0
          const distX = Math.abs(playerX - LANES[coin.lane]);
          if (distZ < 10 && distX < 8) {
            collected = true;
          }
        }

        if (collected) {
          seg.collectedCoins.add(coin.id);
          addCoin(1);
        }
      }

      // 3. Recycling
      if (seg.z > SEGMENT_LENGTH) {
        // Find the furthest segment
        const furthestZ = Math.min(...segments.current.map(s => s.z));
        seg.z = furthestZ - SEGMENT_LENGTH;
        
        // Randomize new content
        seg.obstacles = generateObstacles();
        seg.coins = generateCoins(seg.obstacles);
        seg.collectedCoins = new Set();
        
        setTick(t => t + 1);
      }
    }
  });

  return (
    <group>
      {segments.current.map((seg) => (
        <group key={seg.id} position={[0, 0, seg.z]}>
          <WorldSegment 
            index={seg.id} 
            obstacles={seg.obstacles} 
            coins={seg.coins}
            collectedCoins={seg.collectedCoins}
          />
        </group>
      ))}
    </group>
  );
}
