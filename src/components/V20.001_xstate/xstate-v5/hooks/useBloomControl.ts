// xstate-v5/hooks/useBloomControl.ts
import { useSelector } from '@xstate/react';
import { useContext } from 'react';
import { OvermindContext } from '../context/OvermindContext';

export function useBloomControl() {
  const actorRef = useContext(OvermindContext);

  const threshold = useSelector(actorRef, (state) => {
    // @ts-ignore - accessing nested actor
    return state.context.bloomActor?.getSnapshot?.()?.context?.threshold ?? 0.5;
  });

  const strength = useSelector(actorRef, (state) => {
    // @ts-ignore - accessing nested actor
    return state.context.bloomActor?.getSnapshot?.()?.context?.strength ?? 1.5;
  });

  const radius = useSelector(actorRef, (state) => {
    // @ts-ignore - accessing nested actor
    return state.context.bloomActor?.getSnapshot?.()?.context?.radius ?? 0.4;
  });

  const enabled = useSelector(actorRef, (state) => {
    // @ts-ignore - accessing nested actor
    return state.context.bloomActor?.getSnapshot?.()?.context?.enabled ?? true;
  });

  const updateThreshold = (value: number) => {
    // @ts-ignore - accessing nested actor
    actorRef.getSnapshot().context.bloomActor?.send({ type: 'UPDATE_THRESHOLD', threshold: value });
  };

  const updateStrength = (value: number) => {
    // @ts-ignore - accessing nested actor
    actorRef.getSnapshot().context.bloomActor?.send({ type: 'UPDATE_STRENGTH', strength: value });
  };

  const updateRadius = (value: number) => {
    // @ts-ignore - accessing nested actor
    actorRef.getSnapshot().context.bloomActor?.send({ type: 'UPDATE_RADIUS', radius: value });
  };

  const toggleEnabled = () => {
    // @ts-ignore - accessing nested actor
    actorRef.getSnapshot().context.bloomActor?.send({ type: 'TOGGLE_ENABLED' });
  };

  return {
    threshold,
    strength,
    radius,
    enabled,
    updateThreshold,
    updateStrength,
    updateRadius,
    toggleEnabled
  };
}
