// xstate-v5/actors/application/applicationMachine.types.ts
import type { ActorRefFrom } from 'xstate';
import type { sceneLifecycleMachine } from '../scene/sceneLifecycleMachine';

export type ApplicationStatus = 'initializing' | 'ready' | 'running' | 'error' | 'cleanup';

export interface ApplicationContext {
  status: ApplicationStatus;
  error: Error | null;
  sceneActor: ActorRefFrom<typeof sceneLifecycleMachine> | null;
}

export type ApplicationEvents =
  | { type: 'START' }
  | { type: 'LOAD_SCENE'; path: string; containerElement: HTMLElement }
  | { type: 'ERROR_OCCURRED'; error: Error }
  | { type: 'CLEANUP_REQUESTED' };
