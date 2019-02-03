import { quat, vec3 } from 'gl-matrix';
import { IGame } from '../game/interface';
import { Script } from '../systems/script/interface';

export function create(axis: vec3, period: number): Script {
  const rotVel = 1 / period;
  let angle = 0;

  return (id: string, game: IGame, delta: number) => {
    angle += delta * rotVel;
    if (angle > Math.PI * 2) {
      angle -= Math.PI * 2;
    }

    const transform = game.worldTransforms.get(id);
    const rot = quat.create();
    quat.setAxisAngle(rot, axis, angle);
    transform.setRotation(rot);
  };
}
