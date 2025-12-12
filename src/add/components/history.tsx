import { useState, useRef, useCallback } from "react";

export default function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = state;
      const newState = typeof next === "function" ? (next as any)(prev) : next;
      pastRef.current = [...pastRef.current, prev];
      futureRef.current = [];
      setState(newState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [state, ...futureRef.current];
    setState(previous);
  }, [state]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    pastRef.current = [...pastRef.current, state];
    setState(next);
  }, [state]);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
