export class Keyboard {
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

  isDown(key: number): boolean {
    return this.keyDown.has(key);
  }
}
