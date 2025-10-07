// xstate-v5/components/ControlPanel/tabs/BloomTab.tsx
import React from 'react';
import type { ActorRefFrom } from 'xstate';
import type { bloomMachine } from '../../../actors/bloom/bloomMachine';
import { useBloom } from '../../../hooks/useBloom';

interface BloomTabProps {
  bloomActor: ActorRefFrom<typeof bloomMachine>;
}

export const BloomTab: React.FC<BloomTabProps> = ({ bloomActor }) => {
  const {
    enabled,
    threshold,
    strength,
    radius,
    bloomColor,
    toggleBloom,
    updateThreshold,
    updateStrength,
    updateRadius,
    setBloomColor,
    restoreDefaults
  } = useBloom(bloomActor);

  // XState architecture: bloomMachine communique directement avec materialMachine via sendTo
  // Plus besoin d'envoyer manuellement depuis React
  const handleBloomColorChange = (color: string) => {
    setBloomColor(color); // bloomMachine → materialMachine automatiquement
  };

  return (
    <div className="tab-content">
      <div className="control-section">
        <h3>Global Bloom</h3>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={toggleBloom}
            />
            Enable Bloom
          </label>
        </div>

        <div className="control-row">
          <label>
            Threshold: {threshold.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={threshold}
              onChange={(e) => updateThreshold(+e.target.value)}
              disabled={!enabled}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Strength: {strength.toFixed(2)}
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={strength}
              onChange={(e) => updateStrength(+e.target.value)}
              disabled={!enabled}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Radius: {radius.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={radius}
              onChange={(e) => updateRadius(+e.target.value)}
              disabled={!enabled}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Bloom Color:
            <input
              type="color"
              value={bloomColor}
              onChange={(e) => handleBloomColorChange(e.target.value)}
              disabled={!enabled}
            />
            <span className="color-preview" style={{ backgroundColor: bloomColor }} />
          </label>
        </div>

        <div className="control-row">
          <button onClick={restoreDefaults} className="btn-secondary">
            🔄 Restore Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
