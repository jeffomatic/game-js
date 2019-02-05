import { quat, vec3 } from 'gl-matrix';
import { IGame } from '../game/interface';
import { IScript } from '../components/script';

export class Revolve implements IScript {
  private center: vec3;
  private start: vec3;
  private axis: vec3;
  private period: number;

  private spoke: vec3;
  private first: boolean;
  private angle: number;

  constructor({
    center,
    start,
    axis,
    period,
  }: {
    center: vec3;
    start: vec3;
    axis: vec3;
    period: number;
  }) {
    this.center = center;
    this.start = start;
    this.axis = axis;
    this.period = period;

    this.spoke = vec3.create();
    vec3.sub(this.spoke, start, center);
    this.first = true;
    this.angle = 0;
  }

  update(entityId: string, game: IGame, delta: number): void {
    const rotVel = 1 / this.period;
    const transform = game.components.transforms.get(entityId);

    if (this.first) {
      this.first = false;
      transform.setTranslate(this.start);
      return;
    }

    this.angle += delta * rotVel;
    if (this.angle > Math.PI * 2) {
      this.angle = Math.PI * 2 - this.angle;
    }

    const rot = quat.create();
    quat.setAxisAngle(rot, this.axis, this.angle);
    const rotSpoke = vec3.create();
    vec3.transformQuat(rotSpoke, this.spoke, rot);
    const pos = vec3.create();
    vec3.add(pos, this.center, rotSpoke);
    transform.setTranslate(pos);
  }
}
