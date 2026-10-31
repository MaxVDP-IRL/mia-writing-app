// The tracing-screen test reads the shipped CSS from disk. This project does
// not depend on @types/node; declare only the two calls that test uses.
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string
}

declare module 'node:path' {
  export function resolve(...parts: string[]): string
}
