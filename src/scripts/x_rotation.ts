import { quat } from 'gl-matrix';
import { IGame } from '../game/interface';
import { Script } from '../systems/script/interface';

export function create(rotSpeed: number): Script {
  return (id: string, game: IGame, delta: number) => {
    const transform = game.worldTransforms.get(id);
    const rot = quat.create();
    quat.rotateX(rot, transform.getRotation(), rotSpeed * delta);
    transform.setRotation(rot);
  };
}
