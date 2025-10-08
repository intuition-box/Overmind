// xstate-v5/components/SceneCanvasWithControls.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useApplication } from '../hooks/useApplication';
import { ControlPanel } from './ControlPanel/ControlPanel';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export function SceneCanvasWithControls() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderStatus, setRenderStatus] = useState('Initializing...');
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationsRef = useRef<THREE.AnimationClip[]>([]);
  const permanentActionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());

  const {
    bloomActor,
    lightingActor,
    pbrActor,
    performanceActor,
    effectsActor,
    sceneActor,
    materialActor,
    revelationActor,
    isRunning
  } = useApplication();

  // Function to toggle reveal rings visibility
  const toggleRevealRings = () => {
    console.log('[ToggleReveal] Button clicked');
    if (revelationActor) {
      console.log('[ToggleReveal] Sending TOGGLE_FORCE_SHOW_ALL to revelationActor');
      revelationActor.send({ type: 'TOGGLE_FORCE_SHOW_ALL' });
    } else {
      console.warn('[ToggleReveal] ⚠️ revelationActor is null');
    }
  };

  // Ref pour stocker le helper de zone
  const zoneHelperRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Function to trigger reveal animation (rings + pose transition)
  const triggerRingAnimation = () => {
    const mixer = mixerRef.current;
    const animations = animationsRef.current;
    const permanentActions = permanentActionsRef.current;

    if (!mixer || animations.length === 0) {
      console.warn('[TriggerReveal] ⚠️ Mixer or animations not available');
      return;
    }

    console.log('[TriggerReveal] 🎬 Starting reveal transition...');

    // Helper to ease animation weights
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    // Get EXISTING permanent actions that are already playing
    const brasR1Action = permanentActions.get('Bras_R1_Mouv');
    const brasR2Action = permanentActions.get('Bras_R2_Mouv');

    if (!brasR1Action || !brasR2Action) {
      console.error('[TriggerReveal] Missing Bras_R1/R2 permanent actions');
      return;
    }

    // Find pose clips and create new actions for them
    const poseR1R2Clip = animations.find(clip => clip.name === 'R1&R2_Pose');
    const poseR2R1Clip = animations.find(clip => clip.name === 'R2&R1_Pose');

    if (!poseR1R2Clip || !poseR2R1Clip) {
      console.error('[TriggerReveal] Missing pose clips (R1&R2_Pose or R2&R1_Pose)');
      return;
    }

    const poseR1R2Action = mixer.clipAction(poseR1R2Clip);
    const poseR2R1Action = mixer.clipAction(poseR2R1Clip);

    // Listen for pose finish to trigger return to loop (ADD BEFORE PLAY!)
    let finishedPoseCount = 0;
    const totalPoses = 2;

    function onPoseFinished(event: any) {
      if (event.action === poseR1R2Action || event.action === poseR2R1Action) {
        finishedPoseCount++;
        console.log(`[TriggerReveal] Pose finished (${finishedPoseCount}/${totalPoses})`);

        if (finishedPoseCount >= totalPoses) {
          console.log('[TriggerReveal] All poses finished, transitioning back to loop...');
          mixer.removeEventListener('finished', onPoseFinished);
          returnToLoop();
        }
      }
    }

    mixer.addEventListener('finished', onPoseFinished);

    // Calculate pose duration and log for debugging
    const poseR1R2Duration = poseR1R2Clip.duration;
    const poseR2R1Duration = poseR2R1Clip.duration;
    console.log(`[TriggerReveal] Pose durations: R1R2=${poseR1R2Duration.toFixed(2)}s, R2R1=${poseR2R1Duration.toFixed(2)}s`);

    // Prepare poses (play but weight=0, will crossfade to them)
    poseR1R2Action.reset();
    poseR1R2Action.setLoop(THREE.LoopOnce, 1);
    poseR1R2Action.clampWhenFinished = true;
    poseR1R2Action.setEffectiveTimeScale(0.8);
    poseR1R2Action.setEffectiveWeight(0);
    poseR1R2Action.enabled = true; // Force animation to progress even with weight=0
    poseR1R2Action.play();

    poseR2R1Action.reset();
    poseR2R1Action.setLoop(THREE.LoopOnce, 1);
    poseR2R1Action.clampWhenFinished = true;
    poseR2R1Action.setEffectiveTimeScale(0.8);
    poseR2R1Action.setEffectiveWeight(0);
    poseR2R1Action.enabled = true; // Force animation to progress even with weight=0
    poseR2R1Action.play();

    console.log(`[TriggerReveal] Poses will finish in ~${(poseR1R2Duration / 0.8).toFixed(1)}s (with timeScale 0.8)`);

    // Start all ring animations IMMEDIATELY (synchronized with poses)
    const RING_ANIMATIONS = [
      'Action_Ring',
      'Ring_BloomArea_1Action_Ring',
      'Ring_BloomArea_2Action_Ring',
      'Ring_BloomArea_3Action_Ring',
      'Ring_BloomArea_4Action_Ring',
      'Ring_BloomArea_5Action_Ring',
      'Ring_Ext_SG1Action_Ring',
      'Ring_Int_SG1Action_Ring'
    ];

    const SYNC_TIMESCALE = 0.8; // Synchronized with poses
    let ringCount = 0;

    animations.forEach((clip) => {
      if (RING_ANIMATIONS.includes(clip.name)) {
        const action = mixer.clipAction(clip);
        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.setEffectiveTimeScale(SYNC_TIMESCALE);
        action.setEffectiveWeight(1);
        action.play();
        ringCount++;
        console.log(`[TriggerReveal] ▶️ Ring: "${clip.name}" (timeScale: ${SYNC_TIMESCALE})`);
      }
    });

    console.log(`[TriggerReveal] 🎬 Playing ${ringCount} rings + crossfading to poses`);

    // Function to transition back to loop
    function returnToLoop() {
      // Stop all rings
      animations.forEach((clip) => {
        const RING_ANIMATIONS = [
          'Action_Ring',
          'Ring_BloomArea_1Action_Ring',
          'Ring_BloomArea_2Action_Ring',
          'Ring_BloomArea_3Action_Ring',
          'Ring_BloomArea_4Action_Ring',
          'Ring_BloomArea_5Action_Ring',
          'Ring_Ext_SG1Action_Ring',
          'Ring_Int_SG1Action_Ring'
        ];

        if (RING_ANIMATIONS.includes(clip.name)) {
          const action = mixer.clipAction(clip);
          action.stop();
        }
      });

      // Reset permanent actions to time=0 for smooth transition
      brasR1Action.reset();
      brasR1Action.play();
      brasR1Action.setEffectiveWeight(0);

      brasR2Action.reset();
      brasR2Action.play();
      brasR2Action.setEffectiveWeight(0);

      // Crossfade: poses → permanent arms
      const returnFadeDuration = 10.0;
      const returnStartTime = Date.now();

      function crossfadeToLoopAnimate() {
        const elapsed = (Date.now() - returnStartTime) / 1000;
        const progress = Math.min(elapsed / returnFadeDuration, 1);
        const eased = easeOutCubic(progress);

        // Fade out poses, fade in permanent arms
        poseR1R2Action.setEffectiveWeight(1 - eased);
        poseR2R1Action.setEffectiveWeight(1 - eased);
        brasR1Action.setEffectiveWeight(eased);
        brasR2Action.setEffectiveWeight(eased);

        if (progress < 1) {
          requestAnimationFrame(crossfadeToLoopAnimate);
        } else {
          // Stop poses completely
          poseR1R2Action.stop();
          poseR2R1Action.stop();
          console.log('[TriggerReveal] ✅ Returned to loop');
        }
      }

      crossfadeToLoopAnimate();
    }

    // Crossfade: permanent arms → poses (parallel with rings)
    const fadeDuration = 10.0; // 10 seconds
    const startTime = Date.now();

    function crossfadeAnimate() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / fadeDuration, 1);
      const eased = easeOutCubic(progress);

      // Fade out permanent arms, fade in poses
      brasR1Action.setEffectiveWeight(1 - eased);
      brasR2Action.setEffectiveWeight(1 - eased);
      poseR1R2Action.setEffectiveWeight(eased);
      poseR2R1Action.setEffectiveWeight(eased);

      if (progress < 1) {
        requestAnimationFrame(crossfadeAnimate);
      } else {
        console.log('[TriggerReveal] ✅ Crossfade to poses complete');
      }
    }

    crossfadeAnimate();
  };

  useEffect(() => {
    if (!containerRef.current || !isRunning) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // ===== SCENE SETUP =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene; // Store scene ref for zone helper

    // ===== CAMERA =====
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1, 0);

    // ===== RENDERER =====
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.7;
    container.appendChild(renderer.domElement);

    // ===== CONTROLS =====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0);
    controls.update();

    // ===== LIGHTS =====
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // ===== GRID & AXES =====
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    gridHelper.visible = false;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.visible = false;
    scene.add(axesHelper);

    // ===== POST-PROCESSING =====
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Adaptive bloom resolution based on pixel ratio
    // High-DPI screens (Retina, 4K) use reduced bloom resolution for better performance
    // Standard screens keep full resolution for maximum quality
    // Note: Uses device pixel ratio directly (renderer may cap it separately)
    const bloomResolutionScale = window.devicePixelRatio > 1 ? 0.5 : 1.0;
    const bloomWidth = width * bloomResolutionScale;
    const bloomHeight = height * bloomResolutionScale;

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(bloomWidth, bloomHeight),
      0.40, // strength
      0.4,  // radius
      0.15  // threshold
    );
    bloomPass.enabled = true;
    composer.addPass(bloomPass);

    console.log(`[Bloom] Resolution: ${bloomWidth}×${bloomHeight} (scale: ${bloomResolutionScale.toFixed(1)}x, device pixel ratio: ${window.devicePixelRatio}x)`);

    // ===== CONNECT TO XSTATE MACHINES =====

    // 1. bloomMachine
    if (bloomActor) {
      bloomActor.send({ type: 'SET_BLOOM_PASS', bloomPass });
    }

    // 2. lightingMachine
    if (lightingActor) {
      lightingActor.send({ type: 'SET_RENDERER', renderer });
      lightingActor.send({
        type: 'SET_LIGHTS',
        ambientLight,
        directionalLight,
        pointLight
      });
    }

    // 3. pbrMachine
    if (pbrActor) {
      pbrActor.send({ type: 'SET_RENDERER', renderer });
    }

    // 4. performanceMonitor
    if (performanceActor) {
      performanceActor.send({ type: 'SET_RENDERER', renderer });
    }

    // 5. sceneMachine
    if (sceneActor) {
      sceneActor.send({ type: 'SET_SCENE', scene });
      sceneActor.send({ type: 'INITIALIZE_GRID', gridHelper });
      sceneActor.send({ type: 'INITIALIZE_AXES', axesHelper });
    }

    // ===== LOAD GLB MODEL =====
    setRenderStatus('Loading model...');
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    let mixer: THREE.AnimationMixer | null = null;
    const materialGroups: {
      revealRings: THREE.Material[];  // 7 objets avec "BloomArea" (AnneauxBloomArea + Ring_Ext/Int)
      eyeRings: THREE.Material[];     // 2 anneaux métalliques (Anneaux_Eye_Ext/Int)
      iris: THREE.Material[];         // 1 objet IRIS central
    } = {
      revealRings: [],
      eyeRings: [],
      iris: []
    };

    // Collect Object3D references for visibility toggling
    const revealObjects: THREE.Object3D[] = [];
    const revealObjectsSet = new Set<THREE.Object3D>(); // To avoid duplicates

    loader.load(
      '/models/V3_Eye-3.0.glb',
      (gltf) => {
        const model = gltf.scene;

        // Collect materials by specific object and material names
        // REVEAL: Groups AnneauxBloomArea_1→5 + Ring_Ext_SG1 + Ring_Int_SG1
        // EYE_RINGS: 2 anneaux métalliques (Anneaux_Eye_Ext + Anneaux_Eye_Int)
        // IRIS: 1 objet IRIS

        const REVEAL_BLOOM_MATERIAL = 'BloomArea';  // Material for reveal rings

        const EYE_RING_OBJECT_NAMES = [
          'Anneaux_Eye_Ext',  // Outer eye ring
          'Anneaux_Eye_Int'   // Inner eye ring
        ];

        const IRIS_OBJECT_NAME = 'IRIS';  // L'objet iris central

        const foundMaterials = new Set<string>();  // Track unique material names

        // First pass: collect parent groups for AnneauxBloomArea_1→5
        model.traverse((child) => {
          const objectName = child.name;

          // Detect AnneauxBloomArea parent groups (1→5)
          if (objectName.match(/^AnneauxBloomArea_[1-5]$/)) {
            console.log(`[REVEAL] Adding parent group "${objectName}"`);
            revealObjectsSet.add(child);
          }
          // Detect Ring_Ext_SG1 and Ring_Int_SG1 objects
          else if (objectName === 'Ring_Ext_SG1' || objectName === 'Ring_Int_SG1') {
            console.log(`[REVEAL] Adding ring object "${objectName}"`);
            revealObjectsSet.add(child);
          }
        });

        // Second pass: collect materials for material control
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const materialName = child.material.name;
            const objectName = child.name;
            foundMaterials.add(materialName);  // Track all materials found

            // REVEAL RINGS group - collect materials with "BloomArea"
            if (materialName === REVEAL_BLOOM_MATERIAL) {
              console.log(`[REVEAL] Adding material "${materialName}" from object "${objectName}"`);
              materialGroups.revealRings.push(child.material);
            }
            // EYE_RINGS group - 2 metal rings around the eye
            else if (EYE_RING_OBJECT_NAMES.includes(objectName)) {
              console.log(`[EYE_RINGS] Adding material "${materialName}" from object "${objectName}"`);
              materialGroups.eyeRings.push(child.material);
            }
            // IRIS group - the central iris object
            else if (objectName === IRIS_OBJECT_NAME) {
              console.log(`[IRIS] Adding material "${materialName}" from object "${objectName}"`);
              materialGroups.iris.push(child.material);
            }
          }
        });

        console.log('[MATERIALS] All unique materials found in model:', Array.from(foundMaterials));
        console.log('[MATERIALS] revealRings group count:', materialGroups.revealRings.length);
        console.log('[MATERIALS] eyeRings group count:', materialGroups.eyeRings.length);
        console.log('[MATERIALS] iris group count:', materialGroups.iris.length);

        scene.add(model);

        // Convert Set to Array for reveal objects
        const revealObjectsArray = Array.from(revealObjectsSet);

        // Connect revelation objects to revelationMachine
        if (revelationActor && revealObjectsArray.length > 0) {
          revelationActor.send({ type: 'SET_RINGS', rings: revealObjectsArray });
          revelationActor.send({ type: 'SET_MODEL_REFERENCE', model });
          console.log(`[REVELATION] Registered ${revealObjectsArray.length} rings to revelationActor`);
        }

        // Connect materials to materialMachine AND initialize emissive colors for bloom
        if (materialActor) {
          if (materialGroups.revealRings.length > 0) {
            materialActor.send({ type: 'SET_GROUP_MATERIALS', group: 'revealRings', materials: materialGroups.revealRings });
            materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_COLOR', group: 'revealRings', color: '#00ffff' });
            materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_INTENSITY', group: 'revealRings', intensity: 1.0 });
            // Send objects for visibility toggling
            if (revealObjectsArray.length > 0) {
              // Initialize reveal objects as HIDDEN (matching materialMachine default: visible: false)
              revealObjectsArray.forEach((obj) => {
                obj.visible = false;
                obj.traverse((child) => {
                  child.visible = false;
                });
              });

              materialActor.send({ type: 'SET_REVEAL_OBJECTS', objects: revealObjectsArray });
              console.log(`[REVEAL] Registered ${revealObjectsArray.length} objects for visibility toggle (initialized as HIDDEN)`);
            }
          }
          if (materialGroups.eyeRings.length > 0) {
            materialActor.send({ type: 'SET_GROUP_MATERIALS', group: 'eyeRings', materials: materialGroups.eyeRings });
            materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_COLOR', group: 'eyeRings', color: '#00ffff' });
            materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_INTENSITY', group: 'eyeRings', intensity: 1.0 });
          }
          if (materialGroups.iris.length > 0) {
            materialActor.send({ type: 'SET_GROUP_MATERIALS', group: 'iris', materials: materialGroups.iris });
            materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_COLOR', group: 'iris', color: '#00ffff' });
            materialActor.send({ type: 'UPDATE_GROUP_EMISSIVE_INTENSITY', group: 'iris', intensity: 1.0 });
          }
        }

        // Connect materials to pbrMachine
        if (pbrActor) {
          if (materialGroups.revealRings.length > 0) {
            pbrActor.send({ type: 'SET_GROUP_MATERIALS', group: 'magicRings', materials: materialGroups.revealRings });
          }
          if (materialGroups.eyeRings.length > 0) {
            pbrActor.send({ type: 'SET_GROUP_MATERIALS', group: 'eyeRings', materials: materialGroups.eyeRings });
          }
          if (materialGroups.iris.length > 0) {
            pbrActor.send({ type: 'SET_GROUP_MATERIALS', group: 'iris', materials: materialGroups.iris });
          }
        }

        // Setup animation mixer and play PERMANENT animations (bigArms + littleArms)
        console.log(`[SceneCanvas] Model loaded - Found ${gltf.animations.length} animations`);

        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);

          // Store mixer and animations in refs for external access
          mixerRef.current = mixer;
          animationsRef.current = gltf.animations;

          // Permanent animations from V3_CONFIG
          const BIG_ARMS = ['Bras_L1_Mouv', 'Bras_L2_Mouv', 'Bras_R1_Mouv', 'Bras_R2_Mouv'];
          const LITTLE_ARMS = [
            'Little_1_Mouv', 'Little_2_Mouv', 'Little_3_Mouv', 'Little_4_Mouv',
            'Little_5_Mouv', 'Little_6_Mouv', 'Little_7_Mouv', 'Little_8_Mouv',
            'Arm_Little_9Action', 'Little_10_Mouv', 'Little_11_Mouv',
            'Little_12_Mouv', 'Little_13_Mouv'
          ];
          const EYE_RINGS = ['Anneaux_Eye_Ext_Action', 'Anneaux_Eye_Int_Action'];

          let permanentCount = 0;

          gltf.animations.forEach((clip) => {
            const isPermanent = BIG_ARMS.includes(clip.name) || LITTLE_ARMS.includes(clip.name) || EYE_RINGS.includes(clip.name);

            if (isPermanent) {
              const action = mixer.clipAction(clip);
              action.setLoop(THREE.LoopRepeat, Infinity);
              action.setEffectiveTimeScale(0.6);
              action.setEffectiveWeight(1);
              action.play();

              // Store permanent actions for later use (reveal animation)
              permanentActionsRef.current.set(clip.name, action);

              permanentCount++;
              console.log(`[SceneCanvas] ✅ Playing permanent animation: "${clip.name}"`);
            }
          });

          console.log(`[SceneCanvas] 🎬 Started ${permanentCount} permanent animations`);
        } else {
          console.warn(`[SceneCanvas] ⚠️ No animations found in model - will stay in T-pose`);
        }

        setRenderStatus(`✅ Loaded (${gltf.animations.length} animations) - Use Control Panel →`);
      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setRenderStatus(`Loading... ${percent}%`);
      },
      (error) => {
        setRenderStatus('❌ Error loading model');
        console.error('[SceneCanvasWithControls] Error:', error);
      }
    );

    // ===== ANIMATION LOOP =====
    const clock = new THREE.Clock();
    let animationId: number;
    let fpsFrameCount = 0;
    let fpsLastTime = performance.now();

    function animate() {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }

      // Update revelation system continuously
      if (revelationActor) {
        revelationActor.send({ type: 'UPDATE_REVELATION' });
      }

      controls.update();
      composer.render();

      // FPS tracking
      fpsFrameCount++;
      const now = performance.now();
      if (now - fpsLastTime >= 1000) {
        const fps = Math.round((fpsFrameCount * 1000) / (now - fpsLastTime));

        if (performanceActor) {
          performanceActor.send({ type: 'UPDATE_FPS', fps });

          // Memory tracking (if available)
          if ((performance as any).memory) {
            const memory = (performance as any).memory;
            performanceActor.send({
              type: 'UPDATE_MEMORY',
              used: memory.usedJSHeapSize / 1048576,
              limit: memory.jsHeapSizeLimit / 1048576
            });
          }

          // Renderer info
          performanceActor.send({
            type: 'UPDATE_RENDERER_INFO',
            info: {
              triangles: renderer.info.render.triangles,
              geometries: renderer.info.memory.geometries,
              textures: renderer.info.memory.textures,
              programs: renderer.info.programs?.length || 0,
              calls: renderer.info.render.calls
            }
          });
        }

        fpsFrameCount = 0;
        fpsLastTime = now;
      }
    }

    animate();

    // ===== CLEANUP =====
    return () => {
      cancelAnimationFrame(animationId);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isRunning, bloomActor, lightingActor, pbrActor, performanceActor, sceneActor, materialActor, revelationActor]);

  // Zone Helper Effect - Manages visibility of trigger zone helper
  useEffect(() => {
    if (!revelationActor || !sceneRef.current) return;

    let wasVisible = false;

    // Subscribe to showZoneHelper and triggerZone changes
    const subscription = revelationActor.subscribe((state) => {
      const { showZoneHelper, triggerZone } = state.context;
      const scene = sceneRef.current;

      if (!scene) return;

      // Détecter changement de visibilité
      const visibilityChanged = showZoneHelper !== wasVisible;

      // Remove existing helper if present
      if (zoneHelperRef.current) {
        scene.remove(zoneHelperRef.current);
        zoneHelperRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        zoneHelperRef.current = null;
      }

      // Create new helper if needed
      if (showZoneHelper) {
        const group = new THREE.Group();
        group.name = 'ZoneTriggerHelper';

        // Cylindre principal (zone trigger)
        const cylinderGeometry = new THREE.CylinderGeometry(
          triggerZone.radius,
          triggerZone.radius,
          triggerZone.height,
          32,
          1,
          true
        );
        const cylinderMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
          wireframe: false
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        group.add(cylinder);

        // Wireframe du cylindre
        const wireframeGeometry = new THREE.EdgesGeometry(cylinderGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        group.add(wireframe);

        // Position du groupe
        group.position.set(
          triggerZone.position.x,
          triggerZone.position.y,
          triggerZone.position.z
        );

        scene.add(group);
        zoneHelperRef.current = group;

        // Log seulement lors de l'activation
        if (visibilityChanged) {
          console.log(`[ZoneHelper] 👁️ ACTIVÉ - Position: X=${triggerZone.position.x.toFixed(2)} Y=${triggerZone.position.y.toFixed(2)} Z=${triggerZone.position.z.toFixed(2)}, Rayon: ${triggerZone.radius.toFixed(2)}`);
        }
      } else if (visibilityChanged) {
        // Log seulement lors de la désactivation avec dernière position
        console.log(`[ZoneHelper] 🚫 DÉSACTIVÉ - Dernière position: X=${triggerZone.position.x.toFixed(2)} Y=${triggerZone.position.y.toFixed(2)} Z=${triggerZone.position.z.toFixed(2)}, Rayon: ${triggerZone.radius.toFixed(2)}`);
      }

      wasVisible = showZoneHelper;
    });

    return () => {
      subscription.unsubscribe();

      // Cleanup on unmount
      if (zoneHelperRef.current && sceneRef.current) {
        sceneRef.current.remove(zoneHelperRef.current);
        zoneHelperRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        zoneHelperRef.current = null;
      }
    };
  }, [revelationActor]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#0cf',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px',
        border: '1px solid rgba(0, 200, 255, 0.3)',
        zIndex: 500
      }}>
        {renderStatus}
      </div>

      {/* ControlPanel XState v5 */}
      {isRunning && (
        <ControlPanel
          bloomActor={bloomActor!}
          lightingActor={lightingActor!}
          pbrActor={pbrActor!}
          effectsActor={effectsActor!}
          sceneActor={sceneActor!}
          performanceActor={performanceActor!}
          materialActor={materialActor!}
          revelationActor={revelationActor!}
          onTriggerRingAnimation={triggerRingAnimation}
          onToggleRevealRings={toggleRevealRings}
        />
      )}
    </div>
  );
}
