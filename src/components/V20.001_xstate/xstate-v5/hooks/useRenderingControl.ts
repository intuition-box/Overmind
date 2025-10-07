// xstate-v5/hooks/useRenderingControl.ts
import { useSelector } from '@xstate/react';
import { useContext } from 'react';
import { OvermindContext } from '../context/OvermindContext';

export function useRenderingControl() {
  const actorRef = useContext(OvermindContext);

  const fps = useSelector(actorRef, (state) => {
    // @ts-ignore - accessing nested actor
    return state.context.renderingActor?.getSnapshot?.()?.context?.fps ?? 0;
  });

  const useComposer = useSelector(actorRef, (state) => {
    // @ts-ignore - accessing nested actor
    return state.context.renderingActor?.getSnapshot?.()?.context?.useComposer ?? false;
  });

  const isRendering = useSelector(actorRef, (state) => {
    // @ts-ignore - accessing nested actor
    return state.context.renderingActor?.getSnapshot?.()?.value === 'rendering';
  });

  const startRendering = () => {
    // @ts-ignore - accessing nested actor
    actorRef.getSnapshot().context.renderingActor?.send({ type: 'START_RENDERING' });
  };

  const stopRendering = () => {
    // @ts-ignore - accessing nested actor
    actorRef.getSnapshot().context.renderingActor?.send({ type: 'STOP_RENDERING' });
  };

  const toggleComposer = () => {
    // @ts-ignore - accessing nested actor
    actorRef.getSnapshot().context.renderingActor?.send({ type: 'TOGGLE_COMPOSER' });
  };

  return {
    fps,
    useComposer,
    isRendering,
    startRendering,
    stopRendering,
    toggleComposer
  };
}
