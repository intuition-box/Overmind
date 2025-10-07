// xstate-v5/hooks/useCameraControls.ts
import { useState, useCallback } from 'react';

export function useCameraControls() {
  const [position, setPosition] = useState({ x: 0, y: 2, z: 5 });

  const updatePosition = useCallback((newPosition: { x: number; y: number; z: number }) => {
    setPosition(newPosition);
    // Will send event to cameraActor when integrated
  }, []);

  const resetCamera = useCallback(() => {
    setPosition({ x: 0, y: 2, z: 5 });
  }, []);

  return {
    updatePosition,
    resetCamera,
    position
  };
}
