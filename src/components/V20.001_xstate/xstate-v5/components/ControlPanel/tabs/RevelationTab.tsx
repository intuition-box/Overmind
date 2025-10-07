// xstate-v5/components/ControlPanel/tabs/RevelationTab.tsx
import React from 'react';
import type { ActorRefFrom } from 'xstate';
import type { revelationMachine } from '../../../actors/revelation/revelationMachine';
import { useSelector } from '@xstate/react';

interface RevelationTabProps {
  revelationActor: ActorRefFrom<typeof revelationMachine>;
}

export const RevelationTab: React.FC<RevelationTabProps> = ({ revelationActor }) => {
  // Sélectionner les états depuis revelationMachine
  const isAnimating = useSelector(revelationActor, (state) => state.context.isAnimating);
  const ringInfos = useSelector(revelationActor, (state) => state.context.ringInfos);
  const triggerZone = useSelector(revelationActor, (state) => state.context.triggerZone);
  const moveSpeed = useSelector(revelationActor, (state) => state.context.moveSpeed);
  const scaleSpeed = useSelector(revelationActor, (state) => state.context.scaleSpeed);

  // Local state pour le helper visuel de la zone
  const [showZoneHelper, setShowZoneHelper] = React.useState(false);

  // Actions
  const startAnimation = () => {
    revelationActor.send({ type: 'START_RING_ANIMATION' });
  };

  const toggleZoneHelper = () => {
    const newValue = !showZoneHelper;
    setShowZoneHelper(newValue);
    revelationActor.send({ type: 'TOGGLE_ZONE_HELPER', visible: newValue });
  };

  const moveZone = (direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward') => {
    revelationActor.send({ type: 'MOVE_ZONE', direction });
  };

  const scaleZone = (direction: 'increase' | 'decrease') => {
    revelationActor.send({ type: 'SCALE_ZONE', direction });
  };

  const resetZone = () => {
    revelationActor.send({ type: 'RESET_ZONE' });
  };

  // Stats
  const visibleCount = ringInfos.filter(r => r.visible).length;
  const totalCount = ringInfos.length;

  return (
    <div className="tab-content">
      <div className="control-section">
        <h3>🌟 Système de Révélation</h3>

        {/* Ring Animation */}
        <div className="control-row">
          <button
            onClick={startAnimation}
            className="btn-primary"
            disabled={isAnimating}
          >
            {isAnimating ? '⏳ Animation en cours...' : '🎬 Lancer animation des rings'}
          </button>
        </div>

        {/* Stats */}
        <div className="control-row">
          <p style={{ margin: '10px 0', color: '#888' }}>
            Anneaux visibles: {visibleCount}/{totalCount}
          </p>
        </div>
      </div>

      <div className="control-section">
        <h3>📐 Contrôle Zone Trigger</h3>

        {/* Zone Helper Toggle */}
        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={showZoneHelper}
              onChange={toggleZoneHelper}
            />
            👁️ Afficher la zone trigger dans la scène
          </label>
        </div>

        {/* Position */}
        <div className="control-row">
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Position: X={triggerZone.position.x.toFixed(2)} Y={triggerZone.position.y.toFixed(2)} Z={triggerZone.position.z.toFixed(2)}
          </label>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button onClick={() => moveZone('forward')} className="btn-secondary" title="Z - Avant">Z ⬆ Avant</button>
            <button onClick={() => moveZone('backward')} className="btn-secondary" title="S - Arrière">S ⬇ Arrière</button>
            <button onClick={() => moveZone('left')} className="btn-secondary" title="Q - Gauche">Q ← Gauche</button>
            <button onClick={() => moveZone('right')} className="btn-secondary" title="D - Droite">D → Droite</button>
            <button onClick={() => moveZone('up')} className="btn-secondary" title="A - Monter">A ↑ Monter</button>
            <button onClick={() => moveZone('down')} className="btn-secondary" title="E - Descendre">E ↓ Descendre</button>
          </div>
        </div>

        {/* Radius */}
        <div className="control-row">
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Rayon: {triggerZone.radius.toFixed(2)}
          </label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => scaleZone('increase')} className="btn-secondary" title="R - Agrandir">R 🔍+ Agrandir</button>
            <button onClick={() => scaleZone('decrease')} className="btn-secondary" title="F - Rétrécir">F 🔍- Rétrécir</button>
          </div>
        </div>

        {/* Height */}
        <div className="control-row">
          <p style={{ margin: '5px 0', color: '#888' }}>
            Hauteur: {triggerZone.height.toFixed(2)}
          </p>
        </div>

        {/* Reset */}
        <div className="control-row">
          <button onClick={resetZone} className="btn-secondary">
            🔄 Réinitialiser Zone
          </button>
        </div>

        {/* Info vitesse */}
        <div className="control-row">
          <p style={{ margin: '10px 0', fontSize: '0.85em', color: '#666' }}>
            Vitesse déplacement: {moveSpeed} | Vitesse échelle: {scaleSpeed}
          </p>
        </div>
      </div>

      <div className="control-section">
        <h3>📊 Informations Anneaux</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.85em' }}>
          {ringInfos.length === 0 ? (
            <p style={{ color: '#888' }}>Aucun anneau enregistré</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Nom</th>
                  <th style={{ textAlign: 'center', padding: '5px' }}>Visible</th>
                  <th style={{ textAlign: 'right', padding: '5px' }}>Distance</th>
                </tr>
              </thead>
              <tbody>
                {ringInfos.map((ring, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '5px' }}>{ring.name}</td>
                    <td style={{ textAlign: 'center', padding: '5px' }}>
                      {ring.visible ? '👁️' : '🚫'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '5px' }}>
                      {ring.distance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="control-section">
        <h3>ℹ️ Aide Clavier (AZERTY)</h3>
        <div style={{ fontSize: '0.85em', color: '#888' }}>
          <p><strong>Z/S</strong> : Avant/Arrière (axe Z)</p>
          <p><strong>Q/D</strong> : Gauche/Droite (axe X)</p>
          <p><strong>A/E</strong> : Monter/Descendre (axe Y)</p>
          <p><strong>R/F</strong> : Rayon (agrandir/rétrécir)</p>
        </div>
      </div>
    </div>
  );
};
