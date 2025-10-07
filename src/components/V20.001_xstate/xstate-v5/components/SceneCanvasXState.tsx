// xstate-v5/components/SceneCanvasXState.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useApplication } from '../hooks/useApplication';
import { useSelector } from '@xstate/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function SceneCanvasXState() {
  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const { actorRef, sceneActor } = useApplication();
  const [threeSetup, setThreeSetup] = useState<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
  } | null>(null);

  // Get sceneActor state
  const sceneState = useSelector(sceneActor, (state) => state?.value || 'idle');
  const sceneContext = useSelector(sceneActor, (state) => state?.context);
  const model = sceneContext?.model;

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = 800;
    const height = 600;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0);
    controls.update();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid
    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(grid);

    setThreeSetup({ scene, camera, renderer, controls });

    // Send LOAD_SCENE event to applicationMachine
    if (container) {
      actorRef.send({
        type: 'LOAD_SCENE',
        path: '/models/V3_Eye-3.0.glb',
        containerElement: container
      });
    }

    // Cleanup
    return () => {
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [actorRef]);

  // Add model to scene when loaded
  useEffect(() => {
    if (!threeSetup || !model) return;

    const { scene } = threeSetup;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);

    return () => {
      scene.remove(model);
    };
  }, [threeSetup, model]);

  // Animation loop
  useEffect(() => {
    if (!threeSetup) return;

    const { scene, camera, renderer, controls } = threeSetup;
    const mixer = sceneContext?.mixer;
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();
      if (mixer) {
        mixer.update(delta);
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [threeSetup, sceneContext?.mixer]);

  const handleTriggerReveal = () => {
    if (sceneActor) {
      const animationActor = sceneActor.getSnapshot().context.animationActor;
      if (animationActor) {
        animationActor.send({ type: 'TRIGGER_REVEAL' });
      }
    }
  };

  const handleReturnToLoop = () => {
    if (sceneActor) {
      const animationActor = sceneActor.getSnapshot().context.animationActor;
      if (animationActor) {
        animationActor.send({ type: 'RETURN_TO_LOOP' });
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Animation Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={handleTriggerReveal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Trigger Reveal
        </button>
        <button
          onClick={handleReturnToLoop}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Return to Loop
        </button>
      </div>
      <div
        ref={containerRef}
        style={{
          width: '800px',
          height: '600px',
          backgroundColor: '#000',
          border: '2px solid #0f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px',
        border: '1px solid #0f0'
      }}>
        🎬 XState Scene: {String(sceneState)}
      </div>
    </div>
  );
}
