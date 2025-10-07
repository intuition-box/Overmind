// xstate-v5/components/ControlPanel/tabs/PBRTab.tsx
import React from 'react';
import type { ActorRefFrom } from 'xstate';
import type { pbrMachine, ObjectType } from '../../../actors/pbr/pbrMachine';
import { usePBR } from '../../../hooks/usePBR';
import { PBR_PRESETS } from '../../../utils/pbrPresets';
import { TONE_MAPPING_OPTIONS } from '../../../utils/toneMappingMap';

interface PBRTabProps {
  pbrActor: ActorRefFrom<typeof pbrMachine>;
}

export const PBRTab: React.FC<PBRTabProps> = ({ pbrActor }) => {
  const {
    toneMapping,
    eyeRings,
    iris,
    magicRings,
    arms,
    currentPreset,
    setToneMapping,
    updateGroupMetalness,
    updateGroupRoughness,
    applyPresetToGroup,
    restoreDefaults
  } = usePBR(pbrActor);

  const groups: { id: ObjectType; label: string; data: typeof eyeRings }[] = [
    { id: 'eyeRings', label: '👁️ Eye Rings', data: eyeRings },
    { id: 'iris', label: '🔵 Iris', data: iris },
    { id: 'magicRings', label: '✨ Magic Rings', data: magicRings },
    { id: 'arms', label: '🦾 Arms', data: arms }
  ];

  return (
    <div className="tab-content">
      <div className="control-section">
        <h3>Tone Mapping</h3>
        <select
          value={toneMapping}
          onChange={(e) => setToneMapping(e.target.value as any)}
          className="select-input"
        >
          {TONE_MAPPING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="control-section">
          <h3>{group.label}</h3>

          <div className="control-row">
            <label>
              Metalness: {group.data.metalness.toFixed(2)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={group.data.metalness}
                onChange={(e) => updateGroupMetalness(group.id, +e.target.value)}
              />
            </label>
          </div>

          <div className="control-row">
            <label>
              Roughness: {group.data.roughness.toFixed(2)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={group.data.roughness}
                onChange={(e) => updateGroupRoughness(group.id, +e.target.value)}
              />
            </label>
          </div>

          <div className="preset-row">
            <span>Presets:</span>
            {Object.entries(PBR_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className="preset-button-small"
                onClick={() => applyPresetToGroup(group.id, key as any)}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="control-section">
        <button onClick={restoreDefaults} className="btn-secondary">
          🔄 Restore All Defaults
        </button>
      </div>
    </div>
  );
};
