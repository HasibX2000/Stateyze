import createStore from "../../store";
import throttle from "../../middleware/throttle";
import { State } from "../../types";

interface TestState extends State {
  count: number;
  text: string;
  increment: () => void;
  setText: (text: string) => void;
}

describe("Throttle Middleware", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it("should throttle state updates", async () => {
    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        text: "",
        increment: () => set((state) => ({ count: state.count + 1 })),
        setText: (text) => set({ text }),
      }),
      [throttle(["count"], { wait: 100 })]
    );

    // First call executes immediately
    store.getState().increment();
    expect(store.getState().count).toBe(1);

    // Second call is throttled
    store.getState().increment();
    expect(store.getState().count).toBe(1);

    // Wait half the throttle time
    jest.advanceTimersByTime(50);
    expect(store.getState().count).toBe(1);

    // Third call is still throttled
    store.getState().increment();
    expect(store.getState().count).toBe(1);

    // Wait for throttle to complete
    jest.advanceTimersByTime(50);
    expect(store.getState().count).toBe(2);
  });

  it("should not throttle non-specified paths", () => {
    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        text: "",
        increment: () => set((state) => ({ count: state.count + 1 })),
        setText: (text) => set({ text }),
      }),
      [throttle(["count"], { wait: 100 })]
    );

    // Text updates should not be throttled
    store.getState().setText("hello");
    store.getState().setText("world");
    expect(store.getState().text).toBe("world");

    // Count updates should be throttled
    store.getState().increment();
    store.getState().increment();
    expect(store.getState().count).toBe(1);
  });

  it("should respect leading: false option", () => {
    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        text: "",
        increment: () => set((state) => ({ count: state.count + 1 })),
        setText: (text) => set({ text }),
      }),
      [throttle(["count"], { wait: 100, leading: false })]
    );

    // First call should be delayed
    store.getState().increment();
    expect(store.getState().count).toBe(0);

    // Call should execute after wait time
    jest.advanceTimersByTime(100);
    expect(store.getState().count).toBe(1);
  });

  it("should respect trailing: false option", () => {
    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        text: "",
        increment: () => set((state) => ({ count: state.count + 1 })),
        setText: (text) => set({ text }),
      }),
      [throttle(["count"], { wait: 100, trailing: false })]
    );

    // First call executes immediately
    store.getState().increment();
    expect(store.getState().count).toBe(1);

    // Subsequent calls during throttle period are ignored
    store.getState().increment();
    store.getState().increment();

    // No trailing call after wait
    jest.advanceTimersByTime(100);
    expect(store.getState().count).toBe(1);
  });
});
