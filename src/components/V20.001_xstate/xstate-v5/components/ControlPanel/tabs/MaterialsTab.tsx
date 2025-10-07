// xstate-v5/components/ControlPanel/tabs/MaterialsTab.tsx
import React from 'react';
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { materialMachine, MaterialGroup } from '../../../actors/material/materialMachine';

interface MaterialsTabProps {
  materialActor: ActorRefFrom<typeof materialMachine>;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ materialActor }) => {
  const groups = useSelector(materialActor, (state) => state.context.groups);

  const updateEmissiveColor = (group: MaterialGroup, color: string) => {
    materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_COLOR', group, color });
  };

  const updateEmissiveIntensity = (group: MaterialGroup, intensity: number) => {
    materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_INTENSITY', group, intensity });
  };

  const renderGroupControls = (groupName: MaterialGroup, label: string) => {
    const group = groups[groupName];

    return (
      <div key={groupName} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #444', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>{label}</h3>

        {/* Emissive Color */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Couleur émissive (glow)
          </label>
          <input
            type="color"
            value={group.emissiveColor}
            onChange={(e) => updateEmissiveColor(groupName, e.target.value)}
            style={{ width: '60px', height: '30px', cursor: 'pointer' }}
          />
          <span style={{ marginLeft: '10px', fontSize: '12px', color: '#888' }}>
            {group.emissiveColor}
          </span>
        </div>

        {/* Emissive Intensity */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            Intensité émissive: {group.emissiveIntensity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={group.emissiveIntensity}
            onChange={(e) => updateEmissiveIntensity(groupName, parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: '16px' }}>Matériaux par Groupe</h2>
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
        Contrôle la couleur et l'intensité d'émission (glow) pour chaque groupe d'objets.
      </p>

      {renderGroupControls('iris', '🌀 Iris')}
      {renderGroupControls('eyeRings', '👁️ Eye Rings')}
      {renderGroupControls('revealRings', '✨ Reveal Rings')}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
          💡 <strong>emissive</strong> = couleur que l'objet "émet" (comme un néon)
          <br />
          💡 <strong>emissiveIntensity</strong> = à quel point il brille (0 = éteint, 2 = très brillant)
        </p>
      </div>
    </div>
  );
};
