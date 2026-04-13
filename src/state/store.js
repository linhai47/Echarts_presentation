export function createStore(initialState) {
  const cloneState = (value) =>
    typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));

  let state = cloneState(initialState);
  const listeners = new Set();

  return {
    getState: () => cloneState(state),
    setState: (patch) => {
      const nextState = { ...state, ...patch };

      if (patch.filters) {
        nextState.filters = {
          ...(state.filters || {}),
          ...patch.filters
        };
      }

      state = nextState;

      const snapshot = cloneState(state);
      listeners.forEach((listener) => listener(snapshot));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
