import { quat, vec3 } from 'gl-matrix';
import { IGame } from '../game/interface';
import { IScript } from '../components/script';

export class Spin implements IScript {
  private axis: vec3;
  private period: number;
  private angle: number;

  constructor(axis: vec3, period: number) {
    this.axis = axis;
    this.period = period;
    this.angle = 0;
  }

  update(id: string, game: IGame, delta: number): void {
    const rotVel = 1 / this.period;
    this.angle += delta * rotVel;
    if (this.angle > Math.PI * 2) {
      this.angle -= Math.PI * 2;
    }

    const transform = game.components.transforms.get(id);
    const rot = quat.create();
    quat.setAxisAngle(rot, this.axis, this.angle);
    transform.setRotation(rot);
  }
}
