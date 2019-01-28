import { Renderable } from '../../renderer';

export interface ICharacter {
  getModelId(): string;
}

export interface ICharacterSystem {
  create(id: string, modelId: string): ICharacter;
  get(id: string): ICharacter;
  getRenderables(): Renderable[];
}
