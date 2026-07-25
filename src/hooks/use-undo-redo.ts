import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isUndoRedo = useRef(false);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      setHistory(prev => ({
        ...prev,
        present: typeof newState === 'function' ? (newState as (prev: T) => T)(prev.present) : newState,
      }));
      return;
    }

    setHistory(prev => {
      const newPresent = typeof newState === 'function' ? (newState as (prev: T) => T)(prev.present) : newState;
      return {
        past: [...prev.past.slice(-(maxHistory - 1)), prev.present],
        present: newPresent,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      isUndoRedo.current = true;
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      isUndoRedo.current = true;
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
