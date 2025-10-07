// xstate-v5/utils/types.ts
import * as THREE from 'three';

export interface GLBLoadInput {
  path: string;
  dracoLoader?: THREE.Loader;
  onProgress?: (progress: number) => void;
}

export interface GLBLoadOutput {
  model: THREE.Group;
  bones: THREE.Bone[];
  animations: THREE.AnimationClip[];
  materials: Map<string, THREE.Material>;
}

export interface ValidateBonesInput {
  bones: THREE.Bone[];
  expectedCount: number;
  strictMode?: boolean;
}

export interface ValidateBonesOutput {
  isValid: boolean;
  actualCount: number;
  expectedCount: number;
  errors: string[];
  warnings: string[];
}

export interface SceneSetupInput {
  containerElement: HTMLElement;
  canvasWidth: number;
  canvasHeight: number;
}

export interface SceneSetupOutput {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}
