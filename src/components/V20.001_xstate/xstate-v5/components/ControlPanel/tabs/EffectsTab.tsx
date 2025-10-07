// xstate-v5/components/ControlPanel/tabs/EffectsTab.tsx
import React from 'react';
import type { ActorRefFrom } from 'xstate';
import type { effectsMachine } from '../../../actors/effects/effectsMachine';
import { useEffects } from '../../../hooks/useEffects';
import { EFFECT_PRESETS } from '../../../utils/effectPresets';

interface EffectsTabProps {
  effectsActor: ActorRefFrom<typeof effectsMachine>;
}

export const EffectsTab: React.FC<EffectsTabProps> = ({ effectsActor }) => {
  const {
    glowEnabled,
    ultraBloomEnabled,
    motionTrailEnabled,
    currentPreset,
    toggleGlow,
    toggleUltraBloom,
    toggleMotionTrail,
    applyEffectPreset,
    restoreDefaults
  } = useEffects(effectsActor);

  return (
    <div className="tab-content">
      <div className="control-section">
        <h3>Visual Effects</h3>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={glowEnabled}
              onChange={toggleGlow}
            />
            ✨ Glow Effect
          </label>
        </div>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={ultraBloomEnabled}
              onChange={toggleUltraBloom}
            />
            💥 Ultra Bloom (Strength 3.0)
          </label>
        </div>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={motionTrailEnabled}
              onChange={toggleMotionTrail}
            />
            🌊 Motion Trail
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Effect Presets</h3>
        <div className="preset-grid">
          {Object.entries(EFFECT_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`preset-button ${currentPreset === key ? 'active' : ''}`}
              onClick={() => applyEffectPreset(key as any)}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <button onClick={restoreDefaults} className="btn-secondary">
          🔄 Restore Defaults
        </button>
      </div>

      <div className="control-section info-box">
        <h4>ℹ️ Effect Info</h4>
        <ul>
          <li><strong>Glow:</strong> Per-object emissive glow</li>
          <li><strong>Ultra Bloom:</strong> Sends strength=3.0 to bloomMachine</li>
          <li><strong>Motion Trail:</strong> Leaves trail behind moving objects</li>
        </ul>
      </div>
    </div>
  );
};
