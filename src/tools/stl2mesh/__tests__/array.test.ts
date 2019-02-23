import {
  search,
  makeDict,
  removeNonunique,
  pushSorted,
  uniqSorted,
} from '../array';
import * as math from '../math';

test('search', () => {
  expect(search([], v => math.compare(1, v))).toBe(-1);
  expect(search([1], v => math.compare(1, v))).toBe(0);
  expect(search([0, 1], v => math.compare(1, v))).toBe(1);
  expect(search([1, 2], v => math.compare(1, v))).toBe(0);
});

test('makeDict', () => {
  expect(makeDict([], math.compare3)).toEqual([]);
  expect(makeDict([[0, 0, 0]], math.compare3)).toEqual([[0, 0, 0]]);
  expect(makeDict([[0, 0, 0], [0, 0, 0]], math.compare3)).toEqual([[0, 0, 0]]);
  expect(makeDict([[0, 0, 0], [1, 1, 1]], math.compare3)).toEqual([
    [0, 0, 0],
    [1, 1, 1],
  ]);
  expect(makeDict([[1, 1, 1], [0, 0, 0]], math.compare3)).toEqual([
    [0, 0, 0],
    [1, 1, 1],
  ]);
  expect(
    makeDict([[1, 1, 1], [0, 0, 0], [2, 2, 2], [0, 0, 0]], math.compare3),
  ).toEqual([[0, 0, 0], [1, 1, 1], [2, 2, 2]]);
});

test('removeNonunique', () => {
  expect(removeNonunique([], (a, b) => a - b)).toEqual([]);
  expect(removeNonunique([1], (a, b) => a - b)).toEqual([1]);
  expect(removeNonunique([1, 2], (a, b) => a - b)).toEqual([1, 2]);
  expect(removeNonunique([2, 1], (a, b) => a - b)).toEqual([1, 2]);
  expect(removeNonunique([2, 1, 1, 2], (a, b) => a - b)).toEqual([]);
  expect(removeNonunique([2, 1, 1, 3, 2], (a, b) => a - b)).toEqual([3]);
});

test('pushSorted', () => {
  expect(pushSorted([], 1, (a, b) => a - b)).toEqual([1]);
  expect(pushSorted([0], 1, (a, b) => a - b)).toEqual([0, 1]);
  expect(pushSorted([2], 1, (a, b) => a - b)).toEqual([1, 2]);
  expect(pushSorted([0, 2], 1, (a, b) => a - b)).toEqual([0, 1, 2]);
});

test('uniqSorted', () => {
  expect(uniqSorted([], (a, b) => a - b)).toEqual([]);
  expect(uniqSorted([0], (a, b) => a - b)).toEqual([0]);
  expect(uniqSorted([0, 1], (a, b) => a - b)).toEqual([0, 1]);
  expect(uniqSorted([0, 0], (a, b) => a - b)).toEqual([0]);
});
