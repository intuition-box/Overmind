// xstate-v5/hooks/useSceneLifecycle.ts
import { useActorRef, useSelector } from '@xstate/react';
import { sceneLifecycleMachine } from '../actors/scene/sceneLifecycleMachine';

export function useSceneLifecycle() {
  const actorRef = useActorRef(sceneLifecycleMachine);

  const state = useSelector(actorRef, (state) => state.value);
  const context = useSelector(actorRef, (state) => state.context);

  return {
    actorRef,
    state,
    context,
    model: context.model,
    bones: context.bones,
    animations: context.animations,
    scene: context.scene,
    camera: context.camera,
    renderer: context.renderer,
    mixer: context.mixer,
    error: context.error
  };
}
