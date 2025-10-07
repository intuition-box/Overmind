// xstate-v5/components/ControlPanel/tabs/LightingTab.tsx
import React from 'react';
import type { ActorRefFrom } from 'xstate';
import type { lightingMachine } from '../../../actors/lighting/lightingMachine';
import { useLighting } from '../../../hooks/useLighting';
import { LIGHT_POSITION_PRESETS } from '../../../utils/lightPresets';

interface LightingTabProps {
  lightingActor: ActorRefFrom<typeof lightingMachine>;
}

export const LightingTab: React.FC<LightingTabProps> = ({ lightingActor }) => {
  const {
    ambientIntensity,
    directionalIntensity,
    pointIntensity,
    exposure,
    hdrBoostEnabled,
    hdrBoostMultiplier,
    directionalPosition,
    currentPreset,
    updateAmbientIntensity,
    updateDirectionalIntensity,
    updatePointIntensity,
    updateExposure,
    toggleHDRBoost,
    updateHDRMultiplier,
    updateDirectionalPosition,
    applyLightPreset
  } = useLighting(lightingActor);

  return (
    <div className="tab-content">
      <div className="control-section">
        <h3>Light Intensities</h3>

        <div className="control-row">
          <label>
            Ambient: {ambientIntensity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={ambientIntensity}
              onChange={(e) => updateAmbientIntensity(+e.target.value)}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Directional: {directionalIntensity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={directionalIntensity}
              onChange={(e) => updateDirectionalIntensity(+e.target.value)}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Point: {pointIntensity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={pointIntensity}
              onChange={(e) => updatePointIntensity(+e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Exposure & HDR</h3>

        <div className="control-row">
          <label>
            Exposure: {exposure.toFixed(2)}
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={exposure}
              onChange={(e) => updateExposure(+e.target.value)}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={hdrBoostEnabled}
              onChange={toggleHDRBoost}
            />
            HDR Boost
          </label>
        </div>

        {hdrBoostEnabled && (
          <div className="control-row">
            <label>
              HDR Multiplier: {hdrBoostMultiplier.toFixed(1)}
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={hdrBoostMultiplier}
                onChange={(e) => updateHDRMultiplier(+e.target.value)}
              />
            </label>
          </div>
        )}
      </div>

      <div className="control-section">
        <h3>Light Position Presets</h3>
        <div className="preset-grid">
          {Object.entries(LIGHT_POSITION_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`preset-button ${currentPreset === key ? 'active' : ''}`}
              onClick={() => applyLightPreset(key as any)}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <h3>Directional Light Position</h3>
        <div className="control-row">
          <label>
            X: {directionalPosition.x.toFixed(1)}
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={directionalPosition.x}
              onChange={(e) => updateDirectionalPosition({
                ...directionalPosition,
                x: +e.target.value
              })}
            />
          </label>
        </div>
        <div className="control-row">
          <label>
            Y: {directionalPosition.y.toFixed(1)}
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={directionalPosition.y}
              onChange={(e) => updateDirectionalPosition({
                ...directionalPosition,
                y: +e.target.value
              })}
            />
          </label>
        </div>
        <div className="control-row">
          <label>
            Z: {directionalPosition.z.toFixed(1)}
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={directionalPosition.z}
              onChange={(e) => updateDirectionalPosition({
                ...directionalPosition,
                z: +e.target.value
              })}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
