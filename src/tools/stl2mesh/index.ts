import * as fs from 'fs';
import * as process from 'process';
import * as _ from 'lodash';

import { isAscii, parseAscii } from './ascii';
import { parseBinary } from './binary';
import * as transform from './transform';

if (process.argv.length !== 3) {
  throw new Error(`invalid argument length: ${process.argv.length}`);
}

let path = process.argv[2];
if (path === '-') {
  path = '/dev/stdin';
}

const stl = fs.readFileSync(path);
const triangles = isAscii(stl) ? parseAscii(stl) : parseBinary(stl);
const rawVerts = _.flatten(triangles);
const centered = transform.center(rawVerts);
const vertices = transform.scale(centered, 0.2, 0.2, 0.2);
const triangleIndices = _.range(0, vertices.length / 3);

const lineIndices = [];
for (let i = 0; i < vertices.length / 3; i += 3) {
  lineIndices.push(i + 0, i + 1);
  lineIndices.push(i + 1, i + 2);
  lineIndices.push(i + 2, i + 0);
}

console.log(
  JSON.stringify({
    vertices,
    triangleIndices,
    lineIndices,
  }),
);
