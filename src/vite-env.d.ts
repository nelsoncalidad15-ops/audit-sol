/// <reference types="vite/client" />

declare module '*.gs?raw' {
  const source: string;
  export default source;
}
