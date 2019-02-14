declare module 'flru' {
  export interface FLru<T> {
    clear: () => void;
    get: (key: string) => T;
    set: (key: string, value: T) => void;
    has: (key: string) => boolean;
  }

  export default function <T>(max?: number): FLru<T>;
}

