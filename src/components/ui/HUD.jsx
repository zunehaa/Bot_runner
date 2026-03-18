import { useGameStore } from '../../store/useGameStore';
import './HUD.css';

// ============================================================
//  HUD — Phase 1
//  Pure React overlay — completely separate from the R3F canvas.
//  Reads from Zustand but renders standard HTML/CSS.
// ============================================================

export function HUD() {
  const score      = useGameStore((s) => s.score);
  const coins      = useGameStore((s) => s.coins);
  const speed      = useGameStore((s) => s.speed);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const activePowerUp = useGameStore((s) => s.activePowerUp);
  const powerUpTimeLeft = useGameStore((s) => s.powerUpTimeLeft);

  if (gameStatus !== 'running' && gameStatus !== 'paused') return null;

  const speedPercent = Math.round(((speed - 0.22) / (0.55 - 0.22)) * 100);

  return (
    <div className="hud">
      {/* Score */}
      <div className="hud-score">
        <span className="hud-label">SCORE</span>
        <span className="hud-value">{score.toLocaleString()}</span>
      </div>

      {/* Coins */}
      <div className="hud-coins">
        <span className="coin-icon">🪙</span>
        <span className="hud-value">{coins}</span>
      </div>

      {/* Speed bar */}
      <div className="hud-speed">
        <span className="hud-label">SPEED</span>
        <div className="speed-bar">
          <div
            className="speed-fill"
            style={{ width: `${Math.max(0, speedPercent)}%` }}
          />
        </div>
      </div>

      {/* Active Power-up */}
      {activePowerUp && (
        <div className="hud-powerup">
          <span className="powerup-label">{activePowerUp.toUpperCase()}</span>
          <div className="powerup-timer">
            <div 
              className="powerup-fill" 
              style={{ width: `${powerUpTimeLeft * 100}%` }} 
            />
          </div>
        </div>
      )}

      {/* Paused overlay */}
      {gameStatus === 'paused' && (
        <div className="hud-paused">PAUSED</div>
      )}
    </div>
  );
}
