export type State = Record<string, any>;

export type SetState<T extends State> = {
  (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean): void;
};

export type GetState<T extends State> = () => T;

export type Subscribe<T extends State> = (listener: (state: T) => void) => () => void;

export interface StoreApi<T extends State> {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
  destroy: () => void;
}

export type StateCreator<T extends State> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>
) => T;

export type MiddlewareApi<T extends State> = Pick<
  StoreApi<T>,
  "getState" | "setState" | "subscribe"
>;

export type Middleware<T extends State> = (
  api: MiddlewareApi<T>
) => (next: SetState<T>) => SetState<T>;
