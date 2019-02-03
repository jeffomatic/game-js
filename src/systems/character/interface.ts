import { Renderable } from '../../renderer';

export interface ICharacter {
  getMeshId(): string;
}

export interface ICharacterSystem {
  create(id: string, meshId: string): ICharacter;
  get(id: string): ICharacter;
  getRenderables(): Renderable[];
}
