import { quat, vec3 } from 'gl-matrix';
import { IScript } from '../components/script';
import { IGame } from '../game/interface';

const keyMap = {
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

const moveSpeed = 1;
const rotSpeed = 1;

export class CameraControl implements IScript {
  update(entityId: string, game: IGame, delta: number): void {
    const transform = game.components.transforms.get(entityId);

    // I. Update rotation
    let pitch = 0;
    let yaw = 0;
    let roll = 0;
    const frameRot = delta * rotSpeed;

    // Pitch
    if (game.keyboard.isDown(keyMap.pitchUp)) {
      pitch = +frameRot;
    } else if (game.keyboard.isDown(keyMap.pitchDown)) {
      pitch = -frameRot;
    }

    // Yaw
    if (game.keyboard.isDown(keyMap.yawLeft)) {
      yaw = +frameRot;
    } else if (game.keyboard.isDown(keyMap.yawRight)) {
      yaw = -frameRot;
    }

    // Roll
    if (game.keyboard.isDown(keyMap.rollCCW)) {
      roll = +frameRot;
    } else if (game.keyboard.isDown(keyMap.rollCW)) {
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

      const q = quat.multiply(quat.create(), transform.getRotation(), rotDelta);
      quat.normalize(q, q);
      transform.setRotation(q);
    }

    // II. Update translation
    const frameSpeed = delta * moveSpeed;
    const dispDelta = vec3.create();

    // Forward
    if (game.keyboard.isDown(keyMap.back)) {
      dispDelta[2] = +frameSpeed;
    } else if (game.keyboard.isDown(keyMap.forward)) {
      dispDelta[2] = -frameSpeed;
    }

    // Strafe
    if (game.keyboard.isDown(keyMap.right)) {
      dispDelta[0] = +frameSpeed;
    } else if (game.keyboard.isDown(keyMap.left)) {
      dispDelta[0] = -frameSpeed;
    }

    // Asc/desc
    if (game.keyboard.isDown(keyMap.up)) {
      dispDelta[1] = +frameSpeed;
    } else if (game.keyboard.isDown(keyMap.down)) {
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
