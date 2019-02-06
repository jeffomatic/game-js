import * as fs from 'fs';
import * as process from 'process';

import { parse } from './parse';

const stl = fs.readFileSync(process.argv[2]).toString();
console.log(JSON.stringify(parse(stl)));
