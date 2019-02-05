import { IGame } from '../game/interface';
import { IScript } from '../components/script';

export class Compose implements IScript {
  private children: IScript[];

  constructor() {
    this.children = [];
  }

  add(s: IScript): void {
    this.children.push(s);
  }

  update(entityId: string, game: IGame, delta: number): void {
    for (const s of this.children) {
      s.update(entityId, game, delta);
    }
  }
}
