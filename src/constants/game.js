// ============================================================
//  GLOBAL GAME CONSTANTS
//  Locked values — do NOT change these without updating ALL
//  systems that depend on lane coordinates.
// ============================================================

export const LANES = [-4, 0, 4];           // x-positions: left, center, right
export const LANE_SWITCH_SPEED = 0.14;     // lerp factor per frame (higher = snappier)

export const JUMP_VELOCITY      = 0.22;    // initial upward velocity on jump
export const GRAVITY            = 0.018;   // downward acceleration per frame
export const PLAYER_REST_Y      = 0.75;    // y-position when standing on ground

export const SLIDE_DURATION_MS  = 1200;    // how long a slide lasts (ms)
export const SLIDE_SCALE_Y      = 0.45;    // player Y scale during slide

export const WORLD_SPEED_INITIAL  = 0.22;  // starting world scroll speed
export const WORLD_SPEED_MAX      = 0.55;  // cap so it stays playable

export const SEGMENT_LENGTH  = 30;         // z-depth of one track segment
export const TRACK_WIDTH     = 10;         // total track width (covers 3 lanes)
export const POOL_SIZE       = 6;          // number of recycled segments

export const CAMERA_OFFSET   = { x: 0, y: 5, z: 11 }; // behind-player camera pos
export const CAMERA_LERP     = 0.08;                    // camera lag factor

// ── Phase 3: Chaser & Power-ups ───────────────────────────
export const CHASER_THRESHOLD  = -16;   // Max distance chaser can be behind
export const CHASER_CATCH_Z    = -2;    // At what Z does the chaser catch the player
export const CHASER_SPEED_MOD  = 0.95;  // Base chaser speed relative to player

export const POWERUP_DURATION = 8000;   // 8 seconds
export const MAGNET_RADIUS    = 10;     // How far the magnet pulls coins
