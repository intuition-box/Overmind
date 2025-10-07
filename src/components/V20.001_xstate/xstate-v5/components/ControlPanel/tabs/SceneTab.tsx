// xstate-v5/components/ControlPanel/tabs/SceneTab.tsx
import React from 'react';
import type { ActorRefFrom } from 'xstate';
import type { sceneMachine } from '../../../actors/scene/sceneMachine';
import { useScene } from '../../../hooks/useScene';

interface SceneTabProps {
  sceneActor: ActorRefFrom<typeof sceneMachine>;
}

export const SceneTab: React.FC<SceneTabProps> = ({ sceneActor }) => {
  const {
    backgroundColor,
    gridVisible,
    gridSize,
    gridDivisions,
    gridColor1,
    gridColor2,
    axesVisible,
    axesSize,
    setBackgroundColor,
    toggleGrid,
    updateGridSize,
    updateGridDivisions,
    updateGridColors,
    toggleAxes,
    updateAxesSize,
    restoreDefaults
  } = useScene(sceneActor);

  return (
    <div className="tab-content">
      <div className="control-section">
        <h3>Background</h3>
        <div className="control-row">
          <label>
            Background Color:
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
            <span className="color-preview" style={{ backgroundColor }} />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Grid Helper</h3>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={gridVisible}
              onChange={toggleGrid}
            />
            Show Grid
          </label>
        </div>

        <div className="control-row">
          <label>
            Grid Size: {gridSize}
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={gridSize}
              onChange={(e) => updateGridSize(+e.target.value)}
              disabled={!gridVisible}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Divisions: {gridDivisions}
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={gridDivisions}
              onChange={(e) => updateGridDivisions(+e.target.value)}
              disabled={!gridVisible}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Center Line Color:
            <input
              type="color"
              value={gridColor1}
              onChange={(e) => updateGridColors(e.target.value, gridColor2)}
              disabled={!gridVisible}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            Grid Line Color:
            <input
              type="color"
              value={gridColor2}
              onChange={(e) => updateGridColors(gridColor1, e.target.value)}
              disabled={!gridVisible}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Axes Helper</h3>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={axesVisible}
              onChange={toggleAxes}
            />
            Show Axes (RGB = XYZ)
          </label>
        </div>

        <div className="control-row">
          <label>
            Axes Size: {axesSize}
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={axesSize}
              onChange={(e) => updateAxesSize(+e.target.value)}
              disabled={!axesVisible}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <button onClick={restoreDefaults} className="btn-secondary">
          🔄 Restore Defaults
        </button>
      </div>
    </div>
  );
};
