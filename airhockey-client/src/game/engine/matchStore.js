import { useSyncExternalStore } from 'react';

export const createMatchStore = (initialSnapshot) => {
  let snapshot = initialSnapshot;
  const listeners = new Set();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    patch: (partialSnapshot) => {
      snapshot = { ...snapshot, ...partialSnapshot };
      listeners.forEach((listener) => listener());
    },
  };
};

export const useMatchSnapshot = (store) =>
  useSyncExternalStore(store.subscribe, store.getSnapshot);
