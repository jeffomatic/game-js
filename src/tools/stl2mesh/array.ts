import * as _ from 'lodash';

export type CompareFunc<T> = (a: T, b: T) => number;

export function search<T>(sorted: T[], check: (item: T) => number): number {
  let min = 0;
  let max = sorted.length - 1;

  while (min <= max) {
    const i = min + Math.floor((max - min) / 2);
    const c = check(sorted[i]);
    if (c === 0) {
      return i;
    }

    if (c < 0) {
      max = i - 1;
    } else {
      min = i + 1;
    }
  }

  return -1;
}

export function makeDict<T>(vals: T[], compare: CompareFunc<T>): T[] {
  return _.uniqWith(vals.slice().sort(compare), (a, b) => compare(a, b) === 0);
}

export function removeNonunique<T>(items: T[], compare: CompareFunc<T>): T[] {
  if (items.length < 2) {
    return items;
  }

  const res = [];
  const sorted = items.sort(compare);
  let prevVsCur = compare(sorted[0], sorted[1]);

  if (prevVsCur !== 0) {
    res.push(sorted[0]);
  }

  for (let i = 1; i < sorted.length - 1; i += 1) {
    const curVsNext = compare(sorted[i], sorted[i + 1]);

    if (prevVsCur !== 0 && curVsNext !== 0) {
      res.push(sorted[i]);
    }

    prevVsCur = curVsNext;
  }

  if (prevVsCur !== 0) {
    res.push(sorted[sorted.length - 1]);
  }

  return res;
}

export function pushSorted<T>(
  sorted: T[],
  toAdd: T,
  compare: CompareFunc<T>,
): T[] {
  sorted.push(toAdd);

  for (let i = sorted.length - 2; i >= 0; i -= 1) {
    if (compare(sorted[i], sorted[i + 1]) <= 0) {
      break;
    }

    const temp = sorted[i];
    sorted[i] = sorted[i + 1];
    sorted[i + 1] = temp;
  }

  return sorted;
}

export function uniqSorted<T>(sorted: T[], compare: CompareFunc<T>): T[] {
  if (sorted.length < 2) {
    return sorted;
  }

  const res = [sorted[0]];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i += 1) {
    if (compare(prev, sorted[i]) === 0) {
      continue;
    }
    res.push(sorted[i]);
    prev = sorted[i];
  }

  return res;
}
