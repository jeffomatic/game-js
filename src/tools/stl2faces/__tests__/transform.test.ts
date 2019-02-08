import { center, scale } from '../transform';

test('center', () => {
  expect(center([[1, 1, 1], [1, 1, 1]])).toEqual([[0, 0, 0], [0, 0, 0]]);
  expect(center([[-1, -1, -1], [1, 1, 1]])).toEqual([[-1, -1, -1], [1, 1, 1]]);
  expect(center([[-3, -3, -3], [1, 1, 1]])).toEqual([[-2, -2, -2], [2, 2, 2]]);
  expect(center([[3, 3, 3], [-1, -1, -1]])).toEqual([[2, 2, 2], [-2, -2, -2]]);
  expect(center([[-3, -3, -3], [-1, -1, -1]])).toEqual([
    [-1, -1, -1],
    [1, 1, 1],
  ]);
  expect(center([[3, 3, 3], [1, 1, 1]])).toEqual([[1, 1, 1], [-1, -1, -1]]);
  expect(center([[-3, 3, 1], [1, -1, 1]])).toEqual([[-2, 2, 0], [2, -2, 0]]);

  const complex = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [-9, -8, -7, -6, -5, -3, -2, -1],
  ];
  expect(center(center(complex))).toEqual(center(complex));
});

test('scale', () => {
  expect(
    scale([[0, 0, 0], [1, 1, 1], [-1, -1, -1], [1, 2, 3]], 2, 3, 4),
  ).toEqual([[0, 0, 0], [2, 3, 4], [-2, -3, -4], [2, 6, 12]]);

  expect(scale([[0, 0, 0, 1, 1, 1, -1, -1, -1, 1, 2, 3]], 2, 3, 4)).toEqual([
    [0, 0, 0, 2, 3, 4, -2, -3, -4, 2, 6, 12],
  ]);
});
