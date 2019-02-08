import * as fs from 'fs';
import * as process from 'process';

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
const faces = isAscii(stl) ? parseAscii(stl) : parseBinary(stl);
console.log(
  JSON.stringify(transform.scale(transform.center(faces), 0.2, 0.2, 0.2)),
);
