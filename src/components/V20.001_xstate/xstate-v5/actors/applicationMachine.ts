// xstate-v5/actors/applicationMachine.ts
import { setup, assign, spawnChild, type ActorRefFrom } from 'xstate';
import { bloomMachine } from './bloom/bloomMachine';
import { lightingMachine } from './lighting/lightingMachine';
import { pbrMachine } from './pbr/pbrMachine';
import { performanceMonitor } from './performance/performanceMonitor';
import { effectsMachine } from './effects/effectsMachine';
import { sceneMachine } from './scene/sceneMachine';
import { materialMachine } from './material/materialMachine';
import { revelationMachine } from './revelation/revelationMachine';
import { popMachine } from './pop/popMachine';

export interface ApplicationContext {
  // Spawned actors
  bloomActor: ActorRefFrom<typeof bloomMachine> | null;
  lightingActor: ActorRefFrom<typeof lightingMachine> | null;
  pbrActor: ActorRefFrom<typeof pbrMachine> | null;
  performanceActor: ActorRefFrom<typeof performanceMonitor> | null;
  effectsActor: ActorRefFrom<typeof effectsMachine> | null;
  sceneActor: ActorRefFrom<typeof sceneMachine> | null;
  materialActor: ActorRefFrom<typeof materialMachine> | null;
  revelationActor: ActorRefFrom<typeof revelationMachine> | null;
  popActor: ActorRefFrom<typeof popMachine> | null;
}

export type ApplicationEvents =
  | { type: 'INITIALIZE' }
  | { type: 'SHUTDOWN' };

export const applicationMachine = setup({
  types: {} as {
    context: ApplicationContext;
    events: ApplicationEvents;
  },
  actors: {
    bloom: bloomMachine,
    lighting: lightingMachine,
    pbr: pbrMachine,
    performance: performanceMonitor,
    effects: effectsMachine,
    scene: sceneMachine,
    material: materialMachine,
    revelation: revelationMachine,
    pop: popMachine
  }
}).createMachine({
  id: 'application',
  initial: 'running', // Start directly in running state
  context: {
    bloomActor: null,
    lightingActor: null,
    pbrActor: null,
    performanceActor: null,
    effectsActor: null,
    sceneActor: null,
    materialActor: null,
    revelationActor: null,
    popActor: null
  },
  states: {
    running: {
      entry: [
        assign({
          bloomActor: ({ spawn }) => spawn('bloom', { systemId: 'bloom' }),
          lightingActor: ({ spawn }) => spawn('lighting', { systemId: 'lighting' }),
          pbrActor: ({ spawn }) => spawn('pbr', { systemId: 'pbr' }),
          performanceActor: ({ spawn }) => spawn('performance', { systemId: 'performance' }),
          effectsActor: ({ spawn }) => spawn('effects', { systemId: 'effects' }),
          sceneActor: ({ spawn }) => spawn('scene', { systemId: 'scene' }),
          materialActor: ({ spawn }) => spawn('material', { systemId: 'material' }),
          revelationActor: ({ spawn }) => spawn('revelation', { systemId: 'revelation' }),
          popActor: ({ spawn }) => spawn('pop', { systemId: 'pop' })
        }),
        () => console.log('[applicationMachine] ✅ All actors spawned and running')
      ],
      on: {
        SHUTDOWN: {
          target: 'stopped',
          actions: assign({
            bloomActor: null,
            lightingActor: null,
            pbrActor: null,
            performanceActor: null,
            effectsActor: null,
            sceneActor: null,
            materialActor: null,
            revelationActor: null,
            popActor: null
          })
        }
      }
    },
    stopped: {
      entry: () => console.log('[applicationMachine] ⏹️ All actors stopped'),
      on: {
        INITIALIZE: {
          target: 'running'
        }
      }
    }
  }
});
