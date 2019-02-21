import { vec3 } from 'gl-matrix';
import { IGame } from '../game/interface';
import { IScript } from '../components/script';

export class Scale implements IScript {
  private period: number;
  private theta: number;
  private range: [number, number];

  constructor(period: number, range: [number, number]) {
    this.period = period;
    this.theta = 0;
    this.range = range;
  }

  update(entityId: string, game: IGame, delta: number): void {
    this.theta += delta / this.period;
    if (this.theta >= Math.PI * 2) {
      this.theta -= Math.PI * 2;
    }

    const alpha = (Math.sin(this.theta) + 1) / 2;
    const scale = this.range[0] + alpha * (this.range[1] - this.range[0]);
    const transform = game.components.transforms.get(entityId);
    transform.setScale(vec3.fromValues(scale, scale, scale));
  }
}
