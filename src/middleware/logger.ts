import { Middleware, State } from "../types";

interface LoggerOptions {
  enabled?: boolean;
  name?: string;
  formatter?: (state: any) => any;
}

const logger =
  <T extends State>(options: LoggerOptions = {}): Middleware<T> =>
  (api) =>
  (next) =>
  (args) => {
    if (options.enabled === false) {
      return next(args);
    }

    const name = options.name || "Store";
    const formatter = options.formatter || ((state) => state);

    const prevState = formatter(api.getState());
    console.group(`${name} - State Update`);
    console.log("Prev State:", prevState);
    console.log("Action:", args);

    const result = next(args);

    const nextState = formatter(api.getState());
    console.log("Next State:", nextState);
    console.groupEnd();

    return result;
  };

export default logger;
