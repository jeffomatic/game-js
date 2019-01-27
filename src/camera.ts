import { quat, vec4 } from 'gl-matrix';
import { Input } from './input';
import { Transform } from './transform';

export class Camera {
  input: Input;
  transform: Transform;
  moveSpeed: number;
  rotSpeed: number;

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

  constructor(input: Input) {
    this.input = input;
    this.transform = new Transform();
    this.moveSpeed = 1;
    this.rotSpeed = 1;
  }

  simulate(delta: number) {
    // I. Update rotation
    let pitch = 0;
    let yaw = 0;
    let roll = 0;
    const frameRot = delta * this.rotSpeed;

    // Pitch
    if (this.input.isKeyDown(Camera.keyMap.pitchUp)) {
      pitch = +frameRot;
    } else if (this.input.isKeyDown(Camera.keyMap.pitchDown)) {
      pitch = -frameRot;
    }

    // Yaw
    if (this.input.isKeyDown(Camera.keyMap.yawLeft)) {
      yaw = +frameRot;
    } else if (this.input.isKeyDown(Camera.keyMap.yawRight)) {
      yaw = -frameRot;
    }

    !true && console.log('');

    // Roll
    if (this.input.isKeyDown(Camera.keyMap.rollCCW)) {
      roll = +frameRot;
    } else if (this.input.isKeyDown(Camera.keyMap.rollCW)) {
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

      const q = quat.multiply(quat.create(), this.transform.rot, rotDelta);
      quat.normalize(q, q);
      this.transform.setRot(q);
    }

    // II. Update translation
    const frameSpeed = delta * this.moveSpeed;
    const dispDelta = vec4.create();

    // Forward
    if (this.input.isKeyDown(Camera.keyMap.back)) {
      dispDelta[2] = +frameSpeed;
    } else if (this.input.isKeyDown(Camera.keyMap.forward)) {
      dispDelta[2] = -frameSpeed;
    }

    // Strafe
    if (this.input.isKeyDown(Camera.keyMap.right)) {
      dispDelta[0] = +frameSpeed;
    } else if (this.input.isKeyDown(Camera.keyMap.left)) {
      dispDelta[0] = -frameSpeed;
    }

    // Asc/desc
    if (this.input.isKeyDown(Camera.keyMap.up)) {
      dispDelta[1] = +frameSpeed;
    } else if (this.input.isKeyDown(Camera.keyMap.down)) {
      dispDelta[1] = -frameSpeed;
    }

    if (dispDelta[0] !== 0 || dispDelta[1] !== 0 || dispDelta[2] !== 0) {
      // Rotate the displacement by the current orientation
      const orientedDisp = vec4.transformQuat(
        vec4.create(),
        dispDelta,
        this.transform.rot,
      );
      const newTrans = vec4.add(
        vec4.create(),
        this.transform.translate,
        orientedDisp,
      );
      this.transform.setTranslate(newTrans);
    }

    this.transform.update();
  }
}
