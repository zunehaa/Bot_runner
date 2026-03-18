import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { playerState } from '../../state/playerState';
import {
  LANE_SWITCH_SPEED,
  JUMP_VELOCITY,
  GRAVITY,
  PLAYER_REST_Y,
  SLIDE_DURATION_MS,
  SLIDE_SCALE_Y,
} from '../../constants/game';

export function Player() {
  const meshRef      = useRef();
  const bodyRef      = useRef();

  const velocityY    = useRef(0);
  const posY         = useRef(PLAYER_REST_Y);
  const slideTimer   = useRef(null);

  const { landPlayer, stopSlide } = useGameStore();
  const gameStatus = useGameStore((s) => s.gameStatus);

  useEffect(() => {
    if (gameStatus === 'prepare') {
      if (bodyRef.current) {
        bodyRef.current.position.set(0, PLAYER_REST_Y, 0);
        posY.current = PLAYER_REST_Y;
        velocityY.current = 0;
      }
    }
    
    if (gameStatus === 'idle' || gameStatus === 'dead') {
      if (slideTimer.current) {
        clearTimeout(slideTimer.current);
        slideTimer.current = null;
      }
    }
  }, [gameStatus]);

  useFrame((_, delta) => {
    const { targetX, isJumping, isSliding, gameStatus } = useGameStore.getState();
    if (gameStatus !== 'running') return;
    if (!bodyRef.current || !meshRef.current) return;

    // ── 1. Lane Switch (smooth lerp on X) ──────────────────────
    bodyRef.current.position.x = THREE.MathUtils.lerp(
      bodyRef.current.position.x,
      targetX,
      LANE_SWITCH_SPEED,
    );

    // ── 2. Jump Physics (manual gravity) ───────────────────────
    if (isJumping) {
      if (velocityY.current === 0) velocityY.current = JUMP_VELOCITY;
      velocityY.current  -= GRAVITY;
      posY.current       += velocityY.current;

      if (posY.current <= PLAYER_REST_Y) {
        posY.current      = PLAYER_REST_Y;
        velocityY.current = 0;
        landPlayer();
      }
    }
    bodyRef.current.position.y = posY.current;

    // ── 3. Sync State for Collisions ───────────────────────────
    playerState.x = bodyRef.current.position.x;
    playerState.y = bodyRef.current.position.y;
    playerState.isJumping = isJumping;
    playerState.isSliding = isSliding;

    // ── 4. Slide (scale Y compression) ─────────────────────────
    const targetScaleY = isSliding ? SLIDE_SCALE_Y : 1.0;
    meshRef.current.scale.y = THREE.MathUtils.lerp(
      meshRef.current.scale.y,
      targetScaleY,
      0.2,
    );

    // Auto-stop slide after SLIDE_DURATION_MS
    if (isSliding && slideTimer.current === null) {
      slideTimer.current = setTimeout(() => {
        stopSlide();
        slideTimer.current = null;
      }, SLIDE_DURATION_MS);
    }
    if (!isSliding && slideTimer.current !== null) {
      clearTimeout(slideTimer.current);
      slideTimer.current = null;
    }
  });

  return (
    <group ref={bodyRef} position={[0, PLAYER_REST_Y, 0]}>
      {/* Main body */}
      <group ref={meshRef}>
        {/* Torso */}
        <mesh castShadow position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.28, 0.55, 8, 16]} />
          <meshStandardMaterial color="#ff6b35" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#ffcd94" roughness={0.6} />
        </mesh>

        {/* Left eye */}
        <mesh position={[-0.09, 0.76, 0.19]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        {/* Right eye */}
        <mesh position={[0.09, 0.76, 0.19]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Backpack */}
        <mesh castShadow position={[0, 0.15, -0.3]}>
          <boxGeometry args={[0.4, 0.55, 0.18]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
