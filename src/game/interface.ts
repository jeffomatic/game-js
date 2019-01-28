import { IWorldTransformSystem } from '../systems/world_transform/interface';
import { ICharacterSystem } from '../systems/character/interface';

export interface IGame {
  worldTransforms: IWorldTransformSystem;
  characters: ICharacterSystem;
}
