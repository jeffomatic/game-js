import { mat3, mat4, quat, vec3 } from 'gl-matrix';
import { IWorldTransform, IWorldTransformSystem } from './interface';

export class WorldTransform implements IWorldTransform {
  private id: string;
  private translate: vec3;
  private scale: vec3;
  private rot: quat;
  private mat: mat4;
  private dirty: boolean;

  constructor(id: string) {
    this.translate = vec3.create();
    this.scale = vec3.fromValues(1, 1, 1);
    this.rot = quat.create();
    quat.identity(this.rot);
    this.mat = mat4.create();
    this.dirty = true;
  }

  getTranslate(): vec3 {
    return this.translate;
  }

  setTranslate(v: vec3): void {
    this.dirty = true;
    vec3.copy(this.translate, v);
  }

  getRotation(): quat {
    return this.rot;
  }

  setRotation(q: quat): void {
    this.dirty = true;
    quat.copy(this.rot, q);
  }

  getScale(): vec3 {
    return this.scale;
  }

  setScale(v: vec3): void {
    this.dirty = true;
    vec3.copy(this.scale, v);
  }

  getMatrix(): mat4 {
    if (!this.dirty) {
      return this.mat;
    }

    // 3x3 scale matrix
    const s = mat3.create();
    s[0 * 3 + 0] = this.scale[0];
    s[1 * 3 + 1] = this.scale[1];
    s[2 * 3 + 2] = this.scale[2];

    // 3x3 rotation matrix
    const r = mat3.fromQuat(mat3.create(), this.rot);

    // 3x3 scale-then-rotate matrix
    const rs = mat3.multiply(mat3.create(), r, s);

    // 4x4 scale-then-rotate-then-translate matrix
    this.mat[0 * 4 + 0] = rs[0 * 3 + 0];
    this.mat[0 * 4 + 1] = rs[0 * 3 + 1];
    this.mat[0 * 4 + 2] = rs[0 * 3 + 2];
    this.mat[0 * 4 + 3] = 0;
    this.mat[1 * 4 + 0] = rs[1 * 3 + 0];
    this.mat[1 * 4 + 1] = rs[1 * 3 + 1];
    this.mat[1 * 4 + 2] = rs[1 * 3 + 2];
    this.mat[1 * 4 + 3] = 0;
    this.mat[2 * 4 + 0] = rs[2 * 3 + 0];
    this.mat[2 * 4 + 1] = rs[2 * 3 + 1];
    this.mat[2 * 4 + 2] = rs[2 * 3 + 2];
    this.mat[2 * 4 + 3] = 0;
    this.mat[3 * 4 + 0] = this.translate[0];
    this.mat[3 * 4 + 1] = this.translate[1];
    this.mat[3 * 4 + 2] = this.translate[2];
    this.mat[3 * 4 + 3] = 1;

    this.dirty = false;

    return this.mat;
  }
}

export class WorldTransformSystem implements IWorldTransformSystem {
  private transforms: { [id: string]: IWorldTransform };

  constructor() {
    this.transforms = {};
  }

  create(id: string): IWorldTransform {
    const t = new WorldTransform(id);
    this.transforms[id] = t;
    return t;
  }

  get(id: string): IWorldTransform {
    return this.transforms[id];
  }
}
