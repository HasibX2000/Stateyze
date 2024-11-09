import { Middleware, State, MiddlewareApi } from "../types";

interface PersistOptions {
  name: string;
  storage?: Storage;
  serialize?: (state: any) => string;
  deserialize?: (str: string) => any;
}

const persist =
  <T extends State>(options: PersistOptions): Middleware<T> =>
  (api: MiddlewareApi<T>) => {
    const storage = options.storage || localStorage;
    const serialize = options.serialize || JSON.stringify;
    const deserialize = options.deserialize || JSON.parse;

    // Load persisted state
    try {
      const persistedState = storage.getItem(options.name);
      if (persistedState) {
        const state = deserialize(persistedState);
        api.setState(state, true);
      }
    } catch (err) {
      console.warn("Error loading persisted state:", err);
    }

    // Subscribe to changes
    api.subscribe((state) => {
      try {
        storage.setItem(options.name, serialize(state));
      } catch (err) {
        console.warn("Error persisting state:", err);
      }
    });

    return (next) => next;
  };

export default persist;
