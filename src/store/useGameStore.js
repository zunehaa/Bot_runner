import { create } from 'zustand';
import { LANES, WORLD_SPEED_INITIAL } from '../constants/game';
import { playerState } from '../state/playerState';

// ============================================================
//  ZUSTAND GLOBAL STORE
//  Single source of truth for all game state.
//  3D scene components read from here via selectors.
//  UI overlay components also read from here.
// ============================================================

export const useGameStore = create((set, get) => ({
  // ── Player ──────────────────────────────────────────────────
  laneIndex: 1,               // 0 = left, 1 = center, 2 = right
  targetX:   LANES[1],        // the x-coordinate the player lerps toward
  isJumping:  false,
  isSliding:  false,

  // ── Environment / Chaser ──────────────────────────────────
  chaserZ:   -12,             // starts behind player

  // ── Power-ups ──────────────────────────────────────────────
  activePowerUp: null,        // 'magnet' | 'shield' | 'jetpack'
  powerUpTimeLeft: 0,

  // ── Game State ───────────────────────────────────────────────
  gameStatus: 'idle',         // 'idle' | 'running' | 'dead' | 'paused' | 'prepare'
  score:      0,
  coins:      0,
  distance:   0,              // metres travelled (used for speed scaling)
  speed:      WORLD_SPEED_INITIAL,

  // ── Actions ──────────────────────────────────────────────────
  setGameStatus: (status) => set({ gameStatus: status }),

  switchLane: (dir) => {
    const s = get();
    if (s.gameStatus !== 'running') return;
    const next = Math.max(0, Math.min(2, s.laneIndex + dir));
    if (next === s.laneIndex) return; // already at edge — ignore
    set({ laneIndex: next, targetX: LANES[next] });
  },

  triggerJump: () => {
    const s = get();
    if (s.gameStatus !== 'running') return;
    if (s.isJumping) return; // no double-jump
    set({ isJumping: true });
  },

  triggerSlide: () => {
    const s = get();
    if (s.gameStatus !== 'running') return;
    if (s.isJumping) return; // can't slide mid-air
    set({ isSliding: true });
  },

  landPlayer: () => set({ isJumping: false }),
  stopSlide:  () => set({ isSliding: false }),

  addCoin: (n = 1) => set((s) => ({ coins: s.coins + n })),

  startGame: () => {
    // Reset mutable state immediately
    playerState.x = LANES[1];
    playerState.y = 0.75;
    playerState.isJumping = false;
    playerState.isSliding = false;

    set({
      gameStatus: 'prepare', // Intermediate state to allow for safe reset
      score:      0,
      coins:      0,
      distance:   0,
      speed:      WORLD_SPEED_INITIAL,
      laneIndex:  1,
      targetX:    LANES[1],
      isJumping:  false,
      isSliding:  false,
      chaserZ:    -12,
      activePowerUp: null,
      powerUpTimeLeft: 0,
    });
  },

  endGame: () => set({ gameStatus: 'dead' }),

  activatePowerUp: (type) => set({ 
    activePowerUp: type, 
    powerUpTimeLeft: 1.0 
  }),

  pauseGame: () => set((s) => ({
    gameStatus: s.gameStatus === 'running' ? 'paused' : 'running',
  })),

  // Called every frame by ScoreManager
  tick: (delta) => {
    const s = get();
    if (s.gameStatus !== 'running') return;
    const newDist  = s.distance + s.speed * delta * 60;
    // Speed ramps up gradually, capped at WORLD_SPEED_MAX
    const newSpeed = Math.min(s.speed + delta * 0.00008, 0.55);

    // Chaser logic: pushes closer if player is slow, falls back if fast
    let newChaserZ = s.chaserZ + (newSpeed * 0.98 - newSpeed) * delta * 60;
    
    // Manage power-up timer
    let newPowerUpTime = s.powerUpTimeLeft;
    let newActivePowerUp = s.activePowerUp;
    if (newActivePowerUp) {
      newPowerUpTime -= delta / 8; // 8 seconds total
      if (newPowerUpTime <= 0) {
        newPowerUpTime = 0;
        newActivePowerUp = null;
      }
    }

    set({
      distance: newDist,
      speed:    newSpeed,
      chaserZ:  newChaserZ,
      score:    Math.floor(newDist * 8) + s.coins * 5,
      activePowerUp: newActivePowerUp,
      powerUpTimeLeft: newPowerUpTime,
    });
  },
}));
