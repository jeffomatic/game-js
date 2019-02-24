import * as commander from 'commander';
import * as fs from 'fs';
import * as process from 'process';

import * as stl from './stl';

commander
  .usage('[options] <file>')
  .option('-v, --verbose', 'print debug output to stderr')
  .parse(process.argv);

if (commander.args.length !== 1) {
  throw new Error(`invalid argument length: ${commander.args.length}`);
}

let path = commander.args[0];
if (path === '-') {
  path = '/dev/stdin';
}

const buf = fs.readFileSync(path);
const triangles = stl.parse(buf);
const mesh = stl.convert(triangles, {
  scale: 0.001,
  verbose: commander.verbose,
});

console.log(JSON.stringify(mesh));
