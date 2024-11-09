# Stateyze

A lightweight state management library for React applications.

## Installation

```bash
npm install stateyze
# or
yarn add stateyze
```

## Features

- Simple and intuitive API
- Built-in React integration
- Powerful middleware system
- TypeScript support (optional)
- Tiny bundle size (~2KB gzipped)
- DevTools integration
- Persistence support
- Immer integration
- Performance optimizations

## Basic Store

### JavaScript:

```javascript
import { createStore, useStore } from "stateyze";

const store = createStore((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### TypeScript:

```typescript
interface State {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const store = createStore<State>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

## React Usage

```javascript
function Counter() {
  const count = useStore(store, (state) => state.count);
  const { increment, decrement } = useStore(store);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## Middleware

### Logger

```javascript
const store = createStore(
  (set) => ({
    /* state */
  }),
  [logger()]
);
```

### DevTools

```javascript
const store = createStore(
  (set) => ({
    /* state */
  }),
  [devtools()]
);
```

### Persist

```javascript
const store = createStore(
  (set) => ({
    /* state */
  }),
  [persist("storage-key")]
);
```

### Immer

```javascript
const store = createStore(
  (set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ text, completed: false });
      }),
  }),
  [immer()]
);
```

### Throttle

```javascript
const store = createStore(
  (set) => ({
    /* state */
  }),
  [throttle(["count"], { wait: 1000 })]
);
```

## Complete Examples

### Todo List

```javascript
const todoStore = createStore((set) => ({
  todos: [],
  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), text, completed: false }],
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),
  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
}));
```

### Async Actions

```javascript
const userStore = createStore((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

## API Reference

### createStore

```typescript
function createStore<T>(
  initializer: (set: SetState<T>) => T,
  middleware?: Middleware<T>[]
): Store<T>;
```

### useStore

```typescript
function useStore<T, U>(store: Store<T>, selector?: (state: T) => U): U;
```

### Middleware Options

- **Logger:** `logger()`
- **DevTools:** `devtools({ name?: string })`
- **Persist:** `persist(key: string, options?: { storage?: Storage })`
- **Immer:** `immer()`
- **Throttle:** `throttle(paths: string[], options?: { wait?: number })`

## Best Practices

1. Keep stores focused and small
2. Use selectors for performance
3. Combine middleware as needed
4. Use Immer for complex updates
5. Add persistence for important state
6. Use DevTools during development
7. Implement throttling for frequent updates
8. Split complex state into multiple stores

## Troubleshooting

Common issues:

- **State not updating:** Check selector usage
- **Middleware not working:** Check middleware order
- **Performance issues:** Use selectors and throttle
- **TypeScript errors:** Check interface definitions

## Migration Guide

### From Redux:

```javascript
// Redux
const reducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    default:
      return state;
  }
};

// Stateyze
const store = createStore((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### From Zustand:

Stateyze provides a very similar API to Zustand, making the migration seamless. The main difference is that you’ll import from `stateyze` instead of `zustand`. Below is an example of how you can migrate your Zustand store to Stateyze:

#### Zustand:

```javascript
import create from "zustand";

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

#### Stateyze:

```javascript
import { createStore, useStore } from "stateyze";

const store = createStore((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### Key Differences:

- **Importing the store:**  
  In Zustand, you use `create` to generate the store, while in Stateyze, you use `createStore` and the `useStore` hook.
- **React Integration:**  
  Stateyze automatically integrates with React, so you don't need to use any custom hooks like `useStore` from Zustand. However, `useStore` in Stateyze works similarly for accessing state.
- **Middleware support:**  
  Stateyze comes with middleware support built-in (e.g., `logger`, `devtools`, `persist`, etc.), which you can easily combine with your store. Zustand also supports middleware but with different integration.

- **TypeScript support:**  
  Stateyze is designed to work seamlessly with TypeScript, allowing for more type-safety out of the box. Zustand also has TypeScript support, but it might require more manual setup.

In summary, transitioning from Zustand to Stateyze is quite easy and involves simply changing the import and adopting the Stateyze API for store creation and usage. Most of the logic from Zustand can be directly applied in Stateyze with minimal changes.

## License

MIT
© Akon M Hasib
