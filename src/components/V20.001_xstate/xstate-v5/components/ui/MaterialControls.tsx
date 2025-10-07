// xstate-v5/components/ui/MaterialControls.tsx
import React from 'react';
import { useMaterialControls } from '../../hooks/useMaterialControls';

export function MaterialControls() {
  const { updateColor, updateMetalness, updateRoughness, color, metalness, roughness } = useMaterialControls();

  return (
    <div style={{ padding: '10px', border: '1px solid #333', marginBottom: '10px' }}>
      <h3>Material Controls</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => updateColor(e.target.value)}
        />
        <span style={{ marginLeft: '10px' }}>{color}</span>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Metalness: {metalness.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={metalness}
          onChange={(e) => updateMetalness(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Roughness: {roughness.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={roughness}
          onChange={(e) => updateRoughness(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
