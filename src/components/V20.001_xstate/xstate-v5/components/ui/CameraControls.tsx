// xstate-v5/components/ui/CameraControls.tsx
import React from 'react';
import { useCameraControls } from '../../hooks/useCameraControls';

export function CameraControls() {
  const { updatePosition, resetCamera, position } = useCameraControls();

  return (
    <div style={{ padding: '10px', border: '1px solid #333', marginBottom: '10px' }}>
      <h3>Camera Controls</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>X: {position.x.toFixed(1)}</label>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={position.x}
          onChange={(e) => updatePosition({ ...position, x: parseFloat(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Y: {position.y.toFixed(1)}</label>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={position.y}
          onChange={(e) => updatePosition({ ...position, y: parseFloat(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Z: {position.z.toFixed(1)}</label>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={position.z}
          onChange={(e) => updatePosition({ ...position, z: parseFloat(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
      <button onClick={resetCamera} style={{ padding: '5px 15px' }}>
        Reset Camera
      </button>
    </div>
  );
}
