import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats }  from '@react-three/drei';
import { Perf }   from 'r3f-perf';
import { useGameStore } from './store/useGameStore';

// ── 3D Game Components (R3F-land) ────────────────────────────
import { Player }       from './components/game/Player';
import { Track }        from './components/game/Track';
import { Chaser }       from './components/game/Chaser';
import { CameraRig }    from './components/game/CameraRig';
import { ScoreManager } from './components/game/ScoreManager';
import { Stars, Sky }   from '@react-three/drei';

// ── 2D UI Overlays (React-land — zero R3F) ───────────────────
import { HUD }      from './components/ui/HUD';
import { MainMenu } from './components/ui/MainMenu';
import { GameOver } from './components/ui/GameOver';

// ── Hooks ────────────────────────────────────────────────────
import { useInput } from './hooks/useInput';

import './App.css';

// ============================================================
//  GAME SCENE — everything inside <Canvas>
//  useInput lives here so it has access to Zustand from
//  within the R3F render loop context.
// ============================================================
function GameScene({ playerRef }) {
  useInput();               // keyboard + touch input

  return (
    <>
      {/* ── Lighting ────────────────────────────────────────── */}
      <ambientLight intensity={0.35} color="#8888aa" />
      <directionalLight
        position={[6, 12, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#ffe4d0"
      />
      {/* Back-fill to soften shadows */}
      <pointLight position={[-6, 4, -10]} intensity={0.4} color="#533483" />
      <pointLight position={[ 6, 4, -10]} intensity={0.4} color="#0f3460" />

      {/* ── Scene Hierarchy ──────────────────────────────────── */}
      <Suspense fallback={null}>
        <Track />
        <Chaser />
        <group ref={playerRef}>
          <Player />
        </group>
      </Suspense>

      {/* ── Camera (reads playerRef) ─────────────────────────── */}
      <CameraRig playerRef={playerRef} />

      {/* ── Logic (no render output) ─────────────────────────── */}
      <ScoreManager />

      {/* ── Dev-only performance overlay ─────────────────────── */}
      {import.meta.env.DEV && <Perf position="bottom-right" />}
    </>
  );
}

// ============================================================
//  APP ROOT
//  Rule: Canvas and UI overlays are siblings in the DOM.
//        UI never lives inside Canvas; Canvas never renders HTML.
// ============================================================
export default function App() {
  const playerRef = useRef();

  return (
    <div className="app-root">
      {/* ── 3D Canvas ──────────────────────────────────────────── */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 11], fov: 60, near: 0.1, far: 300 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 5, 60]} />
        <Sky sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} distance={450000} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <GameScene playerRef={playerRef} />
      </Canvas>

      {/* ── 2D UI Overlays ─────────────────────────────────────── */}
      <MainMenu />
      <HUD />
      <GameOver />
    </div>
  );
}
