// ============================================================
//  COLLISION UTILITIES — Phase 2
//  Pure AABB (axis-aligned bounding box) logic.
//  No physics engine needed for a lane runner.
// ============================================================

import { LANES } from '../constants/game';

// ── Obstacle visual + collision definitions ─────────────────
//  sx/sy/sz  = full size on each axis
//  cy        = centre Y in world space (base of obstacle is at y=0)
//  For AABB, half-extents = sx/2, sy/2, sz/2
//  obstacle worldY range = [cy - sy/2, cy + sy/2]

export const OBSTACLE_DEFS = {
  // Short barrier — player must JUMP to clear
  low: {
    sx: 1.4, sy: 0.75, sz: 0.55,
    cy: 0.375,                    // centred at half its height
    color: '#e94560', emissive: '#e94560', emissiveIntensity: 0.6,
    hint: 'JUMP',
  },
  // Tall wall — player must SWITCH LANE (too tall to jump or slide under)
  high: {
    sx: 1.4, sy: 2.6, sz: 0.55,
    cy: 1.3,
    color: '#533483', emissive: '#7b52ab', emissiveIntensity: 0.5,
    hint: 'SWITCH',
  },
  // Horizontal pipe at mid-height — player must SLIDE under it
  bar: {
    sx: 1.7, sy: 0.28, sz: 0.5,
    cy: 1.0,                      // bar floats at y=1.0
    color: '#0f3460', emissive: '#4a90d9', emissiveIntensity: 0.8,
    hint: 'SLIDE',
  },
  // Power-up pickup
  powerup: {
    sx: 0.8, sy: 0.8, sz: 0.8,
    cy: 0.9,
    color: '#00ff88', emissive: '#00ff88', emissiveIntensity: 1.5,
    hint: 'PICKUP',
  }
};

// ── Player bounding box helpers ─────────────────────────────
const PLAYER_HALF_W = 0.32;   // was 0.35
const PLAYER_HALF_D = 0.32;   // was 0.35

export function getPlayerHalfH(isSliding) {
  // Standing: half-height = 0.75 (centre at y=0.75, feet at 0, head at 1.5)
  // Sliding:  half-height = 0.30 (centre at y=0.30)
  return isSliding ? 0.30 : 0.75;
}

export function getPlayerCenterY(isSliding) {
  return isSliding ? 0.30 : 0.75;
}

// ── AABB overlap check: player vs. obstacle ─────────────────
//  playerX, playerY  — player centre in world space
//  playerHalfH       — player half-height (sliding vs. standing)
//  obsWorldZ         — obstacle centre Z in world space
//  def               — OBSTACLE_DEFS entry
//  obsLaneX          — obstacle lane centre X (LANES[lane])

export function checkPlayerObstacle(playerX, playerY, playerHalfH, obsWorldZ, def, obsLaneX) {
  const obsHalfW = def.sx / 2;
  const obsHalfH = def.sy / 2;
  const obsHalfD = def.sz / 2;

  const xOverlap = Math.abs(playerX - obsLaneX)  < PLAYER_HALF_W + obsHalfW;
  const yOverlap = Math.abs(playerY - def.cy)     < playerHalfH   + obsHalfH;
  const zOverlap = Math.abs(obsWorldZ)            < PLAYER_HALF_D + obsHalfD; // player is at z=0

  return xOverlap && yOverlap && zOverlap;
}

// ── Coin collection check (sphere proximity) ─────────────────
const COIN_COLLECT_RADIUS = 1.05;

export function checkPlayerCoin(px, py, cz, lane) {
  const laneX = LANES[lane];
  const dx = Math.abs(px - laneX);
  const dz = Math.abs(cz); // player is at z=0
  // Relaxed radius for smoother collection, especially at high speed
  return dx < 1.4 && dz < 2.5;
}

// ── Segment content generators ──────────────────────────────
const OBS_TYPES = ['low', 'high', 'bar'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateObstacles() {
  // Block 1 or 2 lanes — NEVER all 3
  const blockCount = Math.random() < 0.38 ? 2 : 1;
  const blockedLanes = shuffle([0, 1, 2]).slice(0, blockCount);

  const results = blockedLanes.map((laneIdx) => ({
    lane: laneIdx,
    type: OBS_TYPES[Math.floor(Math.random() * OBS_TYPES.length)],
    zOffset: (Math.random() - 0.5) * 6,  // slight scatter within segment
  }));

  // Occasional power-up in a free lane
  if (Math.random() < 0.15) {
    const freeLanes = [0, 1, 2].filter(l => !blockedLanes.includes(l));
    if (freeLanes.length > 0) {
      results.push({
        lane: freeLanes[0],
        type: 'powerup',
        zOffset: -10, // far end of segment
        powerupType: ['magnet', 'shield', 'jetpack'][Math.floor(Math.random() * 3)]
      });
    }
  }

  return results;
}

export function generateCoins(obstacles) {
  const blockedLanes = new Set(obstacles.map((o) => o.lane));
  const freeLanes    = [0, 1, 2].filter((l) => !blockedLanes.has(l));
  if (freeLanes.length === 0) return [];

  const lane  = freeLanes[Math.floor(Math.random() * freeLanes.length)];
  const count = Math.floor(Math.random() * 3) + 3; // 3–5 coins
  const startZ = -8;

  return Array.from({ length: count }, (_, i) => ({
    lane,
    zOffset: startZ + i * 2.4,
    id: i,
  }));
}
