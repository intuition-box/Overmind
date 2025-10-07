// xstate-v5/services/features/applyColorToMaterials.ts
import { fromPromise } from 'xstate';
import * as THREE from 'three';

export interface ApplyColorToMaterialsInput {
  materials: Map<string, THREE.Material>;
  color: string;
  materialNames?: string[];
}

export interface ApplyColorToMaterialsOutput {
  appliedCount: number;
}

export const applyColorToMaterials = fromPromise<ApplyColorToMaterialsOutput, ApplyColorToMaterialsInput>(
  async ({ input }) => {
    const { materials, color, materialNames } = input;
    let appliedCount = 0;

    const threeColor = new THREE.Color(color);

    materials.forEach((material, name) => {
      // Si materialNames est défini, n'appliquer qu'à ces matériaux
      if (materialNames && !materialNames.includes(name)) {
        return;
      }

      // Appliquer la couleur selon le type de matériau
      if ('color' in material) {
        (material as any).color.copy(threeColor);
        appliedCount++;
      }

      // Si c'est un matériau avec emissive
      if ('emissive' in material) {
        (material as any).emissive.copy(threeColor);
      }

      material.needsUpdate = true;
    });

    return { appliedCount };
  }
);
