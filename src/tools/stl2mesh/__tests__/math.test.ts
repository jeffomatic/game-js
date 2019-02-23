import { equal, compare, compare3, normalize, triangleNormal } from '../math';

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

test('normalize3', () => {
  expect(normalize([1, 0, 0])).toEqual([1, 0, 0]);
  expect(normalize([0, 1, 0])).toEqual([0, 1, 0]);
  expect(normalize([0, 0, 1])).toEqual([0, 0, 1]);
  expect(normalize([5, 0, 0])).toEqual([1, 0, 0]);
  expect(normalize([0, 5, 0])).toEqual([0, 1, 0]);
  expect(normalize([0, 0, 5])).toEqual([0, 0, 1]);
});

test('triangleNormal', () => {
  expect(triangleNormal([[0, 0, 0], [1, 0, 0], [0, 0, 1]])).toEqual([0, -1, 0]);
  expect(triangleNormal([[0, 0, 1], [1, 0, 0], [0, 0, 0]])).toEqual([0, 1, 0]);
});
