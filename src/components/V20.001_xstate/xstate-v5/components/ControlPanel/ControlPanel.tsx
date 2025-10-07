// xstate-v5/components/ControlPanel/ControlPanel.tsx
import React, { useState } from 'react';
import type { ActorRefFrom } from 'xstate';
import type { bloomMachine } from '../../actors/bloom/bloomMachine';
import type { lightingMachine } from '../../actors/lighting/lightingMachine';
import type { pbrMachine } from '../../actors/pbr/pbrMachine';
import type { effectsMachine } from '../../actors/effects/effectsMachine';
import type { sceneMachine } from '../../actors/scene/sceneMachine';
import type { performanceMonitor } from '../../actors/performance/performanceMonitor';
import type { materialMachine } from '../../actors/material/materialMachine';
import type { revelationMachine } from '../../actors/revelation/revelationMachine';
import { BloomTab } from './tabs/BloomTab';
import { LightingTab } from './tabs/LightingTab';
import { PBRTab } from './tabs/PBRTab';
import { EffectsTab } from './tabs/EffectsTab';
import { SceneTab } from './tabs/SceneTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { RevelationTab } from './tabs/RevelationTab';
import { MaterialsTab } from './tabs/MaterialsTab';
import './ControlPanel.css';

type TabId = 'bloom' | 'lighting' | 'pbr' | 'materials' | 'effects' | 'scene' | 'performance' | 'revelation';

interface ControlPanelProps {
  bloomActor: ActorRefFrom<typeof bloomMachine>;
  lightingActor: ActorRefFrom<typeof lightingMachine>;
  pbrActor: ActorRefFrom<typeof pbrMachine>;
  effectsActor: ActorRefFrom<typeof effectsMachine>;
  sceneActor: ActorRefFrom<typeof sceneMachine>;
  performanceActor: ActorRefFrom<typeof performanceMonitor>;
  materialActor: ActorRefFrom<typeof materialMachine>;
  revelationActor: ActorRefFrom<typeof revelationMachine>;
  onTriggerRingAnimation: () => void;
  onToggleRevealRings: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  bloomActor,
  lightingActor,
  pbrActor,
  effectsActor,
  sceneActor,
  performanceActor,
  materialActor,
  revelationActor,
  onTriggerRingAnimation,
  onToggleRevealRings
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('bloom');

  const tabs = [
    { id: 'bloom', label: 'bloom', title: 'Bloom Controls' },
    { id: 'lighting', label: 'lighting', title: 'Lighting' },
    { id: 'pbr', label: 'pbr', title: 'PBR Settings' },
    { id: 'materials', label: 'materials', title: 'Materials (Emissive)' },
    { id: 'effects', label: 'effects', title: 'Effects' },
    { id: 'scene', label: 'scene', title: 'Scene' },
    { id: 'performance', label: 'perf', title: 'Performance' },
    { id: 'revelation', label: 'révélation', title: 'Système de Révélation' }
  ] as const;

  return (
    <div className="control-panel">
      {/* Animation Buttons */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '8px' }}>
        <button onClick={onTriggerRingAnimation} className="btn-primary">
          ▶️ Anim Ring
        </button>
        <button onClick={onToggleRevealRings} className="btn-secondary">
          👁️ Toggle Reveal
        </button>
      </div>

      <div className="control-panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as TabId)}
            title={tab.title}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="control-panel-content">
        {activeTab === 'bloom' && (
          <BloomTab bloomActor={bloomActor} materialActor={materialActor} />
        )}
        {activeTab === 'lighting' && (
          <LightingTab lightingActor={lightingActor} />
        )}
        {activeTab === 'pbr' && (
          <PBRTab pbrActor={pbrActor} />
        )}
        {activeTab === 'materials' && (
          <MaterialsTab materialActor={materialActor} />
        )}
        {activeTab === 'effects' && (
          <EffectsTab effectsActor={effectsActor} />
        )}
        {activeTab === 'scene' && (
          <SceneTab sceneActor={sceneActor} />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab performanceActor={performanceActor} />
        )}
        {activeTab === 'revelation' && (
          <RevelationTab revelationActor={revelationActor} />
        )}
      </div>
    </div>
  );
};
