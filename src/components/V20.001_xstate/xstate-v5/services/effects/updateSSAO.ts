// xstate-v5/services/effects/updateSSAO.ts
import { fromPromise } from 'xstate';

export interface UpdateSSAOInput {
  strength: number;
  radius?: number;
  bias?: number;
}

export const updateSSAO = fromPromise<void, UpdateSSAOInput>(
  async ({ input }) => {
    const { strength, radius = 8, bias = 0.5 } = input;
  }
);
