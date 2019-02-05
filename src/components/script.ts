import { IGame } from '../game/interface';

export interface IScript {
  update(id: string, game: IGame, delta: number): void;
}
