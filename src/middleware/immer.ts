import { produce, Draft, castDraft } from "immer";
import { Middleware, State, SetState } from "../types";

type DraftFunction<T> = (state: T) => void | Partial<T>;
type ImmerFunction<T> = (draft: Draft<T>) => void | Draft<T>;

const immer = <T extends State>(): Middleware<T> =>
  () =>
  (next) =>
  (args) => {
    // If args is a function, wrap it with Immer's produce
    if (typeof args === "function") {
      return next((state: T) => {
        return produce<T>(state, (draft) => {
          const fn = args as unknown as ImmerFunction<T>;
          return fn(draft);
        });
      });
    }

    // If args is an object, apply it directly
    return next(args);
  };

export default immer;
