import { IGame } from '../game/interface';

export interface IScript {
  update(entityId: string, game: IGame, delta: number): void;
}
