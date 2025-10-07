// xstate-v5/hooks/useDebugPanel.ts
import { useSelector, useActorRef } from '@xstate/react';
import { debugPanelMachine } from '../actors/features/debugPanel/debugPanelMachine';

export function useDebugPanel() {
  const actorRef = useActorRef(debugPanelMachine);

  const isOpen = useSelector(actorRef, (state) => state.context.isOpen);
  const activeTab = useSelector(actorRef, (state) => state.context.activeTab);
  const fps = useSelector(actorRef, (state) => state.context.fps);
  const bones = useSelector(actorRef, (state) => state.context.bones);
  const animations = useSelector(actorRef, (state) => state.context.animations);

  const toggle = () => actorRef.send({ type: 'TOGGLE' });
  const open = () => actorRef.send({ type: 'OPEN' });
  const close = () => actorRef.send({ type: 'CLOSE' });
  const changeTab = (tab: 'animations' | 'rendering' | 'materials' | 'performance') => {
    actorRef.send({ type: 'CHANGE_TAB', tab });
  };

  return {
    isOpen,
    activeTab,
    fps,
    bones,
    animations,
    toggle,
    open,
    close,
    changeTab
  };
}
