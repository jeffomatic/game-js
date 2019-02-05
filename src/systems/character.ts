import { IGame } from '../game/interface';
import { Character } from '../components/character';
import { Renderable } from '../renderer';

export class CharacterSystem {
  static getRenderables(game: IGame): Renderable[] {
    const res = [];
    game.components.characters.forEach(
      (entityId: string, character: Character): void => {
        res.push({
          worldModel: game.components.transforms.get(entityId).getMatrix(),
          meshId: character.getMeshId(),
        });
      },
    );

    return res;
  }
}
