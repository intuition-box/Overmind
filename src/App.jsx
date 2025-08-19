// src/App.jsx - V8 World Environment
import React from 'react';
import V8Scene from './components/V8/index.js';
import './App.css';
import './index.css';

/**
 * 🌍 V8 - World Environment + Tone Mapping Exposure
 * Système d'éclairage dynamique unifié pour transitions jour/nuit fluides
 * 
 * Architecture: App.jsx → V8/index.js → V3Scene.jsx → Tous les systèmes V6
 */
function App() {
  return (
    <div className="App">
      {/* V8Scene = V3Scene avec architecture V6 stable */}
      <V8Scene />
    </div>
  );
}

export default App;