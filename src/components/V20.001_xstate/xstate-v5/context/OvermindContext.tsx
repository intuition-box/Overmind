// xstate-v5/context/OvermindContext.tsx
import { createContext } from 'react';
import type { ActorRefFrom } from 'xstate';
import type { applicationMachine } from '../actors/application/applicationMachine';

export interface OvermindContextValue {
  actorRef: ActorRefFrom<typeof applicationMachine>;
}

export const OvermindContext = createContext<OvermindContextValue | null>(null);
