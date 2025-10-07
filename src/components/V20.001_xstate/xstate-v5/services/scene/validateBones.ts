// xstate-v5/services/scene/validateBones.ts
import { fromPromise } from 'xstate';
import type { ValidateBonesInput, ValidateBonesOutput } from '../../utils/types';

export const validateBones = fromPromise<ValidateBonesOutput, ValidateBonesInput>(
  async ({ input }) => {
    const { bones, expectedCount, strictMode = false } = input;
    const actualCount = bones.length;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check bone count
    if (actualCount !== expectedCount) {
      const message = `Bone count mismatch: expected ${expectedCount}, got ${actualCount}`;
      if (strictMode) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    // Check for duplicate bones
    const boneNames = bones.map(bone => bone.name);
    const duplicates = boneNames.filter((name, index) => boneNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      warnings.push(`Duplicate bone names found: ${duplicates.join(', ')}`);
    }

    // Check for unnamed bones
    const unnamedBones = bones.filter(bone => !bone.name || bone.name === '');
    if (unnamedBones.length > 0) {
      warnings.push(`${unnamedBones.length} unnamed bones found`);
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      actualCount,
      expectedCount,
      errors,
      warnings
    };
  }
);
