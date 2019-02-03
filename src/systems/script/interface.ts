import { IGame } from '../../game/interface';

export type Script = (id: string, game: IGame, delta: number) => void;
