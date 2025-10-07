// xstate-v5/components/ui/DebugPanel.tsx
import React from 'react';
import { useSelector } from '@xstate/react';
import { useApplication } from '../../hooks/useApplication';

export function DebugPanel() {
  const { actorRef } = useApplication();
  const status = useSelector(actorRef, (state) => state.context.status);
  const snapshot = actorRef.getSnapshot();

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #333',
      marginBottom: '10px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3>Debug Panel</h3>
      <div style={{ marginBottom: '5px' }}>
        <strong>Status:</strong> {status}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>State:</strong> {JSON.stringify(snapshot.value)}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Context:</strong>
        <pre style={{
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {JSON.stringify(snapshot.context, null, 2)}
        </pre>
      </div>
    </div>
  );
}
