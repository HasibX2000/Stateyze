import { Middleware, State, MiddlewareApi } from "../types";

interface DevToolsOptions {
  name?: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options: { name: string }) => {
        subscribe: (listener: (message: any) => void) => void;
        send: (action: string, state: any) => void;
      };
    };
  }
}

const devtools =
  <T extends State>(options?: DevToolsOptions): Middleware<T> =>
  (api: MiddlewareApi<T>) =>
  (next) => {
    if (!options?.enabled && typeof window === "undefined") return next;

    const extension = window.__REDUX_DEVTOOLS_EXTENSION__;
    if (!extension) {
      console.warn("Redux DevTools Extension not installed");
      return next;
    }

    const devTools = extension.connect({ name: options?.name || "Stateyze Store" });

    devTools.subscribe((message: any) => {
      if (message.type === "DISPATCH" && message.payload.type === "JUMP_TO_ACTION") {
        next(JSON.parse(message.state), true);
      }
    });

    api.subscribe((state) => {
      devTools.send("State Update", state);
    });

    return next;
  };

export default devtools;
