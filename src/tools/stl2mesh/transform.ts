export function center(triangles: number[][]): number[][] {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (const tri of triangles) {
    for (let v = 0; v < tri.length / 3; v += 1) {
      for (let d = 0; d < 3; d += 1) {
        min[d] = Math.min(min[d], tri[3 * v + d]);
        max[d] = Math.max(max[d], tri[3 * v + d]);
      }
    }
  }

  const offset = [0, 0, 0];
  for (let d = 0; d < 3; d += 1) {
    // align max value to origin, then shift by half of the span
    offset[d] = -max[d] + Math.abs(max[d] - min[d]) / 2;
  }

  const res = [];
  for (const t in triangles) {
    const face = triangles[t];
    res[t] = [];
    for (let v = 0; v < face.length / 3; v += 1) {
      for (let d = 0; d < 3; d += 1) {
        const i = 3 * v + d;
        res[t][i] = face[i] + offset[d];
      }
    }
  }

  return res;
}

export function scale(
  triangles: number[][],
  x: number,
  y: number,
  z: number,
): number[][] {
  const k = [x, y, z];
  const res = [];
  for (const f in triangles) {
    const face = triangles[f];
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
