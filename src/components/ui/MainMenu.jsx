import { useGameStore } from '../../store/useGameStore';
import './MainMenu.css';

// ============================================================
//  MAIN MENU — Phase 1
//  Shows on gameStatus === 'idle'
//  Clicking "Play" (or any key/swipe) starts the game.
// ============================================================

export function MainMenu() {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const startGame  = useGameStore((s) => s.startGame);

  if (gameStatus !== 'idle') return null;

  return (
    <div className="menu-overlay">
      <div className="menu-card">
        {/* Animated logo */}
        <div className="menu-logo">
          <span className="logo-subway">SUBWAY</span>
          <span className="logo-runner">RUNNER</span>
        </div>

        <p className="menu-subtitle">
          Run. Jump. Slide. Survive.
        </p>

        <button className="menu-play-btn" onClick={startGame}>
          <span className="btn-glow" />
          ▶  PLAY
        </button>

        <div className="menu-controls">
          <div className="control-row">
            <kbd>←</kbd><kbd>→</kbd>
            <span>Switch Lane</span>
          </div>
          <div className="control-row">
            <kbd>↑</kbd>
            <span>Jump</span>
          </div>
          <div className="control-row">
            <kbd>↓</kbd>
            <span>Slide</span>
          </div>
          <div className="control-row touch-hint">
            <span>📱 Swipe on mobile</span>
          </div>
        </div>
      </div>

      {/* Decorative background rings */}
      <div className="ring ring-1" />
      <div className="ring ring-2" />
      <div className="ring ring-3" />
    </div>
  );
}
