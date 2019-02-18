import * as fs from 'fs';
import * as process from 'process';

import { parse } from './parse_stl';
import { convert } from './convert';

if (process.argv.length !== 3) {
  throw new Error(`invalid argument length: ${process.argv.length}`);
}

let path = process.argv[2];
if (path === '-') {
  path = '/dev/stdin';
}

const stl = fs.readFileSync(path);
const triangles = parse(stl);
const mesh = convert(triangles, { scale: 0.2 });

console.log(JSON.stringify(mesh));
