// xstate-v5/components/SceneCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useScene } from '../hooks/useScene';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function SceneCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { sceneState } = useScene();
  const [renderStatus, setRenderStatus] = useState('idle');

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
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Grid
    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(grid);

    // Load GLB model
    setRenderStatus('Loading model...');
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    let mixer: THREE.AnimationMixer | null = null;

    loader.load(
      '/models/V3_Eye-3.0.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // Setup animation mixer
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const firstAnimation = gltf.animations[0];
          const action = mixer.clipAction(firstAnimation);
          action.play();
        }

        setRenderStatus(`✅ Rendering (${gltf.animations.length} animations)`);
      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setRenderStatus(`Loading... ${percent}%`);
      },
      (error) => {
        setRenderStatus('❌ Error loading model');
        console.error('[SceneCanvas] Error:', error);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          width: '800px',
          height: '600px',
          backgroundColor: '#000',
          border: '2px solid #333',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px'
      }}>
        {renderStatus}
      </div>
    </div>
  );
}
