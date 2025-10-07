// xstate-v5/components/ui/AnimationControls.tsx
import React from 'react';
import { useAnimationControls } from '../../hooks/useAnimationControls';

export function AnimationControls() {
  const { playAnimation, stopAnimation, currentAnimation } = useAnimationControls();

  const animations = [
    'Idle', 'Walk', 'Run', 'Jump', 'Attack',
    'Dance', 'Wave', 'Sit', 'Stand'
  ];

  return (
    <div style={{ padding: '10px', border: '1px solid #333', marginBottom: '10px' }}>
      <h3>Animation Controls</h3>
      <p>Current: {currentAnimation || 'None'}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {animations.map(name => (
          <button
            key={name}
            onClick={() => playAnimation(name)}
            style={{ padding: '5px 10px' }}
          >
            {name}
          </button>
        ))}
      </div>
      <button
        onClick={stopAnimation}
        style={{ marginTop: '10px', padding: '5px 15px' }}
      >
        Stop All
      </button>
    </div>
  );
}
