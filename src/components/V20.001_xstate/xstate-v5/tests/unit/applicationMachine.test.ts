// xstate-v5/tests/unit/applicationMachine.test.ts
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { applicationMachine } from '../../actors/application/applicationMachine';

describe('applicationMachine', () => {
  it('initializes in initializing state', () => {
    const actor = createActor(applicationMachine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('initializing');
    actor.stop();
  });

  it('transitions from initializing to ready on START', () => {
    const actor = createActor(applicationMachine);
    actor.start();
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().value).toBe('ready');
    actor.stop();
  });

  it('transitions from ready to running on START', () => {
    const actor = createActor(applicationMachine);
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().value).toBe('running');
    actor.stop();
  });

  it('transitions to error on ERROR_OCCURRED', () => {
    const actor = createActor(applicationMachine);
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'START' });
    actor.send({ type: 'ERROR_OCCURRED', error: new Error('Test error') });
    expect(actor.getSnapshot().value).toBe('error');
    expect(actor.getSnapshot().context.error?.message).toBe('Test error');
    actor.stop();
  });

  it('transitions to cleanup on CLEANUP_REQUESTED', () => {
    const actor = createActor(applicationMachine);
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'START' });
    actor.send({ type: 'CLEANUP_REQUESTED' });
    expect(actor.getSnapshot().value).toBe('cleanup');
    actor.stop();
  });
});
