// xstate-v5/components/ControlPanel/tabs/PopTab.tsx
import React from 'react';
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { popMachine } from '../../../actors/pop/popMachine';

interface PopTabProps {
  popActor: ActorRefFrom<typeof popMachine>;
}

export const PopTab: React.FC<PopTabProps> = ({ popActor }) => {
  // Safety check: if popActor is not initialized, show loading message
  if (!popActor) {
    return (
      <div className="tab-content">
        <p>⏳ Initializing eyelid controls...</p>
      </div>
    );
  }

  // Pop_Sup state
  const popSupStartAngle = useSelector(popActor, (state) => state.context.popSupStartAngle);
  const popSupTargetAngle = useSelector(popActor, (state) => state.context.popSupTargetAngle);
  const popSupCurrentAngle = useSelector(popActor, (state) => state.context.popSupCurrentAngle);

  // Pop_Inf state
  const popInfStartAngle = useSelector(popActor, (state) => state.context.popInfStartAngle);
  const popInfTargetAngle = useSelector(popActor, (state) => state.context.popInfTargetAngle);
  const popInfCurrentAngle = useSelector(popActor, (state) => state.context.popInfCurrentAngle);

  // Animation state
  const isAnimating = useSelector(popActor, (state) => state.context.isAnimating);
  const blinkSpeed = useSelector(popActor, (state) => state.context.blinkSpeed);
  const minBlinkInterval = useSelector(popActor, (state) => state.context.minBlinkInterval);
  const maxBlinkInterval = useSelector(popActor, (state) => state.context.maxBlinkInterval);

  return (
    <div className="tab-content">
      {/* Animation Controls */}
      <div className="control-section" style={{ background: '#1a1a2e', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>Animation Automatique</h3>

        <div className="control-row">
          <button
            onClick={() => popActor.send({ type: isAnimating ? 'STOP_ANIMATION' : 'START_ANIMATION' })}
            style={{
              width: '100%',
              padding: '12px',
              background: isAnimating ? '#d32f2f' : '#4CAF50',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isAnimating ? '⏸ Arrêter l\'animation' : '▶ Démarrer l\'animation'}
          </button>
        </div>

        <div className="control-row">
          <label>
            <span>Vitesse de clignement (ms): {blinkSpeed}</span>
          </label>
          <input
            type="number"
            min="50"
            max="1000"
            step="50"
            value={blinkSpeed}
            onChange={(e) =>
              popActor.send({
                type: 'SET_BLINK_SPEED',
                speed: parseFloat(e.target.value) || 200
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="control-row">
          <label>
            <span>Intervalle min (ms): {minBlinkInterval}</span>
          </label>
          <input
            type="number"
            min="500"
            max="10000"
            step="100"
            value={minBlinkInterval}
            onChange={(e) =>
              popActor.send({
                type: 'SET_BLINK_INTERVAL',
                min: parseFloat(e.target.value) || 2000,
                max: maxBlinkInterval
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="control-row">
          <label>
            <span>Intervalle max (ms): {maxBlinkInterval}</span>
          </label>
          <input
            type="number"
            min="500"
            max="10000"
            step="100"
            value={maxBlinkInterval}
            onChange={(e) =>
              popActor.send({
                type: 'SET_BLINK_INTERVAL',
                min: minBlinkInterval,
                max: parseFloat(e.target.value) || 5000
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div className="info-box">
        <h4>Contrôle Manuel des Paupières</h4>
        <ul>
          <li>Rotation sur l'axe X (orange)</li>
          <li>Utilisez les inputs pour définir les angles</li>
          <li>Angles trouvés: Pop_Sup 45.5°, Pop_Inf -43°</li>
        </ul>
      </div>

      {/* Pop_Sup Controls */}
      <div className="control-section">
        <h3>Pop_Sup (Supérieure)</h3>

        <div className="control-row">
          <label>
            <span>Angle actuel</span>
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
              {popSupCurrentAngle.toFixed(1)}°
            </span>
          </label>
        </div>

        <div className="control-row">
          <label>
            <span>Angle de départ</span>
          </label>
          <input
            type="number"
            min="-90"
            max="90"
            step="1"
            value={popSupStartAngle}
            onChange={(e) =>
              popActor.send({
                type: 'SET_POP_SUP_START_ANGLE',
                angle: parseFloat(e.target.value) || 0
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="control-row">
          <label>
            <span>Angle cible</span>
          </label>
          <input
            type="number"
            min="-90"
            max="90"
            step="1"
            value={popSupTargetAngle}
            onChange={(e) =>
              popActor.send({
                type: 'SET_POP_SUP_TARGET_ANGLE',
                angle: parseFloat(e.target.value) || 0
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="control-row">
          <label>
            <span>Rotation manuelle (temps réel)</span>
          </label>
          <input
            type="number"
            min="-90"
            max="90"
            step="0.5"
            value={popSupCurrentAngle}
            onChange={(e) =>
              popActor.send({
                type: 'UPDATE_POP_SUP_ROTATION',
                angle: parseFloat(e.target.value) || 0
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#1a3a1a',
              border: '1px solid #4CAF50',
              borderRadius: '4px',
              color: '#4CAF50',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          />
        </div>
      </div>

      {/* Pop_Inf Controls */}
      <div className="control-section">
        <h3>Pop_Inf (Inférieure)</h3>

        <div className="control-row">
          <label>
            <span>Angle actuel</span>
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
              {popInfCurrentAngle.toFixed(1)}°
            </span>
          </label>
        </div>

        <div className="control-row">
          <label>
            <span>Angle de départ</span>
          </label>
          <input
            type="number"
            min="-90"
            max="90"
            step="1"
            value={popInfStartAngle}
            onChange={(e) =>
              popActor.send({
                type: 'SET_POP_INF_START_ANGLE',
                angle: parseFloat(e.target.value) || 0
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="control-row">
          <label>
            <span>Angle cible</span>
          </label>
          <input
            type="number"
            min="-90"
            max="90"
            step="1"
            value={popInfTargetAngle}
            onChange={(e) =>
              popActor.send({
                type: 'SET_POP_INF_TARGET_ANGLE',
                angle: parseFloat(e.target.value) || 0
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2a2a',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="control-row">
          <label>
            <span>Rotation manuelle (temps réel)</span>
          </label>
          <input
            type="number"
            min="-90"
            max="90"
            step="0.5"
            value={popInfCurrentAngle}
            onChange={(e) =>
              popActor.send({
                type: 'UPDATE_POP_INF_ROTATION',
                angle: parseFloat(e.target.value) || 0
              })
            }
            style={{
              width: '100%',
              padding: '8px',
              background: '#1a3a1a',
              border: '1px solid #4CAF50',
              borderRadius: '4px',
              color: '#4CAF50',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          />
        </div>
      </div>

      {/* Quick Reference */}
      <div className="info-box">
        <h4>Résumé des angles paramétrés</h4>
        <ul style={{ fontSize: '11px' }}>
          <li><strong>Pop_Sup:</strong> {popSupStartAngle}° (départ) → {popSupTargetAngle}° (cible)</li>
          <li><strong>Pop_Inf:</strong> {popInfStartAngle}° (départ) → {popInfTargetAngle}° (cible)</li>
        </ul>
      </div>
    </div>
  );
};
