import createStore from "../store";

interface TestState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  addAmount: (amount: number) => void;
}

describe("createStore", () => {
  it("should create store with initial state", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      addAmount: (amount) => set((state) => ({ count: state.count + amount })),
    }));

    expect(store.getState().count).toBe(0);
  });

  it("should handle multiple state updates", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      addAmount: (amount) => set((state) => ({ count: state.count + amount })),
    }));

    store.getState().increment();
    store.getState().increment();
    expect(store.getState().count).toBe(2);

    store.getState().decrement();
    expect(store.getState().count).toBe(1);
  });

  it("should handle direct state updates", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set({ count: 1 }),
      decrement: () => set({ count: -1 }),
      reset: () => set({ count: 0 }),
      addAmount: (amount) => set({ count: amount }),
    }));

    store.getState().addAmount(5);
    expect(store.getState().count).toBe(5);
  });

  it("should notify all subscribers", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      addAmount: (amount) => set((state) => ({ count: state.count + amount })),
    }));

    const listener1 = jest.fn();
    const listener2 = jest.fn();

    store.subscribe(listener1);
    store.subscribe(listener2);

    store.getState().increment();

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it("should handle unsubscribe correctly", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      addAmount: (amount) => set((state) => ({ count: state.count + amount })),
    }));

    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    store.getState().increment();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.getState().increment();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should handle destroy correctly", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      addAmount: (amount) => set((state) => ({ count: state.count + amount })),
    }));

    const listener = jest.fn();
    store.subscribe(listener);

    store.destroy();
    store.getState().increment();
    expect(listener).not.toHaveBeenCalled();
  });

  it("should not update state if new state is identical", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count })), // Same value
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      addAmount: (amount) => set((state) => ({ count: state.count + amount })),
    }));

    const listener = jest.fn();
    store.subscribe(listener);

    store.getState().increment(); // Should not trigger update
    expect(listener).not.toHaveBeenCalled();
  });
});
