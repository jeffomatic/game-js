import { isAscii, parseAscii } from '../ascii';

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
