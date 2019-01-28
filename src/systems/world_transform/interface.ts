import { vec3, quat, mat4 } from 'gl-matrix';

export interface IWorldTransform {
  getTranslate(): vec3;
  setTranslate(v: vec3): void;
  getRotation(): quat;
  setRotation(q: quat): void;
  getScale(): vec3;
  setScale(v: vec3): void;
  getMatrix(): mat4;
}

export interface IWorldTransformSystem {
  create(id: string): IWorldTransform;
  get(id: string): IWorldTransform;
}
