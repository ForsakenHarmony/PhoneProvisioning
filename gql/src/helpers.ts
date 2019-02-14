export type Lazy<T extends object> = Promise<T> | T;

export function logFn(context: string, message: string) {
  process.stdout.write(`[${context}] ${message}\n`);
}

export function delay(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  })
}
