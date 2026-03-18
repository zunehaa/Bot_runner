import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

// ============================================================
//  INPUT HOOK
//  Handles keyboard (arrow keys + WASD) AND mobile touch swipes.
//  Intentionally kept outside JSX so it can run in any context.
// ============================================================

export function useInput() {
  const { switchLane, triggerJump, triggerSlide, startGame, pauseGame } = useGameStore();
  const touchStart = useRef({ x: 0, y: 0 });

  // ── Keyboard ─────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      const { gameStatus } = useGameStore.getState();

      // Start from idle on any arrow/WASD key
      if (gameStatus === 'idle' || gameStatus === 'dead') {
        if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s',' '].includes(e.key)) {
          startGame();
          return;
        }
      }

      if (gameStatus !== 'running') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          switchLane(-1); break;

        case 'ArrowRight':
        case 'd':
          switchLane(+1); break;

        case 'ArrowUp':
        case 'w':
        case ' ':
          triggerJump(); break;

        case 'ArrowDown':
        case 's':
          triggerSlide(); break;

        case 'Escape':
        case 'p':
          pauseGame(); break;

        default: break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [switchLane, triggerJump, triggerSlide, startGame, pauseGame]);

  // ── Touch / Swipe ─────────────────────────────────────────────
  useEffect(() => {
    const SWIPE_THRESHOLD = 40; // px minimum to register a swipe

    const onTouchStart = (e) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = (e) => {
      const { gameStatus } = useGameStore.getState();
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;

      if (gameStatus === 'idle' || gameStatus === 'dead') {
        startGame();
        return;
      }

      if (gameStatus !== 'running') return;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (Math.abs(dx) > SWIPE_THRESHOLD) switchLane(dx < 0 ? -1 : 1);
      } else {
        // Vertical swipe
        if (dy < -SWIPE_THRESHOLD)  triggerJump();
        if (dy >  SWIPE_THRESHOLD)  triggerSlide();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, [switchLane, triggerJump, triggerSlide, startGame]);
}
