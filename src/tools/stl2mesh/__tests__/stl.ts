import { isAscii, parseAscii, parseBinary, convert } from '../stl';

test('isAcii', () => {
  expect(isAscii(new Buffer('solid'))).toBe(true);
  expect(isAscii(new Buffer(' \n\r\tsolid'))).toBe(true);
  expect(isAscii(new Buffer(' solid xyz'))).toBe(true);

  expect(isAscii(new Buffer('xsolid'))).toBe(false);
  expect(isAscii(new Buffer(' \n\r\txsolid'))).toBe(false);
  expect(isAscii(new Buffer(' xsolid xyz'))).toBe(false);
});

test('parseAscii', () => {
  const sample = `
    solid cube_corner
      facet normal 0.0 -1.0 0.0
        outer loop
          vertex 0.0 0.0 0.0
          vertex 1.0 0.0 0.0
          vertex 0.0 0.0 1.0
        endloop
      endfacet
      facet normal 0.0 0.0 -1.0
        outer loop
          vertex 0.0 0.0 0.0
          vertex 0.0 1.0 0.0
          vertex 1.0 0.0 0.0
        endloop
      endfacet
      facet normal -1.0 0.0 0.0
        outer loop
          vertex 0.0 0.0 0.0
          vertex 0.0 0.0 1.0
          vertex 0.0 1.0 0.0
        endloop
      endfacet
      facet normal 0.577 0.577 0.577
        outer loop
          vertex 1.0 0.0 0.0
          vertex 0.0 1.0 0.0
          vertex 0.0 0.0 1.0
        endloop
      endfacet
    endsolid
  `;

  expect(parseAscii(new Buffer(sample))).toEqual([
    [0, 0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
  ]);
});

test('parseBinary', () => {
  const sample =
    '4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553482d4d4553480a0c000000000080bf0000000000000000000000000000f0410000000000000000000000000000f041000000000000f0410000f0410000000080bf000000000000000000000000000000000000000000000000000000000000f041000000000000f0410000000000000000803f00000080000000000000f041000000000000f0410000f0410000f041000000000000f0410000f0410000f04100000000803f00000000000000000000f041000000000000f0410000f04100000000000000000000f0410000f04100000000000000000000000080bf000000000000f04100000000000000000000f041000000000000f041000000000000000000000000000000000000000080bf000000000000000000000000000000000000f041000000000000f04100000000000000000000f0410000000000000000803f000000000000f0410000f0410000f0410000f0410000f04100000000000000000000f041000000000000000000000000803f000000000000f0410000f0410000f041000000000000f04100000000000000000000f0410000f04100000000000000000000000080bf000000000000f041000000000000f0410000f0410000000000000000000000000000000000000000000000000000000080bf0000000000000000000000000000f0410000f041000000000000f0410000000000000000000000000000000000000000803f0000f0410000f0410000f041000000000000f0410000f04100000000000000000000f041000000000000000000000000803f0000f0410000f0410000f04100000000000000000000f0410000f041000000000000f0410000'; // tslint:disable-line
  const parsed = parseBinary(new Buffer(sample, 'hex'));
  console.log(parsed);
  expect(parsed).toEqual([
    [0, 30, 0, 0, 0, 30, 0, 30, 30],
    [0, 0, 0, 0, 0, 30, 0, 30, 0],
    [30, 0, 30, 30, 30, 0, 30, 30, 30],
    [30, 0, 30, 30, 0, 0, 30, 30, 0],
    [30, 0, 0, 30, 0, 30, 0, 0, 0],
    [0, 0, 0, 30, 0, 30, 0, 0, 30],
    [30, 30, 30, 30, 30, 0, 0, 30, 0],
    [30, 30, 30, 0, 30, 0, 0, 30, 30],
    [0, 30, 0, 30, 30, 0, 0, 0, 0],
    [0, 0, 0, 30, 30, 0, 30, 0, 0],
    [30, 30, 30, 0, 30, 30, 0, 0, 30],
    [30, 30, 30, 0, 0, 30, 30, 0, 30],
  ]);
});

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
