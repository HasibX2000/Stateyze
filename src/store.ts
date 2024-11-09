import { State, StateCreator, StoreApi, Middleware, SetState } from "./types";

function createStore<T extends State>(
  createState: StateCreator<T>,
  middlewares: Middleware<T>[] = []
) {
  let state: T;
  const listeners = new Set<(state: T) => void>();

  const getState: StoreApi<T>["getState"] = () => state;

  const setState: SetState<T> = (partial, replace) => {
    const nextState = typeof partial === "function" ? (partial as Function)(state) : partial;

    const isStateEqual = Object.keys(nextState).every((key) =>
      Object.is(nextState[key], state[key])
    );

    if (!isStateEqual) {
      state = replace ? (nextState as T) : { ...state, ...nextState };
      listeners.forEach((listener) => listener(state));
    }
  };

  const subscribe: StoreApi<T>["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy: StoreApi<T>["destroy"] = () => {
    listeners.clear();
  };

  const api = { getState, setState, subscribe, destroy };

  // Apply middlewares
  let setStateWithMiddleware = setState;

  if (middlewares.length) {
    const middlewareApi = { getState, setState: setStateWithMiddleware, subscribe };
    setStateWithMiddleware = [...middlewares]
      .reverse()
      .reduce((acc, middleware) => middleware(middlewareApi)(acc), setState);
  }

  state = createState(setStateWithMiddleware, getState, api);

  const storeApi = <U>(selector: (state: T) => U): U => selector(state);

  return Object.assign(storeApi, api);
}

export default createStore;
