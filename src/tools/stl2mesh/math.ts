export const defaultEpsilon = 0.000001;

/**
 * Borrowed from gl-matrix
 */
export function equal(a: number, b: number, epsilon = defaultEpsilon): boolean {
  return Math.abs(a - b) <= epsilon * Math.max(1.0, Math.abs(a), Math.abs(b));
}

export function compare(
  a: number,
  b: number,
  epsilon = defaultEpsilon,
): number {
  if (equal(a, b, epsilon)) {
    return 0;
  }
  return a < b ? -1 : 1;
}

export function compare3(
  a: number[],
  b: number[],
  epsilon = defaultEpsilon,
): number {
  const c0 = compare(a[0], b[0], epsilon);
  if (c0 === -1) {
    return -1;
  }
  if (c0 === 1) {
    return 1;
  }

  const c1 = compare(a[1], b[1], epsilon);
  if (c1 === -1) {
    return -1;
  }
  if (c1 === 1) {
    return 1;
  }

  return compare(a[2], b[2], epsilon);
}

export function normalize3(vec: number[]): number[] {
  const mag = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
  return [vec[0] / mag, vec[1] / mag, vec[2] / mag];
}

export function triangleNormal(verts: number[][]): number[] {
  const v = [
    verts[1][0] - verts[0][0],
    verts[1][1] - verts[0][1],
    verts[1][2] - verts[0][2],
  ];
  const w = [
    verts[2][0] - verts[0][0],
    verts[2][1] - verts[0][1],
    verts[2][2] - verts[0][2],
  ];
  return [
    v[1] * w[2] - v[2] * w[1],
    v[2] * w[0] - v[0] * w[2],
    v[0] * w[1] - v[1] * w[0],
  ];
}
