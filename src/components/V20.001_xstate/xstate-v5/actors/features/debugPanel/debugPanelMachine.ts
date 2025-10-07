// xstate-v5/actors/features/debugPanel/debugPanelMachine.ts
import { setup, assign } from 'xstate';

export interface DebugPanelContext {
  isOpen: boolean;
  activeTab: 'animations' | 'rendering' | 'materials' | 'performance';
  fps: number;
  bones: number;
  animations: number;
}

export type DebugPanelEvents =
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'CHANGE_TAB'; tab: 'animations' | 'rendering' | 'materials' | 'performance' }
  | { type: 'UPDATE_FPS'; fps: number }
  | { type: 'UPDATE_BONES'; bones: number }
  | { type: 'UPDATE_ANIMATIONS'; animations: number };

export const debugPanelMachine = setup({
  types: {} as {
    context: DebugPanelContext;
    events: DebugPanelEvents;
  }
}).createMachine({
  id: 'debugPanel',
  initial: 'closed',
  context: {
    isOpen: false,
    activeTab: 'animations',
    fps: 0,
    bones: 0,
    animations: 0
  },
  states: {
    closed: {
      entry: assign({ isOpen: false }),
      on: {
        TOGGLE: 'open',
        OPEN: 'open'
      }
    },
    open: {
      entry: assign({ isOpen: true }),
      on: {
        TOGGLE: 'closed',
        CLOSE: 'closed',
        CHANGE_TAB: {
          actions: assign({ activeTab: ({ event }) => event.tab })
        },
        UPDATE_FPS: {
          actions: assign({ fps: ({ event }) => event.fps })
        },
        UPDATE_BONES: {
          actions: assign({ bones: ({ event }) => event.bones })
        },
        UPDATE_ANIMATIONS: {
          actions: assign({ animations: ({ event }) => event.animations })
        }
      }
    }
  }
});
