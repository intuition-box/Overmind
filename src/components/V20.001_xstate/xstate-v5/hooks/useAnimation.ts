// xstate-v5/hooks/useAnimation.ts
import { useSelector } from '@xstate/react';
import { useApplication } from './useApplication';

export function useAnimation() {
  const { actorRef } = useApplication();

  // For now, return basic state - will be expanded when animationActor is added to applicationMachine
  const animationState = useSelector(actorRef, (state) => state.value);

  return {
    actorRef,
    animationState
  };
}
