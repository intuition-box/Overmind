// xstate-v5/context/OvermindProvider.tsx
import React, { useMemo } from 'react';
import { useActorRef } from '@xstate/react';
import { OvermindContext } from './OvermindContext';
import { applicationMachine } from '../actors/application/applicationMachine';

interface OvermindProviderProps {
  children: React.ReactNode;
}

export function OvermindProvider({ children }: OvermindProviderProps) {
  const actorRef = useActorRef(applicationMachine);

  const contextValue = useMemo(
    () => ({ actorRef }),
    [actorRef]
  );

  return (
    <OvermindContext.Provider value={contextValue}>
      {children}
    </OvermindContext.Provider>
  );
}
