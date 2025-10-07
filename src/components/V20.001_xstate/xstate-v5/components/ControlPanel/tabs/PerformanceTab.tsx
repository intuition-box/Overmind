// xstate-v5/components/ControlPanel/tabs/PerformanceTab.tsx
import React from 'react';
import type { ActorRefFrom } from 'xstate';
import type { performanceMonitor } from '../../../actors/performance/performanceMonitor';
import { usePerformance } from '../../../hooks/usePerformance';

interface PerformanceTabProps {
  performanceActor: ActorRefFrom<typeof performanceMonitor>;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ performanceActor }) => {
  const {
    isMonitoring,
    fps,
    fpsHistory,
    memoryUsed,
    memoryLimit,
    memoryUsedPercent,
    rendererInfo,
    startMonitoring,
    stopMonitoring,
    clearHistory
  } = usePerformance(performanceActor);

  const avgFps = fpsHistory.length > 0
    ? (fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length).toFixed(1)
    : '0';

  const minFps = fpsHistory.length > 0 ? Math.min(...fpsHistory).toFixed(1) : '0';
  const maxFps = fpsHistory.length > 0 ? Math.max(...fpsHistory).toFixed(1) : '0';

  return (
    <div className="tab-content">
      <div className="control-section">
        <h3>Monitoring</h3>
        <div className="control-row">
          {!isMonitoring ? (
            <button onClick={startMonitoring} className="btn-primary">
              ▶️ Start Monitoring
            </button>
          ) : (
            <button onClick={stopMonitoring} className="btn-danger">
              ⏸️ Stop Monitoring
            </button>
          )}
        </div>
      </div>

      <div className="control-section">
        <h3>FPS Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Current FPS:</span>
            <span className="stat-value">{fps.toFixed(1)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average FPS:</span>
            <span className="stat-value">{avgFps}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Min FPS:</span>
            <span className="stat-value">{minFps}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max FPS:</span>
            <span className="stat-value">{maxFps}</span>
          </div>
        </div>

        <div className="control-row">
          <button onClick={clearHistory} className="btn-secondary" disabled={!isMonitoring}>
            🗑️ Clear History
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Memory Usage</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Used:</span>
            <span className="stat-value">{memoryUsed.toFixed(1)} MB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Limit:</span>
            <span className="stat-value">{memoryLimit.toFixed(1)} MB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Percentage:</span>
            <span className="stat-value">{memoryUsedPercent}%</span>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${memoryUsedPercent}%`,
              backgroundColor: memoryUsedPercent > 80 ? '#ff4444' : '#44ff44'
            }}
          />
        </div>
      </div>

      <div className="control-section">
        <h3>Renderer Info</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Triangles:</span>
            <span className="stat-value">{rendererInfo.triangles.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Geometries:</span>
            <span className="stat-value">{rendererInfo.geometries}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Textures:</span>
            <span className="stat-value">{rendererInfo.textures}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Programs:</span>
            <span className="stat-value">{rendererInfo.programs}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Draw Calls:</span>
            <span className="stat-value">{rendererInfo.calls}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
