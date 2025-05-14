import { isReactNative } from "@walletconnect/utils";

// polyfills are required for react native because of @reown/appkit
// even though the modal is not used there its still part of the bundle
// if we omit bundling it, Metro still throws due to the subpath imports used in Appkit
if (isReactNative()) {
  if (typeof global.HTMLElement === "undefined") {
    // @ts-ignore
    global.HTMLElement = class HTMLElement {};
  }
  if (typeof global.document === "undefined") {
    global.document = {
      // `@walletconnect/utils` uses this to check if the document is polyfilled
      // @ts-ignore
      walletConnectPolyfill: true,
      // @ts-ignore
      createElement: () => ({}),
      getElementById: () => null,
      querySelector: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      createTreeWalker: () => ({
        // @ts-ignore
        currentNode: null,
        nextNode: () => null,
      }),
      // @ts-ignore
      body: {},
    };
  }
  if (typeof global.customElements === "undefined") {
    global.customElements = {
      define: () => {},
      get: () => undefined,
      // @ts-ignore
      whenDefined: () => Promise.resolve(),
    };
  }
  if (typeof global.CSSStyleSheet === "undefined") {
    // @ts-ignore
    global.CSSStyleSheet = class {
      replace() {
        return Promise.resolve();
      }

      replaceSync() {}
    };
  }
}
