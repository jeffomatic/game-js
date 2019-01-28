import { quat, vec4, vec3 } from 'gl-matrix';
import { IFirstPersonWasdSystem, IFirstPersonWasd } from './interface';
import { IGame } from '../../game/interface';

class FirstPersonWasd implements IFirstPersonWasd {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export class FirstPersonWasdSystem implements IFirstPersonWasdSystem {
  private game: IGame;
  private components: IFirstPersonWasd;

  static keyMap = {
    forward: 87, // w
    left: 65, // a
    back: 83, // s
    right: 68, // d
    up: 81, // q
    down: 69, // e
    pitchUp: 38, // UP
    pitchDown: 40, // DOWN
    yawLeft: 37, // LEFT
    yawRight: 39, // RIGHT
    rollCCW: 188, // ,
    rollCW: 190, // .
  };

  static moveSpeed = 1;
  static rotSpeed = 1;

  constructor(game: IGame) {
    this.game = game;
    this.components = {};
  }

  create(id: string): IFirstPersonWasd {
    const c = new FirstPersonWasd(id);
    this.components[id] = c;
    return c;
  }

  get(id: string): IFirstPersonWasd {
    return this.components[id];
  }

  update(delta: number): void {
    for (const id in this.components) {
      const transform = this.game.worldTransforms.get(id);

      // I. Update rotation
      let pitch = 0;
      let yaw = 0;
      let roll = 0;
      const frameRot = delta * FirstPersonWasdSystem.rotSpeed;

      // Pitch
      if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.pitchUp)) {
        pitch = +frameRot;
      } else if (
        this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.pitchDown)
      ) {
        pitch = -frameRot;
      }

      // Yaw
      if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.yawLeft)) {
        yaw = +frameRot;
      } else if (
        this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.yawRight)
      ) {
        yaw = -frameRot;
      }

      !true && console.log('');

      // Roll
      if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.rollCCW)) {
        roll = +frameRot;
      } else if (
        this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.rollCW)
      ) {
        roll = -frameRot;
      }

      if (pitch !== 0 || yaw !== 0 || roll !== 0) {
        const rotDelta = quat.create();

        if (pitch !== 0) {
          quat.rotateX(rotDelta, rotDelta, pitch);
        }

        if (yaw !== 0) {
          quat.rotateY(rotDelta, rotDelta, yaw);
        }

        if (roll !== 0) {
          quat.rotateZ(rotDelta, rotDelta, roll);
        }

        const q = quat.multiply(
          quat.create(),
          transform.getRotation(),
          rotDelta,
        );
        quat.normalize(q, q);
        transform.setRotation(q);
      }

      // II. Update translation
      const frameSpeed = delta * FirstPersonWasdSystem.moveSpeed;
      const dispDelta = vec3.create();

      // Forward
      if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.back)) {
        dispDelta[2] = +frameSpeed;
      } else if (
        this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.forward)
      ) {
        dispDelta[2] = -frameSpeed;
      }

      // Strafe
      if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.right)) {
        dispDelta[0] = +frameSpeed;
      } else if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.left)) {
        dispDelta[0] = -frameSpeed;
      }

      // Asc/desc
      if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.up)) {
        dispDelta[1] = +frameSpeed;
      } else if (this.game.keyboard.isDown(FirstPersonWasdSystem.keyMap.down)) {
        dispDelta[1] = -frameSpeed;
      }

      if (dispDelta[0] !== 0 || dispDelta[1] !== 0 || dispDelta[2] !== 0) {
        // Rotate the displacement by the current orientation
        const orientedDisp = vec3.transformQuat(
          vec3.create(),
          dispDelta,
          transform.getRotation(),
        );
        const newTrans = vec3.add(
          vec3.create(),
          transform.getTranslate(),
          orientedDisp,
        );
        transform.setTranslate(newTrans);
      }
    }
  }
}
