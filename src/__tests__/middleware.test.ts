import createStore from "../store";
import { State, Middleware } from "../types";

interface TestState extends State {
  count: number;
  increment: () => void;
}

describe("Middleware", () => {
  it("should intercept state changes", () => {
    const log: any[] = [];

    const loggerMiddleware: Middleware<TestState> = (api) => (next) => (args) => {
      log.push({ type: "before", count: api.getState().count });
      next(args);
      log.push({ type: "after", count: api.getState().count });
    };

    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      [loggerMiddleware]
    );

    store.getState().increment();

    expect(log).toHaveLength(2);
    expect(log[0]).toEqual({ type: "before", count: 0 });
    expect(log[1]).toEqual({ type: "after", count: 1 });
  });

  it("should handle multiple middlewares", () => {
    const log: string[] = [];

    const middleware1: Middleware<TestState> = () => (next) => (args) => {
      log.push("middleware1 before");
      const result = next(args);
      log.push("middleware1 after");
      return result;
    };

    const middleware2: Middleware<TestState> = () => (next) => (args) => {
      log.push("middleware2 before");
      const result = next(args);
      log.push("middleware2 after");
      return result;
    };

    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      [middleware1, middleware2]
    );

    store.getState().increment();

    expect(log).toEqual([
      "middleware1 before",
      "middleware2 before",
      "middleware2 after",
      "middleware1 after",
    ]);
  });
});
