// xstate-v5/components/GLBTest.tsx
import React, { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';

export function GLBTest() {
  const [status, setStatus] = useState('idle');
  const [bones, setBones] = useState(0);
  const [animations, setAnimations] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus('loading...');

    const loader = new GLTFLoader();
    // DRACOLoader activé - fichiers .wasm installés dans public/draco/
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/V3_Eye-3.0.glb',
      (gltf) => {
        const model = gltf.scene;
        const bonesArray: THREE.Bone[] = [];

        model.traverse((child) => {
          if (child instanceof THREE.Bone) {
            bonesArray.push(child);
          }
        });

        setBones(bonesArray.length);
        setAnimations(gltf.animations.length);
        setStatus('✅ Chargé !');

      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setStatus(`Chargement... ${percent}%`);
      },
      (err) => {
        setError(err.message || 'Erreur inconnue');
        setStatus('❌ Erreur');
        console.error('[GLBTest] Erreur:', err);
      }
    );
  }, []);

  return (
    <div style={{
      padding: '15px',
      border: '2px solid #0f0',
      borderRadius: '8px',
      backgroundColor: '#1a1a1a',
      color: '#0f0',
      fontFamily: 'monospace'
    }}>
      <h3>🧪 GLB Test - V3_Eye-3.0.glb</h3>
      <div>
        <strong>Status:</strong> {status}
      </div>
      <div>
        <strong>Bones:</strong> {bones} {bones === 484 && '✅'}
      </div>
      <div>
        <strong>Animations:</strong> {animations} {animations === 29 && '✅'}
      </div>
      {error && (
        <div style={{ color: '#f00', marginTop: '10px' }}>
          <strong>Erreur:</strong> {error}
        </div>
      )}
    </div>
  );
}
