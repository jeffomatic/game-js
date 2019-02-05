import { Character } from './character';
import { IScript } from './script';
import { Transform } from './transform';

export { Character, IScript, Transform };

class ComponentContainer<T> {
  private components: { [entityId: string]: T };

  constructor() {
    this.components = {};
  }

  add(entityId: string, component: T): void {
    this.components[entityId] = component;
  }

  get(entityId: string): T | null {
    return this.components[entityId];
  }

  forEach(f: ((entityId: string, component: T) => void)): void {
    for (const id in this.components) {
      f(id, this.components[id]);
    }
  }
}

export class ComponentManager {
  characters: ComponentContainer<Character>;
  scripts: ComponentContainer<IScript>;
  transforms: ComponentContainer<Transform>;

  constructor() {
    this.characters = new ComponentContainer<Character>();
    this.scripts = new ComponentContainer<IScript>();
    this.transforms = new ComponentContainer<Transform>();
  }
}
