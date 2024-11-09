import { useEffect, useState, useRef } from "react";
import { State, StoreApi } from "./types";

export function useStore<T extends State, U>(
  api: StoreApi<T> & (<V>(selector: (state: T) => V) => V),
  selector: (state: T) => U
): U {
  const [value, setValue] = useState(() => selector(api.getState()));
  const selectorRef = useRef(selector);

  useEffect(() => {
    selectorRef.current = selector;
    setValue(selector(api.getState()));
  }, [selector, api]);

  useEffect(() => {
    return api.subscribe((state) => {
      setValue(selectorRef.current(state));
    });
  }, [api]);

  return value;
}
