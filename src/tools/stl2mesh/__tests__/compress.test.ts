import { search, makeDict } from '../compress';
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
