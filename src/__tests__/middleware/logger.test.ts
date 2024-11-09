import createStore from "../../store";
import logger from "../../middleware/logger";
import { State } from "../../types";

interface TestState extends State {
  count: number;
  increment: () => void;
}

describe("Logger Middleware", () => {
  let consoleGroup: jest.SpyInstance;
  let consoleLog: jest.SpyInstance;
  let consoleGroupEnd: jest.SpyInstance;

  beforeEach(() => {
    consoleGroup = jest.spyOn(console, "group").mockImplementation();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    consoleGroupEnd = jest.spyOn(console, "groupEnd").mockImplementation();
  });

  afterEach(() => {
    consoleGroup.mockRestore();
    consoleLog.mockRestore();
    consoleGroupEnd.mockRestore();
  });

  it("should log state changes", () => {
    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      [logger({ enabled: true })]
    );

    store.getState().increment();

    expect(consoleGroup).toHaveBeenCalledWith("Store - State Update");
    expect(consoleLog).toHaveBeenCalledWith("Prev State:", {
      count: 0,
      increment: expect.any(Function),
    });
    expect(consoleLog).toHaveBeenCalledWith("Next State:", {
      count: 1,
      increment: expect.any(Function),
    });
    expect(consoleGroupEnd).toHaveBeenCalled();
  });

  it("should use custom name", () => {
    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      [logger({ enabled: true, name: "Counter" })]
    );

    store.getState().increment();

    expect(consoleGroup).toHaveBeenCalledWith("Counter - State Update");
  });

  it("should use custom formatter", () => {
    const formatter = (state: TestState) => ({ count: state.count });

    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      [logger({ enabled: true, formatter })]
    );

    store.getState().increment();

    expect(consoleLog).toHaveBeenCalledWith("Prev State:", { count: 0 });
    expect(consoleLog).toHaveBeenCalledWith("Next State:", { count: 1 });
  });

  it("should not log when disabled", () => {
    const store = createStore<TestState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      [logger({ enabled: false })]
    );

    store.getState().increment();

    expect(consoleGroup).not.toHaveBeenCalled();
    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleGroupEnd).not.toHaveBeenCalled();
  });
});
