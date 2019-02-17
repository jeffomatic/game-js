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
const verts = _.flatten(triangles);
const centered = transform.center(verts);
const scaled = transform.scale(centered, 0.2, 0.2, 0.2);
console.log({ vertices: scaled });
