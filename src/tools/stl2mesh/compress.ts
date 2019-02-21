import * as _ from 'lodash';

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

  if (a < b) {
    return -1;
  }

  return 1;
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

  const c2 = compare(a[2], b[2], epsilon);
  if (c2 === -1) {
    return -1;
  }
  if (c2 === 1) {
    return 1;
  }

  return 0;
}

export function search<T>(sorted: T[], check: (item: T) => number): number {
  let min = 0;
  let max = sorted.length - 1;

  while (min <= max) {
    const i = min + Math.floor((max - min) / 2);
    const c = check(sorted[i]);
    if (c === 0) {
      return i;
    }

    if (c === -1) {
      max = i - 1;
    } else {
      min = i + 1;
    }
  }

  return -1;
}

export function search3(
  sorted: number[][],
  want: number[],
  epsilon = defaultEpsilon,
): number {
  let min = 0;
  let max = sorted.length - 1;

  while (min <= max) {
    const i = min + Math.floor((max - min) / 2);
    const c = compare3(want, sorted[i], epsilon);
    if (c === 0) {
      return i;
    }

    if (c === -1) {
      max = i - 1;
    } else {
      min = i + 1;
    }
  }

  return -1;
}

export function dict3(vals: number[][], epsilon = defaultEpsilon): number[][] {
  const cmp = (a, b) => compare3(a, b, epsilon);
  const eq = (a, b) => compare3(a, b, epsilon) === 0;
  return _.uniqWith(vals.slice().sort(cmp), eq);
}
