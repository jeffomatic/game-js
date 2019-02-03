import { IGame } from '../../game/interface';
import { ICharacter, ICharacterSystem } from './interface';
import { Renderable, BufferedFace } from '../../renderer';

export class Character implements ICharacter {
  private id: string;
  private modelId: string;

  constructor(id: string, modelId: string) {
    this.id = id;
    this.modelId = modelId;
  }

  getModelId(): string {
    return this.modelId;
  }
}

export class CharacterSystem implements ICharacterSystem {
  private game: IGame;
  private characters: { [id: string]: ICharacter };
  private bufferedModels: { [model: string]: BufferedFace[] };

  constructor(game: IGame) {
    this.game = game;
    this.characters = {};
    this.bufferedModels = {};
  }

  create(id: string, model: string): ICharacter {
    const c = new Character(id, model);
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
        modelId: c.getModelId(),
      };
    });
  }
}
