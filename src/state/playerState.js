// ============================================================
//  PLAYER STATE — shared mutable object (not Zustand)
//  Updated every frame by Player.jsx.
//  Read every frame by Track.jsx collision detection.
//  No React re-renders caused — pure mutable ref pattern.
// ============================================================

export const playerState = {
  x:          0,       // current world X (mid-lerp)
  y:          0.75,    // current world Y (posY)
  isSliding:  false,
  isJumping:  false,
  invincible: false,   // brief grace period after hit (Phase 3)
};
