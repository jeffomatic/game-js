import { IGame } from '../../game/interface';
import { ICharacter, ICharacterSystem } from './interface';
import { Renderable } from '../../renderer';

export class Character implements ICharacter {
  private meshId: string;

  constructor(meshId: string) {
    this.meshId = meshId;
  }

  getMeshId(): string {
    return this.meshId;
  }
}

export class CharacterSystem implements ICharacterSystem {
  private game: IGame;
  private characters: { [id: string]: ICharacter };

  constructor(game: IGame) {
    this.game = game;
    this.characters = {};
  }

  create(id: string, meshId: string): ICharacter {
    const c = new Character(meshId);
    this.characters[id] = c;
    return c;
  }

  get(id: string): ICharacter {
    return this.characters[id];
  }

  getRenderables(): Renderable[] {
    return Object.keys(this.characters).map((id) => {
      const c = this.characters[id];
      const t = this.game.worldTransforms.get(id);

      return {
        worldModel: t.getMatrix(),
        meshId: c.getMeshId(),
      };
    });
  }
}
