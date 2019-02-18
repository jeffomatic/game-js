import * as _ from 'lodash';

import * as transform from './transform';
import * as compress from './compress';

export interface Mesh {
  vertices: number[];
  triangleIndices: number[];
  lineIndices: number[];
}

export interface ConvertOpts {
  epsilon?: number;
  scale?: number;
}

export function convert(tris: number[][], opts: ConvertOpts = {}): Mesh {
  const epsilon = opts.epsilon || compress.defaultEpsilon;
  const scale = opts.scale || 1;

  const chunked = _.chunk(_.flatten(tris), 3);
  const dict = compress.dict3(chunked, epsilon);

  const flattenedDict = _.flatten(dict);
  const centered = transform.center(flattenedDict);
  const vertices = transform.scale(centered, scale, scale, scale);

  const triangleIndices = chunked.map(v => compress.search3(dict, v, epsilon));

  const lineVerts = [];
  for (let t = 0; t < chunked.length; t += 3) {
    lineVerts.push(chunked[t + 0]);
    lineVerts.push(chunked[t + 1]);
    lineVerts.push(chunked[t + 1]);
    lineVerts.push(chunked[t + 2]);
    lineVerts.push(chunked[t + 2]);
    lineVerts.push(chunked[t + 0]);
  }
  const lineIndices = lineVerts.map(v => compress.search3(dict, v, epsilon));

  return { vertices, triangleIndices, lineIndices };
}
