// hooks/useMemory.ts
import { useEffect, useState } from "react";

type UseMemoryResult<T> = {
  state: T;
  set: (value: T) => void;
  clear: () => void;
};

/**
 * A hook to handle persistent memory using localStorage.
 * @param key The localStorage key.
 * @param initialValue The initial value if nothing is stored.
 */
export default function useMemory<T>(
  key: string,
  initialValue: T
): UseMemoryResult<T> {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (!stored) return initialValue;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // optionally handle quota errors
    }
  }, [key, state]);

  const set = (value: T) => setState(value);
  const clear = () => setState(initialValue);

  return { state, set, clear };
}
