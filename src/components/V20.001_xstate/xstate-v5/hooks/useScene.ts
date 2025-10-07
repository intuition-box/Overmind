// xstate-v5/hooks/useScene.ts
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { sceneMachine } from '../actors/scene/sceneMachine';

export function useScene(actorRef: ActorRefFrom<typeof sceneMachine>) {
  // Background
  const backgroundColor = useSelector(actorRef, (state) => state.context.backgroundColor);

  // Grid
  const gridVisible = useSelector(actorRef, (state) => state.context.gridVisible);
  const gridSize = useSelector(actorRef, (state) => state.context.gridSize);
  const gridDivisions = useSelector(actorRef, (state) => state.context.gridDivisions);
  const gridColor1 = useSelector(actorRef, (state) => state.context.gridColor1);
  const gridColor2 = useSelector(actorRef, (state) => state.context.gridColor2);

  // Axes
  const axesVisible = useSelector(actorRef, (state) => state.context.axesVisible);
  const axesSize = useSelector(actorRef, (state) => state.context.axesSize);

  // Actions - Background
  const setBackgroundColor = (color: string) => {
    actorRef.send({ type: 'SET_BACKGROUND_COLOR', color });
  };

  // Actions - Grid
  const toggleGrid = () => {
    actorRef.send({ type: 'TOGGLE_GRID' });
  };

  const showGrid = () => {
    actorRef.send({ type: 'SHOW_GRID' });
  };

  const hideGrid = () => {
    actorRef.send({ type: 'HIDE_GRID' });
  };

  const updateGridSize = (size: number) => {
    actorRef.send({ type: 'UPDATE_GRID_SIZE', size });
  };

  const updateGridDivisions = (divisions: number) => {
    actorRef.send({ type: 'UPDATE_GRID_DIVISIONS', divisions });
  };

  const updateGridColors = (color1: string, color2: string) => {
    actorRef.send({ type: 'UPDATE_GRID_COLORS', color1, color2 });
  };

  // Actions - Axes
  const toggleAxes = () => {
    actorRef.send({ type: 'TOGGLE_AXES' });
  };

  const showAxes = () => {
    actorRef.send({ type: 'SHOW_AXES' });
  };

  const hideAxes = () => {
    actorRef.send({ type: 'HIDE_AXES' });
  };

  const updateAxesSize = (size: number) => {
    actorRef.send({ type: 'UPDATE_AXES_SIZE', size });
  };

  const restoreDefaults = () => {
    actorRef.send({ type: 'RESTORE_DEFAULTS' });
  };

  return {
    // State - Background
    backgroundColor,

    // State - Grid
    gridVisible,
    gridSize,
    gridDivisions,
    gridColor1,
    gridColor2,

    // State - Axes
    axesVisible,
    axesSize,

    // Actions - Background
    setBackgroundColor,

    // Actions - Grid
    toggleGrid,
    showGrid,
    hideGrid,
    updateGridSize,
    updateGridDivisions,
    updateGridColors,

    // Actions - Axes
    toggleAxes,
    showAxes,
    hideAxes,
    updateAxesSize,

    // Actions - General
    restoreDefaults
  };
}
