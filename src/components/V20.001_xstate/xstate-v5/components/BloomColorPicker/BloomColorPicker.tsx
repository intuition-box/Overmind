// xstate-v5/components/BloomColorPicker/BloomColorPicker.tsx
import React from 'react';
import { useBloomColorPicker } from '../../hooks/useBloomColorPicker';

export function BloomColorPicker() {
  const { color, isApplying, changeColor } = useBloomColorPicker();

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Bloom Color Picker</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="color"
          value={color}
          onChange={(e) => changeColor(e.target.value)}
          style={{ width: '50px', height: '30px', cursor: 'pointer' }}
        />

        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {color}
        </span>

        {isApplying && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            Applying...
          </span>
        )}
      </div>

      <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#666' }}>
        Changes apply with 200ms debounce
      </p>
    </div>
  );
}
