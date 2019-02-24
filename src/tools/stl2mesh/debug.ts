export class Timer {
  constructor(private callback: (string, number) => void) {}

  measure<T>(tag: string, func: () => T): T {
    const start = new Date().getTime();
    try {
      return func();
    } finally {
      this.callback(tag, new Date().getTime() - start);
    }
  }
}
