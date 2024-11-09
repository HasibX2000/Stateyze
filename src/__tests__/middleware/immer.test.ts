import createStore from "../../store";
import immer from "../../middleware/immer";
import { State } from "../../types";
import { Draft } from "immer";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TestState extends State {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  updateTodo: (id: number, text: string) => void;
  removeTodo: (id: number) => void;
}

describe("Immer Middleware", () => {
  it("should allow direct mutations in state updates", () => {
    const store = createStore<TestState>(
      (set) => ({
        todos: [],
        addTodo: (text) =>
          set((state) => {
            (state as Draft<TestState>).todos.push({
              id: state.todos.length + 1,
              text,
              completed: false,
            });
          }),
        toggleTodo: (id) =>
          set((state) => {
            const todo = (state as Draft<TestState>).todos.find((t) => t.id === id);
            if (todo) {
              todo.completed = !todo.completed;
            }
          }),
        updateTodo: (id, text) =>
          set((state) => {
            const todo = (state as Draft<TestState>).todos.find((t) => t.id === id);
            if (todo) {
              todo.text = text;
            }
          }),
        removeTodo: (id) =>
          set((state) => {
            const draft = state as Draft<TestState>;
            const index = draft.todos.findIndex((t) => t.id === id);
            if (index !== -1) {
              draft.todos.splice(index, 1);
            }
          }),
      }),
      [immer()]
    );

    // Add todos
    store.getState().addTodo("Learn TypeScript");
    store.getState().addTodo("Learn React");
    expect(store.getState().todos).toHaveLength(2);

    // Toggle todo
    store.getState().toggleTodo(1);
    expect(store.getState().todos[0].completed).toBe(true);

    // Update todo
    store.getState().updateTodo(2, "Master React");
    expect(store.getState().todos[1].text).toBe("Master React");

    // Remove todo
    store.getState().removeTodo(1);
    expect(store.getState().todos).toHaveLength(1);
    expect(store.getState().todos[0].id).toBe(2);
  });

  it("should handle nested updates", () => {
    interface NestedState extends State {
      user: {
        profile: {
          name: string;
          settings: {
            theme: string;
            notifications: boolean;
          };
        };
      };
      updateTheme: (theme: string) => void;
      toggleNotifications: () => void;
    }

    const store = createStore<NestedState>(
      (set) => ({
        user: {
          profile: {
            name: "John",
            settings: {
              theme: "light",
              notifications: true,
            },
          },
        },
        updateTheme: (theme) =>
          set((state) => {
            (state as Draft<NestedState>).user.profile.settings.theme = theme;
          }),
        toggleNotifications: () =>
          set((state) => {
            const draft = state as Draft<NestedState>;
            draft.user.profile.settings.notifications = !draft.user.profile.settings.notifications;
          }),
      }),
      [immer()]
    );

    store.getState().updateTheme("dark");
    expect(store.getState().user.profile.settings.theme).toBe("dark");

    store.getState().toggleNotifications();
    expect(store.getState().user.profile.settings.notifications).toBe(false);
  });

  it("should handle regular updates without Immer", () => {
    const store = createStore<TestState>(
      (set) => ({
        todos: [],
        addTodo: (text) => set({ todos: [{ id: 1, text, completed: false }] }),
        toggleTodo: () => set({}),
        updateTodo: () => set({}),
        removeTodo: () => set({}),
      }),
      [immer()]
    );

    store.getState().addTodo("Test");
    expect(store.getState().todos).toHaveLength(1);
  });
});
