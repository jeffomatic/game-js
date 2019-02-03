import { Keyboard } from '../keyboard';
import { IWorldTransformSystem } from '../systems/world_transform/interface';
import { ICharacterSystem } from '../systems/character/interface';

export interface IGame {
  keyboard: Keyboard;
  worldTransforms: IWorldTransformSystem;
  characters: ICharacterSystem;
}
