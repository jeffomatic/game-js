import { convert } from '../convert';

test('convert', () => {
  expect(convert([])).toEqual({
    vertices: [],
    triangleIndices: [],
    lineIndices: [],
  });

  expect(convert([[-1, -1, -1, 0, 0, 0, 1, 1, 1]])).toEqual({
    vertices: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    triangleIndices: [0, 1, 2],
    lineIndices: [0, 1, 0, 2, 1, 2],
  });

  expect(convert([[0, 0, 0, 1, 1, 1, 2, 2, 2]])).toEqual({
    vertices: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    triangleIndices: [0, 1, 2],
    lineIndices: [0, 1, 0, 2, 1, 2],
  });

  expect(convert([[0, 0, 0, 1, 1, 1, 2, 2, 2]])).toEqual({
    vertices: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    triangleIndices: [0, 1, 2],
    lineIndices: [0, 1, 0, 2, 1, 2],
  });

  expect(
    convert([[-1, -1, -1, 0, 0, 0, 1, 1, 1], [1, 1, 1, -1, -1, -1, 0, 0, 0]]),
  ).toEqual({
    vertices: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    triangleIndices: [0, 1, 2, 2, 0, 1],
    lineIndices: [0, 1, 0, 2, 1, 2],
  });
});
