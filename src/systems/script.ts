import { IGame } from '../game/interface';
import { IScript } from '../components/script';

export class ScriptSystem {
  static update(game: IGame, delta: number): void {
    game.components.scripts.forEach(
      (entityId: string, script: IScript): void => {
        script.update(entityId, game, delta);
      },
    );
  }
}
