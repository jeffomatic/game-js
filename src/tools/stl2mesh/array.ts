import * as _ from 'lodash';

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

export function makeDict<T>(vals: T[], compare: (a: T, b: T) => number): T[] {
  return _.uniqWith(vals.slice().sort(compare), (a, b) => compare(a, b) === 0);
}

export function removeDupes<T>(
  items: T[],
  compare: (a: T, b: T) => number,
): T[] {
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
