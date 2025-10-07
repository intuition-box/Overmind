// xstate-v5/hooks/useBloomColorPicker.ts
import { useSelector, useActorRef } from '@xstate/react';
import { bloomColorPickerMachine } from '../actors/features/bloomColorPicker/bloomColorPickerMachine';

export function useBloomColorPicker() {
  const actorRef = useActorRef(bloomColorPickerMachine);

  const color = useSelector(actorRef, (state) => state.context.color);
  const isApplying = useSelector(actorRef, (state) => state.value === 'applying');

  const changeColor = (newColor: string) => {
    actorRef.send({
      type: 'CHANGE_COLOR',
      color: newColor
    });
  };

  return {
    color,
    isApplying,
    changeColor
  };
}
