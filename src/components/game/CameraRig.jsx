import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_OFFSET, CAMERA_LERP } from '../../constants/game';

// ============================================================
//  CAMERA RIG — Phase 1
//  Follows the player's X position with smooth lag.
//  Uses a fixed Z/Y offset so the player always appears
//  at the bottom-centre of the viewport.
// ============================================================

const _targetPos  = new THREE.Vector3();
const _lookAt     = new THREE.Vector3();

export function CameraRig({ playerRef }) {
  const { camera } = useThree();
  const smoothedX   = useRef(0);

  useFrame(() => {
    // Get player's current X (even mid-lerp)
    const playerX = playerRef?.current?.position?.x ?? 0;

    // Smooth camera X independently (slower lag than the player lerp)
    smoothedX.current = THREE.MathUtils.lerp(smoothedX.current, playerX, CAMERA_LERP);

    // Build target camera position
    _targetPos.set(
      smoothedX.current + CAMERA_OFFSET.x,
      CAMERA_OFFSET.y,
      CAMERA_OFFSET.z,
    );

    // Lerp camera to target
    camera.position.lerp(_targetPos, 0.1);

    // Always look slightly ahead of the player (down the track)
    _lookAt.set(smoothedX.current, 1.2, -4);
    camera.lookAt(_lookAt);
  });

  return null; // No rendered output — logic only
}
