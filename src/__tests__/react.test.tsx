import { renderHook, act } from "@testing-library/react";
import createStore from "../store";
import { useStore } from "../react";

interface TestState {
  count: number;
  increment: () => void;
}

describe("useStore", () => {
  it("should return store state", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    const { result } = renderHook(() => useStore(store, (state) => state.count));
    expect(result.current).toBe(0);
  });

  it("should update when store changes", () => {
    const store = createStore<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    const { result } = renderHook(() => useStore(store, (state) => state.count));

    act(() => {
      store.getState().increment();
    });

    expect(result.current).toBe(1);
  });
});
