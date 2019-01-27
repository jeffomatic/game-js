import { mat3, mat4, quat, vec4 } from 'gl-matrix';

export class Transform {
  translate: vec4;
  scale: vec4;
  rot: quat;
  transform: mat4;
  dirty: boolean;

  constructor() {
    this.translate = vec4.create();
    this.scale = vec4.create();
    vec4.set(this.scale, 1, 1, 1, 1);
    this.rot = quat.create();
    quat.identity(this.rot);
    this.transform = mat4.create();
    this.dirty = true;
    this.update();
  }

  update() {
    if (!this.dirty) {
      return;
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
    const t = this.transform;
    const tr = this.translate;

    t[0 * 4 + 0] = rs[0 * 3 + 0];
    t[0 * 4 + 1] = rs[0 * 3 + 1];
    t[0 * 4 + 2] = rs[0 * 3 + 2];
    t[0 * 4 + 3] = 0;
    t[1 * 4 + 0] = rs[1 * 3 + 0];
    t[1 * 4 + 1] = rs[1 * 3 + 1];
    t[1 * 4 + 2] = rs[1 * 3 + 2];
    t[1 * 4 + 3] = 0;
    t[2 * 4 + 0] = rs[2 * 3 + 0];
    t[2 * 4 + 1] = rs[2 * 3 + 1];
    t[2 * 4 + 2] = rs[2 * 3 + 2];
    t[2 * 4 + 3] = 0;
    t[3 * 4 + 0] = tr[0];
    t[3 * 4 + 1] = tr[1];
    t[3 * 4 + 2] = tr[2];
    t[3 * 4 + 3] = 1;

    this.dirty = false;
  }

  setTranslate(v: vec4): void {
    this.dirty = true;
    vec4.copy(this.translate, v);
  }

  setScale(v: vec4): void {
    this.dirty = true;
    vec4.copy(this.scale, v);
  }

  setRot(q: quat): void {
    this.dirty = true;
    quat.copy(this.rot, q);
  }
}
