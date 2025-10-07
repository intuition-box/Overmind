// src/AppXState.tsx - XState v5 Test Entry Point
import React from 'react';
import { OvermindProvider } from './components/V20.001_xstate/xstate-v5/context/OvermindProvider';
import { App } from './components/V20.001_xstate/xstate-v5/components/App';

export default function AppXState() {
  return (
    <OvermindProvider>
      <App />
    </OvermindProvider>
  );
}
