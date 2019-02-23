import * as fs from 'fs';
import * as process from 'process';

import * as stl from './stl';

if (process.argv.length !== 3) {
  throw new Error(`invalid argument length: ${process.argv.length}`);
}

let path = process.argv[2];
if (path === '-') {
  path = '/dev/stdin';
}

const buf = fs.readFileSync(path);
const triangles = stl.parse(buf);
const mesh = stl.convert(triangles, { scale: 0.001 });

console.log(JSON.stringify(mesh));
