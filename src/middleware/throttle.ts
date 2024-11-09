import { Middleware, State } from "../types";

interface ThrottleOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
}

const throttle = <T extends State>(
  paths: (keyof T)[],
  options: ThrottleOptions = {}
): Middleware<T> => {
  const { wait = 1000, leading = true, trailing = true } = options;

  let isThrottled = false;
  let lastArgs: any = null;
  let timeoutId: NodeJS.Timeout | null = null;
  let isFirstCall = true;

  return (api) => {
    const shouldThrottle = (args: any): boolean => {
      if (typeof args !== "function") return false;

      // Check if the state update touches any throttled paths
      const currentState = api.getState();
      const nextState = args(currentState);
      return paths.some(
        (path) => JSON.stringify(currentState[path]) !== JSON.stringify(nextState[path])
      );
    };

    return (next) => (args) => {
      if (!shouldThrottle(args)) {
        return next(args);
      }

      if (isThrottled) {
        if (trailing) {
          lastArgs = args;
        }
        return;
      }

      if (isFirstCall && !leading) {
        isFirstCall = false;
        isThrottled = true;
        lastArgs = args;

        timeoutId = setTimeout(() => {
          isThrottled = false;
          if (lastArgs) {
            next(lastArgs);
            lastArgs = null;
          }
          timeoutId = null;
        }, wait);

        return;
      }

      isFirstCall = false;
      isThrottled = true;
      next(args);

      timeoutId = setTimeout(() => {
        isThrottled = false;
        if (trailing && lastArgs) {
          next(lastArgs);
          lastArgs = null;
        }
        timeoutId = null;
      }, wait);
    };
  };
};

export default throttle;
