// xstate-v5/hooks/useApplication.ts
import { useActorRef, useSelector } from '@xstate/react';
import { applicationMachine } from '../actors/applicationMachine';

export function useApplication() {
  const actorRef = useActorRef(applicationMachine);

  // State
  const isRunning = useSelector(actorRef, (state) => state.matches('running'));

  // Actors
  const bloomActor = useSelector(actorRef, (state) => state.context.bloomActor);
  const lightingActor = useSelector(actorRef, (state) => state.context.lightingActor);
  const pbrActor = useSelector(actorRef, (state) => state.context.pbrActor);
  const performanceActor = useSelector(actorRef, (state) => state.context.performanceActor);
  const effectsActor = useSelector(actorRef, (state) => state.context.effectsActor);
  const sceneActor = useSelector(actorRef, (state) => state.context.sceneActor);
  const materialActor = useSelector(actorRef, (state) => state.context.materialActor);
  const revelationActor = useSelector(actorRef, (state) => state.context.revelationActor);

  return {
    actorRef,
    isRunning,

    // Actors
    bloomActor,
    lightingActor,
    pbrActor,
    performanceActor,
    effectsActor,
    sceneActor,
    materialActor,
    revelationActor
  };
}
