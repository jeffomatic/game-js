export function center(verts: number[]): number[] {
  if (verts.length % 3 !== 0) {
    throw new Error(
      `vertex array contains invalid number of elements: ${verts.length}`,
    );
  }

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < verts.length; i += 3) {
    min[0] = Math.min(min[0], verts[i + 0]);
    max[0] = Math.max(max[0], verts[i + 0]);
    min[1] = Math.min(min[1], verts[i + 1]);
    max[1] = Math.max(max[1], verts[i + 1]);
    min[2] = Math.min(min[2], verts[i + 2]);
    max[2] = Math.max(max[2], verts[i + 2]);
  }

  const offset = [
    -max[0] + Math.abs(max[0] - min[0]) / 2,
    -max[1] + Math.abs(max[1] - min[1]) / 2,
    -max[2] + Math.abs(max[2] - min[2]) / 2,
  ];

  const res = [];
  for (let i = 0; i < verts.length; i += 3) {
    res[i + 0] = verts[i + 0] + offset[0];
    res[i + 1] = verts[i + 1] + offset[1];
    res[i + 2] = verts[i + 2] + offset[2];
  }

  return res;
}

export function scale(
  verts: number[],
  x: number,
  y: number,
  z: number,
): number[] {
  if (verts.length % 3 !== 0) {
    throw new Error(
      `vertex array contains invalid number of elements: ${verts.length}`,
    );
  }

  const s = [x, y, z];
  const res = [];
  for (let i = 0; i < verts.length; i += 3) {
    res[i + 0] = verts[i + 0] + s[0];
    res[i + 1] = verts[i + 1] + s[1];
    res[i + 2] = verts[i + 2] + s[2];
  }

  return res;
}
