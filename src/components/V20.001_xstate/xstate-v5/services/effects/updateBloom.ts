// xstate-v5/services/effects/updateBloom.ts
import { fromPromise } from 'xstate';

export interface UpdateBloomInput {
  strength: number;
  threshold?: number;
  radius?: number;
}

export const updateBloom = fromPromise<void, UpdateBloomInput>(
  async ({ input }) => {
    const { strength, threshold = 0.5, radius = 0.8 } = input;
  }
);
