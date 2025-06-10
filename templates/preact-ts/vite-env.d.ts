/// <reference types="vite/client" />

declare module 'preact' {
  export const render: any;
  export const Fragment: any;
  export * from 'preact/hooks';
}

declare module 'preact/hooks' {
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useMemo: any;
  export const useCallback: any;
}

declare module 'preact/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

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
  const content: Record<string, string>;
  export default content;
}