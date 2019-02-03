import { quat, vec3 } from 'gl-matrix';
import { IGame } from '../game/interface';
import { Script } from '../systems/script/interface';

export function create({
  center,
  start,
  axis,
  period,
}: {
  center: vec3;
  start: vec3;
  axis: vec3;
  period: number;
}): Script {
  const rotVel = 1 / period;
  const spoke = vec3.create();
  vec3.sub(spoke, start, center);

  let first = true;
  let angle = 0;

  return (id: string, game: IGame, delta: number) => {
    const transform = game.worldTransforms.get(id);

    if (first) {
      first = false;
      transform.setTranslate(start);
      return;
    }

    angle += delta * rotVel;
    if (angle > Math.PI * 2) {
      angle = Math.PI * 2 - angle;
    }

    const rot = quat.create();
    quat.setAxisAngle(rot, axis, angle);
    const rotSpoke = vec3.create();
    vec3.transformQuat(rotSpoke, spoke, rot);
    const pos = vec3.create();
    vec3.add(pos, center, rotSpoke);
    transform.setTranslate(pos);
  };
}
