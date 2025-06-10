/// <reference types="vite/client" />

// Extend ImportMeta interface
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  [key: string]: any;
}

// JSX namespace for Solid.js
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Solid.js JSX Runtime
declare module 'solid-js/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// Solid.js types
declare module 'solid-js' {
  export type Component<T = {}> = (props: T) => any;
  export const createSignal: any;
  export const createEffect: any;
  export const onMount: any;
  export const onCleanup: any;
  export const Show: any;
  export const For: any;
  export const Switch: any;
  export const Match: any;
  export const createMemo: any;
  export const createResource: any;
  export const Suspense: any;
  export const ErrorBoundary: any;
  export const Portal: any;
  export const Dynamic: any;
  export const render: any;
  export const hydrate: any;
  export const isServer: any;
  export const DEV: any;
  export const createContext: any;
  export const useContext: any;
  export const children: any;
  export const mergeProps: any;
  export const splitProps: any;
  export const batch: any;
  export const untrack: any;
  export const on: any;
  export const createRoot: any;
  export const getOwner: any;
  export const runWithOwner: any;
  export const enableScheduling: any;
  export const startTransition: any;
  export const useTransition: any;
  export const observable: any;
  export const from: any;
  export const mapArray: any;
  export const indexArray: any;
  export const createSelector: any;
  export const lazy: any;
  export const createUniqueId: any;
  export const createComputed: any;
  export const createRenderEffect: any;
  export const createDeferred: any;
  export const createReaction: any;
  export const getListener: any;
  export const onError: any;
  export const catchError: any;
  export const resetErrorBoundaries: any;
  export const sharedConfig: any;
  export const equalFn: any;
  export const requestCallback: any;
  export const enableExternalSource: any;
  export const enableHydration: any;
  export const getHydrationKey: any;
  export const noHydrate: any;
  export const Assets: any;
  export const HydrationScript: any;
  export const ssr: any;
  export const ssrElement: any;
  export const ssrAttribute: any;
  export const ssrHydrationKey: any;
  export const escape: any;
  export const resolveSSRNode: any;
  export const ssrSpread: any;
  export const ssrBoolean: any;
  export const ssrStyle: any;
  export const ssrClassList: any;
  export const generateHydrationScript: any;
  export const getRequestEvent: any;
  export const isDev: any;
}

// Solid.js web
declare module 'solid-js/web' {
  export const render: any;
  export const hydrate: any;
  export const isServer: any;
  export const Portal: any;
  export const Dynamic: any;
  export const insert: any;
  export const spread: any;
  export const assign: any;
  export const style: any;
  export const classList: any;
  export const delegateEvents: any;
  export const clearDelegatedEvents: any;
  export const template: any;
  export const effect: any;
  export const memo: any;
  export const createComponent: any;
  export const mergeProps: any;
  export const splitProps: any;
  export const use: any;
}

// File type declarations
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}