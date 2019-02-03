import { Script } from './interface';
import { IGame } from '../../game/interface';

export class ScriptSystem {
  private game: IGame;
  private scripts: { [id: string]: Script };

  constructor(game: IGame) {
    this.game = game;
    this.scripts = {};
  }

  create(id: string, f: Script): void {
    this.scripts[id] = f;
  }

  update(delta: number): void {
    for (const id in this.scripts) {
      this.scripts[id](id, this.game, delta);
    }
  }
}
