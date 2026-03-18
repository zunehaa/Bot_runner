import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Leaderboard } from './Leaderboard';
import './GameOver.css';

export function GameOver() {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const score      = useGameStore((s) => s.score);
  const coins      = useGameStore((s) => s.coins);
  const distance   = useGameStore((s) => s.distance);
  const startGame  = useGameStore((s) => s.startGame);

  // Read personal best from localStorage
  const prevBest  = parseInt(localStorage.getItem('subwayBest') || '0', 10);
  const isNewBest = score > prevBest;

  useEffect(() => {
    if (gameStatus === 'dead') {
      // Local storage backup
      if (isNewBest) {
        localStorage.setItem('subwayBest', String(Math.floor(score)));
      }
    }
  }, [gameStatus]);

  const displayBest = Math.max(score, prevBest);

  if (gameStatus !== 'dead') return null;

  return (
    <div className="gameover-overlay">
      <div className="gameover-card">
        {/* Heading */}
        <div className="gameover-title">
          {isNewBest ? '🏆 NEW BEST!' : '💀 GAME OVER'}
        </div>

        {/* Score block */}
        <div className="gameover-scores">
          <div className="gs-row">
            <span className="gs-label">Score</span>
            <span className="gs-value score-main">{Math.floor(score).toLocaleString()}</span>
          </div>
          <div className="gs-row">
            <span className="gs-label">Coins</span>
            <span className="gs-value coins-value">🪙 {coins}</span>
          </div>
          <div className="gs-row">
            <span className="gs-label">Best</span>
            <span className="gs-value best-value">{displayBest.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="gameover-actions">
          <button className="go-btn go-retry" onClick={startGame}>
            ↺  PLAY AGAIN
          </button>
        </div>

        <Leaderboard />

        {isNewBest && <div className="confetti-text">✨ Crushing it! ✨</div>}
      </div>
    </div>
  );
}
