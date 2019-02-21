import { equal, compare, compare3, search, search3, dict3 } from '../compress';

test('equal', () => {
  expect(equal(1, 1)).toBe(true);
  expect(equal(-1, -1)).toBe(true);
  expect(equal(1, 1.01, 0.01)).toBe(true);
  expect(equal(1, 0.991, 0.01)).toBe(true);
  expect(equal(1, 1.011, 0.01)).toBe(false);
});

test('compare', () => {
  expect(compare(1, 1)).toBe(0);
  expect(compare(1, 2)).toBe(-1);
  expect(compare(2, 1)).toBe(1);
  expect(compare(1, 1.01, 0.01)).toBe(0);
  expect(compare(1, 0.991, 0.01)).toBe(0);
  expect(compare(1, 1.011, 0.01)).toBe(-1);
});

test('compare3', () => {
  expect(compare3([1, 1, 1], [1, 1, 1])).toBe(0);
  expect(compare3([1, 1, 1], [1, 1, 2])).toBe(-1);
  expect(compare3([1, 1, 2], [1, 1, 1])).toBe(1);
  expect(compare3([0.99, -999, -999], [1, 999, 999])).toBe(-1);
  expect(compare3([1.01, 1, 1], [1, 999, 999])).toBe(1);
  expect(compare3([1.01, 1, 1], [1, 999, 999], 0.01)).toBe(-1);
});

test('search3', () => {
  expect(search3([], [0, 0, 0])).toBe(-1);
  expect(search3([[0, 0, 0]], [0, 0, 0])).toBe(0);
  expect(search3([[1, 1, 1]], [0, 0, 0])).toBe(-1);
  expect(search3([[0, 0, 0], [1, 1, 1]], [0, 0, 0])).toBe(0);
  expect(search3([[0, 0, 0], [1, 1, 1]], [1, 1, 1])).toBe(1);
  expect(search3([[0, 0, 0], [1, 1, 1]], [0.5, 0.5, 0.5])).toBe(-1);
  expect(search3([[0, 0, 0], [1, 1, 1], [2, 2, 2]], [0, 0, 0])).toBe(0);
  expect(search3([[0, 0, 0], [1, 1, 1], [2, 2, 2]], [1, 1, 1])).toBe(1);
  expect(search3([[0, 0, 0], [1, 1, 1], [2, 2, 2]], [2, 2, 2])).toBe(2);
  expect(search3([[0, 0, 0], [1, 1, 1], [2, 2, 2]], [0.5, 0.5, 0.5])).toBe(-1);
  expect(search3([[0.1, 0, 0]], [0, 0, 0], 0.1)).toBe(0);
  expect(search3([[0.11, 0, 0]], [0, 0, 0], 0.1)).toBe(-1);
});

test('search', () => {
  expect(search([], v => compare(1, v))).toBe(-1);
  expect(search([1], v => compare(1, v))).toBe(0);
  expect(search([0, 1], v => compare(1, v))).toBe(1);
  expect(search([1, 2], v => compare(1, v))).toBe(0);
});

test('dict3', () => {
  expect(dict3([])).toEqual([]);
  expect(dict3([[0, 0, 0]])).toEqual([[0, 0, 0]]);
  expect(dict3([[0, 0, 0], [0, 0, 0]])).toEqual([[0, 0, 0]]);
  expect(dict3([[0, 0, 0], [1, 1, 1]])).toEqual([[0, 0, 0], [1, 1, 1]]);
  expect(dict3([[1, 1, 1], [0, 0, 0]])).toEqual([[0, 0, 0], [1, 1, 1]]);
  expect(dict3([[1, 1, 1], [0, 0, 0], [2, 2, 2], [0, 0, 0]])).toEqual([
    [0, 0, 0],
    [1, 1, 1],
    [2, 2, 2],
  ]);
  expect(dict3([[0, 0, 0.01], [0, 0, 0]], 0.01)).toEqual([[0, 0, 0.01]]);
  expect(dict3([[0, 0, 0.011], [0, 0, 0]], 0.01)).toEqual([
    [0, 0, 0],
    [0, 0, 0.011],
  ]);
});
