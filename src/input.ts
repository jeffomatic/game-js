export class Input {
  keyDown: Set<number>;

  constructor() {
    this.keyDown = new Set();

    document.addEventListener('focusout', () => {
      this.keyDown.clear();
    });

    document.addEventListener('keydown', (event) => {
      this.keyDown.add(event.which);
    });

    document.addEventListener('keyup', (event) => {
      this.keyDown.delete(event.which);
    });
  }

  isKeyDown(key: number): boolean {
    return this.keyDown.has(key);
  }
}
