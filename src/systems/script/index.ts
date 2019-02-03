import { Script } from './interface';
import { IGame } from '../../game/interface';

export class ScriptSystem {
  private game: IGame;
  private scripts: { [id: string]: Script[] };

  constructor(game: IGame) {
    this.game = game;
    this.scripts = {};
  }

  append(id: string, f: Script): void {
    if (this.scripts[id] === undefined) {
      this.scripts[id] = [];
    }
    this.scripts[id].push(f);
  }

  update(delta: number): void {
    for (const id in this.scripts) {
      for (const script of this.scripts[id]) {
        script(id, this.game, delta);
      }
    }
  }
}
