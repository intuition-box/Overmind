// xstate-v5/hooks/useAnimationControls.ts
import { useCallback } from 'react';
import { useSelector } from '@xstate/react';
import { useApplication } from './useApplication';

export function useAnimationControls() {
  const { actorRef } = useApplication();
  const currentAnimation = useSelector(actorRef, (state) =>
    state.context.status || 'None'
  );

  const playAnimation = useCallback((name: string) => {
    // Will send event to animationActor when integrated
  }, []);

  const stopAnimation = useCallback(() => {
    // Will send STOP event when integrated
  }, []);

  return {
    playAnimation,
    stopAnimation,
    currentAnimation
  };
}
