import { vec3, quat, mat4 } from 'gl-matrix';

export interface IWorldTransform {
  setTranslate(v: vec3): void;
  setRotation(q: quat): void;
  setScale(v: vec3): void;
  getMatrix(): mat4;
}

export interface IWorldTransformSystem {
  create(id: string): IWorldTransform;
  get(id: string): IWorldTransform;
}
