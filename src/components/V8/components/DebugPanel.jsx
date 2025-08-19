// 🎛️ DebugPanel V6 - SIMPLE BLOOM SYSTEM EDITION
import React, { useState } from 'react';

// PRESETS SÉCURITÉ 
const SECURITY_PRESETS = {
  SAFE: { color: "#00ff88", intensity: 0.3, description: " Mode sécurisé" },
  DANGER: { color: "#ff4444", intensity: 0.8, description: " Alerte danger" },
  WARNING: { color: "#ffaa00", intensity: 0.5, description: " Avertissement" },
  SCANNING: { color: "#4488ff", intensity: 0.6, description: "🔵 Analyse en cours" },
  NORMAL: { color: "#ffffff", intensity: 0.2, description: "⚪ État normal" }
};

// ✅ CORRIGÉ : Composant pour contrôler les paramètres bloom d'une couleur
function ColorBloomControls({ colorName, title, onColorBloomChange, currentColor, values, onValuesChange }) {
  const handleSliderChange = (param, value) => {
    const newValues = { ...values, [param]: value };
    onValuesChange(colorName, newValues);
    onColorBloomChange?.(colorName, param, value);
  };
  
  return (
    <div style={{ 
      marginBottom: '15px', 
      padding: '10px', 
      border: '1px solid #555', 
      borderRadius: '4px',
      background: 'rgba(0,0,0,0.3)'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: currentColor || '#FFD93D', fontSize: '12px' }}>
        {title}
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '10px', color: '#ccc', display: 'block', marginBottom: '4px' }}>
            Strength: {values.strength.toFixed(2)}
            <input
              type="range"
              min="0"
              max="3"
              step="0.01"
              value={values.strength}
              onChange={(e) => handleSliderChange('strength', parseFloat(e.target.value))}
              style={{ 
                width: '100%',
                height: '4px',
                background: '#333',
                borderRadius: '2px',
                outline: 'none',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
          </label>
        </div>
        
        <div>
          <label style={{ fontSize: '10px', color: '#ccc', display: 'block', marginBottom: '4px' }}>
            Radius: {values.radius.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={values.radius}
              onChange={(e) => handleSliderChange('radius', parseFloat(e.target.value))}
              style={{ 
                width: '100%',
                height: '4px',
                background: '#333',
                borderRadius: '2px',
                outline: 'none',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
          </label>
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '10px', color: '#ccc', display: 'block', marginBottom: '4px' }}>
            Emissive: {values.emissiveIntensity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={values.emissiveIntensity}
              onChange={(e) => handleSliderChange('emissiveIntensity', parseFloat(e.target.value))}
              style={{ 
                width: '100%',
                height: '4px',
                background: '#333',
                borderRadius: '2px',
                outline: 'none',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
          </label>
        </div>
        
        <div style={{ fontSize: '9px', color: '#999', gridColumn: '1 / -1', marginTop: '4px' }}>
          {colorName === 'revealRings' ? '💍 Reveal rings indépendants' : 
           colorName === 'iris' ? '👁️ Iris avec couleur sécurité' :
           colorName === 'eyeRings' ? '💍 Eye rings avec couleur sécurité' : 
           '🎨 Groupe avec couleur sécurité'}
        </div>
      </div>
    </div>
  );
}

export default function DebugPanel({ 
  showDebug, 
  forceShowRings, 
  onToggleForceRings,
  magicRingsInfo = [],
  currentAnimation = 'permanent',
  onTriggerTransition = null,
  securityState = 'NORMAL',
  onSecurityStateChange = null,
  isTransitioning = false,
  onColorBloomChange = null,
  setExposure = null,              // ✅ NOUVEAU V8
  getExposure = null,              // ✅ NOUVEAU V8
  worldEnvironmentController = null, // ✅ PHASE 2 V8
  pbrLightingController = null,    // ✅ PHASE 5 V8 - Option 3
  setBackground = null,            // ✅ NOUVEAU : Contrôle Background
  getBackground = null             // ✅ NOUVEAU : Contrôle Background
}) {
  const [activeTab, setActiveTab] = useState('controls');
  
  // ✅ NOUVEAU V8 : State pour exposure
  const [exposure, setExposureState] = useState(1.0);
  
  // ✅ CORRIGÉ : Threshold global + paramètres par groupe
  const [globalThreshold, setGlobalThreshold] = useState(0.3);
  
  const [bloomValues, setBloomValues] = useState({
    iris: {
      strength: 0.8,
      radius: 0.4,
      emissiveIntensity: 0.5
    },
    eyeRings: {
      strength: 0.8,
      radius: 0.4,
      emissiveIntensity: 0.5
    },
    revealRings: {
      strength: 0.8,
      radius: 0.4,
      emissiveIntensity: 0.5
    }
  });
  
  // ✅ NOUVEAU V8 : Handler pour exposure slider
  const handleExposureChange = (value) => {
    const newExposure = parseFloat(value);
    setExposureState(newExposure);
    if (setExposure) {
      setExposure(newExposure);
    }
  };
  
  // ✅ NOUVEAU : Handler pour threshold global
  const handleGlobalThresholdChange = (value) => {
    const newThreshold = parseFloat(value);
    setGlobalThreshold(newThreshold);
    if (onColorBloomChange) {
      onColorBloomChange('global', 'threshold', newThreshold);
    }
  };

  // ✅ NOUVEAU : Handler pour mise à jour des valeurs bloom
  const handleBloomValuesChange = (colorName, newValues) => {
    setBloomValues(prev => ({
      ...prev,
      [colorName]: newValues
    }));
  };


  // ✅ NOUVEAU : State pour le background
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'color',
    color: '#404040'
  });

  // ✅ NOUVEAU : Handler pour background
  const handleBackgroundChange = (type, value) => {
    setBackgroundSettings({ type, color: value || '#404040' });
    if (setBackground) {
      setBackground(type, value);
    }
  };

  // ✅ NOUVEAU PHASE 5 : States pour PBR Lighting - Option 3
  const [pbrSettings, setPbrSettings] = useState({
    currentPreset: 'sombre',
    ambientMultiplier: 1.0,
    directionalMultiplier: 1.0,
    customExposure: 1.0
  });

  // ✅ Handler pour presets PBR
  const handlePbrPresetChange = (presetName) => {
    if (pbrLightingController) {
      const success = pbrLightingController.applyPreset(presetName);
      if (success) {
        setPbrSettings(prev => ({ ...prev, currentPreset: presetName }));
        console.log(`🎛️ Preset PBR "${presetName}" appliqué`);
      }
    }
  };

  // ✅ Handler pour multipliers PBR
  const handlePbrMultipliers = (ambientMult, directionalMult) => {
    console.log(`🔧 Tentative multipliers: Ambient=${ambientMult}, Directional=${directionalMult}`);
    console.log(`🔧 PBRController disponible:`, pbrLightingController ? 'OUI' : 'NON');
    
    if (pbrLightingController) {
      pbrLightingController.setGlobalMultipliers(ambientMult, directionalMult);
      setPbrSettings(prev => ({
        ...prev,
        ambientMultiplier: ambientMult,
        directionalMultiplier: directionalMult
      }));
    } else {
      // Même si le contrôleur n'est pas prêt, on met à jour l'état local
      setPbrSettings(prev => ({
        ...prev,
        ambientMultiplier: ambientMult,
        directionalMultiplier: directionalMult
      }));
      console.warn('⚠️ Contrôleur PBR non disponible, mais état local mis à jour');
    }
  };

  
  if (!showDebug) return null;
  
  // ✅ CORRIGÉ : Obtenir la couleur actuelle du mode de sécurité
  const currentColor = SECURITY_PRESETS[securityState]?.color || '#ffffff';
  
  return (
    <div style={{
      position: "absolute",
      top: "10px",
      left: "10px",
      color: "white",
      background: "rgba(0,0,0,0.95)",
      padding: "20px",
      borderRadius: "12px",
      fontSize: "12px",
      maxHeight: "90vh",
      overflowY: "auto",
      minWidth: "400px",
      fontFamily: "monospace",
      border: "2px solid #333",
      boxShadow: "0 8px 32px rgba(0,0,0,0.8)"
    }}>
      
      <h3 style={{ margin: "0 0 15px 0", color: "#4CAF50", textAlign: "center" }}>
        🎛️ V6 Simple Bloom System
      </h3>

      {/* 📑 TABS */}
      <div style={{ 
        display: "flex", 
        marginBottom: "15px", 
        borderBottom: "1px solid #555",
        paddingBottom: "8px"
      }}>
        {['controls', 'groups', 'pbr', 'background'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "6px 12px",
              margin: "0 2px",
              background: activeTab === tab ? "#4CAF50" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "10px",
              cursor: "pointer"
            }}
          >
            {tab === 'controls' && '🎮 Contrôles'}
            {tab === 'groups' && '🎨 Groupes'}
            {tab === 'pbr' && '💡 PBR'}
            {tab === 'background' && '🌌 Background'}
          </button>
        ))}
      </div>

      {/* TAB CONTRÔLES */}
      {activeTab === 'controls' && (
        <div>
          {/* ✅ TRANSITION BUTTON */}
          {onTriggerTransition && (
            <button
              onClick={onTriggerTransition}
              disabled={isTransitioning}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                background: isTransitioning ? "#666" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: isTransitioning ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {isTransitioning ? "�� Transition..." : `�� ${currentAnimation === 'permanent' ? 'POSE' : 'PERMANENT'}`}
            </button>
          )}

          {/* 🔒 SECURITY PRESETS */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#FF6B6B" }}>
              🔒 Modes Sécurité (Couleur de base)
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {Object.entries(SECURITY_PRESETS).map(([state, preset]) => (
                <button
                  key={state}
                  onClick={() => onSecurityStateChange?.(state)}
                  style={{
                    padding: "8px",
                    background: securityState === state ? preset.color : "#444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "10px",
                    cursor: "pointer",
                    opacity: securityState === state ? 1 : 0.7
                  }}
                >
                  {preset.description}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ PHASE 2 V8 : WORLD ENVIRONMENT THÈMES */}
          {setExposure && (
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#FFD93D" }}>
                🌍 World Environment - Thèmes
              </h4>
              
              {/* ✅ BOUTONS THÈMES AVEC WORLDENVIRONMENTCONTROLLER */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr 1fr", 
                gap: "8px", 
                marginBottom: "12px" 
              }}>
                <button
                  onClick={() => {
                    if (worldEnvironmentController) {
                      worldEnvironmentController.changeTheme('NIGHT');
                    } else {
                      handleExposureChange('0.3');
                    }
                  }}
                  style={{
                    padding: "8px 4px",
                    background: exposure <= 0.4 ? "#2196F3" : "#444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "10px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  🌙 Night
                </button>
                <button
                  onClick={() => {
                    if (worldEnvironmentController) {
                      worldEnvironmentController.changeTheme('DAY');
                    } else {
                      handleExposureChange('1.0');
                    }
                  }}
                  style={{
                    padding: "8px 4px",
                    background: exposure >= 0.8 && exposure <= 1.2 ? "#FF9800" : "#444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "10px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  ☀️ Day
                </button>
                <button
                  onClick={() => {
                    if (worldEnvironmentController) {
                      worldEnvironmentController.changeTheme('BRIGHT');
                    } else {
                      handleExposureChange('1.8');
                    }
                  }}
                  style={{
                    padding: "8px 4px",
                    background: exposure >= 1.6 ? "#FFC107" : "#444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "10px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  🔆 Bright
                </button>
              </div>
              
              {/* ✅ SLIDER PRÉCIS */}
              <div style={{ 
                padding: "10px", 
                border: "1px solid #555", 
                borderRadius: "4px",
                background: "rgba(255, 217, 61, 0.1)"
              }}>
                <label style={{ 
                  fontSize: "11px", 
                  color: "#FFD93D", 
                  display: "block", 
                  marginBottom: "6px",
                  fontWeight: "bold"
                }}>
                  Exposure Précis: {exposure.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={exposure}
                  onChange={(e) => handleExposureChange(e.target.value)}
                  style={{
                    width: "100%",
                    margin: "4px 0",
                    accentColor: "#FFD93D"
                  }}
                />
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  fontSize: "9px", 
                  color: "#aaa",
                  marginTop: "4px"
                }}>
                  <span>🌙 0.3</span>
                  <span>☀️ 1.0</span>
                  <span>🔆 1.8</span>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NOUVEAU : THRESHOLD GLOBAL */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#FF9800" }}>
              🎯 Bloom Threshold Global
            </h4>
            <div style={{ 
              padding: "10px", 
              border: "1px solid #555", 
              borderRadius: "4px",
              background: "rgba(255, 152, 0, 0.1)"
            }}>
              <label style={{ 
                fontSize: "11px", 
                color: "#FF9800", 
                display: "block", 
                marginBottom: "6px",
                fontWeight: "bold"
              }}>
                Threshold: {globalThreshold.toFixed(2)} (Seuil luminosité pour toute la scène)
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                value={globalThreshold}
                onChange={(e) => handleGlobalThresholdChange(e.target.value)}
                style={{
                  width: "100%",
                  margin: "4px 0",
                  accentColor: "#FF9800"
                }}
              />
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontSize: "9px", 
                color: "#aaa",
                marginTop: "4px"
              }}>
                <span>🔥 0.0 (Tout bloom)</span>
                <span>⚡ 0.3 (Recommandé)</span>
                <span>✨ 1.0 (Très lumineux uniquement)</span>
              </div>
            </div>
          </div>

          {/* RINGS CONTROL */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#4ECDC4" }}>
              💍 Magic Rings ({magicRingsInfo.length})
            </h4>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={forceShowRings}
                onChange={(e) => onToggleForceRings?.(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Force Show All Rings
            </label>
          </div>
        </div>
      )}

      {/* 🎨 TAB GROUPES */}
      {activeTab === 'groups' && (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#4CAF50', fontSize: '14px' }}>
            🎨 Contrôles Bloom par Groupe
          </h4>
          
          {/* ✅ COLOR PICKER */}
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '4px'
          }}>
            <label style={{ fontSize: '11px', color: '#FF6B6B', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              🎨 Couleur Sécurité (Iris + Eye Rings):
            </label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => {
                const newColor = e.target.value;
                console.log(`🎨 Color picker: ${newColor}`);
                // Simuler un changement de mode pour déclencher les callbacks
                onSecurityStateChange?.('CUSTOM');
              }}
              style={{
                width: '100%',
                height: '35px',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </div>
          
          <div style={{ 
            marginBottom: '15px', 
            padding: '8px', 
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#ccc'
          }}>
            <strong>ℹ️ Info:</strong> Sélectionnez une couleur ci-dessus, puis ajustez chaque groupe séparément.
          </div>
          
          <ColorBloomControls
            colorName="iris"
            title={`👁️ Iris (${securityState})`}
            onColorBloomChange={onColorBloomChange}
            currentColor={currentColor}
            values={bloomValues.iris}
            onValuesChange={handleBloomValuesChange}
          />
          
          <ColorBloomControls
            colorName="eyeRings"
            title={`💍 Eye Rings (${securityState})`}
            onColorBloomChange={onColorBloomChange}
            currentColor={currentColor}
            values={bloomValues.eyeRings}
            onValuesChange={handleBloomValuesChange}
          />
          
          <ColorBloomControls
            colorName="revealRings"
            title="🔮 Reveal Rings (Indépendant)"
            onColorBloomChange={onColorBloomChange}
            currentColor="#ffaa00"
            values={bloomValues.revealRings}
            onValuesChange={handleBloomValuesChange}
          />
        </div>
      )}


      {/* 💡 TAB PBR LIGHTING - Option 3 */}
      {activeTab === 'pbr' && (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#FF9800', fontSize: '14px' }}>
            💡 Éclairage PBR - Solution Hybride
          </h4>
          
          {/* ✅ INFO SOLUTION HYBRIDE + DEBUG */}
          <div style={{ 
            marginBottom: '15px', 
            padding: '8px', 
            background: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#ccc'
          }}>
            <strong>🎛️ Option 3:</strong> Presets rapides + contrôles temps réel pour matériaux PBR Blender
            <br/>
            <strong>🔍 Debug:</strong> Contrôleur = {pbrLightingController ? '✅ Initialisé' : '❌ Non initialisé'}
          </div>

          {/* ✅ PRESETS RAPIDES */}
          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#FF9800', fontSize: '12px' }}>
              🎨 Presets Éclairage
            </h5>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {pbrLightingController?.getAvailablePresets()?.map(preset => (
                <button
                  key={preset.key}
                  onClick={() => handlePbrPresetChange(preset.key)}
                  style={{
                    padding: '6px 8px',
                    background: pbrSettings.currentPreset === preset.key ? '#FF9800' : '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    fontSize: '9px',
                    cursor: 'pointer',
                    fontWeight: pbrSettings.currentPreset === preset.key ? 'bold' : 'normal'
                  }}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              )) || 
              // ✅ FALLBACK: Boutons statiques si contrôleur pas prêt
              ['sombre', 'normal', 'lumineux', 'pbr'].map(presetKey => (
                <button
                  key={presetKey}
                  onClick={() => {
                    console.log(`🔄 Tentative preset ${presetKey} - Contrôleur:`, pbrLightingController ? 'OK' : 'MANQUANT');
                    if (pbrLightingController) {
                      handlePbrPresetChange(presetKey);
                    }
                  }}
                  style={{
                    padding: '6px 8px',
                    background: pbrSettings.currentPreset === presetKey ? '#FF9800' : '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    fontSize: '9px',
                    cursor: 'pointer',
                    fontWeight: pbrSettings.currentPreset === presetKey ? 'bold' : 'normal',
                    opacity: pbrLightingController ? 1 : 0.6
                  }}
                  title={pbrLightingController ? `Preset ${presetKey}` : 'Contrôleur non initialisé'}
                >
                  {presetKey.charAt(0).toUpperCase() + presetKey.slice(1)}
                </button>
              ))}
            </div>
            
            {/* ✅ DESCRIPTION PRESET ACTUEL */}
            {pbrLightingController && (
              <div style={{ 
                marginTop: '8px',
                padding: '6px',
                background: 'rgba(255, 152, 0, 0.1)',
                borderRadius: '3px',
                fontSize: '9px',
                color: '#FF9800'
              }}>
                <strong>Actuel:</strong> {pbrLightingController.presets[pbrSettings.currentPreset]?.description}
              </div>
            )}
          </div>

          {/* ✅ SLIDERS GLOBAUX TEMPS RÉEL */}
          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#FF9800', fontSize: '12px' }}>
              🔧 Multipliers Globaux
            </h5>
            
            {/* Ambient Light Multiplier */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '10px', color: '#ccc', display: 'block', marginBottom: '4px' }}>
                Lumière Ambiante: ×{pbrSettings.ambientMultiplier.toFixed(1)}
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={pbrSettings.ambientMultiplier}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    handlePbrMultipliers(value, pbrSettings.directionalMultiplier);
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    background: '#333',
                    borderRadius: '2px',
                    outline: 'none',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
              </label>
            </div>
            
            {/* Directional Light Multiplier */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '10px', color: '#ccc', display: 'block', marginBottom: '4px' }}>
                Lumière Directionnelle: ×{pbrSettings.directionalMultiplier.toFixed(1)}
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={pbrSettings.directionalMultiplier}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    handlePbrMultipliers(pbrSettings.ambientMultiplier, value);
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    background: '#333',
                    borderRadius: '2px',
                    outline: 'none',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
              </label>
            </div>
          </div>

          {/* ✅ ACTIONS RAPIDES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => {
                console.log('🔄 Tentative Reset V6...');
                console.log('📊 PBR Controller:', pbrLightingController ? 'Disponible' : 'Non disponible');
                
                if (pbrLightingController) {
                  handlePbrPresetChange('sombre');
                  handlePbrMultipliers(1.0, 1.0);
                  console.log('✅ Reset V6 effectué');
                } else {
                  // Fallback: reset local state
                  setPbrSettings({
                    currentPreset: 'sombre',
                    ambientMultiplier: 1.0,
                    directionalMultiplier: 1.0,
                    customExposure: 1.0
                  });
                  console.log('⚠️ Reset local seulement (contrôleur indisponible)');
                }
              }}
              style={{
                padding: '6px',
                background: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '9px',
                cursor: 'pointer',
                fontWeight: 'bold',
                opacity: pbrLightingController ? 1 : 0.7
              }}
              title={pbrLightingController ? 'Reset au preset Sombre (V6)' : 'Contrôleur PBR non initialisé'}
            >
              🔄 Reset V6
            </button>
            
            <button
              onClick={() => {
                console.log('🔍 Debug PBR démarré...');
                console.log('📊 PBR Controller disponible:', pbrLightingController ? 'OUI' : 'NON');
                console.log('📊 PBR Settings locaux:', pbrSettings);
                
                if (pbrLightingController) {
                  const info = pbrLightingController.getDebugInfo();
                  console.log('🔍 Debug PBR complet:', info);
                  console.log('📊 Intensités finales:', info.lightIntensities);
                  console.log('🎨 Presets disponibles:', pbrLightingController.getAvailablePresets());
                } else {
                  console.warn('⚠️ PBRLightingController non initialisé');
                  console.log('📊 État local uniquement:', pbrSettings);
                }
              }}
              style={{
                padding: '6px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '9px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📊 Debug
            </button>
          </div>
        </div>
      )}

      {/* 🌌 TAB BACKGROUND */}
      {activeTab === 'background' && (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#9C27B0', fontSize: '14px' }}>
            🌌 Contrôle du Background
          </h4>
          
          {/* ✅ INFO */}
          <div style={{ 
            marginBottom: '15px', 
            padding: '8px', 
            background: 'rgba(156, 39, 176, 0.1)',
            border: '1px solid rgba(156, 39, 176, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#ccc'
          }}>
            <strong>ℹ️ Background:</strong> Contrôlez l'arrière-plan de la scène 3D. Par défaut, la scène utilise un gris moyen (#404040).
          </div>

          {/* ✅ BOUTONS PRESETS */}
          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#9C27B0', fontSize: '12px' }}>
              🎨 Préréglages
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              <button
                onClick={() => handleBackgroundChange('transparent')}
                style={{
                  padding: '8px 4px',
                  background: backgroundSettings.type === 'transparent' ? '#9C27B0' : '#444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                👻 Transparent
              </button>
              <button
                onClick={() => handleBackgroundChange('black')}
                style={{
                  padding: '8px 4px',
                  background: backgroundSettings.type === 'black' ? '#9C27B0' : '#444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ⚫ Noir
              </button>
              <button
                onClick={() => handleBackgroundChange('white')}
                style={{
                  padding: '8px 4px',
                  background: backgroundSettings.type === 'white' ? '#9C27B0' : '#444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ⚪ Blanc
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => handleBackgroundChange('dark')}
                style={{
                  padding: '8px 4px',
                  background: backgroundSettings.type === 'dark' ? '#9C27B0' : '#444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🌚 Sombre
              </button>
              <button
                onClick={() => handleBackgroundChange('color', '#404040')}
                style={{
                  padding: '8px 4px',
                  background: backgroundSettings.type === 'color' && backgroundSettings.color === '#404040' ? '#9C27B0' : '#444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔄 Défaut
              </button>
            </div>
          </div>

          {/* ✅ COULEUR PERSONNALISÉE */}
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            border: '1px solid #555', 
            borderRadius: '4px',
            background: 'rgba(156, 39, 176, 0.1)'
          }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#9C27B0', fontSize: '12px' }}>
              🎨 Couleur Personnalisée
            </h5>
            <label style={{ fontSize: '10px', color: '#ccc', display: 'block', marginBottom: '6px' }}>
              Choisir une couleur:
              <input
                type="color"
                value={backgroundSettings.color}
                onChange={(e) => {
                  const newColor = e.target.value;
                  handleBackgroundChange('color', newColor);
                }}
                style={{
                  width: '100%',
                  height: '35px',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              />
            </label>
            <div style={{ fontSize: '9px', color: '#999', marginTop: '6px' }}>
              Couleur actuelle: {backgroundSettings.color} ({backgroundSettings.type})
            </div>
          </div>

          {/* ✅ STATUS */}
          <div style={{ 
            padding: '8px', 
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid #555',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#ccc'
          }}>
            <strong>📊 Status:</strong><br/>
            Type: {backgroundSettings.type}<br/>
            {backgroundSettings.type === 'color' && `Couleur: ${backgroundSettings.color}`}
            {backgroundSettings.type === 'transparent' && 'Arrière-plan transparent'}
            {backgroundSettings.type === 'black' && 'Arrière-plan noir'}
            {backgroundSettings.type === 'white' && 'Arrière-plan blanc'}
            {backgroundSettings.type === 'dark' && 'Arrière-plan sombre'}
          </div>
        </div>
      )}

      {/* ✅ KEYBOARD SHORTCUTS */}
      <div style={{
        borderTop: "1px solid #555",
        paddingTop: "15px",
        marginTop: "15px"
      }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#9C27B0", fontSize: "11px" }}>
          ⌨️ Raccourcis Clavier
        </h4>
        <div style={{ fontSize: "9px", color: "#999", lineHeight: "1.3" }}>
          <div>SPACE = Transition | P = Debug | F = Camera Fit</div>
          <div>R = Toggle Rings | ZQSD = Déplacer zone</div>
          <div>AE = Haut/Bas | RF = Taille</div>
          <div>SHIFT+F/R = Contrôles rapides</div>
        </div>
      </div>
    </div>
  );
}