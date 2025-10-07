// xstate-v5/hooks/useMaterialControls.ts
import { useState, useCallback } from 'react';

export function useMaterialControls() {
  const [color, setColor] = useState('#ffffff');
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);

  const updateColor = useCallback((newColor: string) => {
    setColor(newColor);
    // Will send event to materialActor when integrated
  }, []);

  const updateMetalness = useCallback((value: number) => {
    setMetalness(value);
  }, []);

  const updateRoughness = useCallback((value: number) => {
    setRoughness(value);
  }, []);

  return {
    updateColor,
    updateMetalness,
    updateRoughness,
    color,
    metalness,
    roughness
  };
}
