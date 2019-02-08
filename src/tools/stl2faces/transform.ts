export function center(faces: number[][]): number[][] {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (const face of faces) {
    for (let v = 0; v < face.length / 3; v += 1) {
      for (let d = 0; d < 3; d += 1) {
        min[d] = Math.min(min[d], face[3 * v + d]);
        max[d] = Math.max(max[d], face[3 * v + d]);
      }
    }
  }

  const offset = [0, 0, 0];
  for (let d = 0; d < 3; d += 1) {
    const halfWidth = Math.abs(max[d] - min[d]) / 2;
    offset[d] = -(min[d] + halfWidth);
    // if (max[d] <= 0) {
    //   offset[d] = -(max[d] - halfWidth);
    // } else if (0 <= min[d]) {
    //   offset[d] = -(min[d] + halfWidth);
    // } else {
    //   offset[d] = -(max[d] - halfWidth);
    // }
  }

  const res = [];
  for (const f in faces) {
    const face = faces[f];
    res[f] = [];
    for (let v = 0; v < face.length / 3; v += 1) {
      for (let d = 0; d < 3; d += 1) {
        const i = 3 * v + d;
        res[f][i] = face[i] + offset[d];
      }
    }
  }

  return res;
}

export function scale(
  faces: number[][],
  x: number,
  y: number,
  z: number,
): number[][] {
  const k = [x, y, z];
  const res = [];
  for (const f in faces) {
    const face = faces[f];
    res[f] = [];
    for (let v = 0; v < face.length / 3; v += 1) {
      for (let d = 0; d < 3; d += 1) {
        const i = 3 * v + d;
        res[f][i] = face[i] * k[d];
      }
    }
  }

  return res;
}